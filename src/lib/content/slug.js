import { slugifyCategoryName } from '../blog/slug.js'

export function slugifyName(name) {
  return slugifyCategoryName(name)
}

export async function uniqueContentSlug(db, model, nameEn, excludeId = null) {
  const base = slugifyName(nameEn)
  if (!base) return null

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const slug = attempt === 0 ? base : `${base}-${attempt + 1}`
    let existing = null
    if (model === 'blog') {
      existing = await db.blog.findUnique({ where: { slug }, select: { id: true } })
    } else if (model === 'service') {
      existing = await db.service.findUnique({ where: { slug }, select: { id: true } })
    } else {
      return null
    }
    if (!existing || existing.id === excludeId) return slug
  }

  return null
}
