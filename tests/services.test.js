import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test, { after, before } from 'node:test'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth/password.js'
import { validatePublicImage } from '../src/lib/media/public-image.js'
import { removeStoredFile, writeStoredFile } from '../src/lib/storage/objects.js'
import { ServiceError } from '../src/lib/service/errors.js'
import { getAvailableServiceById, listAvailableServices } from '../src/lib/service/public.js'
import {
  createService,
  deleteService,
  listServices,
  updateService,
} from '../src/lib/service/services.js'

const password = 'Phase8-Test-1a'
const prisma = new PrismaClient()
let passwordHash
let previousStorageRoot
let storageRoot

function email() {
  return `phase8-test-${randomUUID()}@example.com`
}

async function createAdmin({ role = 'ADMIN', permissions = [], address = email() } = {}) {
  return prisma.adminUser.create({
    data: {
      name: 'Phase 8 test',
      email: address,
      passwordHash,
      role,
      active: true,
      permissions: { create: permissions.map((permission) => ({ permission })) },
    },
  })
}

async function makeImageMedia(name = 'service.png') {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])
  const validated = validatePublicImage({ filename: name, bytes: png })
  assert.equal(validated.ok, true)
  const storageKey = await writeStoredFile('PUBLIC', png)
  return {
    storageKey,
    mimeType: validated.mimeType,
    byteSize: validated.byteSize,
    originalFilename: validated.originalFilename,
  }
}

function baseInput(overrides = {}) {
  return {
    nameEn: 'Corporate Advisory',
    nameAr: 'الاستشارات المؤسسية',
    available: true,
    heroTitleEn: 'Corporate hero',
    heroTitleAr: 'عنوان البطل',
    heroDescriptionEn: 'English hero description',
    heroDescriptionAr: 'وصف البطل',
    overviewTitleEn: 'Practice areas',
    overviewTitleAr: 'مجالات الممارسة',
    overviewDescriptionEn: 'English practice section',
    overviewDescriptionAr: 'وصف قسم الممارسة',
    practiceAreas: [
      {
        titleEn: 'Contracts',
        titleAr: 'العقود',
        subtitleEn: 'Drafting',
        subtitleAr: 'صياغة',
        descriptionEn: 'Contract support',
        descriptionAr: 'دعم العقود',
      },
    ],
    ...overrides,
  }
}

async function cleanup() {
  await prisma.benefitTranslation.deleteMany({})
  await prisma.benefit.deleteMany({})
  await prisma.practiceAreaTranslation.deleteMany({})
  await prisma.practiceArea.deleteMany({})
  await prisma.serviceTranslation.deleteMany({})
  await prisma.service.deleteMany({})
  await prisma.mediaAsset.deleteMany({ where: { visibility: 'PUBLIC' } })
  await prisma.adminUser.deleteMany({ where: { email: { startsWith: 'phase8-test-' } } })
}

before(async () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set.')
  previousStorageRoot = process.env.STORAGE_ROOT
  storageRoot = mkdtempSync(join(tmpdir(), 'alzboon-phase8-'))
  process.env.STORAGE_ROOT = storageRoot
  passwordHash = await hashPassword(password)
  await cleanup()
})

after(async () => {
  await cleanup()
  await prisma.$disconnect()
  if (previousStorageRoot === undefined) delete process.env.STORAGE_ROOT
  else process.env.STORAGE_ROOT = previousStorageRoot
  rmSync(storageRoot, { recursive: true, force: true })
})

test('service listing requires MANAGE_SERVICES', async () => {
  const allowed = await createAdmin({ role: 'SUPER_ADMIN' })
  const denied = await createAdmin({ permissions: ['MANAGE_BLOGS'] })

  try {
    await assert.rejects(() => listServices(prisma, denied.id, { page: 1 }), (error) => error.code === 'FORBIDDEN')
    const listing = await listServices(prisma, allowed.id, { page: 1 })
    assert.equal(listing.total, 0)
  } finally {
    await prisma.adminUser.deleteMany({ where: { id: { in: [allowed.id, denied.id] } } })
  }
})

