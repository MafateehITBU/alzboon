'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { adminActionMessage } from '@/lib/auth/admin-messages'
import { AuthError } from '@/lib/auth/errors'
import { logoutCurrentSession, requireAdmin } from '@/lib/auth/current-admin'
import { changeOwnPassword, updateOwnProfile } from '@/lib/auth/self-account'
import { discardStoredPhoto, saveProfilePhoto } from '@/lib/media/save-profile-photo'
import { removeStoredFile } from '@/lib/storage/objects'
import { getPrisma } from '@/lib/prisma/client'

export async function updateOwnProfileAction(_previous, formData) {
  const current = await requireAdmin()
  let stagedKey = null

  try {
    const removeProfile = formData.get('removeProfile') === '1'
    const profileMedia = removeProfile ? null : await saveProfilePhoto(formData.get('photo'))
    stagedKey = profileMedia?.storageKey ?? null

    const result = await updateOwnProfile(getPrisma(), current.admin.id, {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      profileMedia,
      removeProfile,
    })

    if (result.removedStorageKey) {
      await removeStoredFile('PRIVATE', result.removedStorageKey)
    }

    revalidatePath('/admin/account')
    revalidatePath('/admin/profile')
    revalidatePath('/admin')
    return { ok: true, message: 'Your profile was saved.' }
  } catch (error) {
    if (stagedKey) await discardStoredPhoto(stagedKey)
    return failure(error)
  }
}

export async function changeOwnPasswordAction(_previous, formData) {
  const current = await requireAdmin()

  try {
    await changeOwnPassword(getPrisma(), current.admin.id, {
      currentPassword: formData.get('currentPassword'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    })

    await logoutCurrentSession()
    redirect('/admin/login?passwordChanged=1')
  } catch (error) {
    if (isRedirect(error)) throw error
    return failure(error)
  }
}

function failure(error) {
  if (error instanceof AuthError) {
    return { ok: false, message: adminActionMessage(error.code), code: error.code }
  }
  console.error(error)
  return { ok: false, message: adminActionMessage('UNKNOWN') }
}

function isRedirect(error) {
  return typeof error?.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')
}
