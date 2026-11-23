'use server'

import { revalidatePath } from 'next/cache'
import { AuthError } from '@/lib/auth/errors'
import { requirePermission } from '@/lib/auth/current-admin'
import { createBlogCategory, deleteBlogCategory, updateBlogCategory } from '@/lib/blog/categories'
import { blogActionMessage, BlogError } from '@/lib/blog/errors'
import { getPrisma } from '@/lib/prisma/client'

export async function createCategoryAction(_previous, formData) {
  const current = await requirePermission('MANAGE_BLOGS')

  try {
    const category = await createBlogCategory(getPrisma(), current.admin.id, {
      nameEn: formData.get('nameEn'),
      nameAr: formData.get('nameAr'),
    })
    revalidatePath('/admin/blog-categories')
    revalidatePath('/admin')
    return { ok: true, message: `${category.nameEn} was created.`, categoryId: category.id }
  } catch (error) {
    return failure(error)
  }
}

export async function updateCategoryAction(_previous, formData) {
  const current = await requirePermission('MANAGE_BLOGS')

  try {
    const category = await updateBlogCategory(getPrisma(), current.admin.id, String(formData.get('categoryId') || ''), {
      nameEn: formData.get('nameEn'),
      nameAr: formData.get('nameAr'),
    })
    revalidatePath('/admin/blog-categories')
    return { ok: true, message: `${category.nameEn} was updated.`, categoryId: category.id }
  } catch (error) {
    return failure(error)
  }
}

export async function deleteCategoryAction(_previous, formData) {
  const current = await requirePermission('MANAGE_BLOGS')

  try {
    await deleteBlogCategory(getPrisma(), current.admin.id, String(formData.get('categoryId') || ''))
    revalidatePath('/admin/blog-categories')
    revalidatePath('/admin')
    return { ok: true, message: 'The category was deleted.' }
  } catch (error) {
    return failure(error)
  }
}

function failure(error) {
  if (error instanceof BlogError || error instanceof AuthError) {
    return { ok: false, message: blogActionMessage(error.code), code: error.code }
  }
  console.error(error)
  return { ok: false, message: blogActionMessage('UNKNOWN') }
}
