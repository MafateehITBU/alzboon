import { normalizeEmail } from '../auth/email.js'
import { hasPermission } from '../auth/permissions.js'
import { publicAdmin } from '../auth/session.js'
import { isStorageKey } from '../storage/paths.js'
import { PUBLIC_IMAGE_MAX_BYTES, PUBLIC_IMAGE_MIME_TYPES } from '../media/public-image.js'
import { deleteMediaIfOrphan } from '../media/orphan.js'
import { WebsiteError } from './errors.js'

const SETTINGS_ID = 'default'
const REGIONS = ['JORDAN', 'UAE']
const PLATFORMS = ['LINKEDIN', 'FACEBOOK', 'INSTAGRAM', 'X']

const settingsInclude = {
  logoMedia: true,
  phoneNumbers: { orderBy: [{ sortOrder: 'asc' }, { number: 'asc' }] },
  addresses: { orderBy: [{ sortOrder: 'asc' }, { textEn: 'asc' }] },
  mapLocations: { orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }] },
  socialLinks: true,
}

export async function assertCanManageWebsite(db, actorId) {
  const actor = await db.adminUser.findUnique({
    where: { id: actorId },
    include: { permissions: { select: { permission: true } } },
  })

  if (!actor?.active) throw new WebsiteError('UNAUTHENTICATED')
  if (!hasPermission(publicAdmin(actor), 'MANAGE_WEBSITE_SETTINGS')) throw new WebsiteError('FORBIDDEN')
  return actor
}

export async function getWebsiteSettingsForAdmin(db, actorId) {
  await assertCanManageWebsite(db, actorId)
  const settings = await ensureWebsiteSettings(db)
  return serializeSettings(settings)
}

export async function getPublicWebsiteContact(db) {
  const settings = await db.websiteSettings.findUnique({
    where: { id: SETTINGS_ID },
    include: {
      phoneNumbers: { orderBy: [{ sortOrder: 'asc' }, { number: 'asc' }] },
      addresses: { orderBy: [{ sortOrder: 'asc' }, { textEn: 'asc' }] },
      socialLinks: true,
    },
  })

  if (!settings) return null

  return {
    contactEmail: settings.contactEmail,
    phones: settings.phoneNumbers.map((phone) => ({
      id: phone.id,
      number: phone.number,
      region: phone.region,
      label: phone.label,
    })),
    addresses: settings.addresses.map((address) => ({
      id: address.id,
      textEn: address.textEn,
      textAr: address.textAr,
      region: address.region,
    })),
    socialLinks: settings.socialLinks
      .filter((link) => Boolean(link.url?.trim()))
      .map((link) => ({ platform: link.platform, url: link.url })),
  }
}

export async function saveWebsiteSettings(db, actorId, input) {
  await assertCanManageWebsite(db, actorId)

  const contactEmail = normalizeEmail(input?.contactEmail)
  const businessHoursEn = cleanText(input?.businessHoursEn, 500)
  const businessHoursAr = cleanText(input?.businessHoursAr, 500)
  const phones = normalizePhones(input?.phones)
  const addresses = normalizeAddresses(input?.addresses)
  const mapLocations = normalizeMaps(input?.mapLocations)
  const socialLinks = normalizeSocial(input?.socialLinks)

  if (!contactEmail) throw new WebsiteError('INVALID_EMAIL')
  if (!businessHoursEn || !businessHoursAr) throw new WebsiteError('INVALID_HOURS')
  assertLogoMedia(input?.logoMedia)

  return runInTransaction(db, async (tx) => {
    await ensureWebsiteSettings(tx)

    const current = await tx.websiteSettings.findUniqueOrThrow({
      where: { id: SETTINGS_ID },
      include: { logoMedia: true },
    })

    let nextLogoId = current.logoMediaId
    let removed = null

    if (input?.removeLogo && current.logoMediaId) {
      nextLogoId = null
    }

    if (input?.logoMedia) {
      const created = await tx.mediaAsset.create({
        data: {
          storageKey: input.logoMedia.storageKey,
          visibility: 'PUBLIC',
          originalFilename: String(input.logoMedia.originalFilename || 'logo').slice(0, 120),
          mimeType: input.logoMedia.mimeType,
          byteSize: input.logoMedia.byteSize,
        },
      })
      nextLogoId = created.id
    }

    await tx.websiteSettings.update({
      where: { id: SETTINGS_ID },
      data: {
        contactEmail,
        businessHoursEn,
        businessHoursAr,
        logoMediaId: nextLogoId,
      },
    })

    await tx.phoneNumber.deleteMany({ where: { websiteSettingsId: SETTINGS_ID } })
    if (phones.length) {
      await tx.phoneNumber.createMany({
        data: phones.map((phone, index) => ({
          websiteSettingsId: SETTINGS_ID,
          number: phone.number,
          region: phone.region,
          label: phone.label,
          sortOrder: index,
        })),
      })
    }

    await tx.address.deleteMany({ where: { websiteSettingsId: SETTINGS_ID } })
    if (addresses.length) {
      await tx.address.createMany({
        data: addresses.map((address, index) => ({
          websiteSettingsId: SETTINGS_ID,
          textEn: address.textEn,
          textAr: address.textAr,
          region: address.region,
          sortOrder: index,
        })),
      })
    }

    await tx.mapLocation.deleteMany({ where: { websiteSettingsId: SETTINGS_ID } })
    if (mapLocations.length) {
      await tx.mapLocation.createMany({
        data: mapLocations.map((location, index) => ({
          websiteSettingsId: SETTINGS_ID,
          label: location.label,
          latitude: location.latitude,
          longitude: location.longitude,
          sortOrder: index,
        })),
      })
    }

    await tx.socialLink.deleteMany({ where: { websiteSettingsId: SETTINGS_ID } })
    if (socialLinks.length) {
      await tx.socialLink.createMany({
        data: socialLinks.map((link) => ({
          websiteSettingsId: SETTINGS_ID,
          platform: link.platform,
          url: link.url,
        })),
      })
    }

    if (current.logoMediaId && current.logoMediaId !== nextLogoId) {
      removed = await deleteMediaIfOrphan(tx, current.logoMediaId)
    }

    const saved = await tx.websiteSettings.findUniqueOrThrow({
      where: { id: SETTINGS_ID },
      include: settingsInclude,
    })

    return { settings: serializeSettings(saved), removedMedia: removed }
  })
}

