import { availableServiceWhere } from '../service/public.js'
import { isValidInternationalPhone, toE164Phone } from './phone.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ENQUIRY_EMAIL_WINDOW_MS = 60 * 60 * 1000
const ENQUIRY_EMAIL_LIMIT = 3
const ENQUIRY_IP_WINDOW_MS = 60 * 60 * 1000
const ENQUIRY_IP_LIMIT = 8

function clean(value, max) {
  const text = String(value ?? '').trim()
  if (!text) return ''
  return text.slice(0, max)
}

export { isValidInternationalPhone as isInternationalPhone } from './phone.js'

export async function submitPublicEnquiry(db, input, { ip = 'unknown' } = {}) {
  const honeypot = String(input?.website ?? '').trim()
  if (honeypot) {
    return { ok: true, code: 'OK' }
  }

  const name = clean(input?.name, 120)
  const email = clean(input?.email, 200).toLowerCase()
  const phoneRaw = clean(input?.phone, 60)
  const message = clean(input?.message, 5000)
  const serviceIdRaw = clean(input?.serviceId, 80)

  if (!name || !email || !EMAIL_RE.test(email) || !message) {
    return { ok: false, code: 'INVALID' }
  }

  if (phoneRaw && !isValidInternationalPhone(phoneRaw)) {
    return { ok: false, code: 'INVALID_PHONE' }
  }
  const phone = phoneRaw ? toE164Phone(phoneRaw) : ''

  if (await isEmailRateLimited(db, email)) {
    return { ok: false, code: 'RATE_LIMITED' }
  }
  if (await isIpRateLimited(db, ip)) {
    return { ok: false, code: 'RATE_LIMITED' }
  }

  let serviceId = null
  if (serviceIdRaw) {
    const service = await db.service.findFirst({
      where: { id: serviceIdRaw, ...availableServiceWhere() },
      select: { id: true },
    })
    if (!service) return { ok: false, code: 'INVALID_SERVICE' }
    serviceId = service.id
  }

  await db.contactEnquiry.create({
    data: {
      name,
      email,
      phone,
      serviceId,
      message,
      status: 'NEW',
    },
  })

  await db.loginAttempt.create({
    data: { identifier: `enquiry:${email}`, successful: true },
  })
  await db.loginAttempt.create({
    data: { identifier: `enquiry-ip:${String(ip).slice(0, 120)}`, successful: true },
  })

  return { ok: true, code: 'OK' }
}

async function isEmailRateLimited(db, email) {
  const since = new Date(Date.now() - ENQUIRY_EMAIL_WINDOW_MS)
  const count = await db.contactEnquiry.count({
    where: { email, createdAt: { gt: since } },
  })
  return count >= ENQUIRY_EMAIL_LIMIT
}

async function isIpRateLimited(db, ip) {
  const since = new Date(Date.now() - ENQUIRY_IP_WINDOW_MS)
  const count = await db.loginAttempt.count({
    where: {
      identifier: `enquiry-ip:${String(ip).slice(0, 120)}`,
      successful: true,
      createdAt: { gt: since },
    },
  })
  return count >= ENQUIRY_IP_LIMIT
}
