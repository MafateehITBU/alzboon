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

function readAdminFormValues(formData) {
  return {
    name: String(formData.get('name') || ''),
    email: String(formData.get('email') || ''),
    phone: String(formData.get('phone') || ''),
    role: String(formData.get('role') || 'ADMIN'),
    permissions: selectedPermissions(formData),
    active: formData.get('active') === '1',
    password: String(formData.get('password') || ''),
    confirmPassword: String(formData.get('confirmPassword') || ''),
  }
}

export async function createAdminAction(_previous, formData) {
  const current = await requirePermission('MANAGE_ADMINS')
  let stagedKey = null
  const values = readAdminFormValues(formData)

  try {
    const password = values.password
    const confirmPassword = values.confirmPassword
    if (password !== confirmPassword) throw new AuthError('PASSWORD_MISMATCH')

    const profileMedia = await saveProfilePhoto(formData.get('photo'))
    stagedKey = profileMedia?.storageKey ?? null

    const created = await createAdminAccount(getPrisma(), current.admin.id, {
      name: values.name,
      email: values.email,
      phone: values.phone,
      password,
      role: values.role,
      permissions: values.permissions,
      profileMedia,
    })

    revalidatePath('/admin/admins')
    revalidatePath('/admin')
    return { ok: true, message: `${created.name} was created.`, adminId: created.id }
  } catch (error) {
    if (stagedKey) await discardStoredPhoto(stagedKey)
    return failure(error, values)
  }
}

export async function updateAdminAction(_previous, formData) {
  const current = await requirePermission('MANAGE_ADMINS')
  let stagedKey = null
  const values = readAdminFormValues(formData)

  try {
    const targetId = String(formData.get('adminId') || '')
    const isSelf = targetId === current.admin.id
    const password = values.password
    const confirmPassword = values.confirmPassword
    if (password && password !== confirmPassword) throw new AuthError('PASSWORD_MISMATCH')

    const removeProfile = formData.get('removePhoto') === '1'
    const profileMedia = removeProfile ? null : await saveProfilePhoto(formData.get('photo'))
    stagedKey = profileMedia?.storageKey ?? null

    const updated = await updateAdminAccess(getPrisma(), current.admin.id, targetId, {
      name: values.name,
      email: values.email,
      phone: values.phone,
      active: values.active,
      password: password || undefined,
      profileMedia,
      removeProfile,
      ...(isSelf
        ? {}
        : {
            role: values.role || undefined,
            permissions: values.permissions,
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
    return failure(error, values)
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

function failure(error, values = null) {
  if (error instanceof AuthError) {
    return { ok: false, message: adminActionMessage(error.code), code: error.code, values }
  }
  console.error(error)
  return { ok: false, message: adminActionMessage('UNKNOWN'), values }
}
