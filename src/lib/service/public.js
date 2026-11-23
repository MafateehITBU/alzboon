import { localeToDb } from '../i18n/locale.js'
import { publicMediaUrl } from '../site/public-media.js'

/**
 * Server-side filter for publicly listed services.
 * Every saved service is public; the helper stays for shared query composition.
 */
export function availableServiceWhere() {
  return {}
}

const publicInclude = {
  translations: true,
  practiceAreas: {
    include: { translations: true },
    orderBy: { sortOrder: 'asc' },
  },
  benefits: {
    include: { translations: true },
    orderBy: { sortOrder: 'asc' },
  },
  heroMedia: true,
  practiceAreaMedia: true,
}

export async function listAvailableServices(db, { take = 50, skip = 0 } = {}) {
  return db.service.findMany({
    where: availableServiceWhere(),
    include: publicInclude,
    orderBy: [{ createdAt: 'desc' }],
    skip,
    take,
  })
}

export async function getAvailableServiceById(db, serviceId) {
  return db.service.findFirst({
    where: { id: serviceId, ...availableServiceWhere() },
    include: publicInclude,
  })
}

export async function getAvailableServiceBySlug(db, slug) {
  if (typeof slug !== 'string' || !slug.trim()) return null
  return db.service.findFirst({
    where: { slug: slug.trim(), ...availableServiceWhere() },
    include: publicInclude,
  })
}

function translationFor(rows, locale) {
  const dbLocale = localeToDb(locale)
  return rows?.find((row) => row.locale === dbLocale) || rows?.find((row) => row.locale === 'EN') || null
}

export function serializePublicService(service, locale = 'en') {
  if (!service) return null
  const translation = translationFor(service.translations, locale)

  return {
    id: service.id,
    slug: service.slug,
    name: translation?.name || '',
    heroTitle: translation?.heroTitle || '',
    heroDescription: translation?.heroDescription || '',
    overviewTitle: translation?.overviewTitle || '',
    overviewDescription: translation?.overviewDescription || '',
    heroUrl: publicMediaUrl(service.heroMediaId),
    practiceAreaUrl: publicMediaUrl(service.practiceAreaMediaId),
    practiceAreas: (service.practiceAreas || []).map((area) => {
      const areaTranslation = translationFor(area.translations, locale)
      return {
        id: area.id,
        title: areaTranslation?.title || '',
        subtitle: areaTranslation?.subtitle || '',
        description: areaTranslation?.description || '',
      }
    }),
    benefits: (service.benefits || [])
      .map((benefit) => {
        const benefitTranslation = translationFor(benefit.translations, locale)
        return { id: benefit.id, text: benefitTranslation?.text || '' }
      })
      .filter((benefit) => benefit.text),
  }
}

export function serializePublicServiceCard(service, locale = 'en') {
  const full = serializePublicService(service, locale)
  if (!full) return null
  return {
    id: full.id,
    slug: full.slug,
    name: full.name,
    summary: full.heroDescription || full.overviewDescription || '',
    heroUrl: full.heroUrl,
  }
}
