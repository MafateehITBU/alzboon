import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { after, before, test } from 'node:test'
import { PrismaClient } from '@prisma/client'
import { deleteAdminAccount, updateAdminAccess } from '../src/lib/auth/admin-access.js'
import { bootstrapSuperAdmin } from '../src/lib/auth/bootstrap.js'
import { normalizeEmail } from '../src/lib/auth/email.js'
import { AuthError } from '../src/lib/auth/errors.js'
import { authenticate } from '../src/lib/auth/login.js'
import { hashPassword, isStrongPassword, verifyPassword } from '../src/lib/auth/password.js'
import { hasPermission } from '../src/lib/auth/permissions.js'
import { adminProxyDecision } from '../src/lib/auth/proxy-decision.js'
import {
  createSession,
  findValidSession,
  hashSessionToken,
  revokeSession,
  sessionCookieOptions,
} from '../src/lib/auth/session.js'

const password = 'Phase3-Test-1a'
const prisma = new PrismaClient()
let passwordHash

function email() {
  return `phase3-test-${randomUUID()}@example.com`
}

async function removeFixtures(emails) {
  await prisma.loginAttempt.deleteMany({ where: { identifier: { in: emails } } })
  await prisma.adminUser.deleteMany({ where: { email: { in: emails } } })
}

/** Temporarily deactivate other active Super Admins so last-SA rules can be asserted. */
async function withOnlyActiveSuperAdmins(keepIds, fn) {
  const others = await prisma.adminUser.findMany({
    where: {
      role: 'SUPER_ADMIN',
      active: true,
      NOT: { id: { in: keepIds } },
    },
    select: { id: true },
  })

  if (others.length > 0) {
    await prisma.adminUser.updateMany({
      where: { id: { in: others.map((row) => row.id) } },
      data: { active: false },
    })
  }

  try {
    return await fn()
  } finally {
    if (others.length > 0) {
      await prisma.adminUser.updateMany({
        where: { id: { in: others.map((row) => row.id) } },
        data: { active: true },
      })
    }
  }
}

async function createAdmin({ role = 'ADMIN', active = true, permissions = [], address = email() } = {}) {
  return prisma.adminUser.create({
    data: {
      name: 'Phase 3 test',
      email: address,
      passwordHash,
      role,
      active,
      permissions: { create: permissions.map((permission) => ({ permission })) },
    },
  })
}

before(async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Auth tests need the local PostgreSQL database.')
  }
  passwordHash = await hashPassword(password)
  await prisma.adminUser.deleteMany({ where: { email: { startsWith: 'phase3-test-' } } })
  await prisma.loginAttempt.deleteMany({ where: { identifier: { startsWith: 'phase3-test-' } } })
})

after(async () => {
  await prisma.adminUser.deleteMany({ where: { email: { startsWith: 'phase3-test-' } } })
  await prisma.loginAttempt.deleteMany({ where: { identifier: { startsWith: 'phase3-test-' } } })
  await prisma.$disconnect()
})

test('hashes and verifies Argon2id passwords', async () => {
  assert.match(passwordHash, /^\$argon2id\$/)
  assert.equal(await verifyPassword(passwordHash, password), true)
  assert.equal(await verifyPassword(passwordHash, 'wrong-password'), false)
  assert.equal(isStrongPassword(password), true)
  assert.equal(isStrongPassword('short'), false)
  assert.equal(normalizeEmail('  Admin@Example.com '), 'admin@example.com')
  assert.equal(normalizeEmail('not-an-email'), null)
})

test('session cookie is HTTP-only and Lax', () => {
  const options = sessionCookieOptions()
  assert.equal(options.httpOnly, true)
  assert.equal(options.sameSite, 'lax')
  assert.equal(options.path, '/')
  assert.equal(options.secure, false)
})

test('proxy redirects only from the cookie presence', () => {
  assert.equal(adminProxyDecision({ pathname: '/', hasSessionCookie: false }), 'next')
  assert.equal(adminProxyDecision({ pathname: '/admin', hasSessionCookie: false }), 'login')
  assert.equal(adminProxyDecision({ pathname: '/admin/login', hasSessionCookie: false }), 'next')
  assert.equal(adminProxyDecision({ pathname: '/admin/login', hasSessionCookie: true }), 'admin')
  assert.equal(adminProxyDecision({ pathname: '/admin', hasSessionCookie: true }), 'next')
})

