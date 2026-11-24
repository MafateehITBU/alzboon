import { notFound } from 'next/navigation'
import ServicePageView from '@/components/website/services/ServicePageView'
import { getPrisma } from '@/lib/prisma/client'
import { absoluteUrl } from '@/lib/site/config'
import { loadPublicSiteData } from '@/lib/site/load-public'
import { getAvailableServiceBySlug, serializePublicService } from '@/lib/service/public'

export async function generateMetadata({ params }) {
  const { slug } = await params
  try {
    const service = await getAvailableServiceBySlug(getPrisma(), slug)
    const serialized = serializePublicService(service, 'ar')
    if (!serialized) return { title: 'الخدمة غير موجودة' }
    return {
      title: serialized.name,
      description: serialized.heroDescription || serialized.overviewDescription || serialized.name,
      alternates: {
        canonical: `/ar/services/${serialized.slug}`,
        languages: {
          en: `/services/${serialized.slug}`,
          ar: `/ar/services/${serialized.slug}`,
        },
      },
      openGraph: {
        title: serialized.name,
        description: serialized.heroDescription || serialized.name,
        url: absoluteUrl(`/ar/services/${serialized.slug}`),
        locale: 'ar_AE',
        images: serialized.heroUrl ? [absoluteUrl(serialized.heroUrl)] : undefined,
      },
    }
  } catch {
    return { title: 'الخدمات' }
  }
}

export default async function ArabicServiceDetailPage({ params }) {
  const { slug } = await params
  const site = await loadPublicSiteData('ar')
  let service = null
  try {
    service = serializePublicService(await getAvailableServiceBySlug(getPrisma(), slug), 'ar')
  } catch {
    service = null
  }
  if (!service) notFound()

  return (
    <ServicePageView
      locale={site.locale}
      messages={site.messages}
      contact={site.contact}
      services={site.services}
      service={service}
    />
  )
}
