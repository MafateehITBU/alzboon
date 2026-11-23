import Link from 'next/link'
import { notFound } from 'next/navigation'
import PublicPage from '@/components/website/PublicPage'
import { withLocale } from '@/lib/i18n/paths'
import { getPrisma } from '@/lib/prisma/client'
import { absoluteUrl } from '@/lib/site/config'
import { loadPublicSiteData } from '@/lib/site/load-public'
import { getAvailableServiceBySlug, serializePublicService } from '@/lib/service/public'

export async function generateMetadata({ params }) {
  const { slug } = await params
  try {
    const service = await getAvailableServiceBySlug(getPrisma(), slug)
    const serialized = serializePublicService(service, 'en')
    if (!serialized) return { title: 'Service not found' }
    return {
      title: serialized.name,
      description: serialized.heroDescription || serialized.overviewDescription || serialized.name,
      alternates: {
        canonical: `/services/${serialized.slug}`,
        languages: {
          en: `/services/${serialized.slug}`,
          ar: `/ar/services/${serialized.slug}`,
        },
      },
      openGraph: {
        title: serialized.name,
        description: serialized.heroDescription || serialized.name,
        url: absoluteUrl(`/services/${serialized.slug}`),
        images: serialized.heroUrl ? [absoluteUrl(serialized.heroUrl)] : undefined,
      },
    }
  } catch {
    return { title: 'Service' }
  }
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params
  const site = await loadPublicSiteData('en')
  let service = null
  try {
    service = serializePublicService(await getAvailableServiceBySlug(getPrisma(), slug), 'en')
  } catch {
    service = null
  }
  if (!service) notFound()

  return (
    <PublicPage locale={site.locale} messages={site.messages} contact={site.contact} services={site.services}>
      <Link href={withLocale('/services', 'en')} className="font-jakarta text-sm font-semibold text-teal">
        ← {site.messages.services.back}
      </Link>
      <h1 className="mt-6 font-abu text-4xl tracking-[-0.03em] text-ink">{service.heroTitle || service.name}</h1>
      <p className="mt-4 max-w-3xl font-jakarta text-base leading-7 text-body">{service.heroDescription}</p>
      {service.heroUrl ? (
        <img src={service.heroUrl} alt="" className="mt-8 max-h-[420px] w-full rounded-2xl object-cover" />
      ) : null}

      {(service.overviewTitle || service.overviewDescription) && (
        <section className="mt-12">
          <h2 className="font-abu text-3xl text-ink">{service.overviewTitle || site.messages.services.overview}</h2>
          {service.overviewDescription ? <p className="mt-3 max-w-3xl font-jakarta text-base leading-7 text-body">{service.overviewDescription}</p> : null}
          {service.practiceAreaUrl ? (
            <img src={service.practiceAreaUrl} alt="" className="mt-6 max-h-[360px] w-full rounded-2xl object-cover" />
          ) : null}
        </section>
      )}

      {service.practiceAreas.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-abu text-3xl text-ink">{site.messages.services.practiceAreas}</h2>
          <div className="mt-6 grid gap-4">
            {service.practiceAreas.map((area) => (
              <article key={area.id} className="rounded-2xl border border-line bg-cream/50 p-5">
                <h3 className="font-abu text-2xl text-ink">{area.title}</h3>
                {area.subtitle ? <p className="mt-1 font-jakarta text-sm font-semibold text-teal">{area.subtitle}</p> : null}
                <p className="mt-3 font-jakarta text-sm leading-6 text-body">{area.description}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {service.benefits.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-abu text-3xl text-ink">{site.messages.services.benefits}</h2>
          <ul className="mt-4 list-disc space-y-2 ps-5 font-jakarta text-sm leading-6 text-body">
            {service.benefits.map((benefit) => (
              <li key={benefit.id}>{benefit.text}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </PublicPage>
  )
}
