import PageHeader from '@/components/admin/PageHeader'
import CategoriesPanel from '@/components/admin/blog/CategoriesPanel'
import { requirePermission } from '@/lib/auth/current-admin'
import { listBlogCategories, parseCategoryListQuery } from '@/lib/blog/categories'
import { BlogError } from '@/lib/blog/errors'
import { getPrisma } from '@/lib/prisma/client'

export const metadata = {
  title: 'Blog categories',
  robots: { index: false, follow: false },
}

export default async function BlogCategoriesPage({ searchParams }) {
  const current = await requirePermission('MANAGE_BLOGS')
  const query = parseCategoryListQuery(await searchParams)

  let listing = null
  let loadError = null

  try {
    listing = await listBlogCategories(getPrisma(), current.admin.id, query)
  } catch (error) {
    if (error instanceof BlogError && (error.code === 'FORBIDDEN' || error.code === 'UNAUTHENTICATED')) throw error
    loadError = 'The category list could not be loaded.'
  }

  return (
    <>
      <PageHeader title="Blog categories" description="Organize blogs with English and Arabic category names and unique slugs." />
      <CategoriesPanel query={query} listing={listing} loadError={loadError} />
    </>
  )
}
