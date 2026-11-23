import Link from 'next/link'
import PublicPage from '@/components/website/PublicPage'
import { withLocale } from '@/lib/i18n/paths'
import { getPrisma } from '@/lib/prisma/client'
import { absoluteUrl } from '@/lib/site/config'
import { loadPublicSiteData } from '@/lib/site/load-public'
import {
  countPublishedBlogs,
  listPublicBlogCategories,
  listPublishedBlogs,
  serializePublicBlogListItem,
} from '@/lib/blog/public'

const PAGE_SIZE = 9

export const metadata = {
  title: 'المدونة',
  description: 'مقالات وتحديثات من عواد الزبون للاستشارات القانونية.',
  alternates: { canonical: '/ar/blogs', languages: { en: '/blogs', ar: '/ar/blogs' } },
  openGraph: {
    title: 'المدونة | عواد الزبون',
    description: 'مقالات وتحديثات من عواد الزبون للاستشارات القانونية.',
    url: absoluteUrl('/ar/blogs'),
    locale: 'ar_AE',
  },
}

export default async function ArabicBlogsPage({ searchParams }) {
  const query = await searchParams
  const categorySlug = String(query?.category || '').trim()
  const page = Math.max(1, Number.parseInt(String(query?.page || '1'), 10) || 1)
  const site = await loadPublicSiteData('ar')

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
    blogs = blogs.map((blog) => serializePublicBlogListItem(blog, 'ar'))
  } catch {
    blogs = []
    total = 0
    categories = []
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <PublicPage locale={site.locale} messages={site.messages} contact={site.contact} services={site.services}>
      <p className="font-jakarta text-[11px] font-semibold tracking-[0.18em] text-teal uppercase">{site.messages.nav.blogs}</p>
      <h1 className="mt-2 font-abu text-4xl tracking-[-0.03em] text-ink">{site.messages.blogs.title}</h1>
      <p className="mt-3 max-w-2xl font-jakarta text-sm leading-6 text-body">{site.messages.blogs.description}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={withLocale('/blogs', 'ar')} className={`rounded-full px-3 py-1.5 font-jakarta text-xs font-semibold ${!categorySlug ? 'bg-teal text-white' : 'bg-cream text-body'}`}>
          {site.messages.blogs.allCategories}
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`${withLocale('/blogs', 'ar')}?category=${encodeURIComponent(category.slug)}`}
            className={`rounded-full px-3 py-1.5 font-jakarta text-xs font-semibold ${categorySlug === category.slug ? 'bg-teal text-white' : 'bg-cream text-body'}`}
          >
            {category.nameAr}
          </Link>
        ))}
      </div>
      {blogs.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-line bg-cream/60 p-5 font-jakarta text-sm text-body">{site.messages.blogs.empty}</p>
      ) : (
        <div className="mt-8 grid gap-5 min-[820px]:grid-cols-2 min-[1280px]:grid-cols-3">
          {blogs.map((blog) => (
            <Link key={blog.id} href={withLocale(`/blogs/${blog.slug}`, 'ar')} className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
              {blog.featuredUrl ? <img src={blog.featuredUrl} alt="" className="h-44 w-full object-cover" /> : null}
              <div className="p-4">
                <p className="font-jakarta text-xs text-teal">{blog.categoryName}</p>
                <h2 className="mt-2 font-abu text-xl text-ink">{blog.title}</h2>
                <p className="mt-2 font-jakarta text-xs text-body">
                  {site.messages.blogs.by} {blog.authorName} · {blog.publishedOn}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
      {pageCount > 1 ? (
        <div className="mt-8 flex gap-3">
          {page > 1 ? (
            <Link
              href={`${withLocale('/blogs', 'ar')}?${new URLSearchParams({ ...(categorySlug ? { category: categorySlug } : {}), page: String(page - 1) }).toString()}`}
              className="font-jakarta text-sm font-semibold text-teal"
            >
              {site.messages.blogs.previous}
            </Link>
          ) : null}
          {page < pageCount ? (
            <Link
              href={`${withLocale('/blogs', 'ar')}?${new URLSearchParams({ ...(categorySlug ? { category: categorySlug } : {}), page: String(page + 1) }).toString()}`}
              className="font-jakarta text-sm font-semibold text-teal"
            >
              {site.messages.blogs.next}
            </Link>
          ) : null}
        </div>
      ) : null}
    </PublicPage>
  )
}
