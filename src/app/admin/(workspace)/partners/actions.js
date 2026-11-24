'use server'

import { revalidatePath } from 'next/cache'
import { AuthError } from '@/lib/auth/errors'
import { requirePermission } from '@/lib/auth/current-admin'
import { discardPublicImage, savePublicImage } from '@/lib/media/save-public-image'
import { removeStoredFile } from '@/lib/storage/objects'
import { getPrisma } from '@/lib/prisma/client'
import { websiteActionMessage, WebsiteError } from '@/lib/website/errors'
import { createPartner, deletePartner, updatePartner } from '@/lib/website/partners'
import { importPartnersCsv } from '@/lib/csv/partners-csv'
import { formatImportResult } from '@/lib/csv/import-result'

export async function createPartnerAction(_previous, formData) {
  const current = await requirePermission('MANAGE_WEBSITE_SETTINGS')
  let stagedKey = null

  try {
    const logoMedia = await savePublicImage(formData.get('logo'))
    stagedKey = logoMedia?.storageKey ?? null
    if (!logoMedia) throw new WebsiteError('MISSING_LOGO')

    const result = await createPartner(getPrisma(), current.admin.id, {
      name: formData.get('name'),
      logoMedia,
    })

    revalidatePath('/admin/partners')
    return { ok: true, message: `${result.partner.name} was created.`, partnerId: result.partner.id }
  } catch (error) {
    if (stagedKey) await discardPublicImage(stagedKey)
    return failure(error)
  }
}

export async function updatePartnerAction(_previous, formData) {
  const current = await requirePermission('MANAGE_WEBSITE_SETTINGS')
  let stagedKey = null

  try {
    const logoMedia = await savePublicImage(formData.get('logo'))
    stagedKey = logoMedia?.storageKey ?? null

    const result = await updatePartner(getPrisma(), current.admin.id, String(formData.get('partnerId') || ''), {
      name: formData.get('name'),
      logoMedia,
    })

    if (result.removedMedia?.storageKey) {
      await removeStoredFile(result.removedMedia.visibility, result.removedMedia.storageKey)
    }

    revalidatePath('/admin/partners')
    return { ok: true, message: `${result.partner.name} was updated.`, partnerId: result.partner.id }
  } catch (error) {
    if (stagedKey) await discardPublicImage(stagedKey)
    return failure(error)
  }
}

export async function deletePartnerAction(_previous, formData) {
  const current = await requirePermission('MANAGE_WEBSITE_SETTINGS')

  try {
    const result = await deletePartner(getPrisma(), current.admin.id, String(formData.get('partnerId') || ''))
    if (result.removedMedia?.storageKey) {
      await removeStoredFile(result.removedMedia.visibility, result.removedMedia.storageKey)
    }

    revalidatePath('/admin/partners')
    return { ok: true, message: 'The partner was deleted.' }
  } catch (error) {
    return failure(error)
  }
}

export async function importPartnersCsvAction(formData) {
  const current = await requirePermission('MANAGE_WEBSITE_SETTINGS')
  try {
    const file = formData.get('file')
    if (!(file instanceof File) || file.size < 1) {
      return { ok: false, message: 'Choose a CSV file to import.' }
    }
    const text = await file.text()
    const result = await importPartnersCsv(getPrisma(), current.admin.id, text)
    revalidatePath('/admin/partners')
    return {
      ok: result.errors.length === 0 || result.created + result.updated > 0,
      message: formatImportResult('partners', result),
      result,
    }
  } catch (error) {
    console.error(error)
    return { ok: false, message: 'Partners CSV import failed.' }
  }
}

function failure(error) {
  if (error instanceof WebsiteError || error instanceof AuthError) {
    return { ok: false, message: websiteActionMessage(error.code), code: error.code }
  }
  console.error(error)
  return { ok: false, message: websiteActionMessage('UNKNOWN') }
}
