import { createHash, randomBytes, randomInt } from 'node:crypto'
import {
  LOGIN_ATTEMPT_RETENTION_MS,
  LOGIN_FAILURE_LIMIT,
  LOGIN_IP_FAILURE_LIMIT,
  LOGIN_LOCKOUT_DURATIONS_MS,
  LOGIN_LOCKOUT_MAX_LEVEL,
  LOGIN_OTP_MAX_ATTEMPTS,
  LOGIN_OTP_TTL_MS,
  LOGIN_WINDOW_MS,
} from './constants.js'
import { normalizeEmail } from './email.js'
import { verifyAgainstStoredOrDummy } from './password.js'
import { createSession, deleteExpiredSessions } from './session.js'
import { sendLoginOtpAlertEmail, sendLoginOtpEmail } from '../mail/login-otp.js'
import { isSmtpConfigured } from '../mail/smtp.js'

function hashOpaque(value) {
  return createHash('sha256').update(String(value)).digest('hex')
}

function generateOtpCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}

function generateChallengeToken() {
  return randomBytes(32).toString('base64url')
}

function exposeOtpInTests() {
  return process.env.AUTH_TEST_EXPOSE_OTP === '1'
}

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
  await db.loginOtpChallenge.deleteMany({
    where: { expiresAt: { lt: new Date(Date.now() - LOGIN_ATTEMPT_RETENTION_MS) } },
  })

  if (await isIpRateLimited(db, ipKey)) {
    return { status: 'RATE_LIMITED' }
  }

  const user = await db.adminUser.findUnique({ where: { email } })
  const passwordMatches = await verifyAgainstStoredOrDummy(user?.passwordHash, password)

  if (!user) {
    await recordFailure(db, email, ipKey)
    return { status: 'INVALID_CREDENTIALS' }
  }

  if (!user.active) {
    await db.session.updateMany({
      where: { adminUserId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    await recordFailure(db, email, ipKey)
    return { status: 'ACCOUNT_DEACTIVATED' }
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await recordFailure(db, email, ipKey)
    return { status: 'ACCOUNT_LOCKED', lockedUntil: user.lockedUntil }
  }

  if (!passwordMatches) {
    const lockResult = await registerPasswordFailure(db, user)
    await recordFailure(db, email, ipKey)
    if (lockResult.status === 'ACCOUNT_DEACTIVATED') return lockResult
    if (lockResult.status === 'ACCOUNT_LOCKED') return lockResult
    return { status: 'INVALID_CREDENTIALS' }
  }

  const testingOtp = exposeOtpInTests()
  if (!testingOtp && !isSmtpConfigured()) {
    return { status: 'OTP_UNAVAILABLE' }
  }

  const code = generateOtpCode()
  const challengeToken = generateChallengeToken()
  const expiresAt = new Date(Date.now() + LOGIN_OTP_TTL_MS)

  await db.loginOtpChallenge.updateMany({
    where: { adminUserId: user.id, consumedAt: null },
    data: { consumedAt: new Date() },
  })

  await db.loginOtpChallenge.create({
    data: {
      adminUserId: user.id,
      challengeTokenHash: hashOpaque(challengeToken),
      codeHash: hashOpaque(code),
      expiresAt,
    },
  })

  if (!testingOtp) {
    const sent = await sendLoginOtpEmail({ to: user.email, name: user.name, code })
    if (!sent.ok) {
      return { status: 'OTP_UNAVAILABLE' }
    }
  }

  await db.loginAttempt.create({
    data: { identifier: email, successful: true },
  })

  const result = {
    status: 'OTP_REQUIRED',
    challengeToken,
    expiresAt,
  }

  if (exposeOtpInTests()) {
    result.debugOtp = code
  }

  return result
}

export async function verifyLoginOtp(db, input, { ip = 'unknown' } = {}) {
  const challengeToken = typeof input?.challengeToken === 'string' ? input.challengeToken.trim() : ''
  const code = typeof input?.code === 'string' ? input.code.trim() : ''
  const ipKey = ipIdentifier(ip)

  if (!challengeToken || !/^\d{6}$/.test(code)) {
    return { status: 'OTP_INVALID' }
  }

  if (await isIpRateLimited(db, ipKey)) {
    return { status: 'RATE_LIMITED' }
  }

  const challenge = await db.loginOtpChallenge.findUnique({
    where: { challengeTokenHash: hashOpaque(challengeToken) },
    include: {
      adminUser: {
        select: {
          id: true,
          email: true,
          active: true,
          lockedUntil: true,
        },
      },
    },
  })

  if (!challenge || challenge.consumedAt || challenge.expiresAt <= new Date()) {
    return { status: 'OTP_INVALID' }
  }

  const user = challenge.adminUser
  if (!user?.active) {
    await db.loginOtpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    })
    return { status: 'ACCOUNT_DEACTIVATED' }
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { status: 'ACCOUNT_LOCKED', lockedUntil: user.lockedUntil }
  }

  if (challenge.codeHash !== hashOpaque(code)) {
    const attempts = challenge.attempts + 1
    if (attempts >= LOGIN_OTP_MAX_ATTEMPTS) {
      await db.loginOtpChallenge.update({
        where: { id: challenge.id },
        data: { attempts, consumedAt: new Date() },
      })
      await sendLoginOtpAlertEmail({
        targetEmail: user.email,
        attemptCount: attempts,
      })
      return { status: 'OTP_ALERT_SENT' }
    }

    await db.loginOtpChallenge.update({
      where: { id: challenge.id },
      data: { attempts },
    })
    return { status: 'OTP_INVALID', attemptsRemaining: LOGIN_OTP_MAX_ATTEMPTS - attempts }
  }

  await db.loginOtpChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  })

  await db.adminUser.update({
    where: { id: user.id },
    data: {
      failedLoginCount: 0,
      lockoutLevel: 0,
      lockedUntil: null,
    },
  })

  const session = await createSession(db, user.id)
  return { status: 'OK', token: session.token, expiresAt: session.expiresAt }
}

async function registerPasswordFailure(db, user) {
  const nextCount = (user.failedLoginCount || 0) + 1

  if (nextCount < LOGIN_FAILURE_LIMIT) {
    await db.adminUser.update({
      where: { id: user.id },
      data: { failedLoginCount: nextCount },
    })
    return { status: 'INVALID_CREDENTIALS' }
  }

  const level = user.lockoutLevel || 0

  if (level >= LOGIN_LOCKOUT_MAX_LEVEL) {
    await db.adminUser.update({
      where: { id: user.id },
      data: {
        active: false,
        failedLoginCount: 0,
        lockedUntil: null,
      },
    })
    await db.session.updateMany({
      where: { adminUserId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    return { status: 'ACCOUNT_DEACTIVATED' }
  }

  const durationMs = LOGIN_LOCKOUT_DURATIONS_MS[level]
  const lockedUntil = new Date(Date.now() + durationMs)

  await db.adminUser.update({
    where: { id: user.id },
    data: {
      failedLoginCount: 0,
      lockoutLevel: level + 1,
      lockedUntil,
    },
  })

  return { status: 'ACCOUNT_LOCKED', lockedUntil }
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
