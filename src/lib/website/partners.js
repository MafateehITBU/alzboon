import { deleteMediaIfOrphan } from '../media/orphan.js'
import { PUBLIC_IMAGE_MAX_BYTES, PUBLIC_IMAGE_MIME_TYPES } from '../media/public-image.js'
import { isStorageKey } from '../storage/paths.js'
import { WebsiteError } from './errors.js'
import { assertCanManageWebsite } from './settings.js'

export const PARTNER_PAGE_SIZE = 10

export function parsePartnerListQuery(params = {}) {
  const search = firstValue(params.q).trim().slice(0, 100)
  const parsedPage = Number.parseInt(firstValue(params.page), 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 10000) : 1
  return { search, page }
}

export async function listPartners(db, actorId, query) {
  await assertCanManageWebsite(db, actorId)

  const where = query.search
    ? { name: { contains: query.search, mode: 'insensitive' } }
    : {}

  const page = query.page || 1
  const [total, rows] = await Promise.all([
    db.partner.count({ where }),
    db.partner.findMany({
      where,
      include: { logoMedia: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }, { name: 'asc' }],
      skip: (page - 1) * PARTNER_PAGE_SIZE,
      take: PARTNER_PAGE_SIZE,
    }),
  ])

  return {
    total,
    page,
    pageSize: PARTNER_PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PARTNER_PAGE_SIZE)),
    partners: rows.map(serializePartner),
  }
}

export async function createPartner(db, actorId, input) {
  await assertCanManageWebsite(db, actorId)

  const name = cleanName(input?.name)
  if (!name) throw new WebsiteError('INVALID_NAME')
  if (!input?.logoMedia) throw new WebsiteError('MISSING_LOGO')
  assertLogoMedia(input.logoMedia)

  return runInTransaction(db, async (tx) => {
    const maxSort = await tx.partner.aggregate({ _max: { sortOrder: true } })
    const logo = await tx.mediaAsset.create({
      data: {
        storageKey: input.logoMedia.storageKey,
        visibility: 'PUBLIC',
        originalFilename: String(input.logoMedia.originalFilename || 'logo').slice(0, 120),
        mimeType: input.logoMedia.mimeType,
        byteSize: input.logoMedia.byteSize,
      },
    })

    const partner = await tx.partner.create({
      data: {
        name,
        logoMediaId: logo.id,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      },
      include: { logoMedia: true },
    })

    return { partner: serializePartner(partner), removedMedia: null }
  })
}

export async function updatePartner(db, actorId, partnerId, input) {
  await assertCanManageWebsite(db, actorId)

  const name = cleanName(input?.name)
  if (!name) throw new WebsiteError('INVALID_NAME')
  assertLogoMedia(input?.logoMedia)

  return runInTransaction(db, async (tx) => {
    const current = await tx.partner.findUnique({
      where: { id: partnerId },
      include: { logoMedia: true },
    })
    if (!current) throw new WebsiteError('NOT_FOUND')

    let nextLogoId = current.logoMediaId
    let removedMedia = null

    if (input?.logoMedia) {
      const logo = await tx.mediaAsset.create({
        data: {
          storageKey: input.logoMedia.storageKey,
          visibility: 'PUBLIC',
          originalFilename: String(input.logoMedia.originalFilename || 'logo').slice(0, 120),
          mimeType: input.logoMedia.mimeType,
          byteSize: input.logoMedia.byteSize,
        },
      })
      nextLogoId = logo.id
    }

    const partner = await tx.partner.update({
      where: { id: partnerId },
      data: { name, logoMediaId: nextLogoId },
      include: { logoMedia: true },
    })

    if (current.logoMediaId !== nextLogoId) {
      removedMedia = await deleteMediaIfOrphan(tx, current.logoMediaId)
    }

    return { partner: serializePartner(partner), removedMedia }
  })
}

export async function deletePartner(db, actorId, partnerId) {
  await assertCanManageWebsite(db, actorId)

  return runInTransaction(db, async (tx) => {
    const current = await tx.partner.findUnique({ where: { id: partnerId } })
    if (!current) throw new WebsiteError('NOT_FOUND')

    await tx.partner.delete({ where: { id: partnerId } })
    const removedMedia = await deleteMediaIfOrphan(tx, current.logoMediaId)
    return { id: partnerId, removedMedia }
  })
}

function serializePartner(partner) {
  return {
    id: partner.id,
    name: partner.name,
    sortOrder: partner.sortOrder,
    logoMediaId: partner.logoMediaId,
    logoUrl: `/media/${partner.logoMediaId}`,
    createdAt: partner.createdAt instanceof Date ? partner.createdAt.toISOString() : partner.createdAt,
  }
}

function assertLogoMedia(media) {
  if (!media) return
  if (
    !isStorageKey(media.storageKey) ||
    !PUBLIC_IMAGE_MIME_TYPES.includes(media.mimeType) ||
    !Number.isInteger(media.byteSize) ||
    media.byteSize < 1 ||
    media.byteSize > PUBLIC_IMAGE_MAX_BYTES
  ) {
    throw new WebsiteError('INVALID_IMAGE')
  }
}

function cleanName(value) {
  if (typeof value !== 'string') return null
  const name = value.trim().replace(/\s+/g, ' ')
  if (!name || name.length > 120) return null
  return name
}

function firstValue(value) {
  const picked = Array.isArray(value) ? value[0] : value
  return typeof picked === 'string' ? picked : ''
}

function runInTransaction(db, fn) {
  if (typeof db.$transaction === 'function') return db.$transaction(fn)
  return fn(db)
}
