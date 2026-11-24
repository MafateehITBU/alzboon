import { notFound } from 'next/navigation'
import BlogArticleView from '@/components/website/blog/BlogArticleView'
import {
  getPublishedBlogBySlug,
  listRelatedPublishedBlogs,
  serializePublicBlog,
  serializePublicBlogListItem,
} from '@/lib/blog/public'
import { getPrisma } from '@/lib/prisma/client'
import { absoluteUrl } from '@/lib/site/config'
import { loadPublicSiteData } from '@/lib/site/load-public'

async function loadArticle(slug, locale) {
  const db = getPrisma()
  const raw = await getPublishedBlogBySlug(db, slug)
  const blog = serializePublicBlog(raw, locale)
  if (!blog) return null

  const relatedRaw = await listRelatedPublishedBlogs(db, {
    excludeId: blog.id,
    categorySlug: blog.categorySlug,
    take: 3,
  })
  const related = relatedRaw.map((row) => serializePublicBlogListItem(row, locale)).filter(Boolean)

  return { blog, related }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  try {
    const blog = serializePublicBlog(await getPublishedBlogBySlug(getPrisma(), slug), 'en')
    if (!blog) return { title: 'Blog not found' }
    const description = blog.excerpt || `${blog.title} — ${blog.authorName}`
    const url = absoluteUrl(`/blogs/${blog.slug}`)
    return {
      title: blog.title,
      description,
      alternates: {
        canonical: `/blogs/${blog.slug}`,
        languages: { en: `/blogs/${blog.slug}`, ar: `/ar/blogs/${blog.slug}` },
      },
      openGraph: {
        title: blog.title,
        description,
        url,
        type: 'article',
        publishedTime: blog.publishedOn,
        authors: blog.authorName ? [blog.authorName] : undefined,
        images: blog.featuredUrl ? [{ url: absoluteUrl(blog.featuredUrl) }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description,
        images: blog.featuredUrl ? [absoluteUrl(blog.featuredUrl)] : undefined,
      },
    }
  } catch {
    return { title: 'Blog' }
  }
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params
  const site = await loadPublicSiteData('en')
  let article = null
  try {
    article = await loadArticle(slug, 'en')
  } catch {
    article = null
  }
  if (!article) notFound()

  const { blog, related } = article
  const description = blog.excerpt || `${blog.title} — ${blog.authorName}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description,
    datePublished: blog.publishedOn,
    author: {
      '@type': 'Person',
      name: blog.authorName,
    },
    image: blog.featuredUrl ? absoluteUrl(blog.featuredUrl) : undefined,
    mainEntityOfPage: absoluteUrl(`/blogs/${blog.slug}`),
    inLanguage: 'en',
    articleSection: blog.categoryName || undefined,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogArticleView
        locale={site.locale}
        messages={site.messages}
        contact={site.contact}
        services={site.services}
        blog={blog}
        related={related}
      />
    </>
  )
}
