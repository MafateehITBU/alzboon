import { uniqueContentSlug } from '../content/slug.js'
import { assertCanManageBlogs } from '../blog/access.js'
import { sanitizeTipTapDocument } from '../blog/sanitize-document.js'
import { cellJson, parseCsv, readBoolCell, readJsonCell, rowsToCsv } from './csv.js'
import { mediaExportFields, mediaImportRef, resolveMediaForImport, resolveMediaRef } from './media-ref.js'

const blogInclude = {
  translations: true,
  category: true,
  featuredMedia: true,
  attachmentMedia: true,
}

export const BLOG_CSV_HEADERS = [
  'id',
  'slug',
  'categorySlug',
  'categoryId',
  'authorName',
  'publishedOn',
  'published',
  'titleEn',
  'titleAr',
  'documentEnJson',
  'documentArJson',
  'attachmentDisplayName',
  'featuredMediaId',
  'featuredStorageKey',
  'featuredMimeType',
  'featuredByteSize',
  'featuredOriginalFilename',
  'featuredBase64',
  'attachmentMediaId',
  'attachmentStorageKey',
  'attachmentMimeType',
  'attachmentByteSize',
  'attachmentOriginalFilename',
  'attachmentBase64',
]

export async function exportBlogsCsv(db, actorId) {
  await assertCanManageBlogs(db, actorId)
  const rows = await db.blog.findMany({
    include: blogInclude,
    orderBy: [{ createdAt: 'asc' }],
  })

  const mapped = []
  for (const blog of rows) {
    const en = blog.translations.find((row) => row.locale === 'EN')
    const ar = blog.translations.find((row) => row.locale === 'AR')
    const publishedOn =
      blog.publishedOn instanceof Date
        ? blog.publishedOn.toISOString().slice(0, 10)
        : String(blog.publishedOn || '').slice(0, 10)

    mapped.push({
      id: blog.id,
      slug: blog.slug,
      categorySlug: blog.category?.slug || '',
      categoryId: blog.categoryId,
      authorName: blog.authorName,
      publishedOn,
      published: blog.published ? 'true' : 'false',
      titleEn: en?.title || '',
      titleAr: ar?.title || '',
      documentEnJson: cellJson(en?.document || emptyDocument()),
      documentArJson: cellJson(ar?.document || emptyDocument()),
      attachmentDisplayName: blog.attachmentDisplayName || '',
      ...(await mediaExportFields('featured', blog.featuredMedia, 'PUBLIC')),
      ...(await mediaExportFields('attachment', blog.attachmentMedia, 'PRIVATE')),
    })
  }
  return rowsToCsv(BLOG_CSV_HEADERS, mapped)
}

export async function importBlogsCsv(db, actorId, csvText) {
  await assertCanManageBlogs(db, actorId)
  const { rows } = parseCsv(csvText)
  let created = 0
  let updated = 0
  const errors = []
  const warnings = []

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    const line = index + 2
    try {
      const titleEn = String(row.titleEn || '').trim()
      const titleAr = String(row.titleAr || '').trim()
      const authorName = String(row.authorName || '').trim()
      if (!titleEn || !titleAr) throw new Error('titleEn and titleAr are required')
      if (!authorName) throw new Error('authorName is required')

      const publishedOn = parseDate(row.publishedOn)
      if (!publishedOn) throw new Error('publishedOn must be YYYY-MM-DD')

      const documentEn = sanitizeTipTapDocument(readJsonCell(row.documentEnJson, emptyDocument())) || emptyDocument()
      const documentAr = sanitizeTipTapDocument(readJsonCell(row.documentArJson, emptyDocument())) || emptyDocument()

      await db.$transaction(async (tx) => {
        const category = await resolveCategory(tx, row)
        if (!category) throw new Error('categorySlug or categoryId is required and must exist')

        const preferredId = String(row.id || '').trim()
        const preferredSlug = String(row.slug || '').trim()
        const current = await findExistingBlog(tx, { preferredId, preferredSlug, titleEn })

        const featuredResult = await resolveMediaForImport(tx, mediaImportRef(row, 'featured'), {
          visibility: 'PUBLIC',
          existingId: current?.featuredMediaId || null,
          label: 'blog-featured-pending.png',
        })
        const featured = featuredResult.media
        if (featuredResult.skipped) {
          warnings.push(`Row ${line}: featured image skipped for “${titleEn}”`)
        }

        const attachmentResolved = await resolveMediaRef(tx, mediaImportRef(row, 'attachment'), {
          visibility: 'PRIVATE',
        })
        const attachment = attachmentResolved || (current?.attachmentMediaId
          ? await tx.mediaAsset.findUnique({ where: { id: current.attachmentMediaId } })
          : null)

        const translationCreate = [
          { locale: 'EN', title: titleEn, document: documentEn },
          { locale: 'AR', title: titleAr, document: documentAr },
        ]

        if (current) {
          const slug = preferredSlug || (await uniqueContentSlug(tx, 'blog', titleEn, current.id))
          if (!slug) throw new Error('Could not resolve slug')
          await tx.blogTranslation.deleteMany({ where: { blogId: current.id } })
          await tx.blog.update({
            where: { id: current.id },
            data: {
              slug,
              categoryId: category.id,
              authorName,
              publishedOn,
              published: readBoolCell(row.published, false),
              featuredMediaId: featured.id,
              attachmentMediaId: attachment?.id || null,
              attachmentDisplayName: attachment
                ? String(row.attachmentDisplayName || attachment.originalFilename || '').trim() || null
                : null,
              translations: { create: translationCreate },
            },
          })
          updated += 1
        } else {
          let slug = preferredSlug || (await uniqueContentSlug(tx, 'blog', titleEn))
          if (!slug) throw new Error('Could not resolve slug')
          const clash = await tx.blog.findUnique({ where: { slug } })
          if (clash) slug = await uniqueContentSlug(tx, 'blog', titleEn)

          await tx.blog.create({
            data: {
              slug,
              categoryId: category.id,
              authorName,
              publishedOn,
              published: readBoolCell(row.published, false),
              featuredMediaId: featured.id,
              attachmentMediaId: attachment?.id || null,
              attachmentDisplayName: attachment
                ? String(row.attachmentDisplayName || attachment.originalFilename || '').trim() || null
                : null,
              translations: { create: translationCreate },
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

async function findExistingBlog(tx, { preferredId, preferredSlug, titleEn }) {
  if (preferredId) {
    const byId = await tx.blog.findUnique({ where: { id: preferredId } })
    if (byId) return byId
  }
  if (preferredSlug) {
    const bySlug = await tx.blog.findUnique({ where: { slug: preferredSlug } })
    if (bySlug) return bySlug
  }
  if (titleEn) {
    const translation = await tx.blogTranslation.findFirst({
      where: { locale: 'EN', title: titleEn },
      select: { blogId: true },
    })
    if (translation) return tx.blog.findUnique({ where: { id: translation.blogId } })
  }
  return null
}

async function resolveCategory(tx, row) {
  const categoryId = String(row.categoryId || '').trim()
  const categorySlug = String(row.categorySlug || '').trim()
  if (categoryId) {
    const byId = await tx.blogCategory.findUnique({ where: { id: categoryId } })
    if (byId) return byId
  }
  if (categorySlug) {
    return tx.blogCategory.findUnique({ where: { slug: categorySlug } })
  }
  return null
}

function parseDate(value) {
  const text = String(value || '').trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null
  const date = new Date(`${text}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

function emptyDocument() {
  return { type: 'doc', content: [{ type: 'paragraph' }] }
}
