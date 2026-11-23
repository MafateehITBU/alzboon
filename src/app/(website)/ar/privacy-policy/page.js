import PublicPage from '@/components/website/PublicPage'
import { absoluteUrl } from '@/lib/site/config'
import { loadPublicSiteData } from '@/lib/site/load-public'

export const metadata = {
  title: 'سياسة الخصوصية',
  description: 'سياسة الخصوصية لاستشارات عواد الزبون القانونية.',
  alternates: { canonical: '/ar/privacy-policy', languages: { en: '/privacy-policy', ar: '/ar/privacy-policy' } },
  openGraph: {
    title: 'سياسة الخصوصية',
    description: 'سياسة الخصوصية لاستشارات عواد الزبون القانونية.',
    url: absoluteUrl('/ar/privacy-policy'),
    locale: 'ar_AE',
  },
}

export default async function ArabicPrivacyPage() {
  const site = await loadPublicSiteData('ar')
  return (
    <PublicPage locale={site.locale} messages={site.messages} contact={site.contact} services={site.services} narrow>
      <h1 className="font-abu text-4xl tracking-[-0.03em] text-ink">{site.messages.privacy.title}</h1>
      <p className="mt-4 font-jakarta text-base leading-7 text-body">{site.messages.privacy.body}</p>
    </PublicPage>
  )
}
