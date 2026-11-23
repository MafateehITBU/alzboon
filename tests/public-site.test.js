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
import { createBlog } from '../src/lib/blog/blogs.js'
import { createBlogCategory } from '../src/lib/blog/categories.js'
import { getPublishedBlogBySlug, listPublishedBlogs, publishedBlogWhere, serializePublicBlog } from '../src/lib/blog/public.js'
import { submitPublicEnquiry } from '../src/lib/enquiry/public-submit.js'
import { createService } from '../src/lib/service/services.js'
import { getAvailableServiceBySlug, listAvailableServices, serializePublicService } from '../src/lib/service/public.js'
import { withLocale, stripLocale, switchLocalePath } from '../src/lib/i18n/paths.js'
import { sanitizeTipTapDocument } from '../src/lib/blog/sanitize-document.js'

const prisma = new PrismaClient()
const password = 'Phase11-Test-1a'
let passwordHash
let previousStorageRoot
let storageRoot

function email() {
  return `phase11-${randomUUID()}@example.com`
}

async function makeImage(name = 'public.png') {
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

async function createAdmin() {
  return prisma.adminUser.create({
    data: {
      name: 'Phase 11',
      email: email(),
      passwordHash,
      role: 'SUPER_ADMIN',
      active: true,
    },
  })
}

async function cleanup() {
  await prisma.contactEnquiry.deleteMany({ where: { email: { startsWith: 'phase11-' } } })
  await prisma.loginAttempt.deleteMany({ where: { identifier: { startsWith: 'enquiry' } } })
  await prisma.benefitTranslation.deleteMany({})
  await prisma.benefit.deleteMany({})
  await prisma.practiceAreaTranslation.deleteMany({})
  await prisma.practiceArea.deleteMany({})
  await prisma.serviceTranslation.deleteMany({})
  await prisma.service.deleteMany({})
  await prisma.blogTranslation.deleteMany({})
  await prisma.blog.deleteMany({})
  await prisma.blogCategory.deleteMany({ where: { slug: { startsWith: 'phase11-' } } })
  await prisma.mediaAsset.deleteMany({ where: { visibility: 'PUBLIC' } })
  await prisma.adminUser.deleteMany({ where: { email: { startsWith: 'phase11-' } } })
}

before(async () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set.')
  previousStorageRoot = process.env.STORAGE_ROOT
  storageRoot = mkdtempSync(join(tmpdir(), 'alzboon-phase11-'))
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

test('locale paths switch between english and arabic', () => {
  assert.equal(withLocale('/services', 'en'), '/services')
  assert.equal(withLocale('/services', 'ar'), '/ar/services')
  assert.equal(stripLocale('/ar/blogs').locale, 'ar')
  assert.equal(switchLocalePath('/services/acme', 'ar'), '/ar/services/acme')
})

test('every saved service appears in public listing', async () => {
  const actor = await createAdmin()
  const hero = await makeImage('svc-hero.png')
  const practice = await makeImage('svc-practice.png')
  const secondHero = await makeImage('svc-second-hero.png')
  const secondPractice = await makeImage('svc-second-practice.png')

  try {
    const first = await createService(prisma, actor.id, {
      nameEn: 'Phase11 Visible Service',
      nameAr: 'خدمة ظاهرة',
      available: true,
      heroTitleEn: 'Hero',
      heroTitleAr: 'بطل',
      heroDescriptionEn: 'Hero description',
      heroDescriptionAr: 'وصف',
      overviewTitleEn: 'Overview',
      overviewTitleAr: 'نظرة',
      overviewDescriptionEn: 'Overview body',
      overviewDescriptionAr: 'نص',
      practiceAreas: [
        {
          titleEn: 'Point',
          titleAr: 'نقطة',
          subtitleEn: 'Sub',
          subtitleAr: 'فرعي',
          descriptionEn: 'Desc',
          descriptionAr: 'وصف',
        },
      ],
      heroMedia: hero,
      practiceAreaMedia: practice,
    })

    const second = await createService(prisma, actor.id, {
      nameEn: 'Phase11 Second Service',
      nameAr: 'خدمة ثانية',
      available: false,
      heroTitleEn: 'Hero',
      heroTitleAr: 'بطل',
      heroDescriptionEn: 'Hero description',
      heroDescriptionAr: 'وصف',
      overviewTitleEn: 'Overview',
      overviewTitleAr: 'نظرة',
      overviewDescriptionEn: 'Overview body',
      overviewDescriptionAr: 'نص',
      practiceAreas: [
        {
          titleEn: 'Point',
          titleAr: 'نقطة',
          subtitleEn: 'Sub',
          subtitleAr: 'فرعي',
          descriptionEn: 'Desc',
          descriptionAr: 'وصف',
        },
      ],
      heroMedia: secondHero,
      practiceAreaMedia: secondPractice,
    })

    const listed = await listAvailableServices(prisma)
    assert.equal(listed.some((row) => row.id === first.service.id), true)
    assert.equal(listed.some((row) => row.id === second.service.id), true)
    assert.equal(listed.every((row) => row.available), true)

    const bySlug = await getAvailableServiceBySlug(prisma, first.service.slug)
    const serialized = serializePublicService(bySlug, 'en')
    assert.equal(serialized.slug, first.service.slug)
    assert.equal(serialized.practiceAreas[0].subtitle, 'Sub')
    assert.ok(serialized.heroUrl.startsWith('/media/'))

    const ar = serializePublicService(bySlug, 'ar')
    assert.equal(ar.name, 'خدمة ظاهرة')
  } finally {
    await cleanup()
    await prisma.adminUser.delete({ where: { id: actor.id } }).catch(() => {})
  }
})

test('published blogs exclude hidden and future dates and omit attachments', async () => {
  const actor = await createAdmin()
  const featured = await makeImage('blog.png')
  const futureFeatured = await makeImage('blog-future.png')

  try {
    const category = await createBlogCategory(prisma, actor.id, {
      nameEn: `Phase11 Cat ${randomUUID().slice(0, 8)}`,
      nameAr: 'تصنيف',
    })

    const published = await createBlog(prisma, actor.id, {
      titleEn: 'Phase11 Published',
      titleAr: 'منشور',
      authorName: 'Editor',
      publishedOn: '2020-01-01',
      published: true,
      categoryId: category.id,
      documentEn: sanitizeTipTapDocument({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }] }),
      documentAr: sanitizeTipTapDocument({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'مرحبا' }] }] }),
      featuredMedia: featured,
    })

    await createBlog(prisma, actor.id, {
      titleEn: 'Phase11 Future',
      titleAr: 'مستقبلي',
      authorName: 'Editor',
      publishedOn: '2099-01-01',
      published: true,
      categoryId: category.id,
      documentEn: sanitizeTipTapDocument({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Later' }] }] }),
      documentAr: sanitizeTipTapDocument({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'لاحقا' }] }] }),
      featuredMedia: futureFeatured,
    })

    const listed = await listPublishedBlogs(prisma)
    assert.equal(listed.some((row) => row.id === published.blog.id), true)
    assert.equal(listed.every((row) => row.publishedOn <= new Date('2090-01-01')), true)

    const detail = serializePublicBlog(await getPublishedBlogBySlug(prisma, published.blog.slug), 'en')
    assert.equal(detail.title, 'Phase11 Published')
    assert.equal(detail.attachmentMediaId, undefined)
    assert.ok(!('attachmentUrl' in detail))

    assert.deepEqual(publishedBlogWhere(new Date('2020-01-02')).published, true)
  } finally {
    await cleanup()
    await prisma.adminUser.delete({ where: { id: actor.id } }).catch(() => {})
  }
})