test('valid login creates a hashed session and rejects bad or unknown credentials', async () => {
  const address = email()
  const user = await createAdmin({ address, role: 'ADMIN', permissions: ['MANAGE_BLOGS'] })

  try {
    const success = await authenticate(prisma, { email: ` ${address.toUpperCase()} `, password })
    assert.equal(success.status, 'OK')
    assert.equal(Object.hasOwn(success, 'passwordHash'), false)
    const stored = await prisma.session.findFirst({ where: { adminUserId: user.id, revokedAt: null } })
    assert.equal(stored.tokenHash, hashSessionToken(success.token))
    assert.notEqual(stored.tokenHash, success.token)

    const current = await findValidSession(prisma, success.token)
    assert.equal(current.admin.email, address)
    assert.equal(Object.hasOwn(current.admin, 'passwordHash'), false)
    assert.equal(hasPermission(current.admin, 'MANAGE_BLOGS'), true)
    assert.equal(hasPermission(current.admin, 'MANAGE_ADMINS'), false)

    const wrong = await authenticate(prisma, { email: address, password: 'Wrong-Password-1' })
    const unknown = await authenticate(prisma, { email: email(), password })
    assert.equal(wrong.status, 'INVALID_CREDENTIALS')
    assert.equal(unknown.status, 'INVALID_CREDENTIALS')
  } finally {
    await removeFixtures([address])
  }
})

test('login replaces older sessions and logout revokes the current one', async () => {
  const address = email()
  const user = await createAdmin({ address })

  try {
    const first = await createSession(prisma, user.id)
    const second = await createSession(prisma, user.id)
    assert.equal(await findValidSession(prisma, first.token), null)
    assert.ok(await findValidSession(prisma, second.token))

    await revokeSession(prisma, second.token)
    assert.equal(await findValidSession(prisma, second.token), null)
  } finally {
    await removeFixtures([address])
  }
})

test('expired sessions are rejected', async () => {
  const address = email()
  const user = await createAdmin({ address })

  try {
    const session = await createSession(prisma, user.id)
    await prisma.session.update({
      where: { id: session.sessionId },
      data: { expiresAt: new Date(Date.now() - 1000) },
    })
    assert.equal(await findValidSession(prisma, session.token), null)
  } finally {
    await removeFixtures([address])
  }
})

test('inactive accounts cannot sign in or keep a session', async () => {
  const address = email()
  const user = await createAdmin({ address, active: false })
  const session = await createSession(prisma, user.id)

  try {
    assert.equal(await findValidSession(prisma, session.token), null)
    const revoked = await prisma.session.findUnique({ where: { id: session.sessionId } })
    assert.ok(revoked.revokedAt)
    const result = await authenticate(prisma, { email: address, password })
    assert.equal(result.status, 'INVALID_CREDENTIALS')
  } finally {
    await removeFixtures([address])
  }
})

test('five recent failures temporarily throttle the identifier', async () => {
  const address = email()

  try {
    await prisma.loginAttempt.createMany({
      data: Array.from({ length: 5 }, () => ({ identifier: address, successful: false })),
    })
    const limited = await authenticate(prisma, { email: address, password: 'Wrong-Password-1' })
    assert.equal(limited.status, 'RATE_LIMITED')
    const attempts = await prisma.loginAttempt.count({ where: { identifier: address } })
    assert.equal(attempts, 5)
  } finally {
    await removeFixtures([address])
  }
})

test('a Super Admin has every permission and an Admin has only assigned permissions', async () => {
  const superAddress = email()
  const adminAddress = email()
  const superAdmin = await createAdmin({ address: superAddress, role: 'SUPER_ADMIN' })
  const admin = await createAdmin({ address: adminAddress, permissions: ['MANAGE_SERVICES'] })

  try {
    const superSession = await findValidSession(prisma, (await createSession(prisma, superAdmin.id)).token)
    const adminSession = await findValidSession(prisma, (await createSession(prisma, admin.id)).token)
    for (const permission of ['MANAGE_ADMINS', 'MANAGE_BLOGS', 'MANAGE_SERVICES', 'MANAGE_CONTACT_ENQUIRIES', 'MANAGE_WEBSITE_SETTINGS']) {
      assert.equal(hasPermission(superSession.admin, permission), true)
    }
    assert.equal(hasPermission(adminSession.admin, 'MANAGE_SERVICES'), true)
    assert.equal(hasPermission(adminSession.admin, 'MANAGE_BLOGS'), false)
    assert.equal(adminSession.admin.active, true)
  } finally {
    await removeFixtures([superAddress, adminAddress])
  }
})

