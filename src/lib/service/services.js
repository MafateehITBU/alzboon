import { uniqueContentSlug } from '../content/slug.js' // content slug helper
import { deleteMediaIfOrphan } from '../media/orphan.js'
import { PUBLIC_IMAGE_MAX_BYTES, PUBLIC_IMAGE_MIME_TYPES } from '../media/public-image.js'
import { isStorageKey } from '../storage/paths.js'
import { assertCanManageServices } from './access.js'
import { ServiceError } from './errors.js'

export const SERVICE_PAGE_SIZE = 10

const serviceInclude = {
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

export function parseServiceListQuery(params = {}) {
  const search = firstValue(params.q).trim().slice(0, 100)
  const parsedPage = Number.parseInt(firstValue(params.page), 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 10000) : 1
  return { search, page }
}

export async function listServices(db, actorId, query) {
  await assertCanManageServices(db, actorId)

  const where = {}
  if (query.search) {
    const q = query.search
    where.OR = [
      { slug: { contains: q, mode: 'insensitive' } },
      {
        translations: {
          some: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { heroTitle: { contains: q, mode: 'insensitive' } },
              { heroDescription: { contains: q, mode: 'insensitive' } },
              { overviewTitle: { contains: q, mode: 'insensitive' } },
              { overviewDescription: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
      },
      {
        practiceAreas: {
          some: {
            translations: {
              some: {
                OR: [
                  { title: { contains: q, mode: 'insensitive' } },
                  { subtitle: { contains: q, mode: 'insensitive' } },
                  { description: { contains: q, mode: 'insensitive' } },
                ],
              },
            },
          },
        },
      },
      {
        benefits: {
          some: {
            translations: {
              some: { text: { contains: q, mode: 'insensitive' } },
            },
          },
        },
      },
    ]
  }

  const page = query.page || 1
  const [total, rows] = await Promise.all([
    db.service.count({ where }),
    db.service.findMany({
      where,
      include: serviceInclude,
      orderBy: [{ createdAt: 'desc' }],
      skip: (page - 1) * SERVICE_PAGE_SIZE,
      take: SERVICE_PAGE_SIZE,
    }),
  ])

  return {
    total,
    page,
    pageSize: SERVICE_PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / SERVICE_PAGE_SIZE)),
    services: rows.map(serializeService),
  }
}

export async function getServiceForAdmin(db, actorId, serviceId) {
  await assertCanManageServices(db, actorId)
  const service = await db.service.findUnique({ where: { id: serviceId }, include: serviceInclude })
  if (!service) throw new ServiceError('NOT_FOUND')
  return serializeService(service)
}

export async function createService(db, actorId, input) {
  await assertCanManageServices(db, actorId)
  const payload = normalizeServiceInput(input, true)
  const slug = await uniqueContentSlug(db, 'service', payload.nameEn)
  if (!slug) throw new ServiceError('INVALID_SLUG')

  return runInTransaction(db, async (tx) => {
    const hero = await createMedia(tx, payload.heroMedia)
    const practice = await createMedia(tx, payload.practiceAreaMedia)

    const service = await tx.service.create({
      data: {
        slug,
        available: payload.available,
        heroMediaId: hero.id,
        practiceAreaMediaId: practice.id,
        translations: {
          create: [
            {
              locale: 'EN',
              name: payload.nameEn,
              heroTitle: payload.heroTitleEn,
              heroDescription: payload.heroDescriptionEn,
              overviewTitle: payload.overviewTitleEn,
              overviewDescription: payload.overviewDescriptionEn,
            },
            {
              locale: 'AR',
              name: payload.nameAr,
              heroTitle: payload.heroTitleAr,
              heroDescription: payload.heroDescriptionAr,
              overviewTitle: payload.overviewTitleAr,
              overviewDescription: payload.overviewDescriptionAr,
            },
          ],
        },
        practiceAreas: {
          create: payload.practiceAreas.map((area, index) => ({
            sortOrder: index,
            translations: {
              create: [
                {
                  locale: 'EN',
                  title: area.titleEn,
                  subtitle: area.subtitleEn,
                  description: area.descriptionEn,
                },
                {
                  locale: 'AR',
                  title: area.titleAr,
                  subtitle: area.subtitleAr,
                  description: area.descriptionAr,
                },
              ],
            },
          })),
        },
        benefits: {
          create: payload.benefits.map((benefit, index) => ({
            sortOrder: index,
            translations: {
              create: [
                { locale: 'EN', text: benefit.textEn },
                { locale: 'AR', text: benefit.textAr },
              ],
            },
          })),
        },
      },
      include: serviceInclude,
    })

    return { service: serializeService(service), removedMedia: [] }
  })
}

export async function updateService(db, actorId, serviceId, input) {
  await assertCanManageServices(db, actorId)
  const payload = normalizeServiceInput(input, false)
  const slug = await uniqueContentSlug(db, 'service', payload.nameEn, serviceId)
  if (!slug) throw new ServiceError('INVALID_SLUG')

  return runInTransaction(db, async (tx) => {
    const current = await tx.service.findUnique({ where: { id: serviceId }, include: serviceInclude })
    if (!current) throw new ServiceError('NOT_FOUND')

    let heroMediaId = current.heroMediaId
    let practiceAreaMediaId = current.practiceAreaMediaId
    const removed = []

    if (payload.heroMedia) {
      const hero = await createMedia(tx, payload.heroMedia)
      heroMediaId = hero.id
    }

    if (payload.practiceAreaMedia) {
      const practice = await createMedia(tx, payload.practiceAreaMedia)
      practiceAreaMediaId = practice.id
    }

    await tx.practiceArea.deleteMany({ where: { serviceId } })
    await tx.benefit.deleteMany({ where: { serviceId } })

    const service = await tx.service.update({
      where: { id: serviceId },
      data: {
        slug,
        available: payload.available,
        heroMediaId,
        practiceAreaMediaId,
        translations: {
          deleteMany: {},
          create: [
            {
              locale: 'EN',
              name: payload.nameEn,
              heroTitle: payload.heroTitleEn,
              heroDescription: payload.heroDescriptionEn,
              overviewTitle: payload.overviewTitleEn,
              overviewDescription: payload.overviewDescriptionEn,
            },
            {
              locale: 'AR',
              name: payload.nameAr,
              heroTitle: payload.heroTitleAr,
              heroDescription: payload.heroDescriptionAr,
              overviewTitle: payload.overviewTitleAr,
              overviewDescription: payload.overviewDescriptionAr,
            },
          ],
        },
        practiceAreas: {
          create: payload.practiceAreas.map((area, index) => ({
            sortOrder: index,
            translations: {
              create: [
                {
                  locale: 'EN',
                  title: area.titleEn,
                  subtitle: area.subtitleEn,
                  description: area.descriptionEn,
                },
                {
                  locale: 'AR',
                  title: area.titleAr,
                  subtitle: area.subtitleAr,
                  description: area.descriptionAr,
                },
              ],
            },
          })),
        },
        benefits: {
          create: payload.benefits.map((benefit, index) => ({
            sortOrder: index,
            translations: {
              create: [
                { locale: 'EN', text: benefit.textEn },
                { locale: 'AR', text: benefit.textAr },
              ],
            },
          })),
        },
      },
      include: serviceInclude,
    })

    if (current.heroMediaId !== heroMediaId) {
      const orphan = await deleteMediaIfOrphan(tx, current.heroMediaId)
      if (orphan) removed.push(orphan)
    }

    if (current.practiceAreaMediaId !== practiceAreaMediaId) {
      const orphan = await deleteMediaIfOrphan(tx, current.practiceAreaMediaId)
      if (orphan) removed.push(orphan)
    }

    return { service: serializeService(service), removedMedia: removed }
  })
}

export async function deleteService(db, actorId, serviceId) {
  await assertCanManageServices(db, actorId)

  return runInTransaction(db, async (tx) => {
    const current = await tx.service.findUnique({ where: { id: serviceId } })
    if (!current) throw new ServiceError('NOT_FOUND')

    await tx.service.delete({ where: { id: serviceId } })

    const removedMedia = []
    for (const mediaId of [current.heroMediaId, current.practiceAreaMediaId]) {
      const orphan = await deleteMediaIfOrphan(tx, mediaId)
      if (orphan) removedMedia.push(orphan)
    }

    return { id: serviceId, removedMedia }
  })
}

function normalizeServiceInput(input, requireImages) {
  const nameEn = cleanText(input?.nameEn, 160)
  const nameAr = cleanText(input?.nameAr, 160)
  // Every saved service is public; the column stays for schema compatibility.
  const available = true

  const heroTitleEn = cleanText(input?.heroTitleEn, 200)
  const heroTitleAr = cleanText(input?.heroTitleAr, 200)
  const heroDescriptionEn = cleanMultiline(input?.heroDescriptionEn, 4000)
  const heroDescriptionAr = cleanMultiline(input?.heroDescriptionAr, 4000)

  // Practice-area section title/description reuse the overview columns.
  const overviewTitleEn = cleanText(input?.overviewTitleEn, 200)
  const overviewTitleAr = cleanText(input?.overviewTitleAr, 200)
  const overviewDescriptionEn = cleanMultiline(input?.overviewDescriptionEn, 4000)
  const overviewDescriptionAr = cleanMultiline(input?.overviewDescriptionAr, 4000)
  const practiceAreas = normalizePracticeAreas(input?.practiceAreas)
  const benefits = []

  if (!nameEn || !nameAr) throw new ServiceError('INVALID_NAME')
  if (!heroTitleEn || !heroTitleAr || !heroDescriptionEn || !heroDescriptionAr) {
    throw new ServiceError('INVALID_HERO')
  }
  if (!overviewTitleEn || !overviewTitleAr || !overviewDescriptionEn || !overviewDescriptionAr) {
    throw new ServiceError('INVALID_OVERVIEW')
  }
  if (!practiceAreas.length) throw new ServiceError('INVALID_PRACTICE_AREAS')

  if (requireImages && !input?.heroMedia) throw new ServiceError('MISSING_HERO_IMAGE')
  if (requireImages && !input?.practiceAreaMedia) throw new ServiceError('MISSING_PRACTICE_IMAGE')
  assertImageMedia(input?.heroMedia)
  assertImageMedia(input?.practiceAreaMedia)

  return {
    nameEn,
    nameAr,
    available,
    heroTitleEn,
    heroTitleAr,
    heroDescriptionEn,
    heroDescriptionAr,
    overviewTitleEn,
    overviewTitleAr,
    overviewDescriptionEn,
    overviewDescriptionAr,
    practiceAreas,
    benefits,
    heroMedia: input?.heroMedia || null,
    practiceAreaMedia: input?.practiceAreaMedia || null,
  }
}

function normalizePracticeAreas(value) {
  if (!Array.isArray(value)) return []
  const areas = []

  for (const item of value) {
    const titleEn = cleanText(item?.titleEn, 160)
    const titleAr = cleanText(item?.titleAr, 160)
    const subtitleEn = cleanText(item?.subtitleEn, 200)
    const subtitleAr = cleanText(item?.subtitleAr, 200)
    const descriptionEn = cleanMultiline(item?.descriptionEn, 4000)
    const descriptionAr = cleanMultiline(item?.descriptionAr, 4000)

    if (!titleEn && !titleAr && !subtitleEn && !subtitleAr && !descriptionEn && !descriptionAr) continue
    if (!titleEn || !titleAr || !subtitleEn || !subtitleAr || !descriptionEn || !descriptionAr) {
      throw new ServiceError('INVALID_PRACTICE_AREAS')
    }

    areas.push({
      titleEn,
      titleAr,
      subtitleEn,
      subtitleAr,
      descriptionEn,
      descriptionAr,
    })
  }

  return areas
}

async function createMedia(tx, media) {
  return tx.mediaAsset.create({
    data: {
      storageKey: media.storageKey,
      visibility: 'PUBLIC',
      originalFilename: String(media.originalFilename || 'image').slice(0, 120),
      mimeType: media.mimeType,
      byteSize: media.byteSize,
    },
  })
}

function assertImageMedia(media) {
  if (!media) return
  if (
    !isStorageKey(media.storageKey) ||
    !PUBLIC_IMAGE_MIME_TYPES.includes(media.mimeType) ||
    !Number.isInteger(media.byteSize) ||
    media.byteSize < 1 ||
    media.byteSize > PUBLIC_IMAGE_MAX_BYTES
  ) {
    throw new ServiceError('INVALID_IMAGE')
  }
}

function serializeService(service) {
  const en = service.translations.find((row) => row.locale === 'EN')
  const ar = service.translations.find((row) => row.locale === 'AR')

  return {
    id: service.id,
    slug: service.slug,
    available: service.available,
    nameEn: en?.name || '',
    nameAr: ar?.name || '',
    heroTitleEn: en?.heroTitle || '',
    heroTitleAr: ar?.heroTitle || '',
    heroDescriptionEn: en?.heroDescription || '',
    heroDescriptionAr: ar?.heroDescription || '',
    overviewTitleEn: en?.overviewTitle || '',
    overviewTitleAr: ar?.overviewTitle || '',
    overviewDescriptionEn: en?.overviewDescription || '',
    overviewDescriptionAr: ar?.overviewDescription || '',
    heroMediaId: service.heroMediaId,
    heroUrl: `/media/${service.heroMediaId}`,
    practiceAreaMediaId: service.practiceAreaMediaId,
    practiceAreaUrl: `/media/${service.practiceAreaMediaId}`,
    practiceAreas: (service.practiceAreas || []).map((area) => {
      const areaEn = area.translations.find((row) => row.locale === 'EN')
      const areaAr = area.translations.find((row) => row.locale === 'AR')
      return {
        id: area.id,
        sortOrder: area.sortOrder,
        titleEn: areaEn?.title || '',
        titleAr: areaAr?.title || '',
        subtitleEn: areaEn?.subtitle || '',
        subtitleAr: areaAr?.subtitle || '',
        descriptionEn: areaEn?.description || '',
        descriptionAr: areaAr?.description || '',
      }
    }),
    benefits: (service.benefits || []).map((benefit) => {
      const benefitEn = benefit.translations.find((row) => row.locale === 'EN')
      const benefitAr = benefit.translations.find((row) => row.locale === 'AR')
      return {
        id: benefit.id,
        sortOrder: benefit.sortOrder,
        textEn: benefitEn?.text || '',
        textAr: benefitAr?.text || '',
      }
    }),
    createdAt: service.createdAt instanceof Date ? service.createdAt.toISOString() : service.createdAt,
  }
}

function cleanText(value, max) {
  if (typeof value !== 'string') return null
  const text = value.trim().replace(/\s+/g, ' ')
  if (!text || text.length > max) return null
  return text
}

function cleanMultiline(value, max) {
  if (typeof value !== 'string') return null
  const text = value.replace(/\r\n/g, '\n').trim()
  if (!text || text.length > max) return null
  return text
}

function firstValue(value) {
  const picked = Array.isArray(value) ? value[0] : value
  return typeof picked === 'string' ? picked : ''
}

function runInTransaction(db, fn) {
  if (typeof db.$transaction === 'function') return db.$transaction(fn)
  return fn(db)
}
