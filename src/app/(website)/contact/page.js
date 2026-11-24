import ContactPageView from '@/components/website/contact/ContactPageView'
import { absoluteUrl } from '@/lib/site/config'
import { loadPublicSiteData } from '@/lib/site/load-public'

export const metadata = {
  title: 'Contact Us',
  description: 'Send an enquiry to Awwad AlZboon Legal Consultancy.',
  alternates: { canonical: '/contact', languages: { en: '/contact', ar: '/ar/contact' } },
  openGraph: {
    title: 'Contact Us | Awwad Alzboon Legal Consultancy',
    description: 'Send an enquiry to Awwad AlZboon Legal Consultancy.',
    url: absoluteUrl('/contact'),
  },
}

export default async function ContactPage() {
  const site = await loadPublicSiteData('en')
  return (
    <ContactPageView
      locale={site.locale}
      messages={site.messages}
      contact={site.contact}
      services={site.services}
    />
  )
}