test('account changes recheck the actor and protect the last active Super Admin', async () => {
  const superAddress = email()
  const otherSuperAddress = email()
  const adminAddress = email()
  const limitedAddress = email()
  const superAdmin = await createAdmin({ address: superAddress, role: 'SUPER_ADMIN' })
  const otherSuper = await createAdmin({ address: otherSuperAddress, role: 'SUPER_ADMIN' })
  const manager = await createAdmin({ address: adminAddress, permissions: ['MANAGE_ADMINS'] })
  const limited = await createAdmin({ address: limitedAddress, permissions: ['MANAGE_BLOGS'] })

  try {
    await assert.rejects(
      () => updateAdminAccess(prisma, limited.id, manager.id, { active: false }),
      (error) => error instanceof AuthError && error.code === 'FORBIDDEN',
    )
    await assert.rejects(
      () => updateAdminAccess(prisma, manager.id, superAdmin.id, { active: false }),
      (error) => error.code === 'FORBIDDEN',
    )
    await assert.rejects(
      () => updateAdminAccess(prisma, manager.id, manager.id, { permissions: ['MANAGE_ADMINS', 'MANAGE_BLOGS'] }),
      (error) => error.code === 'FORBIDDEN',
    )
    await assert.rejects(
      () => updateAdminAccess(prisma, superAdmin.id, superAdmin.id, { role: 'ADMIN' }),
      (error) => error.code === 'FORBIDDEN',
    )
    await assert.rejects(
      () => deleteAdminAccount(prisma, manager.id, superAdmin.id),
      (error) => error.code === 'FORBIDDEN',
    )

    await prisma.adminUser.update({ where: { id: otherSuper.id }, data: { active: false } })
    await withOnlyActiveSuperAdmins([superAdmin.id], async () => {
      await assert.rejects(
        () => updateAdminAccess(prisma, superAdmin.id, superAdmin.id, { active: false }),
        (error) => error.code === 'FORBIDDEN',
      )
      await assert.rejects(
        () => deleteAdminAccount(prisma, superAdmin.id, superAdmin.id),
        (error) => error.code === 'FORBIDDEN',
      )
      await assert.rejects(
        () => updateAdminAccess(prisma, superAdmin.id, superAdmin.id, { role: 'ADMIN' }),
        (error) => error.code === 'FORBIDDEN',
      )

      const stillActive = await prisma.adminUser.findUnique({ where: { id: superAdmin.id } })
      assert.equal(stillActive.role, 'SUPER_ADMIN')
      assert.equal(stillActive.active, true)
    })
  } finally {
    await removeFixtures([superAddress, otherSuperAddress, adminAddress, limitedAddress])
  }
})

test('concurrent demotions cannot remove the last active Super Admin', async () => {
  const firstAddress = email()
  const secondAddress = email()
  const first = await createAdmin({ address: firstAddress, role: 'SUPER_ADMIN' })
  const second = await createAdmin({ address: secondAddress, role: 'SUPER_ADMIN' })

  try {
    await withOnlyActiveSuperAdmins([first.id, second.id], async () => {
      const results = await Promise.allSettled([
        updateAdminAccess(prisma, first.id, second.id, { role: 'ADMIN' }),
        updateAdminAccess(prisma, second.id, first.id, { role: 'ADMIN' }),
      ])

      const fulfilled = results.filter((result) => result.status === 'fulfilled')
      const rejected = results.filter(
        (result) => result.status === 'rejected' && result.reason?.code === 'FORBIDDEN',
      )

      assert.equal(fulfilled.length, 1)
      assert.equal(rejected.length, 1)

      const remaining = await prisma.adminUser.count({
        where: { role: 'SUPER_ADMIN', active: true, id: { in: [first.id, second.id] } },
      })
      assert.equal(remaining, 1)
    })
  } finally {
    await removeFixtures([firstAddress, secondAddress])
  }
})

test('a second Super Admin can demote another Super Admin', async () => {
  const firstAddress = email()
  const secondAddress = email()
  const first = await createAdmin({ address: firstAddress, role: 'SUPER_ADMIN' })
  const second = await createAdmin({ address: secondAddress, role: 'SUPER_ADMIN' })

  try {
    const updated = await updateAdminAccess(prisma, second.id, first.id, { role: 'ADMIN' })
    assert.equal(updated.role, 'ADMIN')
    assert.equal(Object.hasOwn(updated, 'passwordHash'), false)
  } finally {
    await removeFixtures([firstAddress, secondAddress])
  }
})

test('bootstrap refuses a weak password, a missing password, and a second Super Admin', async () => {
  const address = email()

  try {
    await assert.rejects(
      () => bootstrapSuperAdmin(prisma, { SUPER_ADMIN_EMAIL: address }),
      (error) => error.code === 'BOOTSTRAP_CONFIG',
    )
    await assert.rejects(
      () => bootstrapSuperAdmin(prisma, { SUPER_ADMIN_EMAIL: address, SUPER_ADMIN_PASSWORD: 'weak' }),
      (error) => error.code === 'WEAK_PASSWORD',
    )

    const preexisting = await prisma.adminUser.findFirst({
      where: { role: 'SUPER_ADMIN', NOT: { email: { startsWith: 'phase3-test-' } } },
      select: { id: true },
    })

    if (!preexisting) {
      const created = await bootstrapSuperAdmin(prisma, {
        SUPER_ADMIN_EMAIL: address,
        SUPER_ADMIN_PASSWORD: password,
      })
      assert.equal(created.role, 'SUPER_ADMIN')
      assert.equal(Object.hasOwn(created, 'passwordHash'), false)
    }

    await assert.rejects(
      () =>
        bootstrapSuperAdmin(prisma, {
          SUPER_ADMIN_EMAIL: email(),
          SUPER_ADMIN_PASSWORD: password,
        }),
      (error) => error.code === 'BOOTSTRAP_EXISTS',
    )
  } finally {
    await removeFixtures([address])
  }
})
