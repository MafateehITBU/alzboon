import { getAppUrl } from '@/lib/site/config'

export default function robots() {
  const base = getAppUrl()
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
