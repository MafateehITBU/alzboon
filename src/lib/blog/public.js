import { localeToDb } from '../i18n/locale.js'
import { publicMediaUrl } from '../site/public-media.js'
import { documentPlainText } from './sanitize-document.js'

const EXCERPT_LENGTH = 160
const WORDS_PER_MINUTE = 200

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

/**
 * Related published blogs: same category first, then other published posts.
 * Excludes the current article. Never invents records.
 */
export async function listRelatedPublishedBlogs(
  db,
  { excludeId, categorySlug = '', take = 3 } = {},
) {
  const limit = Math.max(1, Math.min(6, Number(take) || 3))
  const related = []
  const seen = new Set(excludeId ? [excludeId] : [])

  if (categorySlug) {
    const sameCategory = await listPublishedBlogs(db, {
      take: limit + 4,
      categorySlug,
    })
    for (const blog of sameCategory) {
      if (seen.has(blog.id)) continue
      related.push(blog)
      seen.add(blog.id)
      if (related.length >= limit) return related
    }
  }

  const others = await listPublishedBlogs(db, { take: limit + 8 })
  for (const blog of others) {
    if (seen.has(blog.id)) continue
    related.push(blog)
    seen.add(blog.id)
    if (related.length >= limit) break
  }

  return related
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
  const plain = documentPlainText(translation?.document)
  const storedDescription = typeof translation?.description === 'string' ? translation.description.trim() : ''
  const excerptFromBody =
    plain.length > EXCERPT_LENGTH ? `${plain.slice(0, EXCERPT_LENGTH).trimEnd()}…` : plain
  const excerpt = storedDescription || excerptFromBody
  const wordCount = plain ? plain.split(/\s+/).filter(Boolean).length : 0
  const readingMinutes = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)) : null

  return {
    id: blog.id,
    slug: blog.slug,
    title: translation?.title || '',
    authorName: blog.authorName,
    publishedOn: blog.publishedOn instanceof Date ? blog.publishedOn.toISOString().slice(0, 10) : String(blog.publishedOn).slice(0, 10),
    categorySlug: blog.category?.slug || '',
    categoryName: categoryName || '',
    featuredUrl: publicMediaUrl(blog.featuredMediaId),
    excerpt,
    description: storedDescription,
    readingMinutes,
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
