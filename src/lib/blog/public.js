import { localeToDb } from '../i18n/locale.js'
import { publicMediaUrl } from '../site/public-media.js'

/**
 * Server-side filter for publicly visible blogs.
 * Hidden blogs and future publish dates stay out of public queries.
 */
export function publishedBlogWhere(now = new Date()) {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

  return {
    published: true,
    publishedOn: { lte: today },
  }
}

const publicInclude = {
  translations: true,
  category: true,
  featuredMedia: true,
}

export async function listPublishedBlogs(db, { take = 12, skip = 0, categorySlug = '' } = {}) {
  const where = {
    ...publishedBlogWhere(),
  }
  if (categorySlug) {
    where.category = { slug: categorySlug }
  }

  return db.blog.findMany({
    where,
    include: publicInclude,
    orderBy: [{ publishedOn: 'desc' }, { createdAt: 'desc' }],
    skip,
    take,
  })
}

export async function countPublishedBlogs(db, { categorySlug = '' } = {}) {
  const where = {
    ...publishedBlogWhere(),
  }
  if (categorySlug) {
    where.category = { slug: categorySlug }
  }
  return db.blog.count({ where })
}

export async function getPublishedBlogById(db, blogId) {
  return db.blog.findFirst({
    where: { id: blogId, ...publishedBlogWhere() },
    include: publicInclude,
  })
}

export async function getPublishedBlogBySlug(db, slug) {
  if (typeof slug !== 'string' || !slug.trim()) return null
  return db.blog.findFirst({
    where: { slug: slug.trim(), ...publishedBlogWhere() },
    include: publicInclude,
  })
}

export async function listPublicBlogCategories(db) {
  const rows = await db.blogCategory.findMany({
    where: {
      blogs: { some: publishedBlogWhere() },
    },
    orderBy: { nameEn: 'asc' },
  })
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    nameEn: row.nameEn,
    nameAr: row.nameAr,
  }))
}

function translationFor(rows, locale) {
  const dbLocale = localeToDb(locale)
  return rows?.find((row) => row.locale === dbLocale) || rows?.find((row) => row.locale === 'EN') || null
}

export function serializePublicBlogListItem(blog, locale = 'en') {
  if (!blog) return null
  const translation = translationFor(blog.translations, locale)
  const categoryName = locale === 'ar' ? blog.category?.nameAr || blog.category?.nameEn : blog.category?.nameEn

  return {
    id: blog.id,
    slug: blog.slug,
    title: translation?.title || '',
    authorName: blog.authorName,
    publishedOn: blog.publishedOn instanceof Date ? blog.publishedOn.toISOString().slice(0, 10) : String(blog.publishedOn).slice(0, 10),
    categorySlug: blog.category?.slug || '',
    categoryName: categoryName || '',
    featuredUrl: publicMediaUrl(blog.featuredMediaId),
  }
}

export function serializePublicBlog(blog, locale = 'en') {
  const item = serializePublicBlogListItem(blog, locale)
  if (!item) return null
  const translation = translationFor(blog.translations, locale)
  return {
    ...item,
    document: translation?.document || { type: 'doc', content: [] },
  }
}
