import ContactPageView from '@/components/website/contact/ContactPageView'
import { absoluteUrl } from '@/lib/site/config'
import { loadPublicSiteData } from '@/lib/site/load-public'

export const metadata = {
  title: 'اتصل بنا',
  description: 'أرسل استفسارك إلى استشارات عواد الزبون القانونية.',
  alternates: { canonical: '/ar/contact', languages: { en: '/contact', ar: '/ar/contact' } },
  openGraph: {
    title: 'اتصل بنا | عواد الزبون',
    description: 'أرسل استفسارك إلى استشارات عواد الزبون القانونية.',
    url: absoluteUrl('/ar/contact'),
    locale: 'ar_AE',
  },
}

export default async function ArabicContactPage() {
  const site = await loadPublicSiteData('ar')
  return (
    <ContactPageView
      locale={site.locale}
      messages={site.messages}
      contact={site.contact}
      services={site.services}
    />
  )
}
