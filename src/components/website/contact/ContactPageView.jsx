import SiteShell from '@/components/website/SiteShell'
import ContactHero from '@/components/website/contact/ContactHero'
import ContactSection from '@/components/website/contact/ContactSection'

export default function ContactPageView({ locale, messages, contact, services = [] }) {
  const copy = messages?.contact || {}
  const serviceOptions = (Array.isArray(services) ? services : [])
    .filter((service) => service?.id && service?.name)
    .map((service) => ({ id: service.id, name: service.name, slug: service.slug }))

  return (
    <SiteShell locale={locale} messages={messages} contact={contact} services={services}>
      <ContactHero locale={locale} copy={copy} />
      <ContactSection locale={locale} messages={messages} contact={contact} services={serviceOptions} />
    </SiteShell>
  )
}
