import BlogsPageView from '@/components/website/blogs/BlogsPageView'
import {
  countPublishedBlogs,
  listPublicBlogCategories,
  listPublishedBlogs,
  serializePublicBlogListItem,
} from '@/lib/blog/public'
import { getMessages } from '@/lib/i18n/messages'
import { getPrisma } from '@/lib/prisma/client'
import { absoluteUrl } from '@/lib/site/config'
import { loadPublicSiteData } from '@/lib/site/load-public'

const PAGE_SIZE = 6

export async function generateMetadata() {
  const copy = getMessages('en').blogs
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: {
      canonical: '/blogs',
      languages: { en: '/blogs', ar: '/ar/blogs' },
    },
    openGraph: {
      title: `${copy.metaTitle} | Awwad Alzboon Legal Consultancy`,
      description: copy.metaDescription,
      url: absoluteUrl('/blogs'),
      type: 'website',
    },
  }
}

export default async function BlogsPage({ searchParams }) {
  const query = await searchParams
  const categorySlug = String(query?.category || '').trim()
  const page = Math.max(1, Number.parseInt(String(query?.page || '1'), 10) || 1)
  const site = await loadPublicSiteData('en')

  let blogs = []
  let categories = []
  let total = 0
  try {
    const db = getPrisma()
    ;[blogs, total, categories] = await Promise.all([
      listPublishedBlogs(db, { take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE, categorySlug }),
      countPublishedBlogs(db, { categorySlug }),
      listPublicBlogCategories(db),
    ])
    blogs = blogs.map((blog) => serializePublicBlogListItem(blog, 'en')).filter(Boolean)
  } catch {
    blogs = []
    total = 0
    categories = []
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <BlogsPageView
      locale={site.locale}
      messages={site.messages}
      contact={site.contact}
      services={site.services}
      blogs={blogs}
      categories={categories}
      categorySlug={categorySlug}
      page={page}
      pageCount={pageCount}
    />
  )
}
