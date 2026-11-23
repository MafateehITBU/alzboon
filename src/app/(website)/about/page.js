import AboutPageView from '@/components/website/about/AboutPageView'
import { absoluteUrl } from '@/lib/site/config'
import { loadPublicSiteData } from '@/lib/site/load-public'

export async function generateMetadata() {
  const site = await loadPublicSiteData('en')
  const title = site.messages.about.title
  const description = site.messages.about.metaDescription

  return {
    title,
    description,
    alternates: {
      canonical: '/about',
      languages: { en: '/about', ar: '/ar/about' },
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl('/about'),
      type: 'website',
    },
  }
}

export default async function AboutPage() {
  const site = await loadPublicSiteData('en')
  return (
    <AboutPageView
      locale={site.locale}
      messages={site.messages}
      contact={site.contact}
      services={site.services}
    />
  )
}
