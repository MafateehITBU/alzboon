import { createHash, randomBytes } from 'node:crypto'
import { SESSION_COOKIE, SESSION_RETENTION_MS, SESSION_TTL_MS } from './constants.js'

export function createSessionToken() {
  return randomBytes(32).toString('base64url')
}

export function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  }
}

export function clearedSessionCookieOptions() {
  return {
    ...sessionCookieOptions(),
    maxAge: 0,
  }
}

export function publicAdmin(admin) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    phone: admin.phone ?? null,
    role: admin.role,
    active: admin.active,
    profileMediaId: admin.profileMediaId ?? null,
    permissions: admin.permissions.map((row) => row.permission),
  }
}

export async function createSession(db, adminUserId) {
  const token = createSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  await db.session.updateMany({
    where: { adminUserId, revokedAt: null },
    data: { revokedAt: new Date() },
  })

  const session = await db.session.create({
    data: {
      adminUserId,
      tokenHash: hashSessionToken(token),
      expiresAt,
    },
    select: { id: true, expiresAt: true },
  })

  return { token, sessionId: session.id, expiresAt: session.expiresAt }
}

export async function findValidSession(db, token) {
  if (!token) return null

  const session = await db.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: {
      adminUser: {
        include: { permissions: { select: { permission: true } } },
      },
    },
  })

  if (!session || session.revokedAt || session.expiresAt <= new Date()) return null

  if (!session.adminUser.active) {
    await db.session.updateMany({
      where: { adminUserId: session.adminUserId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    return null
  }

  return {
    sessionId: session.id,
    expiresAt: session.expiresAt,
    admin: publicAdmin(session.adminUser),
  }
}

export async function revokeSession(db, token) {
  if (!token) return

  await db.session.updateMany({
    where: { tokenHash: hashSessionToken(token), revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export async function deleteExpiredSessions(db) {
  const cutoff = new Date(Date.now() - SESSION_RETENTION_MS)

  await db.session.deleteMany({
    where: { expiresAt: { lt: cutoff } },
  })
}

export const sessionCookieName = SESSION_COOKIE