async function ensureWebsiteSettings(db) {
  const existing = await db.websiteSettings.findUnique({
    where: { id: SETTINGS_ID },
    include: settingsInclude,
  })
  if (existing) return existing

  return db.websiteSettings.create({
    data: {
      id: SETTINGS_ID,
      contactEmail: 'info@alzboon.com',
      businessHoursEn: 'Sunday – Thursday, 9:00 AM – 6:00 PM',
      businessHoursAr: 'الأحد – الخميس، ٩:٠٠ ص – ٦:٠٠ م',
    },
    include: settingsInclude,
  })
}

function serializeSettings(settings) {
  return {
    id: settings.id,
    contactEmail: settings.contactEmail,
    businessHoursEn: settings.businessHoursEn,
    businessHoursAr: settings.businessHoursAr,
    logoMediaId: settings.logoMediaId,
    logoUrl: settings.logoMediaId ? `/media/${settings.logoMediaId}` : null,
    phones: settings.phoneNumbers.map((phone) => ({
      id: phone.id,
      number: phone.number,
      region: phone.region,
      label: phone.label || '',
    })),
    addresses: settings.addresses.map((address) => ({
      id: address.id,
      textEn: address.textEn,
      textAr: address.textAr,
      region: address.region,
    })),
    mapLocations: settings.mapLocations.map((location) => ({
      id: location.id,
      label: location.label,
      latitude: String(location.latitude),
      longitude: String(location.longitude),
    })),
    socialLinks: Object.fromEntries(
      PLATFORMS.map((platform) => [
        platform,
        settings.socialLinks.find((link) => link.platform === platform)?.url || '',
      ]),
    ),
  }
}

function normalizePhones(phones) {
  if (!Array.isArray(phones)) throw new WebsiteError('INVALID_PHONE')
  return phones.map((phone) => {
    const number = cleanText(phone?.number, 40)
    const region = phone?.region
    const label = cleanText(phone?.label, 80) || null
    if (!number || !REGIONS.includes(region)) throw new WebsiteError('INVALID_PHONE')
    return { number, region, label }
  })
}

function normalizeAddresses(addresses) {
  if (!Array.isArray(addresses)) throw new WebsiteError('INVALID_ADDRESS')
  return addresses.map((address) => {
    const textEn = cleanText(address?.textEn, 300)
    const textAr = cleanText(address?.textAr, 300)
    const region = address?.region
    if (!textEn || !textAr || !REGIONS.includes(region)) throw new WebsiteError('INVALID_ADDRESS')
    return { textEn, textAr, region }
  })
}

function normalizeMaps(locations) {
  if (!Array.isArray(locations)) throw new WebsiteError('INVALID_MAP')
  return locations.map((location) => {
    const label = cleanText(location?.label, 120)
    const latitude = Number(location?.latitude)
    const longitude = Number(location?.longitude)
    if (
      !label ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new WebsiteError('INVALID_MAP')
    }
    return {
      label,
      latitude: latitude.toFixed(7),
      longitude: longitude.toFixed(7),
    }
  })
}

function normalizeSocial(socialLinks) {
  const source = socialLinks && typeof socialLinks === 'object' ? socialLinks : {}
  const links = []

  for (const platform of PLATFORMS) {
    const raw = typeof source[platform] === 'string' ? source[platform].trim() : ''
    if (!raw) continue
    if (!isHttpUrl(raw)) throw new WebsiteError('INVALID_SOCIAL_URL')
    links.push({ platform, url: raw.slice(0, 500) })
  }

  return links
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

function cleanText(value, max) {
  if (typeof value !== 'string') return null
  const text = value.trim().replace(/\s+/g, ' ')
  if (!text || text.length > max) return null
  return text
}

function isHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function runInTransaction(db, fn) {
  if (typeof db.$transaction === 'function') return db.$transaction(fn)
  return fn(db)
}
