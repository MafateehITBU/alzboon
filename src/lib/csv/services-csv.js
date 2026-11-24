import { uniqueContentSlug } from '../content/slug.js'
import { assertCanManageServices } from '../service/access.js'
import { cellJson, parseCsv, readBoolCell, readJsonCell, rowsToCsv } from './csv.js'
import { mediaExportFields, mediaImportRef, resolveMediaForImport } from './media-ref.js'

const serviceInclude = {
  translations: true,
  practiceAreas: {
    include: { translations: true },
    orderBy: { sortOrder: 'asc' },
  },
  benefits: {
    include: { translations: true },
    orderBy: { sortOrder: 'asc' },
  },
  heroMedia: true,
  practiceAreaMedia: true,
}

export const SERVICE_CSV_HEADERS = [
  'id',
  'slug',
  'available',
  'nameEn',
  'nameAr',
  'heroTitleEn',
  'heroTitleAr',
  'heroDescriptionEn',
  'heroDescriptionAr',
  'overviewTitleEn',
  'overviewTitleAr',
  'overviewDescriptionEn',
  'overviewDescriptionAr',
  'practiceAreasJson',
  'benefitsJson',
  'heroMediaId',
  'heroStorageKey',
  'heroMimeType',
  'heroByteSize',
  'heroOriginalFilename',
  'heroBase64',
  'practiceMediaId',
  'practiceStorageKey',
  'practiceMimeType',
  'practiceByteSize',
  'practiceOriginalFilename',
  'practiceBase64',
]

export async function exportServicesCsv(db, actorId) {
  await assertCanManageServices(db, actorId)
  const rows = await db.service.findMany({
    include: serviceInclude,
    orderBy: [{ createdAt: 'asc' }],
  })

  const mapped = []
  for (const service of rows) {
    const en = service.translations.find((row) => row.locale === 'EN')
    const ar = service.translations.find((row) => row.locale === 'AR')
    const practiceAreas = (service.practiceAreas || []).map((area) => {
      const areaEn = area.translations.find((row) => row.locale === 'EN')
      const areaAr = area.translations.find((row) => row.locale === 'AR')
      return {
        titleEn: areaEn?.title || '',
        titleAr: areaAr?.title || '',
        subtitleEn: areaEn?.subtitle || '',
        subtitleAr: areaAr?.subtitle || '',
        descriptionEn: areaEn?.description || '',
        descriptionAr: areaAr?.description || '',
      }
    })
    const benefits = (service.benefits || []).map((benefit) => {
      const benefitEn = benefit.translations.find((row) => row.locale === 'EN')
      const benefitAr = benefit.translations.find((row) => row.locale === 'AR')
      return {
        textEn: benefitEn?.text || '',
        textAr: benefitAr?.text || '',
      }
    })

    mapped.push({
      id: service.id,
      slug: service.slug,
      available: service.available ? 'true' : 'false',
      nameEn: en?.name || '',
      nameAr: ar?.name || '',
      heroTitleEn: en?.heroTitle || '',
      heroTitleAr: ar?.heroTitle || '',
      heroDescriptionEn: en?.heroDescription || '',
      heroDescriptionAr: ar?.heroDescription || '',
      overviewTitleEn: en?.overviewTitle || '',
      overviewTitleAr: ar?.overviewTitle || '',
      overviewDescriptionEn: en?.overviewDescription || '',
      overviewDescriptionAr: ar?.overviewDescription || '',
      practiceAreasJson: cellJson(practiceAreas),
      benefitsJson: cellJson(benefits),
      ...(await mediaExportFields('hero', service.heroMedia, 'PUBLIC')),
      ...(await mediaExportFields('practice', service.practiceAreaMedia, 'PUBLIC')),
    })
  }

  return rowsToCsv(SERVICE_CSV_HEADERS, mapped)
}

