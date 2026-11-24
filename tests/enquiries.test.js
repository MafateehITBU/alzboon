import './use-test-database.js'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test, { after, before } from 'node:test'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth/password.js'
import { loadDashboardCards } from '../src/lib/admin/dashboard.js'
import {
  countNewEnquiries,
  deleteEnquiry,
  getEnquiryForAdmin,
  listEnquiries,
  updateEnquiryStatus,
} from '../src/lib/enquiry/enquiries.js'
import { EnquiryError } from '../src/lib/enquiry/errors.js'

const password = 'Phase9-Test-1a'
const prisma = new PrismaClient()
let passwordHash

function email() {
  return `phase9-test-${randomUUID()}@example.com`
}

async function createAdmin({ role = 'ADMIN', permissions = [], address = email() } = {}) {
  return prisma.adminUser.create({
    data: {
      name: 'Phase 9 test',
      email: address,
      passwordHash,
      role,
      active: true,
      permissions: { create: permissions.map((permission) => ({ permission })) },
    },
  })
}

async function createEnquiry(data = {}) {
  return prisma.contactEnquiry.create({
    data: {
      name: data.name || 'Ada Contact',
      email: data.email || `ada-${randomUUID()}@example.com`,
      phone: data.phone || '+971500000000',
      serviceId: data.serviceId ?? null,
      message: data.message || 'Please call me about advisory work.',
      status: data.status || 'NEW',
    },
  })
}

async function createServiceFixture() {
  const hero = await prisma.mediaAsset.create({
    data: {
      storageKey: randomUUID(),
      visibility: 'PUBLIC',
      originalFilename: 'phase9-hero.png',
      mimeType: 'image/png',
      byteSize: 12,
    },
  })
  const practice = await prisma.mediaAsset.create({
    data: {
      storageKey: randomUUID(),
      visibility: 'PUBLIC',
      originalFilename: 'phase9-practice.png',
      mimeType: 'image/png',
      byteSize: 12,
    },
  })

  const service = await prisma.service.create({
    data: {
      slug: `phase9-service-${randomUUID().slice(0, 8)}`,
      available: false,
      heroMediaId: hero.id,
      practiceAreaMediaId: practice.id,
      translations: {
        create: [
          {
            locale: 'EN',
            name: 'Phase9 Service',
            heroTitle: 'H',
            heroDescription: 'HD',
            overviewTitle: 'O',
            overviewDescription: 'OD',
          },
          {
            locale: 'AR',
            name: 'خدمة',
            heroTitle: 'ه',
            heroDescription: 'و',
            overviewTitle: 'ن',
            overviewDescription: 'ص',
          },
        ],
      },
    },
  })

  return { service, mediaIds: [hero.id, practice.id] }
}


before(async () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set.')
  passwordHash = await hashPassword(password)
})

after(async () => {
  await prisma.$disconnect()
})

test('enquiry listing requires MANAGE_CONTACT_ENQUIRIES', async () => {
  const allowed = await createAdmin({ role: 'SUPER_ADMIN' })
  const denied = await createAdmin({ permissions: ['MANAGE_BLOGS'] })

  try {
    await assert.rejects(() => listEnquiries(prisma, denied.id, { page: 1 }), (error) => error.code === 'FORBIDDEN')
    const listing = await listEnquiries(prisma, allowed.id, { page: 1 })
    assert.ok(listing.total >= 0)
  } finally {
  }
})

test('search status and service filters work with details access', async () => {
  const actor = await createAdmin({ role: 'SUPER_ADMIN' })
  const { service } = await createServiceFixture()

  const match = await createEnquiry({
    name: 'Phase9 Searchable',
    email: `phase9-search-${randomUUID()}@example.com`,
    phone: '+971511111111',
    status: 'NEW',
    serviceId: service.id,
  })
  await createEnquiry({
    name: 'Phase9 Other',
    email: `phase9-other-${randomUUID()}@example.com`,
    status: 'READ',
  })

  try {
    const byName = await listEnquiries(prisma, actor.id, { search: 'Searchable', page: 1 })
    assert.equal(byName.total, 1)
    assert.equal(byName.enquiries[0].id, match.id)

    const byStatus = await listEnquiries(prisma, actor.id, { status: 'NEW', page: 1 })
    assert.ok(byStatus.enquiries.every((row) => row.status === 'NEW'))

    const byService = await listEnquiries(prisma, actor.id, { serviceId: service.id, page: 1 })
    assert.equal(byService.total, 1)
    assert.equal(byService.enquiries[0].serviceName, 'Phase9 Service')

    const detail = await getEnquiryForAdmin(prisma, actor.id, match.id)
    assert.equal(detail.message, 'Please call me about advisory work.')
    assert.equal(detail.email, match.email)
  } finally {
  }
})

test('status changes dashboard count deletion and invalid status', async () => {
  const actor = await createAdmin({ role: 'SUPER_ADMIN' })
  const denied = await createAdmin({ permissions: ['MANAGE_SERVICES'] })
  const enquiry = await createEnquiry({
    name: 'Phase9 Status',
    email: `phase9-status-${randomUUID()}@example.com`,
    status: 'NEW',
  })

  try {
    const before = await countNewEnquiries(prisma, actor.id)
    assert.ok(before >= 1)

    const cardsBefore = await loadDashboardCards(prisma, { active: true, role: 'SUPER_ADMIN', permissions: [] })
    const enquiryCardBefore = cardsBefore.find((card) => card.key === 'enquiries')
    assert.ok(enquiryCardBefore.newCount >= 1)

    await assert.rejects(
      () => updateEnquiryStatus(prisma, denied.id, enquiry.id, 'READ'),
      (error) => error.code === 'FORBIDDEN',
    )

    await assert.rejects(
      () => updateEnquiryStatus(prisma, actor.id, enquiry.id, 'PENDING'),
      (error) => error instanceof EnquiryError && error.code === 'INVALID_STATUS',
    )

    const read = await updateEnquiryStatus(prisma, actor.id, enquiry.id, 'READ')
    assert.equal(read.status, 'READ')

    const afterRead = await countNewEnquiries(prisma, actor.id)
    assert.equal(afterRead, before - 1)

    const cardsAfter = await loadDashboardCards(prisma, { active: true, role: 'SUPER_ADMIN', permissions: [] })
    const enquiryCardAfter = cardsAfter.find((card) => card.key === 'enquiries')
    assert.equal(enquiryCardAfter.newCount, enquiryCardBefore.newCount - 1)

    const archived = await updateEnquiryStatus(prisma, actor.id, enquiry.id, 'ARCHIVED')
    assert.equal(archived.status, 'ARCHIVED')

    await assert.rejects(() => deleteEnquiry(prisma, denied.id, enquiry.id), (error) => error.code === 'FORBIDDEN')

    const deleted = await deleteEnquiry(prisma, actor.id, enquiry.id)
    assert.equal(deleted.id, enquiry.id)
    await assert.rejects(() => getEnquiryForAdmin(prisma, actor.id, enquiry.id), (error) => error.code === 'NOT_FOUND')
  } finally {
  }
})
