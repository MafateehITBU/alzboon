'use server'

import { revalidatePath } from 'next/cache'
import {
  createAdminAccount,
  deleteAdminAccount,
  updateAdminAccess,
} from '@/lib/auth/admin-access'
import { adminActionMessage } from '@/lib/auth/admin-messages'
import { requirePermission } from '@/lib/auth/current-admin'
import { AuthError } from '@/lib/auth/errors'
import { PERMISSIONS } from '@/lib/auth/constants'
import { discardStoredPhoto, saveProfilePhoto } from '@/lib/media/save-profile-photo'
import { getPrisma } from '@/lib/prisma/client'

export async function createAdminAction(_previous, formData) {
  const current = await requirePermission('MANAGE_ADMINS')
  let stagedKey = null

  try {
    const password = String(formData.get('password') || '')
    const confirmPassword = String(formData.get('confirmPassword') || '')
    if (password !== confirmPassword) throw new AuthError('PASSWORD_MISMATCH')

    const profileMedia = await saveProfilePhoto(formData.get('photo'))
    stagedKey = profileMedia?.storageKey ?? null

    const created = await createAdminAccount(getPrisma(), current.admin.id, {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      password,
      role: formData.get('role'),
      permissions: selectedPermissions(formData),
      profileMedia,
    })

    revalidatePath('/admin/admins')
    revalidatePath('/admin')
    return { ok: true, message: `${created.name} was created.`, adminId: created.id }
  } catch (error) {
    if (stagedKey) await discardStoredPhoto(stagedKey)
    return failure(error)
  }
}

export async function updateAdminAction(_previous, formData) {
  const current = await requirePermission('MANAGE_ADMINS')
  let stagedKey = null

  try {
    const targetId = String(formData.get('adminId') || '')
    const isSelf = targetId === current.admin.id
    const password = String(formData.get('password') || '')
    const confirmPassword = String(formData.get('confirmPassword') || '')
    if (password && password !== confirmPassword) throw new AuthError('PASSWORD_MISMATCH')

    const removeProfile = formData.get('removePhoto') === '1'
    const profileMedia = removeProfile ? null : await saveProfilePhoto(formData.get('photo'))
    stagedKey = profileMedia?.storageKey ?? null

    const updated = await updateAdminAccess(getPrisma(), current.admin.id, targetId, {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      active: formData.get('active') === '1',
      password: password || undefined,
      profileMedia,
      removeProfile,
      ...(isSelf
        ? {}
        : {
            role: formData.get('role') || undefined,
            permissions: selectedPermissions(formData),
          }),
    })

    if (updated.removedStorageKey) await discardStoredPhoto(updated.removedStorageKey)

    revalidatePath('/admin/admins')
    revalidatePath('/admin')
    revalidatePath('/admin/account')
    revalidatePath('/admin/profile')
    return { ok: true, message: `${updated.name} was updated.`, adminId: updated.id }
  } catch (error) {
    if (stagedKey) await discardStoredPhoto(stagedKey)
    return failure(error)
  }
}

export async function deleteAdminAction(_previous, formData) {
  const current = await requirePermission('MANAGE_ADMINS')

  try {
    const targetId = String(formData.get('adminId') || '')
    const result = await deleteAdminAccount(getPrisma(), current.admin.id, targetId)
    if (result.removedStorageKey) await discardStoredPhoto(result.removedStorageKey)

    revalidatePath('/admin/admins')
    revalidatePath('/admin')
    return { ok: true, message: 'The admin account was deleted.' }
  } catch (error) {
    return failure(error)
  }
}

function selectedPermissions(formData) {
  return PERMISSIONS.filter((permission) => formData.get(`permission_${permission}`) === '1')
}

function failure(error) {
  if (error instanceof AuthError) {
    return { ok: false, message: adminActionMessage(error.code), code: error.code }
  }
  console.error(error)
  return { ok: false, message: adminActionMessage('UNKNOWN') }
}
