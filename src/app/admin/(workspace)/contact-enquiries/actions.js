'use server'

import { revalidatePath } from 'next/cache'
import { AuthError } from '@/lib/auth/errors'
import { requirePermission } from '@/lib/auth/current-admin'
import { deleteEnquiry, updateEnquiryStatus } from '@/lib/enquiry/enquiries'
import { ENQUIRY_STATUSES, enquiryActionMessage, EnquiryError } from '@/lib/enquiry/errors'
import { getPrisma } from '@/lib/prisma/client'

export async function updateEnquiryStatusAction(_previous, formData) {
  const current = await requirePermission('MANAGE_CONTACT_ENQUIRIES')

  try {
    const status = String(formData.get('status') || '').toUpperCase()
    if (!ENQUIRY_STATUSES.includes(status)) throw new EnquiryError('INVALID_STATUS')

    const enquiry = await updateEnquiryStatus(
      getPrisma(),
      current.admin.id,
      String(formData.get('enquiryId') || ''),
      status,
    )

    revalidatePath('/admin/contact-enquiries')
    revalidatePath('/admin')
    return {
      ok: true,
      message: `Marked as ${statusLabel(status)}.`,
      enquiryId: enquiry.id,
      status: enquiry.status,
    }
  } catch (error) {
    return failure(error)
  }
}

export async function deleteEnquiryAction(_previous, formData) {
  const current = await requirePermission('MANAGE_CONTACT_ENQUIRIES')

  try {
    await deleteEnquiry(getPrisma(), current.admin.id, String(formData.get('enquiryId') || ''))
    revalidatePath('/admin/contact-enquiries')
    revalidatePath('/admin')
    return { ok: true, message: 'The enquiry was deleted.' }
  } catch (error) {
    return failure(error)
  }
}

function statusLabel(status) {
  if (status === 'NEW') return 'New'
  if (status === 'READ') return 'Read'
  return 'Archived'
}

function failure(error) {
  if (error instanceof EnquiryError || error instanceof AuthError) {
    return { ok: false, message: enquiryActionMessage(error.code), code: error.code }
  }
  console.error(error)
  return { ok: false, message: enquiryActionMessage('UNKNOWN') }
}
