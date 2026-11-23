import SiteShell from '@/components/website/SiteShell'
import AboutHero from '@/components/website/about/AboutHero'
import AboutStats from '@/components/website/about/AboutStats'
import AboutFounder from '@/components/website/about/AboutFounder'
import AboutConsultation from '@/components/website/about/AboutConsultation'

export default function AboutPageView({ locale, messages, contact, services }) {
  const copy = messages?.about || {}

  return (
    <SiteShell locale={locale} messages={messages} contact={contact} services={services}>
      <AboutHero locale={locale} copy={copy} />
      <AboutStats copy={copy} />
      <AboutFounder copy={copy} />
      <AboutConsultation locale={locale} copy={copy} contact={contact} />
    </SiteShell>
  )
}
