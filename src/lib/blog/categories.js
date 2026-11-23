import { BlogError } from './errors.js'
import { assertCanManageBlogs } from './access.js'
import { uniqueCategorySlug } from './slug.js'

export const CATEGORY_PAGE_SIZE = 10

export function parseCategoryListQuery(params = {}) {
  const search = firstValue(params.q).trim().slice(0, 100)
  const parsedPage = Number.parseInt(firstValue(params.page), 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 10000) : 1
  return { search, page }
}

export async function listBlogCategories(db, actorId, query) {
  await assertCanManageBlogs(db, actorId)

  const where = query.search
    ? {
        OR: [
          { nameEn: { contains: query.search, mode: 'insensitive' } },
          { nameAr: { contains: query.search, mode: 'insensitive' } },
          { slug: { contains: query.search, mode: 'insensitive' } },
        ],
      }
    : {}

  const page = query.page || 1
  const [total, rows] = await Promise.all([
    db.blogCategory.count({ where }),
    db.blogCategory.findMany({
      where,
      include: { _count: { select: { blogs: true } } },
      orderBy: [{ createdAt: 'desc' }, { nameEn: 'asc' }],
      skip: (page - 1) * CATEGORY_PAGE_SIZE,
      take: CATEGORY_PAGE_SIZE,
    }),
  ])

  return {
    total,
    page,
    pageSize: CATEGORY_PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / CATEGORY_PAGE_SIZE)),
    categories: rows.map(serializeCategory),
  }
}

export async function listAllCategories(db, actorId) {
  await assertCanManageBlogs(db, actorId)
  const rows = await db.blogCategory.findMany({
    orderBy: [{ nameEn: 'asc' }],
    select: { id: true, nameEn: true, nameAr: true, slug: true },
  })
  return rows
}

export async function createBlogCategory(db, actorId, input) {
  await assertCanManageBlogs(db, actorId)

  const nameEn = cleanName(input?.nameEn)
  const nameAr = cleanName(input?.nameAr)
  if (!nameEn) throw new BlogError('INVALID_NAME_EN')
  if (!nameAr) throw new BlogError('INVALID_NAME_AR')

  return runInTransaction(db, async (tx) => {
    const slug = await uniqueCategorySlug(tx, nameEn)
    if (!slug) throw new BlogError('INVALID_SLUG')

    try {
      const created = await tx.blogCategory.create({
        data: { nameEn, nameAr, slug },
        include: { _count: { select: { blogs: true } } },
      })
      return serializeCategory(created)
    } catch (error) {
      if (error?.code === 'P2002') throw new BlogError('DUPLICATE_SLUG')
      throw error
    }
  })
}

export async function updateBlogCategory(db, actorId, categoryId, input) {
  await assertCanManageBlogs(db, actorId)

  const nameEn = cleanName(input?.nameEn)
  const nameAr = cleanName(input?.nameAr)
  if (!nameEn) throw new BlogError('INVALID_NAME_EN')
  if (!nameAr) throw new BlogError('INVALID_NAME_AR')

  return runInTransaction(db, async (tx) => {
    const current = await tx.blogCategory.findUnique({ where: { id: categoryId } })
    if (!current) throw new BlogError('NOT_FOUND')

    const slug = await uniqueCategorySlug(tx, nameEn, categoryId)
    if (!slug) throw new BlogError('INVALID_SLUG')

    try {
      const updated = await tx.blogCategory.update({
        where: { id: categoryId },
        data: { nameEn, nameAr, slug },
        include: { _count: { select: { blogs: true } } },
      })
      return serializeCategory(updated)
    } catch (error) {
      if (error?.code === 'P2002') throw new BlogError('DUPLICATE_SLUG')
      throw error
    }
  })
}

export async function deleteBlogCategory(db, actorId, categoryId) {
  await assertCanManageBlogs(db, actorId)

  return runInTransaction(db, async (tx) => {
    const current = await tx.blogCategory.findUnique({
      where: { id: categoryId },
      include: { _count: { select: { blogs: true } } },
    })
    if (!current) throw new BlogError('NOT_FOUND')
    if (current._count.blogs > 0) throw new BlogError('CATEGORY_IN_USE')

    await tx.blogCategory.delete({ where: { id: categoryId } })
    return { id: categoryId }
  })
}

function serializeCategory(category) {
  return {
    id: category.id,
    nameEn: category.nameEn,
    nameAr: category.nameAr,
    slug: category.slug,
    blogCount: category._count?.blogs ?? 0,
    createdAt: category.createdAt instanceof Date ? category.createdAt.toISOString() : category.createdAt,
  }
}

function cleanName(value) {
  if (typeof value !== 'string') return null
  const name = value.trim().replace(/\s+/g, ' ')
  if (!name || name.length > 120) return null
  return name
}

function firstValue(value) {
  const picked = Array.isArray(value) ? value[0] : value
  return typeof picked === 'string' ? picked : ''
}

function runInTransaction(db, fn) {
  if (typeof db.$transaction === 'function') return db.$transaction(fn)
  return fn(db)
}
