'use server'

import { revalidatePath } from 'next/cache'
import { AuthError } from '@/lib/auth/errors'
import { revalidatePublicContent } from '@/lib/site/revalidate-public'
import { requirePermission } from '@/lib/auth/current-admin'
import { discardPublicImage, savePublicImage } from '@/lib/media/save-public-image'
import { removeStoredFile } from '@/lib/storage/objects'
import { getPrisma } from '@/lib/prisma/client'
import { websiteActionMessage, WebsiteError } from '@/lib/website/errors'
import { saveWebsiteSettings } from '@/lib/website/settings'

export async function saveWebsiteSettingsAction(_previous, formData) {
  const current = await requirePermission('MANAGE_WEBSITE_SETTINGS')
  let stagedKey = null

  try {
    const logoMedia = await savePublicImage(formData.get('logo'))
    stagedKey = logoMedia?.storageKey ?? null

    const result = await saveWebsiteSettings(getPrisma(), current.admin.id, {
      contactEmail: formData.get('contactEmail'),
      businessHoursEn: formData.get('businessHoursEn'),
      businessHoursAr: formData.get('businessHoursAr'),
      phones: parseJsonArray(formData.get('phonesJson')),
      addresses: parseJsonArray(formData.get('addressesJson')),
      mapLocations: parseJsonArray(formData.get('mapLocationsJson')),
      socialLinks: {
        LINKEDIN: formData.get('social_LINKEDIN'),
        FACEBOOK: formData.get('social_FACEBOOK'),
        INSTAGRAM: formData.get('social_INSTAGRAM'),
        X: formData.get('social_X'),
      },
      logoMedia,
      removeLogo: formData.get('removeLogo') === '1',
    })

    if (result.removedMedia?.storageKey) {
      await removeStoredFile(result.removedMedia.visibility, result.removedMedia.storageKey)
    }

    revalidatePath('/admin/website')
    revalidatePath('/')
    revalidatePublicContent({ home: true, contact: true })
    return { ok: true, message: 'Website information was saved.', settings: result.settings }
  } catch (error) {
    if (stagedKey) await discardPublicImage(stagedKey)
    return failure(error)
  }
}

function parseJsonArray(value) {
  if (typeof value !== 'string' || !value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function failure(error) {
  if (error instanceof WebsiteError || error instanceof AuthError) {
    return { ok: false, message: websiteActionMessage(error.code), code: error.code }
  }
  console.error(error)
  return { ok: false, message: websiteActionMessage('UNKNOWN') }
}