test('creates and edits bilingual services with ordered practice areas', async () => {
  const actor = await createAdmin({ role: 'SUPER_ADMIN' })
  const hero = await makeImageMedia('hero.png')
  const practice = await makeImageMedia('practice.png')

  try {
    const created = await createService(prisma, actor.id, {
      ...baseInput({
        practiceAreas: [
          {
            titleEn: 'First area',
            titleAr: 'الأول',
            subtitleEn: 'One',
            subtitleAr: 'واحد',
            descriptionEn: 'First description',
            descriptionAr: 'الوصف الأول',
          },
          {
            titleEn: 'Second area',
            titleAr: 'الثاني',
            subtitleEn: 'Two',
            subtitleAr: 'اثنان',
            descriptionEn: 'Second description',
            descriptionAr: 'الوصف الثاني',
          },
        ],
      }),
      heroMedia: hero,
      practiceAreaMedia: practice,
    })

    assert.equal(created.service.nameEn, 'Corporate Advisory')
    assert.equal(created.service.nameAr, 'الاستشارات المؤسسية')
    assert.equal(created.service.practiceAreas.length, 2)
    assert.equal(created.service.practiceAreas[0].titleEn, 'First area')
    assert.equal(created.service.practiceAreas[1].titleEn, 'Second area')
    assert.equal(created.service.practiceAreas[0].subtitleEn, 'One')
    assert.equal(created.service.benefits.length, 0)
    assert.equal(created.service.overviewTitleEn, 'Practice areas')

    const listing = await listServices(prisma, actor.id, { search: 'Corporate', page: 1 })
    assert.equal(listing.total, 1)

    const replacementHero = await makeImageMedia('hero-2.png')
    const updated = await updateService(prisma, actor.id, created.service.id, {
      ...baseInput({
        nameEn: 'Corporate Advisory Plus',
        overviewTitleEn: 'Updated practice areas',
        practiceAreas: [
          {
            titleEn: 'Second area',
            titleAr: 'الثاني',
            subtitleEn: 'Two',
            subtitleAr: 'اثنان',
            descriptionEn: 'Second description',
            descriptionAr: 'الوصف الثاني',
          },
          {
            titleEn: 'First area',
            titleAr: 'الأول',
            subtitleEn: 'One',
            subtitleAr: 'واحد',
            descriptionEn: 'First description',
            descriptionAr: 'الوصف الأول',
          },
        ],
      }),
      heroMedia: replacementHero,
    })

    assert.equal(updated.service.nameEn, 'Corporate Advisory Plus')
    assert.equal(updated.service.available, true)
    assert.equal(updated.service.overviewTitleEn, 'Updated practice areas')
    assert.equal(updated.service.practiceAreas[0].titleEn, 'Second area')
    assert.equal(updated.service.practiceAreas[0].subtitleEn, 'Two')
    assert.equal(updated.service.benefits.length, 0)
    assert.ok(updated.removedMedia.length >= 1)

    assert.equal((await getAvailableServiceById(prisma, updated.service.id))?.id, updated.service.id)

    for (const media of updated.removedMedia) {
      await removeStoredFile(media.visibility, media.storageKey)
    }

    const deleted = await deleteService(prisma, actor.id, created.service.id)
    for (const media of deleted.removedMedia) {
      await removeStoredFile(media.visibility, media.storageKey)
    }
  } finally {
    await cleanup()
    await prisma.adminUser.delete({ where: { id: actor.id } }).catch(() => {})
  }
})

test('rejects incomplete practice areas and unauthorized creates', async () => {
  const actor = await createAdmin({ role: 'SUPER_ADMIN' })
  const denied = await createAdmin({ permissions: ['MANAGE_BLOGS'] })
  const hero = await makeImageMedia('hero-deny.png')
  const practice = await makeImageMedia('practice-deny.png')

  try {
    await assert.rejects(
      () =>
        createService(prisma, denied.id, {
          ...baseInput(),
          heroMedia: hero,
          practiceAreaMedia: practice,
        }),
      (error) => error.code === 'FORBIDDEN',
    )

    await assert.rejects(
      () =>
        createService(prisma, actor.id, {
          ...baseInput({ practiceAreas: [] }),
          heroMedia: hero,
          practiceAreaMedia: practice,
        }),
      (error) => error instanceof ServiceError && error.code === 'INVALID_PRACTICE_AREAS',
    )

    await assert.rejects(
      () =>
        createService(prisma, actor.id, {
          ...baseInput({ overviewTitleEn: '' }),
          heroMedia: hero,
          practiceAreaMedia: practice,
        }),
      (error) => error instanceof ServiceError && error.code === 'INVALID_OVERVIEW',
    )

    const before = await prisma.service.count()
    assert.equal(before, 0)
  } finally {
    await removeStoredFile('PUBLIC', hero.storageKey)
    await removeStoredFile('PUBLIC', practice.storageKey)
    await prisma.adminUser.deleteMany({ where: { id: { in: [actor.id, denied.id] } } })
  }
})

