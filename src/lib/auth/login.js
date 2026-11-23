import {
  LOGIN_ATTEMPT_RETENTION_MS,
  LOGIN_FAILURE_LIMIT,
  LOGIN_IP_FAILURE_LIMIT,
  LOGIN_WINDOW_MS,
} from './constants.js'
import { normalizeEmail } from './email.js'
import { verifyAgainstStoredOrDummy } from './password.js'
import { createSession, deleteExpiredSessions } from './session.js'

export async function authenticate(db, input, { ip = 'unknown' } = {}) {
  const email = normalizeEmail(input?.email)
  const password = input?.password
  const ipKey = ipIdentifier(ip)

  if (!email || typeof password !== 'string' || password.length === 0 || password.length > 200) {
    return { status: 'INVALID_CREDENTIALS' }
  }

  await deleteExpiredSessions(db)
  await db.loginAttempt.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - LOGIN_ATTEMPT_RETENTION_MS) } },
  })

  if (await isRateLimited(db, email) || (await isIpRateLimited(db, ipKey))) {
    return { status: 'RATE_LIMITED' }
  }

  const user = await db.adminUser.findUnique({ where: { email } })
  const passwordMatches = await verifyAgainstStoredOrDummy(user?.passwordHash, password)

  if (!user || !passwordMatches || !user.active) {
    if (user && !user.active) {
      await db.session.updateMany({
        where: { adminUserId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      })
    }

    await recordFailure(db, email, ipKey)
    return { status: 'INVALID_CREDENTIALS' }
  }

  const current = await db.adminUser.findUnique({
    where: { id: user.id },
    select: { id: true, active: true },
  })

  if (!current?.active) {
    await recordFailure(db, email, ipKey)
    return { status: 'INVALID_CREDENTIALS' }
  }

  await db.loginAttempt.create({
    data: { identifier: email, successful: true },
  })

  const session = await createSession(db, current.id)

  return { status: 'OK', token: session.token, expiresAt: session.expiresAt }
}

async function recordFailure(db, email, ipKey) {
  await db.loginAttempt.create({
    data: { identifier: email, successful: false },
  })
  if (ipKey) {
    await db.loginAttempt.create({
      data: { identifier: ipKey, successful: false },
    })
  }
}

function ipIdentifier(ip) {
  const value = String(ip || '').trim().slice(0, 120)
  if (!value || value === 'unknown') return null
  return `login-ip:${value}`
}

async function isRateLimited(db, email) {
  const lastSuccess = await db.loginAttempt.findFirst({
    where: { identifier: email, successful: true },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  })
  const windowStart = new Date(Date.now() - LOGIN_WINDOW_MS)
  const since = lastSuccess && lastSuccess.createdAt > windowStart ? lastSuccess.createdAt : windowStart
  const failures = await db.loginAttempt.count({
    where: {
      identifier: email,
      successful: false,
      createdAt: { gt: since },
    },
  })

  return failures >= LOGIN_FAILURE_LIMIT
}

async function isIpRateLimited(db, ipKey) {
  if (!ipKey) return false
  const since = new Date(Date.now() - LOGIN_WINDOW_MS)
  const failures = await db.loginAttempt.count({
    where: {
      identifier: ipKey,
      successful: false,
      createdAt: { gt: since },
    },
  })
  return failures >= LOGIN_IP_FAILURE_LIMIT
}
