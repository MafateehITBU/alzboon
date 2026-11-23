import AboutPageView from '@/components/website/about/AboutPageView'
import { absoluteUrl } from '@/lib/site/config'
import { loadPublicSiteData } from '@/lib/site/load-public'

export async function generateMetadata() {
  const site = await loadPublicSiteData('ar')
  const title = site.messages.about.title
  const description = site.messages.about.metaDescription

  return {
    title,
    description,
    alternates: {
      canonical: '/ar/about',
      languages: { en: '/about', ar: '/ar/about' },
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl('/ar/about'),
      type: 'website',
      locale: 'ar_AE',
    },
  }
}

export default async function ArabicAboutPage() {
  const site = await loadPublicSiteData('ar')
  return (
    <AboutPageView
      locale={site.locale}
      messages={site.messages}
      contact={site.contact}
      services={site.services}
    />
  )
}
