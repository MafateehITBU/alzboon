import Approach from '@/components/website/home/Approach'
import Consultation from '@/components/website/home/Consultation'
import Expertise from '@/components/website/home/Expertise'
import PracticeAreas from '@/components/website/home/PracticeAreas'
import Testimonials from '@/components/website/home/Testimonials'
import Hero from '@/components/website/home/Hero'
import SiteShell from '@/components/website/SiteShell'
import { absoluteUrl } from '@/lib/site/config'
import { loadPublicSiteData } from '@/lib/site/load-public'

export const metadata = {
  title: 'عواد الزبون للاستشارات القانونية',
  description: 'تقدم استشارات عواد الزبون خدمات الملكية الفكرية والاستشارات المؤسسية وفض المنازعات للشركات.',
  alternates: {
    canonical: '/ar',
    languages: {
      en: '/',
      ar: '/ar',
    },
  },
  openGraph: {
    title: 'عواد الزبون للاستشارات القانونية',
    description: 'تقدم استشارات عواد الزبون خدمات الملكية الفكرية والاستشارات المؤسسية وفض المنازعات للشركات.',
    url: absoluteUrl('/ar'),
    type: 'website',
    locale: 'ar_AE',
  },
}

export default async function ArabicHomePage() {
  const { locale, messages, contact, services } = await loadPublicSiteData('ar')

  return (
    <SiteShell locale={locale} messages={messages} contact={contact} services={services}>
      <Hero locale={locale} messages={messages} />
      <PracticeAreas locale={locale} messages={messages} services={services} />
      <Approach messages={messages} />
      <Expertise messages={messages} />
      <Testimonials messages={messages} />
      <Consultation locale={locale} messages={messages} contact={contact} />
    </SiteShell>
  )
}
