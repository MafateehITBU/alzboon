import { uniqueContentSlug } from '../content/slug.js'
import { deleteMediaIfOrphan } from '../media/orphan.js'
import { PUBLIC_IMAGE_MAX_BYTES, PUBLIC_IMAGE_MIME_TYPES } from '../media/public-image.js'
import { ATTACHMENT_MAX_BYTES, ATTACHMENT_MIME_TYPES } from '../media/attachment.js'
import { isStorageKey } from '../storage/paths.js'
import { assertCanManageBlogs } from './access.js'
import { BlogError } from './errors.js'
import { documentHasText, emptyDocument, sanitizeTipTapDocument } from './sanitize-document.js'

export const BLOG_PAGE_SIZE = 10

const blogInclude = {
  translations: true,
  category: true,
  featuredMedia: true,
  attachmentMedia: true,
}

export function parseBlogListQuery(params = {}) {
  const search = firstValue(params.q).trim().slice(0, 100)
  const categoryId = firstValue(params.category)
  const statusValue = firstValue(params.status)
  const parsedPage = Number.parseInt(firstValue(params.page), 10)
  const status = statusValue === 'published' || statusValue === 'hidden' ? statusValue : ''
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 10000) : 1
  return { search, categoryId, status, page }
}

export async function listBlogs(db, actorId, query) {
  await assertCanManageBlogs(db, actorId)

  const where = {}
  if (query.categoryId) where.categoryId = query.categoryId
  if (query.status === 'published') where.published = true
  if (query.status === 'hidden') where.published = false
  if (query.search) {
    where.translations = {
      some: {
        title: { contains: query.search, mode: 'insensitive' },
      },
    }
  }

  const page = query.page || 1
  const [total, rows] = await Promise.all([
    db.blog.count({ where }),
    db.blog.findMany({
      where,
      include: blogInclude,
      orderBy: [{ publishedOn: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * BLOG_PAGE_SIZE,
      take: BLOG_PAGE_SIZE,
    }),
  ])

  return {
    total,
    page,
    pageSize: BLOG_PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE)),
    blogs: rows.map(serializeBlog),
  }
}

export async function getBlogForAdmin(db, actorId, blogId) {
  await assertCanManageBlogs(db, actorId)
  const blog = await db.blog.findUnique({ where: { id: blogId }, include: blogInclude })
  if (!blog) throw new BlogError('NOT_FOUND')
  return serializeBlog(blog)
}

export async function createBlog(db, actorId, input) {
  await assertCanManageBlogs(db, actorId)
  const payload = normalizeBlogInput(input, true)
  const slug = await uniqueContentSlug(db, 'blog', payload.titleEn)
  if (!slug) throw new BlogError('INVALID_SLUG')

  return runInTransaction(db, async (tx) => {
    await assertCategory(tx, payload.categoryId)
    const featured = await createMedia(tx, payload.featuredMedia, 'PUBLIC')
    const attachment = payload.attachmentMedia
      ? await createMedia(tx, payload.attachmentMedia, 'PRIVATE')
      : null

    const blog = await tx.blog.create({
      data: {
        categoryId: payload.categoryId,
        slug,
        authorName: payload.authorName,
        publishedOn: payload.publishedOn,
        published: payload.published,
        featuredMediaId: featured.id,
        attachmentMediaId: attachment?.id ?? null,
        attachmentDisplayName: payload.attachmentDisplayName,
        translations: {
          create: [
            { locale: 'EN', title: payload.titleEn, document: payload.documentEn },
            { locale: 'AR', title: payload.titleAr, document: payload.documentAr },
          ],
        },
      },
      include: blogInclude,
    })

    return { blog: serializeBlog(blog), removedMedia: [] }
  })
}

