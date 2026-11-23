import Link from 'next/link'
import PublicPage from '@/components/website/PublicPage'
import { withLocale } from '@/lib/i18n/paths'
import { absoluteUrl } from '@/lib/site/config'
import { loadPublicSiteData } from '@/lib/site/load-public'

export const metadata = {
  title: 'الخدمات',
  description: 'استكشف الخدمات القانونية المتاحة من عواد الزبون.',
  alternates: { canonical: '/ar/services', languages: { en: '/services', ar: '/ar/services' } },
  openGraph: {
    title: 'الخدمات | عواد الزبون',
    description: 'استكشف الخدمات القانونية المتاحة من عواد الزبون.',
    url: absoluteUrl('/ar/services'),
    locale: 'ar_AE',
  },
}

export default async function ArabicServicesPage() {
  const { locale, messages, contact, services } = await loadPublicSiteData('ar')

  return (
    <PublicPage locale={locale} messages={messages} contact={contact} services={services}>
      <p className="font-jakarta text-[11px] font-semibold tracking-[0.18em] text-teal uppercase">{messages.nav.services}</p>
      <h1 className="mt-2 font-abu text-4xl tracking-[-0.03em] text-ink">{messages.services.title}</h1>
      <p className="mt-3 max-w-2xl font-jakarta text-sm leading-6 text-body">{messages.services.description}</p>
      {services.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-line bg-cream/60 p-5 font-jakarta text-sm text-body">{messages.services.empty}</p>
      ) : (
        <div className="mt-8 grid gap-4 min-[820px]:grid-cols-2">
          {services.map((service) => (
            <Link
              key={service.id}
              href={withLocale(`/services/${service.slug}`, locale)}
              className="rounded-2xl border border-line bg-white p-5 shadow-card transition hover:border-teal/30"
            >
              <h2 className="font-abu text-2xl text-ink">{service.name}</h2>
              <p className="mt-2 line-clamp-3 font-jakarta text-sm leading-6 text-body">{service.summary}</p>
            </Link>
          ))}
        </div>
      )}
    </PublicPage>
  )
}