test('contact form validates creates NEW enquiries and rate limits', async () => {
  const actor = await createAdmin()
  const hero = await makeImage('contact-hero.png')
  const practice = await makeImage('contact-practice.png')

  try {
    const service = await createService(prisma, actor.id, {
      nameEn: 'Phase11 Contact Service',
      nameAr: 'خدمة تواصل',
      available: true,
      heroTitleEn: 'Hero',
      heroTitleAr: 'بطل',
      heroDescriptionEn: 'Hero description',
      heroDescriptionAr: 'وصف',
      overviewTitleEn: 'Overview',
      overviewTitleAr: 'نظرة',
      overviewDescriptionEn: 'Overview body',
      overviewDescriptionAr: 'نص',
      practiceAreas: [
        {
          titleEn: 'Point',
          titleAr: 'نقطة',
          subtitleEn: 'Sub',
          subtitleAr: 'فرعي',
          descriptionEn: 'Desc',
          descriptionAr: 'وصف',
        },
      ],
      heroMedia: hero,
      practiceAreaMedia: practice,
    })

    const address = `phase11-contact-${randomUUID()}@example.com`
    const ok = await submitPublicEnquiry(
      prisma,
      {
        name: 'Client',
        email: address,
        phone: '+971500000000',
        company: 'Acme',
        country: 'UAE',
        serviceId: service.service.id,
        message: 'Please help',
        website: '',
      },
      { ip: '203.0.113.10' },
    )
    assert.equal(ok.ok, true)

    const row = await prisma.contactEnquiry.findFirst({ where: { email: address } })
    assert.equal(row.status, 'NEW')
    assert.equal(row.serviceId, service.service.id)

    const invalid = await submitPublicEnquiry(prisma, { name: '', email: 'bad', phone: '', company: '', country: '', message: '' }, { ip: '203.0.113.11' })
    assert.equal(invalid.ok, false)
    assert.equal(invalid.code, 'INVALID')

    const honeypot = await submitPublicEnquiry(
      prisma,
      {
        name: 'Bot',
        email: `phase11-bot-${randomUUID()}@example.com`,
        phone: '+971500000001',
        company: 'Spam',
        country: 'UAE',
        message: 'Spam',
        website: 'http://spam.test',
      },
      { ip: '203.0.113.12' },
    )
    assert.equal(honeypot.ok, true)
    assert.equal(await prisma.contactEnquiry.count({ where: { company: 'Spam' } }), 0)

    for (let index = 0; index < 3; index += 1) {
      await submitPublicEnquiry(
        prisma,
        {
          name: 'Client',
          email: address,
          phone: '+971500000000',
          company: 'Acme',
          country: 'UAE',
          message: `Follow up ${index}`,
        },
        { ip: `203.0.113.${20 + index}` },
      )
    }
    const limited = await submitPublicEnquiry(
      prisma,
      {
        name: 'Client',
        email: address,
        phone: '+971500000000',
        company: 'Acme',
        country: 'UAE',
        message: 'Too many',
      },
      { ip: '203.0.113.99' },
    )
    assert.equal(limited.ok, false)
    assert.equal(limited.code, 'RATE_LIMITED')
  } finally {
    await cleanup()
    await prisma.adminUser.delete({ where: { id: actor.id } }).catch(() => {})
  }
})
