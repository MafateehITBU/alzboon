import { getPrisma } from '@/lib/prisma/client'
import { listPublishedBlogs } from '@/lib/blog/public'
import { listAvailableServices } from '@/lib/service/public'
import { absoluteUrl } from '@/lib/site/config'

export default async function sitemap() {
  const staticRoutes = [
    '',
    '/ar',
    '/about',
    '/ar/about',
    '/blogs',
    '/ar/blogs',
    '/contact',
    '/ar/contact',
    '/privacy',
    '/ar/privacy',
  ].map((path) => ({
    url: absoluteUrl(path || '/'),
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' || path === '/ar' ? 1 : 0.7,
  }))

  let serviceRoutes = []
  let blogRoutes = []

  try {
    if (process.env.DATABASE_URL) {
      const db = getPrisma()
      const [services, blogs] = await Promise.all([listAvailableServices(db, { take: 200 }), listPublishedBlogs(db, { take: 200 })])
      serviceRoutes = services.flatMap((service) => [
        { url: absoluteUrl(`/services/${service.slug}`), lastModified: service.updatedAt, changeFrequency: 'weekly', priority: 0.8 },
        { url: absoluteUrl(`/ar/services/${service.slug}`), lastModified: service.updatedAt, changeFrequency: 'weekly', priority: 0.8 },
      ])
      blogRoutes = blogs.flatMap((blog) => [
        { url: absoluteUrl(`/blogs/${blog.slug}`), lastModified: blog.updatedAt, changeFrequency: 'weekly', priority: 0.6 },
        { url: absoluteUrl(`/ar/blogs/${blog.slug}`), lastModified: blog.updatedAt, changeFrequency: 'weekly', priority: 0.6 },
      ])
    }
  } catch {
    serviceRoutes = []
    blogRoutes = []
  }

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes]
}
