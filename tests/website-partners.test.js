import './use-test-database.js'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test, { after, before } from 'node:test'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth/password.js'
import { validatePublicImage } from '../src/lib/media/public-image.js'
import { writeStoredFile, removeStoredFile } from '../src/lib/storage/objects.js'
import { WebsiteError } from '../src/lib/website/errors.js'
import {
  createPartner,
  deletePartner,
  listPartners,
  updatePartner,
} from '../src/lib/website/partners.js'
import { getWebsiteSettingsForAdmin, saveWebsiteSettings } from '../src/lib/website/settings.js'

const password = 'Phase6-Test-1a'
const prisma = new PrismaClient()
let passwordHash
let previousStorageRoot
let storageRoot

function email() {
  return `phase6-test-${randomUUID()}@example.com`
}

async function createAdmin({ role = 'ADMIN', permissions = [], address = email() } = {}) {
  return prisma.adminUser.create({
    data: {
      name: 'Phase 6 test',
      email: address,
      passwordHash,
      role,
      active: true,
      permissions: { create: permissions.map((permission) => ({ permission })) },
    },
  })
}


before(async () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set.')
  previousStorageRoot = process.env.STORAGE_ROOT
  storageRoot = mkdtempSync(join(tmpdir(), 'alzboon-phase6-'))
  process.env.STORAGE_ROOT = storageRoot
  passwordHash = await hashPassword(password)
})

after(async () => {
  await prisma.$disconnect()
  if (previousStorageRoot === undefined) delete process.env.STORAGE_ROOT
  else process.env.STORAGE_ROOT = previousStorageRoot
  rmSync(storageRoot, { recursive: true, force: true })
})

test('website settings require MANAGE_WEBSITE_SETTINGS', async () => {
  const allowed = await createAdmin({ role: 'SUPER_ADMIN' })
  const denied = await createAdmin({ permissions: ['MANAGE_BLOGS'] })

  try {
    await assert.rejects(() => getWebsiteSettingsForAdmin(prisma, denied.id), (error) => error.code === 'FORBIDDEN')
    const settings = await getWebsiteSettingsForAdmin(prisma, allowed.id)
    assert.equal(settings.id, 'default')
    assert.ok(settings.contactEmail)
  } finally {
  }
})

test('saves general settings, phones, addresses, maps, and social links', async () => {
  const actor = await createAdmin({ role: 'SUPER_ADMIN' })

  try {
    const saved = await saveWebsiteSettings(prisma, actor.id, {
      contactEmail: 'office@example.com',
      businessHoursEn: 'Sun-Thu 9-6',
      businessHoursAr: 'الأحد-الخميس',
      phones: [
        { number: '+971 500000000', region: 'UAE', label: 'Main' },
        { number: '+962 600000000', region: 'JORDAN', label: '' },
      ],
      addresses: [{ textEn: 'Abu Dhabi', textAr: 'أبوظبي', region: 'UAE' }],
      mapLocations: [{ label: 'Office', latitude: '24.4539000', longitude: '54.3773000' }],
      socialLinks: {
        LINKEDIN: 'https://linkedin.com/company/example',
        FACEBOOK: '',
        INSTAGRAM: 'https://instagram.com/example',
        X: 'not-a-url',
      },
    }).catch((error) => error)

    assert.equal(saved instanceof WebsiteError, true)
    assert.equal(saved.code, 'INVALID_SOCIAL_URL')

    const ok = await saveWebsiteSettings(prisma, actor.id, {
      contactEmail: 'office@example.com',
      businessHoursEn: 'Sun-Thu 9-6',
      businessHoursAr: 'الأحد-الخميس',
      phones: [{ number: '+971 500000000', region: 'UAE', label: 'Main' }],
      addresses: [{ textEn: 'Abu Dhabi', textAr: 'أبوظبي', region: 'UAE' }],
      mapLocations: [{ label: 'Office', latitude: '24.4539000', longitude: '54.3773000' }],
      socialLinks: {
        LINKEDIN: 'https://linkedin.com/company/example',
        FACEBOOK: '',
        INSTAGRAM: 'https://instagram.com/example',
        X: '',
      },
    })

    assert.equal(ok.settings.contactEmail, 'office@example.com')
    assert.equal(ok.settings.phones.length, 1)
    assert.equal(ok.settings.addresses.length, 1)
    assert.equal(ok.settings.mapLocations.length, 1)
    assert.equal(ok.settings.socialLinks.LINKEDIN, 'https://linkedin.com/company/example')
    assert.equal(ok.settings.socialLinks.FACEBOOK, '')
  } finally {
  }
})

test('partner create edit delete and unauthorized access', async () => {
  const actor = await createAdmin({ role: 'SUPER_ADMIN' })
  const denied = await createAdmin({ permissions: ['MANAGE_BLOGS'] })
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])
  const validated = validatePublicImage({ filename: 'logo.png', bytes: png })
  assert.equal(validated.ok, true)
  const storageKey = await writeStoredFile('PUBLIC', png)

  try {
    await assert.rejects(
      () =>
        createPartner(prisma, denied.id, {
          name: 'Denied',
          logoMedia: {
            storageKey,
            mimeType: validated.mimeType,
            byteSize: validated.byteSize,
            originalFilename: validated.originalFilename,
          },
        }),
      (error) => error.code === 'FORBIDDEN',
    )

    const created = await createPartner(prisma, actor.id, {
      name: 'Acme Counsel',
      logoMedia: {
        storageKey,
        mimeType: validated.mimeType,
        byteSize: validated.byteSize,
        originalFilename: validated.originalFilename,
      },
    })
    assert.equal(created.partner.name, 'Acme Counsel')
    assert.ok(created.partner.logoUrl.startsWith('/media/'))

    const listing = await listPartners(prisma, actor.id, { search: 'Acme Counsel', page: 1 })
    assert.ok(listing.partners.some((row) => row.id === created.partner.id) || listing.total >= 1)

    const replacement = await writeStoredFile('PUBLIC', png)
    const updated = await updatePartner(prisma, actor.id, created.partner.id, {
      name: 'Acme Legal',
      logoMedia: {
        storageKey: replacement,
        mimeType: validated.mimeType,
        byteSize: validated.byteSize,
        originalFilename: validated.originalFilename,
      },
    })
    assert.equal(updated.partner.name, 'Acme Legal')
    assert.ok(updated.removedMedia?.storageKey)

    const deleted = await deletePartner(prisma, actor.id, created.partner.id)
    assert.equal(deleted.id, created.partner.id)
    assert.ok(deleted.removedMedia?.storageKey)
    if (updated.removedMedia?.storageKey) await removeStoredFile('PUBLIC', updated.removedMedia.storageKey)
    if (deleted.removedMedia?.storageKey) await removeStoredFile('PUBLIC', deleted.removedMedia.storageKey)
  } finally {
  }
})

test('public image validation rejects svg and mismatched bytes', () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0, 1, 2, 3])
  assert.equal(validatePublicImage({ filename: 'a.jpg', bytes: jpeg }).ok, true)
  assert.equal(validatePublicImage({ filename: 'a.svg', bytes: Buffer.from('<svg></svg>') }).ok, false)
  assert.equal(validatePublicImage({ filename: 'a.png', bytes: jpeg }).ok, false)
})
