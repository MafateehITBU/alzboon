import SiteShell from '@/components/website/SiteShell'
import ServiceHero from '@/components/website/services/ServiceHero'
import ServicePracticeAreas from '@/components/website/services/ServicePracticeAreas'
import ServiceMethodology from '@/components/website/services/ServiceMethodology'
import ServicePrecedent from '@/components/website/services/ServicePrecedent'

export default function ServicePageView({ locale, messages, contact, services, service }) {
  const copy = messages?.services || {}

  return (
    <SiteShell locale={locale} messages={messages} contact={contact} services={services}>
      <ServiceHero locale={locale} service={service} copy={copy} />
      <ServicePracticeAreas locale={locale} service={service} copy={copy} />
      <ServiceMethodology copy={copy.methodology || {}} />
      <ServicePrecedent copy={copy.precedent || {}} />
    </SiteShell>
  )
}
