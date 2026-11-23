export function slugifyCategoryName(name) {
  const base = String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  return base
}

export async function uniqueCategorySlug(db, nameEn, excludeId = null) {
  const base = slugifyCategoryName(nameEn)
  if (!base) return null

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const slug = attempt === 0 ? base : `${base}-${attempt + 1}`
    const existing = await db.blogCategory.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!existing || existing.id === excludeId) return slug
  }

  return null
}
