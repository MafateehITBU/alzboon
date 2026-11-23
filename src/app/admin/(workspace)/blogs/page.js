import PageHeader from '@/components/admin/PageHeader'
import BlogsPanel from '@/components/admin/blog/BlogsPanel'
import { requirePermission } from '@/lib/auth/current-admin'
import { listBlogs, parseBlogListQuery } from '@/lib/blog/blogs'
import { listAllCategories } from '@/lib/blog/categories'
import { BlogError } from '@/lib/blog/errors'
import { getPrisma } from '@/lib/prisma/client'

export const metadata = {
  title: 'Blogs',
  robots: { index: false, follow: false },
}

export default async function BlogsPage({ searchParams }) {
  const current = await requirePermission('MANAGE_BLOGS')
  const query = parseBlogListQuery(await searchParams)

  let listing = null
  let categories = []
  let loadError = null

  try {
    ;[listing, categories] = await Promise.all([
      listBlogs(getPrisma(), current.admin.id, query),
      listAllCategories(getPrisma(), current.admin.id),
    ])
  } catch (error) {
    if (error instanceof BlogError && (error.code === 'FORBIDDEN' || error.code === 'UNAUTHENTICATED')) throw error
    loadError = 'The blog list could not be loaded.'
  }

  return (
    <>
      <PageHeader title="Blogs" description="Create and publish bilingual articles with featured images and optional attachments." />
      <BlogsPanel query={query} listing={listing} categories={categories} loadError={loadError} />
    </>
  )
}