export async function importServicesCsv(db, actorId, csvText) {
  await assertCanManageServices(db, actorId)
  const { rows } = parseCsv(csvText)
  let created = 0
  let updated = 0
  const errors = []
  const warnings = []

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    const line = index + 2
    try {
      const nameEn = String(row.nameEn || '').trim()
      const nameAr = String(row.nameAr || '').trim()
      if (!nameEn || !nameAr) throw new Error('nameEn and nameAr are required')

      const preferredId = String(row.id || '').trim()
      const preferredSlug = String(row.slug || '').trim()
      const practiceAreas = normalizePracticeAreas(readJsonCell(row.practiceAreasJson, []))
      if (practiceAreas.length === 0) throw new Error('practiceAreasJson must include at least one practice area')
      const benefits = normalizeBenefits(readJsonCell(row.benefitsJson, []))

      await db.$transaction(async (tx) => {
        const current = await findExistingService(tx, { preferredId, preferredSlug, nameEn })

        const heroResult = await resolveMediaForImport(tx, mediaImportRef(row, 'hero'), {
          visibility: 'PUBLIC',
          existingId: current?.heroMediaId || null,
          label: 'service-hero-pending.png',
        })
        const practiceResult = await resolveMediaForImport(tx, mediaImportRef(row, 'practice'), {
          visibility: 'PUBLIC',
          existingId: current?.practiceAreaMediaId || null,
          label: 'service-practice-pending.png',
        })
        const hero = heroResult.media
        const practice = practiceResult.media
        if (heroResult.skipped || practiceResult.skipped) {
          warnings.push(`Row ${line}: image(s) skipped for “${nameEn}”`)
        }

        const translationData = [
          {
            locale: 'EN',
            name: nameEn,
            heroTitle: String(row.heroTitleEn || nameEn).trim() || nameEn,
            heroDescription: String(row.heroDescriptionEn || '').trim() || nameEn,
            overviewTitle: String(row.overviewTitleEn || '').trim() || 'Practice areas',
            overviewDescription: String(row.overviewDescriptionEn || '').trim() || nameEn,
          },
          {
            locale: 'AR',
            name: nameAr,
            heroTitle: String(row.heroTitleAr || nameAr).trim() || nameAr,
            heroDescription: String(row.heroDescriptionAr || '').trim() || nameAr,
            overviewTitle: String(row.overviewTitleAr || '').trim() || 'مجالات الممارسة',
            overviewDescription: String(row.overviewDescriptionAr || '').trim() || nameAr,
          },
        ]

        const practiceCreate = practiceAreas.map((area, areaIndex) => ({
          sortOrder: areaIndex,
          translations: {
            create: [
              {
                locale: 'EN',
                title: area.titleEn,
                subtitle: area.subtitleEn,
                description: area.descriptionEn,
              },
              {
                locale: 'AR',
                title: area.titleAr,
                subtitle: area.subtitleAr,
                description: area.descriptionAr,
              },
            ],
          },
        }))

        const benefitCreate = benefits.map((benefit, benefitIndex) => ({
          sortOrder: benefitIndex,
          translations: {
            create: [
              { locale: 'EN', text: benefit.textEn },
              { locale: 'AR', text: benefit.textAr },
            ],
          },
        }))

        if (current) {
          const slug =
            preferredSlug || (await uniqueContentSlug(tx, 'service', nameEn, current.id))
          if (!slug) throw new Error('Could not resolve slug')

          await tx.practiceArea.deleteMany({ where: { serviceId: current.id } })
          await tx.benefit.deleteMany({ where: { serviceId: current.id } })
          await tx.serviceTranslation.deleteMany({ where: { serviceId: current.id } })

          await tx.service.update({
            where: { id: current.id },
            data: {
              slug,
              available: readBoolCell(row.available, true),
              heroMediaId: hero.id,
              practiceAreaMediaId: practice.id,
              translations: { create: translationData },
              practiceAreas: { create: practiceCreate },
              benefits: { create: benefitCreate },
            },
          })
          updated += 1
        } else {
          let slug = preferredSlug || (await uniqueContentSlug(tx, 'service', nameEn))
          if (!slug) throw new Error('Could not resolve slug')
          const clash = await tx.service.findUnique({ where: { slug } })
          if (clash) slug = await uniqueContentSlug(tx, 'service', nameEn)

          await tx.service.create({
            data: {
              slug,
              available: readBoolCell(row.available, true),
              heroMediaId: hero.id,
              practiceAreaMediaId: practice.id,
              translations: { create: translationData },
              practiceAreas: { create: practiceCreate },
              benefits: { create: benefitCreate },
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

async function findExistingService(tx, { preferredId, preferredSlug, nameEn }) {
  if (preferredId) {
    const byId = await tx.service.findUnique({ where: { id: preferredId } })
    if (byId) return byId
  }
  if (preferredSlug) {
    const bySlug = await tx.service.findUnique({ where: { slug: preferredSlug } })
    if (bySlug) return bySlug
  }
  if (nameEn) {
    const translation = await tx.serviceTranslation.findFirst({
      where: { locale: 'EN', name: nameEn },
      select: { serviceId: true },
    })
    if (translation) {
      return tx.service.findUnique({ where: { id: translation.serviceId } })
    }
  }
  return null
}

function normalizePracticeAreas(value) {
  if (!Array.isArray(value)) return []
  return value
    .map((area) => ({
      titleEn: String(area?.titleEn || '').trim(),
      titleAr: String(area?.titleAr || '').trim(),
      subtitleEn: String(area?.subtitleEn || '').trim() || '-',
      subtitleAr: String(area?.subtitleAr || '').trim() || '-',
      descriptionEn: String(area?.descriptionEn || '').trim(),
      descriptionAr: String(area?.descriptionAr || '').trim(),
    }))
    .filter((area) => area.titleEn && area.titleAr && area.descriptionEn && area.descriptionAr)
}

function normalizeBenefits(value) {
  if (!Array.isArray(value)) return []
  return value
    .map((benefit) => ({
      textEn: String(benefit?.textEn || '').trim(),
      textAr: String(benefit?.textAr || '').trim(),
    }))
    .filter((benefit) => benefit.textEn && benefit.textAr)
}
