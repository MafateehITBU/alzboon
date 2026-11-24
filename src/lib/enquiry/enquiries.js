import { assertCanManageEnquiries } from './access.js'
import { ENQUIRY_STATUSES, EnquiryError } from './errors.js'

export const ENQUIRY_PAGE_SIZE = 10

const enquiryInclude = {
  service: {
    include: {
      translations: true,
    },
  },
}

export function parseEnquiryListQuery(params = {}) {
  const search = firstValue(params.q).trim().slice(0, 100)
  const statusValue = firstValue(params.status).toUpperCase()
  const status = ENQUIRY_STATUSES.includes(statusValue) ? statusValue : ''
  const serviceId = firstValue(params.service)
  const parsedPage = Number.parseInt(firstValue(params.page), 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 10000) : 1
  return { search, status, serviceId, page }
}

export async function listEnquiryServices(db, actorId) {
  await assertCanManageEnquiries(db, actorId)
  const rows = await db.service.findMany({
    include: { translations: true },
    orderBy: { createdAt: 'desc' },
  })

  return rows.map((service) => ({
    id: service.id,
    name: service.translations.find((row) => row.locale === 'EN')?.name || 'Untitled service',
  }))
}

export async function listEnquiries(db, actorId, query) {
  await assertCanManageEnquiries(db, actorId)

  const where = buildWhere(query)
  const page = query.page || 1

  const [total, rows] = await Promise.all([
    db.contactEnquiry.count({ where }),
    db.contactEnquiry.findMany({
      where,
      include: enquiryInclude,
      orderBy: [{ createdAt: 'desc' }],
      skip: (page - 1) * ENQUIRY_PAGE_SIZE,
      take: ENQUIRY_PAGE_SIZE,
    }),
  ])

  return {
    total,
    page,
    pageSize: ENQUIRY_PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / ENQUIRY_PAGE_SIZE)),
    enquiries: rows.map(serializeEnquiry),
  }
}

export async function getEnquiryForAdmin(db, actorId, enquiryId) {
  await assertCanManageEnquiries(db, actorId)
  const enquiry = await db.contactEnquiry.findUnique({
    where: { id: enquiryId },
    include: enquiryInclude,
  })
  if (!enquiry) throw new EnquiryError('NOT_FOUND')
  return serializeEnquiry(enquiry)
}

export async function updateEnquiryStatus(db, actorId, enquiryId, status) {
  await assertCanManageEnquiries(db, actorId)

  if (!ENQUIRY_STATUSES.includes(status)) throw new EnquiryError('INVALID_STATUS')

  const current = await db.contactEnquiry.findUnique({ where: { id: enquiryId }, select: { id: true } })
  if (!current) throw new EnquiryError('NOT_FOUND')

  const updated = await db.contactEnquiry.update({
    where: { id: enquiryId },
    data: { status },
    include: enquiryInclude,
  })

  return serializeEnquiry(updated)
}

export async function deleteEnquiry(db, actorId, enquiryId) {
  await assertCanManageEnquiries(db, actorId)

  const current = await db.contactEnquiry.findUnique({ where: { id: enquiryId }, select: { id: true } })
  if (!current) throw new EnquiryError('NOT_FOUND')

  await db.contactEnquiry.delete({ where: { id: enquiryId } })
  return { id: enquiryId }
}

export async function countNewEnquiries(db, actorId) {
  await assertCanManageEnquiries(db, actorId)
  return db.contactEnquiry.count({ where: { status: 'NEW' } })
}

function buildWhere(query) {
  const where = {}

  if (query.status) where.status = query.status
  if (query.serviceId === 'none') where.serviceId = null
  else if (query.serviceId) where.serviceId = query.serviceId

  if (query.search) {
    const q = query.search
    const statusKey = q.trim().toUpperCase()
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
      { message: { contains: q, mode: 'insensitive' } },
      {
        service: {
          translations: {
            some: { name: { contains: q, mode: 'insensitive' } },
          },
        },
      },
    ]
    if (['NEW', 'READ', 'ARCHIVED'].includes(statusKey)) {
      where.OR.push({ status: statusKey })
    }
  }

  return where
}

function serializeEnquiry(enquiry) {
  const serviceName =
    enquiry.service?.translations?.find((row) => row.locale === 'EN')?.name ||
    (enquiry.serviceId ? 'Unavailable service' : 'No service selected')

  return {
    id: enquiry.id,
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone,
    serviceId: enquiry.serviceId,
    serviceName,
    message: enquiry.message,
    status: enquiry.status,
    createdAt: enquiry.createdAt instanceof Date ? enquiry.createdAt.toISOString() : enquiry.createdAt,
    updatedAt: enquiry.updatedAt instanceof Date ? enquiry.updatedAt.toISOString() : enquiry.updatedAt,
  }
}

function firstValue(value) {
  const picked = Array.isArray(value) ? value[0] : value
  return typeof picked === 'string' ? picked : ''
}
