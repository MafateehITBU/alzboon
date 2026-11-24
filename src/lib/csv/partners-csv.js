import { assertCanManageWebsite } from '../website/settings.js'
import { parseCsv, rowsToCsv } from './csv.js'
import { mediaExportFields, mediaImportRef, resolveMediaForImport } from './media-ref.js'

export const PARTNER_CSV_HEADERS = [
  'id',
  'name',
  'sortOrder',
  'logoMediaId',
  'logoStorageKey',
  'logoMimeType',
  'logoByteSize',
  'logoOriginalFilename',
  'logoBase64',
]

export async function exportPartnersCsv(db, actorId) {
  await assertCanManageWebsite(db, actorId)
  const rows = await db.partner.findMany({
    include: { logoMedia: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })

  const mapped = []
  for (const row of rows) {
    mapped.push({
      id: row.id,
      name: row.name,
      sortOrder: String(row.sortOrder),
      ...(await mediaExportFields('logo', row.logoMedia, 'PUBLIC')),
    })
  }
  return rowsToCsv(PARTNER_CSV_HEADERS, mapped)
}

export async function importPartnersCsv(db, actorId, csvText) {
  await assertCanManageWebsite(db, actorId)
  const { rows } = parseCsv(csvText)
  let created = 0
  let updated = 0
  const errors = []
  const warnings = []

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    const line = index + 2
    try {
      const name = String(row.name || '').trim()
      if (!name) throw new Error('name is required')
      const preferredId = String(row.id || '').trim()
      const sortOrder = Number.parseInt(String(row.sortOrder || '0'), 10)
      const logoRef = mediaImportRef(row, 'logo')

      await db.$transaction(async (tx) => {
        const current = preferredId
          ? await tx.partner.findUnique({ where: { id: preferredId } })
          : await tx.partner.findFirst({ where: { name } })

        const logoResult = await resolveMediaForImport(tx, logoRef, {
          visibility: 'PUBLIC',
          existingId: current?.logoMediaId || null,
          label: 'partner-logo-pending.png',
        })
        if (logoResult.skipped) {
          warnings.push(`Row ${line}: logo skipped for “${name}”`)
        }

        if (current) {
          await tx.partner.update({
            where: { id: current.id },
            data: {
              name,
              logoMediaId: logoResult.media.id,
              sortOrder: Number.isFinite(sortOrder) ? sortOrder : current.sortOrder,
            },
          })
          updated += 1
        } else {
          const maxSort = await tx.partner.aggregate({ _max: { sortOrder: true } })
          await tx.partner.create({
            data: {
              name,
              logoMediaId: logoResult.media.id,
              sortOrder: Number.isFinite(sortOrder) ? sortOrder : (maxSort._max.sortOrder ?? -1) + 1,
            },
          })
          created += 1
        }
      })
    } catch (error) {
      errors.push(`Row ${line}: ${error.message || 'Import failed'}`)
    }
  }

  return { created, updated, errors, warnings, total: rows.length }
}