export async function updateBlog(db, actorId, blogId, input) {
  await assertCanManageBlogs(db, actorId)
  const payload = normalizeBlogInput(input, false)
  const slug = await uniqueContentSlug(db, 'blog', payload.titleEn, blogId)
  if (!slug) throw new BlogError('INVALID_SLUG')

  return runInTransaction(db, async (tx) => {
    const current = await tx.blog.findUnique({ where: { id: blogId }, include: blogInclude })
    if (!current) throw new BlogError('NOT_FOUND')

    await assertCategory(tx, payload.categoryId)

    let featuredMediaId = current.featuredMediaId
    let attachmentMediaId = current.attachmentMediaId
    const removed = []

    if (payload.featuredMedia) {
      const featured = await createMedia(tx, payload.featuredMedia, 'PUBLIC')
      featuredMediaId = featured.id
    }

    if (payload.removeAttachment) {
      attachmentMediaId = null
    }

    if (payload.attachmentMedia) {
      const attachment = await createMedia(tx, payload.attachmentMedia, 'PRIVATE')
      attachmentMediaId = attachment.id
    }

    const blog = await tx.blog.update({
      where: { id: blogId },
      data: {
        categoryId: payload.categoryId,
        slug,
        authorName: payload.authorName,
        publishedOn: payload.publishedOn,
        published: payload.published,
        featuredMediaId,
        attachmentMediaId,
        attachmentDisplayName: attachmentMediaId ? payload.attachmentDisplayName : null,
        translations: {
          deleteMany: {},
          create: [
            { locale: 'EN', title: payload.titleEn, document: payload.documentEn },
            { locale: 'AR', title: payload.titleAr, document: payload.documentAr },
          ],
        },
      },
      include: blogInclude,
    })

    if (current.featuredMediaId !== featuredMediaId) {
      const orphan = await deleteMediaIfOrphan(tx, current.featuredMediaId)
      if (orphan) removed.push(orphan)
    }

    if (current.attachmentMediaId && current.attachmentMediaId !== attachmentMediaId) {
      const orphan = await deleteMediaIfOrphan(tx, current.attachmentMediaId)
      if (orphan) removed.push(orphan)
    }

    return { blog: serializeBlog(blog), removedMedia: removed }
  })
}

export async function deleteBlog(db, actorId, blogId) {
  await assertCanManageBlogs(db, actorId)

  return runInTransaction(db, async (tx) => {
    const current = await tx.blog.findUnique({ where: { id: blogId } })
    if (!current) throw new BlogError('NOT_FOUND')

    await tx.blog.delete({ where: { id: blogId } })

    const removedMedia = []
    for (const mediaId of [current.featuredMediaId, current.attachmentMediaId].filter(Boolean)) {
      const orphan = await deleteMediaIfOrphan(tx, mediaId)
      if (orphan) removedMedia.push(orphan)
    }

    return { id: blogId, removedMedia }
  })
}

function normalizeBlogInput(input, requireFeatured) {
  const titleEn = cleanText(input?.titleEn, 200)
  const titleAr = cleanText(input?.titleAr, 200)
  const authorName = cleanText(input?.authorName, 120)
  const categoryId = typeof input?.categoryId === 'string' ? input.categoryId : ''
  const publishedOn = parseDate(input?.publishedOn)
  const published = input?.published === true || input?.published === '1' || input?.published === 'true'
  const documentEn = sanitizeTipTapDocument(input?.documentEn) || emptyDocument()
  const documentAr = sanitizeTipTapDocument(input?.documentAr) || emptyDocument()
  const attachmentDisplayName = cleanText(input?.attachmentDisplayName, 120)

  if (!titleEn || !titleAr) throw new BlogError('INVALID_TITLE')
  if (!authorName) throw new BlogError('INVALID_AUTHOR')
  if (!publishedOn) throw new BlogError('INVALID_DATE')
  if (!categoryId) throw new BlogError('INVALID_CATEGORY')
  if (!documentHasText(documentEn) || !documentHasText(documentAr)) throw new BlogError('INVALID_DOCUMENT')

  if (requireFeatured && !input?.featuredMedia) throw new BlogError('MISSING_IMAGE')
  assertImageMedia(input?.featuredMedia)
  assertAttachmentMedia(input?.attachmentMedia)

  if (input?.attachmentMedia && !attachmentDisplayName) {
    // optional display name defaults to original filename later in UI; allow null
  }

  return {
    titleEn,
    titleAr,
    authorName,
    categoryId,
    publishedOn,
    published,
    documentEn,
    documentAr,
    featuredMedia: input?.featuredMedia || null,
    attachmentMedia: input?.attachmentMedia || null,
    removeAttachment: input?.removeAttachment === true,
    attachmentDisplayName: attachmentDisplayName || input?.attachmentMedia?.originalFilename || null,
  }
}

