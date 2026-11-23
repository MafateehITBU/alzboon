import ContactForm from '@/components/website/contact/ContactForm'
import PublicPage from '@/components/website/PublicPage'
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
    <PublicPage locale={site.locale} messages={site.messages} contact={site.contact} services={site.services} narrow>
      <p className="font-jakarta text-[11px] font-semibold tracking-[0.18em] text-teal uppercase">{site.messages.nav.contact}</p>
      <h1 className="mt-2 font-abu text-4xl tracking-[-0.03em] text-ink">{site.messages.contact.title}</h1>
      <p className="mt-3 font-jakarta text-sm leading-6 text-body">{site.messages.contact.description}</p>
      <div className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-card min-[720px]:p-7">
        <ContactForm locale={site.locale} messages={site.messages} services={site.services} />
      </div>
    </PublicPage>
  )
}
