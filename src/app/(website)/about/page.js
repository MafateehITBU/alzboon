import PublicPage from '@/components/website/PublicPage'
import { absoluteUrl } from '@/lib/site/config'
import { loadPublicSiteData } from '@/lib/site/load-public'

export const metadata = {
  title: 'About Us',
  description: 'About Awwad AlZboon Legal Consultancy.',
  alternates: { canonical: '/about', languages: { en: '/about', ar: '/ar/about' } },
  openGraph: { title: 'About Us', description: 'About Awwad AlZboon Legal Consultancy.', url: absoluteUrl('/about') },
}

export default async function AboutPage() {
  const site = await loadPublicSiteData('en')
  return (
    <PublicPage locale={site.locale} messages={site.messages} contact={site.contact} services={site.services} narrow>
      <h1 className="font-abu text-4xl tracking-[-0.03em] text-ink">{site.messages.about.title}</h1>
      <p className="mt-4 font-jakarta text-base leading-7 text-body">{site.messages.about.body}</p>
    </PublicPage>
  )
}