test('failed update validation leaves existing service unchanged', async () => {
  const actor = await createAdmin({ role: 'SUPER_ADMIN' })
  const hero = await makeImageMedia('hero-keep.png')
  const practice = await makeImageMedia('practice-keep.png')

  try {
    const created = await createService(prisma, actor.id, {
      ...baseInput(),
      heroMedia: hero,
      practiceAreaMedia: practice,
    })

    await assert.rejects(
      () =>
        updateService(prisma, actor.id, created.service.id, {
          ...baseInput({
            practiceAreas: [{ titleEn: 'Only English', titleAr: '', subtitleEn: '', subtitleAr: '', descriptionEn: '', descriptionAr: '' }],
          }),
        }),
      (error) => error.code === 'INVALID_PRACTICE_AREAS',
    )

    const current = await prisma.service.findUnique({
      where: { id: created.service.id },
      include: {
        practiceAreas: { include: { translations: true }, orderBy: { sortOrder: 'asc' } },
      },
    })
    assert.equal(current.practiceAreas.length, 1)
    assert.equal(current.practiceAreas[0].translations.find((row) => row.locale === 'EN').title, 'Contracts')

    const deleted = await deleteService(prisma, actor.id, created.service.id)
    for (const media of deleted.removedMedia) {
      await removeStoredFile(media.visibility, media.storageKey)
    }
  } finally {
    await cleanup()
    await prisma.adminUser.delete({ where: { id: actor.id } }).catch(() => {})
  }
})

test('public service listing includes every saved service and images validate', async () => {
  const actor = await createAdmin({ role: 'SUPER_ADMIN' })
  const hero = await makeImageMedia('hero-public.png')
  const practice = await makeImageMedia('practice-public.png')
  const secondHero = await makeImageMedia('hero-second.png')
  const secondPractice = await makeImageMedia('practice-second.png')

  try {
    const first = await createService(prisma, actor.id, {
      ...baseInput({ nameEn: 'Visible Service', nameAr: 'خدمة ظاهرة' }),
      heroMedia: hero,
      practiceAreaMedia: practice,
    })
    const second = await createService(prisma, actor.id, {
      ...baseInput({ nameEn: 'Second Service', nameAr: 'خدمة ثانية', available: false }),
      heroMedia: secondHero,
      practiceAreaMedia: secondPractice,
    })

    const list = await listAvailableServices(prisma)
    assert.equal(list.some((row) => row.id === first.service.id), true)
    assert.equal(list.some((row) => row.id === second.service.id), true)
    assert.equal(list.every((row) => row.available === true), true)

    const detail = await getAvailableServiceById(prisma, first.service.id)
    assert.equal(detail.id, first.service.id)
    assert.ok(detail.heroMediaId)
    assert.ok(detail.practiceAreaMediaId)
    assert.ok(detail.heroMedia)
    assert.ok(detail.practiceAreaMedia)

    const accepted = validatePublicImage({
      filename: 'ok.webp',
      bytes: Buffer.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]),
    })
    assert.equal(accepted.ok, true)

    const rejected = validatePublicImage({
      filename: 'bad.svg',
      bytes: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
    })
    assert.equal(rejected.ok, false)

    for (const serviceId of [first.service.id, second.service.id]) {
      const deleted = await deleteService(prisma, actor.id, serviceId)
      for (const media of deleted.removedMedia) {
        await removeStoredFile(media.visibility, media.storageKey)
      }
    }
  } finally {
    await cleanup()
    await prisma.adminUser.delete({ where: { id: actor.id } }).catch(() => {})
  }
})
