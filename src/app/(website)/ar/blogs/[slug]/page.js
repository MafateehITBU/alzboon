import Link from 'next/link'
import { notFound } from 'next/navigation'
import PublicPage from '@/components/website/PublicPage'
import RichTextContent from '@/components/website/RichTextContent'
import { withLocale } from '@/lib/i18n/paths'
import { getPrisma } from '@/lib/prisma/client'
import { absoluteUrl } from '@/lib/site/config'
import { loadPublicSiteData } from '@/lib/site/load-public'
import { getPublishedBlogBySlug, serializePublicBlog } from '@/lib/blog/public'

export async function generateMetadata({ params }) {
  const { slug } = await params
  try {
    const blog = serializePublicBlog(await getPublishedBlogBySlug(getPrisma(), slug), 'ar')
    if (!blog) return { title: 'المقال غير موجود' }
    return {
      title: blog.title,
      description: `${blog.title} — ${blog.authorName}`,
      alternates: {
        canonical: `/ar/blogs/${blog.slug}`,
        languages: { en: `/blogs/${blog.slug}`, ar: `/ar/blogs/${blog.slug}` },
      },
      openGraph: {
        title: blog.title,
        description: `${blog.title} — ${blog.authorName}`,
        url: absoluteUrl(`/ar/blogs/${blog.slug}`),
        type: 'article',
        locale: 'ar_AE',
        images: blog.featuredUrl ? [absoluteUrl(blog.featuredUrl)] : undefined,
      },
    }
  } catch {
    return { title: 'المدونة' }
  }
}

export default async function ArabicBlogDetailPage({ params }) {
  const { slug } = await params
  const site = await loadPublicSiteData('ar')
  let blog = null
  try {
    blog = serializePublicBlog(await getPublishedBlogBySlug(getPrisma(), slug), 'ar')
  } catch {
    blog = null
  }
  if (!blog) notFound()

  return (
    <PublicPage locale={site.locale} messages={site.messages} contact={site.contact} services={site.services} narrow>
      <Link href={withLocale('/blogs', 'ar')} className="font-jakarta text-sm font-semibold text-teal">
        ← {site.messages.blogs.back}
      </Link>
      <p className="mt-6 font-jakarta text-xs tracking-wide text-teal uppercase">{blog.categoryName}</p>
      <h1 className="mt-2 font-abu text-4xl tracking-[-0.03em] text-ink">{blog.title}</h1>
      <p className="mt-3 font-jakarta text-sm text-body">
        {site.messages.blogs.by} {blog.authorName} · {blog.publishedOn}
      </p>
      {blog.featuredUrl ? <img src={blog.featuredUrl} alt="" className="mt-8 w-full rounded-2xl object-cover" /> : null}
      <RichTextContent document={blog.document} dir="rtl" className="mt-8" />
    </PublicPage>
  )
}
