'use server'

import { revalidatePath } from 'next/cache'
import { revalidatePublicContent } from '@/lib/site/revalidate-public'
import { redirect } from 'next/navigation'
import { AuthError } from '@/lib/auth/errors'
import { requirePermission } from '@/lib/auth/current-admin'
import { discardPublicImage, savePublicImage } from '@/lib/media/save-public-image'
import { removeStoredFile } from '@/lib/storage/objects'
import { getPrisma } from '@/lib/prisma/client'
import { createService, deleteService, updateService } from '@/lib/service/services'
import { serviceActionMessage, ServiceError } from '@/lib/service/errors'

export async function createServiceAction(_previous, formData) {
  const current = await requirePermission('MANAGE_SERVICES')
  const staged = []

  try {
    const heroMedia = await savePublicImage(formData.get('heroImage'))
    if (heroMedia?.storageKey) staged.push(heroMedia.storageKey)
    if (!heroMedia) throw new ServiceError('MISSING_HERO_IMAGE')

    const practiceAreaMedia = await savePublicImage(formData.get('practiceAreaImage'))
    if (practiceAreaMedia?.storageKey) staged.push(practiceAreaMedia.storageKey)
    if (!practiceAreaMedia) throw new ServiceError('MISSING_PRACTICE_IMAGE')

    const result = await createService(getPrisma(), current.admin.id, {
      ...parseServiceFields(formData),
      heroMedia,
      practiceAreaMedia,
    })

    revalidatePath('/admin/services')
    revalidatePath('/admin')
    revalidatePublicContent({ home: true, services: true })
    redirect('/admin/services?notice=created')
  } catch (error) {
    if (isRedirect(error)) throw error
    for (const storageKey of staged) await discardPublicImage(storageKey)
    return failure(error)
  }
}

export async function updateServiceAction(_previous, formData) {
  const current = await requirePermission('MANAGE_SERVICES')
  const staged = []
  const serviceId = String(formData.get('serviceId') || '')

  try {
    const heroMedia = await savePublicImage(formData.get('heroImage'))
    if (heroMedia?.storageKey) staged.push(heroMedia.storageKey)

    const practiceAreaMedia = await savePublicImage(formData.get('practiceAreaImage'))
    if (practiceAreaMedia?.storageKey) staged.push(practiceAreaMedia.storageKey)

    const result = await updateService(getPrisma(), current.admin.id, serviceId, {
      ...parseServiceFields(formData),
      heroMedia,
      practiceAreaMedia,
    })

    for (const media of result.removedMedia) {
      await removeStoredFile(media.visibility, media.storageKey)
    }

    revalidatePath('/admin/services')
    revalidatePath(`/admin/services/${serviceId}/edit`)
    revalidatePath('/admin')
    revalidatePublicContent({ home: true, services: true })
    redirect('/admin/services?notice=updated')
  } catch (error) {
    if (isRedirect(error)) throw error
    for (const storageKey of staged) await discardPublicImage(storageKey)
    return failure(error)
  }
}

export async function deleteServiceAction(_previous, formData) {
  const current = await requirePermission('MANAGE_SERVICES')

  try {
    const result = await deleteService(getPrisma(), current.admin.id, String(formData.get('serviceId') || ''))
    for (const media of result.removedMedia) {
      await removeStoredFile(media.visibility, media.storageKey)
    }
    revalidatePath('/admin/services')
    revalidatePath('/admin')
    revalidatePublicContent({ home: true, services: true })
    return { ok: true, message: 'The service was deleted.' }
  } catch (error) {
    return failure(error)
  }
}

function parseServiceFields(formData) {
  return {
    nameEn: formData.get('nameEn'),
    nameAr: formData.get('nameAr'),
    heroTitleEn: formData.get('heroTitleEn'),
    heroTitleAr: formData.get('heroTitleAr'),
    heroDescriptionEn: formData.get('heroDescriptionEn'),
    heroDescriptionAr: formData.get('heroDescriptionAr'),
    overviewTitleEn: formData.get('overviewTitleEn'),
    overviewTitleAr: formData.get('overviewTitleAr'),
    overviewDescriptionEn: formData.get('overviewDescriptionEn'),
    overviewDescriptionAr: formData.get('overviewDescriptionAr'),
    practiceAreas: parseJson(formData.get('practiceAreas')),
  }
}

function parseJson(value) {
  if (typeof value !== 'string' || !value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function failure(error) {
  if (error instanceof ServiceError) {
    return { ok: false, message: serviceActionMessage(error.code), code: error.code }
  }
  if (error instanceof AuthError) {
    const code = error.code === 'INVALID_IMAGE' ? 'INVALID_IMAGE' : error.code
    return { ok: false, message: serviceActionMessage(code), code }
  }
  console.error(error)
  return { ok: false, message: serviceActionMessage('UNKNOWN'), code: 'UNKNOWN' }
}

function isRedirect(error) {
  return typeof error?.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')
}
