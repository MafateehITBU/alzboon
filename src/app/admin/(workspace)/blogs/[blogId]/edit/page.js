import PageHeader from '@/components/admin/PageHeader'
import BlogEditorForm from '@/components/admin/blog/BlogEditorForm'
import { requirePermission } from '@/lib/auth/current-admin'
import { getBlogForAdmin } from '@/lib/blog/blogs'
import { listAllCategories } from '@/lib/blog/categories'
import { getPrisma } from '@/lib/prisma/client'

export const metadata = {
  title: 'Edit blog',
  robots: { index: false, follow: false },
}

export default async function EditBlogPage({ params, searchParams }) {
  const current = await requirePermission('MANAGE_BLOGS')
  const { blogId } = await params
  const query = await searchParams
  const [blog, categories] = await Promise.all([
    getBlogForAdmin(getPrisma(), current.admin.id, blogId),
    listAllCategories(getPrisma(), current.admin.id),
  ])

  return (
    <>
      <PageHeader title={blog.titleEn || 'Edit blog'} description="Update bilingual content, publishing status, and media." />
      <BlogEditorForm mode="edit" blog={blog} categories={categories} savedNotice={query?.saved === '1'} />
    </>
  )
}
