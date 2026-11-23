import PublicPage from '@/components/website/PublicPage'
import { absoluteUrl } from '@/lib/site/config'
import { loadPublicSiteData } from '@/lib/site/load-public'

export const metadata = {
  title: 'من نحن',
  description: 'عن استشارات عواد الزبون القانونية.',
  alternates: { canonical: '/ar/about', languages: { en: '/about', ar: '/ar/about' } },
  openGraph: { title: 'من نحن', description: 'عن استشارات عواد الزبون القانونية.', url: absoluteUrl('/ar/about'), locale: 'ar_AE' },
}

export default async function ArabicAboutPage() {
  const site = await loadPublicSiteData('ar')
  return (
    <PublicPage locale={site.locale} messages={site.messages} contact={site.contact} services={site.services} narrow>
      <h1 className="font-abu text-4xl tracking-[-0.03em] text-ink">{site.messages.about.title}</h1>
      <p className="mt-4 font-jakarta text-base leading-7 text-body">{site.messages.about.body}</p>
    </PublicPage>
  )
}
