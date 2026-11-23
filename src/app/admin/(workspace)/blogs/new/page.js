import PageHeader from '@/components/admin/PageHeader'
import BlogEditorForm from '@/components/admin/blog/BlogEditorForm'
import { requirePermission } from '@/lib/auth/current-admin'
import { listAllCategories } from '@/lib/blog/categories'
import { getPrisma } from '@/lib/prisma/client'

export const metadata = {
  title: 'New blog',
  robots: { index: false, follow: false },
}

export default async function NewBlogPage() {
  const current = await requirePermission('MANAGE_BLOGS')
  const categories = await listAllCategories(getPrisma(), current.admin.id)

  return (
    <>
      <PageHeader title="New blog" description="Write English and Arabic content, then choose publishing and media settings." />
      <BlogEditorForm mode="create" categories={categories} />
    </>
  )
}