async function assertCategory(tx, categoryId) {
  const category = await tx.blogCategory.findUnique({ where: { id: categoryId }, select: { id: true } })
  if (!category) throw new BlogError('INVALID_CATEGORY')
}

async function createMedia(tx, media, visibility) {
  return tx.mediaAsset.create({
    data: {
      storageKey: media.storageKey,
      visibility,
      originalFilename: String(media.originalFilename || 'file').slice(0, 120),
      mimeType: media.mimeType,
      byteSize: media.byteSize,
    },
  })
}

function assertImageMedia(media) {
  if (!media) return
  if (
    !isStorageKey(media.storageKey) ||
    !PUBLIC_IMAGE_MIME_TYPES.includes(media.mimeType) ||
    !Number.isInteger(media.byteSize) ||
    media.byteSize < 1 ||
    media.byteSize > PUBLIC_IMAGE_MAX_BYTES
  ) {
    throw new BlogError('INVALID_IMAGE')
  }
}

function assertAttachmentMedia(media) {
  if (!media) return
  if (
    !isStorageKey(media.storageKey) ||
    !ATTACHMENT_MIME_TYPES.includes(media.mimeType) ||
    !Number.isInteger(media.byteSize) ||
    media.byteSize < 1 ||
    media.byteSize > ATTACHMENT_MAX_BYTES
  ) {
    throw new BlogError('INVALID_ATTACHMENT')
  }
}

function serializeBlog(blog) {
  const titleEn = blog.translations.find((row) => row.locale === 'EN')
  const titleAr = blog.translations.find((row) => row.locale === 'AR')

  return {
    id: blog.id,
    slug: blog.slug,
    categoryId: blog.categoryId,
    categoryName: blog.category?.nameEn || '',
    authorName: blog.authorName,
    publishedOn: blog.publishedOn instanceof Date ? blog.publishedOn.toISOString().slice(0, 10) : String(blog.publishedOn).slice(0, 10),
    published: blog.published,
    titleEn: titleEn?.title || '',
    titleAr: titleAr?.title || '',
    documentEn: titleEn?.document || emptyDocument(),
    documentAr: titleAr?.document || emptyDocument(),
    featuredMediaId: blog.featuredMediaId,
    featuredUrl: `/media/${blog.featuredMediaId}`,
    attachmentMediaId: blog.attachmentMediaId,
    attachmentUrl: blog.attachmentMediaId ? `/admin/media/${blog.attachmentMediaId}` : null,
    attachmentDisplayName: blog.attachmentDisplayName,
    createdAt: blog.createdAt instanceof Date ? blog.createdAt.toISOString() : blog.createdAt,
  }
}

function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return null
  return date
}

function cleanText(value, max) {
  if (typeof value !== 'string') return null
  const text = value.trim().replace(/\s+/g, ' ')
  if (!text || text.length > max) return null
  return text
}

function firstValue(value) {
  const picked = Array.isArray(value) ? value[0] : value
  return typeof picked === 'string' ? picked : ''
}

function runInTransaction(db, fn) {
  if (typeof db.$transaction === 'function') return db.$transaction(fn)
  return fn(db)
}
