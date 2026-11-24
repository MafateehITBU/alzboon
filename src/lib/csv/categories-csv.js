import { assertCanManageBlogs } from '../blog/access.js'
import { uniqueCategorySlug } from '../blog/slug.js'
import { parseCsv, rowsToCsv } from './csv.js'

export const CATEGORY_CSV_HEADERS = ['id', 'slug', 'nameEn', 'nameAr']

export async function exportBlogCategoriesCsv(db, actorId) {
  await assertCanManageBlogs(db, actorId)
  const rows = await db.blogCategory.findMany({ orderBy: [{ createdAt: 'asc' }, { nameEn: 'asc' }] })
  return rowsToCsv(
    CATEGORY_CSV_HEADERS,
    rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      nameEn: row.nameEn,
      nameAr: row.nameAr,
    })),
  )
}

export async function importBlogCategoriesCsv(db, actorId, csvText) {
  await assertCanManageBlogs(db, actorId)
  const { rows } = parseCsv(csvText)
  let created = 0
  let updated = 0
  const errors = []

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    const line = index + 2
    try {
      const nameEn = String(row.nameEn || '').trim()
      const nameAr = String(row.nameAr || '').trim()
      if (!nameEn || !nameAr) throw new Error('nameEn and nameAr are required')

      const preferredSlug = String(row.slug || '').trim()
      const preferredId = String(row.id || '').trim()

      const current =
        (preferredId ? await db.blogCategory.findUnique({ where: { id: preferredId } }) : null) ||
        (preferredSlug ? await db.blogCategory.findUnique({ where: { slug: preferredSlug } }) : null) ||
        (await db.blogCategory.findFirst({ where: { nameEn } }))

      if (current) {
        const slug = preferredSlug || (await uniqueCategorySlug(db, nameEn, current.id))
        if (!slug) throw new Error('Could not resolve slug')
        await db.blogCategory.update({
          where: { id: current.id },
          data: { nameEn, nameAr, slug },
        })
        updated += 1
      } else {
        let slug = preferredSlug || (await uniqueCategorySlug(db, nameEn))
        if (!slug) throw new Error('Could not resolve slug')
        const clash = await db.blogCategory.findUnique({ where: { slug } })
        if (clash) slug = await uniqueCategorySlug(db, nameEn)
        await db.blogCategory.create({
          data: { nameEn, nameAr, slug },
        })
        created += 1
      }
    } catch (error) {
      errors.push(`Row ${line}: ${error.message || 'Import failed'}`)
    }
  }

  return { created, updated, errors, total: rows.length }
}
