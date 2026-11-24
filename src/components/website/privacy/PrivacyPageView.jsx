import SiteShell from '@/components/website/SiteShell'
import PrivacyHero from '@/components/website/privacy/PrivacyHero'
import PrivacySections from '@/components/website/privacy/PrivacySections'
import PrivacyToc from '@/components/website/privacy/PrivacyToc'
import { getPrivacyContent } from '@/lib/privacy/content'

export default function PrivacyPageView({ locale, messages, contact, services = [] }) {
  const copy = getPrivacyContent(locale)

  return (
    <SiteShell locale={locale} messages={messages} contact={contact} services={services}>
      <PrivacyHero locale={locale} copy={copy} />
      <section className="bg-[#f7f9fb] px-[80px] py-16 max-[1439px]:px-10 max-[1023px]:px-8 max-[1023px]:py-12 max-[767px]:px-5 max-[767px]:py-10">
        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-[minmax(240px,0.34fr)_minmax(0,0.66fr)] items-start gap-10 max-[1023px]:grid-cols-1 max-[1023px]:gap-8">
          <div className="min-[1024px]:sticky min-[1024px]:top-24">
            <PrivacyToc locale={locale} copy={copy} />
          </div>
          <div className="rounded-[14px] border border-white bg-white/90 p-8 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] max-[767px]:p-5">
            <PrivacySections copy={copy} />
          </div>
        </div>
      </section>
    </SiteShell>
  )
}
