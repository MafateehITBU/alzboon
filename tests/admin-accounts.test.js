import './use-test-database.js'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test, { after, before } from 'node:test'
import { PrismaClient } from '@prisma/client'
import {
  createAdminAccount,
  deleteAdminAccount,
  listAdminAccounts,
  updateAdminAccess,
} from '../src/lib/auth/admin-access.js'
import { AuthError } from '../src/lib/auth/errors.js'
import { hashPassword, verifyPassword } from '../src/lib/auth/password.js'
import { createSession, findValidSession } from '../src/lib/auth/session.js'
import { validateProfilePhoto } from '../src/lib/media/profile-photo.js'
import { writeStoredFile, removeStoredFile } from '../src/lib/storage/objects.js'

const password = 'Phase5-Test-1a'
const prisma = new PrismaClient()
let passwordHash
let previousStorageRoot
let storageRoot

function email() {
  return `phase5-test-${randomUUID()}@example.com`
}

async function removeFixtures(_emails) {
  // Intentionally empty: never delete DB rows from tests.
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

async function createFixture({ role = 'ADMIN', active = true, permissions = [], address = email(), name = 'Phase 5 test' } = {}) {
  return prisma.adminUser.create({
    data: {
      name,
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
    throw new Error('DATABASE_URL is not set.')
  }
  previousStorageRoot = process.env.STORAGE_ROOT
  storageRoot = mkdtempSync(join(tmpdir(), 'alzboon-phase5-'))
  process.env.STORAGE_ROOT = storageRoot
  passwordHash = await hashPassword(password)
})

after(async () => {
  await prisma.$disconnect()
  if (previousStorageRoot === undefined) delete process.env.STORAGE_ROOT
  else process.env.STORAGE_ROOT = previousStorageRoot
  rmSync(storageRoot, { recursive: true, force: true })
})

test('listing admins requires MANAGE_ADMINS', async () => {
  const managerAddress = email()
  const limitedAddress = email()
  const manager = await createFixture({ address: managerAddress, permissions: ['MANAGE_ADMINS'] })
  const limited = await createFixture({ address: limitedAddress, permissions: ['MANAGE_BLOGS'] })

  try {
    await assert.rejects(
      () => listAdminAccounts(prisma, limited.id, { search: '', role: '', status: '', page: 1 }),
      (error) => error instanceof AuthError && error.code === 'FORBIDDEN',
    )
    const listing = await listAdminAccounts(prisma, manager.id, { search: 'phase5-test', role: '', status: '', page: 1 })
    assert.ok(listing.total >= 2)
    assert.ok(listing.admins.every((admin) => !Object.hasOwn(admin, 'passwordHash')))
  } finally {
    await removeFixtures([managerAddress, limitedAddress])
  }
})

test('creates an admin with hashed password and assigned permissions', async () => {
  const actorAddress = email()
  const createdAddress = email()
  const actor = await createFixture({ address: actorAddress, role: 'SUPER_ADMIN' })

  try {
    const created = await createAdminAccount(prisma, actor.id, {
      name: 'Created Admin',
      email: createdAddress,
      phone: '+971500000000',
      password,
      role: 'ADMIN',
      permissions: ['MANAGE_BLOGS', 'MANAGE_SERVICES'],
    })

    assert.equal(created.email, createdAddress)
    assert.equal(created.role, 'ADMIN')
    assert.deepEqual(created.permissions.sort(), ['MANAGE_BLOGS', 'MANAGE_SERVICES'])
    assert.equal(Object.hasOwn(created, 'passwordHash'), false)

    const row = await prisma.adminUser.findUnique({ where: { email: createdAddress } })
    assert.equal(await verifyPassword(row.passwordHash, password), true)
  } finally {
    await removeFixtures([actorAddress, createdAddress])
  }
})

test('rejects duplicate emails and weak passwords', async () => {
  const actorAddress = email()
  const existingAddress = email()
  const actor = await createFixture({ address: actorAddress, role: 'SUPER_ADMIN' })
  await createFixture({ address: existingAddress, permissions: ['MANAGE_BLOGS'] })

  try {
    await assert.rejects(
      () =>
        createAdminAccount(prisma, actor.id, {
          name: 'Dup',
          email: existingAddress,
          password,
          role: 'ADMIN',
          permissions: ['MANAGE_BLOGS'],
        }),
      (error) => error.code === 'DUPLICATE_EMAIL',
    )
    await assert.rejects(
      () =>
        createAdminAccount(prisma, actor.id, {
          name: 'Weak',
          email: email(),
          password: 'short',
          role: 'ADMIN',
          permissions: [],
        }),
      (error) => error.code === 'WEAK_PASSWORD',
    )
  } finally {
    await removeFixtures([actorAddress, existingAddress])
  }
})

test('ordinary admins cannot create or manage Super Admins', async () => {
  const managerAddress = email()
  const superAddress = email()
  const manager = await createFixture({ address: managerAddress, permissions: ['MANAGE_ADMINS'] })
  const superAdmin = await createFixture({ address: superAddress, role: 'SUPER_ADMIN' })

  try {
    await assert.rejects(
      () =>
        createAdminAccount(prisma, manager.id, {
          name: 'Nope',
          email: email(),
          password,
          role: 'SUPER_ADMIN',
          permissions: [],
        }),
      (error) => error.code === 'FORBIDDEN',
    )
    await assert.rejects(
      () => updateAdminAccess(prisma, manager.id, superAdmin.id, { active: false }),
      (error) => error.code === 'FORBIDDEN',
    )
  } finally {
    await removeFixtures([managerAddress, superAddress])
  }
})

test('deactivation and password changes revoke sessions', async () => {
  const actorAddress = email()
  const targetAddress = email()
  const actor = await createFixture({ address: actorAddress, role: 'SUPER_ADMIN' })
  const target = await createFixture({ address: targetAddress, permissions: ['MANAGE_BLOGS'] })
  const session = await createSession(prisma, target.id)

  try {
    assert.ok(await findValidSession(prisma, session.token))
    await updateAdminAccess(prisma, actor.id, target.id, { active: false })
    assert.equal(await findValidSession(prisma, session.token), null)

    await updateAdminAccess(prisma, actor.id, target.id, { active: true })
    const next = await createSession(prisma, target.id)
    await updateAdminAccess(prisma, actor.id, target.id, { password })
    assert.equal(await findValidSession(prisma, next.token), null)
  } finally {
    await removeFixtures([actorAddress, targetAddress])
  }
})

test('permission changes revoke sessions and last Super Admin stays protected', async () => {
  const firstAddress = email()
  const secondAddress = email()
  const targetAddress = email()
  const first = await createFixture({ address: firstAddress, role: 'SUPER_ADMIN' })
  const second = await createFixture({ address: secondAddress, role: 'SUPER_ADMIN' })
  const target = await createFixture({ address: targetAddress, permissions: ['MANAGE_BLOGS'] })
  const session = await createSession(prisma, target.id)

  try {
    await updateAdminAccess(prisma, first.id, target.id, { permissions: ['MANAGE_BLOGS', 'MANAGE_SERVICES'] })
    assert.equal(await findValidSession(prisma, session.token), null)

    await prisma.adminUser.update({ where: { id: second.id }, data: { active: false } })
    await withOnlyActiveSuperAdmins([first.id], async () => {
      await assert.rejects(
        () => updateAdminAccess(prisma, first.id, first.id, { active: false }),
        (error) => error.code === 'FORBIDDEN',
      )
      await assert.rejects(
        () => deleteAdminAccount(prisma, first.id, first.id),
        (error) => error.code === 'FORBIDDEN',
      )
      await assert.rejects(
        () => updateAdminAccess(prisma, first.id, first.id, { role: 'ADMIN' }),
        (error) => error.code === 'FORBIDDEN',
      )
    })
  } finally {
    await removeFixtures([firstAddress, secondAddress, targetAddress])
  }
})

test('deletes an admin and cleans profile media metadata', async () => {
  const actorAddress = email()
  const targetAddress = email()
  const actor = await createFixture({ address: actorAddress, role: 'SUPER_ADMIN' })
  const target = await createFixture({ address: targetAddress, permissions: ['MANAGE_BLOGS'] })
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])
  const validated = validateProfilePhoto({ filename: 'avatar.png', bytes: png })
  assert.equal(validated.ok, true)
  const storageKey = await writeStoredFile('PRIVATE', png)

  try {
    await updateAdminAccess(prisma, actor.id, target.id, {
      profileMedia: {
        storageKey,
        mimeType: validated.mimeType,
        byteSize: validated.byteSize,
        originalFilename: validated.originalFilename,
      },
    })
    const withPhoto = await prisma.adminUser.findUnique({ where: { id: target.id } })
    assert.ok(withPhoto.profileMediaId)

    const deleted = await deleteAdminAccount(prisma, actor.id, target.id)
    assert.equal(deleted.id, target.id)
    assert.equal(deleted.removedStorageKey, storageKey)
    assert.equal(await prisma.adminUser.findUnique({ where: { id: target.id } }), null)
    assert.equal(await prisma.mediaAsset.findUnique({ where: { id: withPhoto.profileMediaId } }), null)
    await removeStoredFile('PRIVATE', storageKey)
  } finally {
    await removeFixtures([actorAddress, targetAddress])
  }
})

test('profile photo validation accepts jpeg png webp and rejects other bytes', () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0, 1, 2, 3])
  const bad = Buffer.from('not-an-image')
  assert.equal(validateProfilePhoto({ filename: 'a.jpg', bytes: jpeg }).ok, true)
  assert.equal(validateProfilePhoto({ filename: 'a.gif', bytes: jpeg }).ok, false)
  assert.equal(validateProfilePhoto({ filename: 'a.jpg', bytes: bad }).ok, false)
})
