'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { revalidatePublicContent } from '@/lib/site/revalidate-public'
import { AuthError } from '@/lib/auth/errors'
import { requirePermission } from '@/lib/auth/current-admin'
import { createBlog, deleteBlog, updateBlog } from '@/lib/blog/blogs'
import { blogActionMessage, BlogError } from '@/lib/blog/errors'
import { notifyBriefSubscribers } from '@/lib/mail/blog-notification'
import { discardAttachment, saveAttachment } from '@/lib/media/save-attachment'
import { discardPublicImage, savePublicImage } from '@/lib/media/save-public-image'
import { removeStoredFile } from '@/lib/storage/objects'
import { getPrisma } from '@/lib/prisma/client'
import { importBlogsCsv } from '@/lib/csv/blogs-csv'
import { formatImportResult } from '@/lib/csv/import-result'

async function notifyIfNewlyPublic(db, result) {
  if (!result?.becamePublic || !result?.blog) return
  try {
    await notifyBriefSubscribers(db, result.blog)
  } catch (error) {
    console.error('[blogs] Subscriber notification failed after publish.', error)
  }
}

export async function createBlogAction(_previous, formData) {
  const current = await requirePermission('MANAGE_BLOGS')
  const staged = []

  try {
    const featuredMedia = await savePublicImage(formData.get('featuredImage'))
    if (featuredMedia?.storageKey) staged.push({ visibility: 'PUBLIC', storageKey: featuredMedia.storageKey })
    if (!featuredMedia) throw new BlogError('MISSING_IMAGE')

    const attachmentMedia = await saveAttachment(formData.get('attachment'))
    if (attachmentMedia?.storageKey) staged.push({ visibility: 'PRIVATE', storageKey: attachmentMedia.storageKey })

    const result = await createBlog(getPrisma(), current.admin.id, {
      titleEn: formData.get('titleEn'),
      titleAr: formData.get('titleAr'),
      descriptionEn: formData.get('descriptionEn'),
      descriptionAr: formData.get('descriptionAr'),
      authorName: formData.get('authorName'),
      publishedOn: formData.get('publishedOn'),
      published: formData.get('published') === '1',
      categoryId: formData.get('categoryId'),
      documentEn: parseJson(formData.get('documentEn')),
      documentAr: parseJson(formData.get('documentAr')),
      featuredMedia,
      attachmentMedia,
      attachmentDisplayName: formData.get('attachmentDisplayName'),
    })

    revalidatePath('/admin/blogs')
    revalidatePath('/admin')
    revalidatePublicContent({ blogs: true })
    await notifyIfNewlyPublic(getPrisma(), result)
    redirect('/admin/blogs?notice=created')
  } catch (error) {
    if (isRedirect(error)) throw error
    for (const file of staged) await removeStoredFile(file.visibility, file.storageKey)
    return failure(error)
  }
}

export async function updateBlogAction(_previous, formData) {
  const current = await requirePermission('MANAGE_BLOGS')
  const staged = []
  const blogId = String(formData.get('blogId') || '')

  try {
    const featuredMedia = await savePublicImage(formData.get('featuredImage'))
    if (featuredMedia?.storageKey) staged.push({ visibility: 'PUBLIC', storageKey: featuredMedia.storageKey })

    const attachmentMedia = await saveAttachment(formData.get('attachment'))
    if (attachmentMedia?.storageKey) staged.push({ visibility: 'PRIVATE', storageKey: attachmentMedia.storageKey })

    const result = await updateBlog(getPrisma(), current.admin.id, blogId, {
      titleEn: formData.get('titleEn'),
      titleAr: formData.get('titleAr'),
      descriptionEn: formData.get('descriptionEn'),
      descriptionAr: formData.get('descriptionAr'),
      authorName: formData.get('authorName'),
      publishedOn: formData.get('publishedOn'),
      published: formData.get('published') === '1',
      categoryId: formData.get('categoryId'),
      documentEn: parseJson(formData.get('documentEn')),
      documentAr: parseJson(formData.get('documentAr')),
      featuredMedia,
      attachmentMedia,
      removeAttachment: formData.get('removeAttachment') === '1',
      attachmentDisplayName: formData.get('attachmentDisplayName'),
    })

    for (const media of result.removedMedia) {
      await removeStoredFile(media.visibility, media.storageKey)
    }

    revalidatePath('/admin/blogs')
    revalidatePath(`/admin/blogs/${blogId}/edit`)
    revalidatePath('/admin')
    revalidatePublicContent({ blogs: true })
    await notifyIfNewlyPublic(getPrisma(), result)
    redirect('/admin/blogs?notice=updated')
  } catch (error) {
    if (isRedirect(error)) throw error
    for (const file of staged) {
      if (file.visibility === 'PUBLIC') await discardPublicImage(file.storageKey)
      else await discardAttachment(file.storageKey)
    }
    return failure(error)
  }
}

export async function deleteBlogAction(_previous, formData) {
  const current = await requirePermission('MANAGE_BLOGS')

  try {
    const result = await deleteBlog(getPrisma(), current.admin.id, String(formData.get('blogId') || ''))
    for (const media of result.removedMedia) {
      await removeStoredFile(media.visibility, media.storageKey)
    }
    revalidatePath('/admin/blogs')
    revalidatePath('/admin')
    revalidatePublicContent({ blogs: true })
    return { ok: true, message: 'The blog was deleted.' }
  } catch (error) {
    return failure(error)
  }
}

export async function importBlogsCsvAction(formData) {
  const current = await requirePermission('MANAGE_BLOGS')
  try {
    const file = formData.get('file')
    if (!(file instanceof File) || file.size < 1) {
      return { ok: false, message: 'Choose a CSV file to import.' }
    }
    const text = await file.text()
    const result = await importBlogsCsv(getPrisma(), current.admin.id, text)
    revalidatePath('/admin/blogs')
    revalidatePath('/admin')
    revalidatePublicContent({ blogs: true })
    return {
      ok: result.errors.length === 0 || result.created + result.updated > 0,
      message: formatImportResult('blogs', result),
      result,
    }
  } catch (error) {
    console.error(error)
    return { ok: false, message: 'Blogs CSV import failed.' }
  }
}

function parseJson(value) {
  if (typeof value !== 'string' || !value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function failure(error) {
  if (error instanceof BlogError || error instanceof AuthError) {
    return { ok: false, message: blogActionMessage(error.code), code: error.code }
  }
  console.error(error)
  return { ok: false, message: blogActionMessage('UNKNOWN') }
}

function isRedirect(error) {
  return typeof error?.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')
}
