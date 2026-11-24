import PrivacyPageView from '@/components/website/privacy/PrivacyPageView'
import { getPrivacyContent } from '@/lib/privacy/content'
import { absoluteUrl } from '@/lib/site/config'
import { loadPublicSiteData } from '@/lib/site/load-public'

export async function generateMetadata() {
  const copy = getPrivacyContent('ar')
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: {
      canonical: '/ar/privacy',
      languages: { en: '/privacy', ar: '/ar/privacy' },
    },
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      url: absoluteUrl('/ar/privacy'),
      type: 'website',
    },
  }
}

export default async function ArabicPrivacyPage() {
  const site = await loadPublicSiteData('ar')
  return (
    <PrivacyPageView
      locale={site.locale}
      messages={site.messages}
      contact={site.contact}
      services={site.services}
    />
  )
}
