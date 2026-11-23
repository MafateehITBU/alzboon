import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test, { after, before } from 'node:test'
import { PrismaClient } from '@prisma/client'
import { createSession } from '../src/lib/auth/session.js'
import { hashPassword, verifyPassword } from '../src/lib/auth/password.js'
import {
  changeOwnPassword,
  getOwnAccount,
  updateOwnProfile,
} from '../src/lib/auth/self-account.js'
import { AuthError } from '../src/lib/auth/errors.js'
import { validateProfilePhoto } from '../src/lib/media/profile-photo.js'
import { removeStoredFile, writeStoredFile } from '../src/lib/storage/objects.js'

const password = 'Phase10-Test-1a'
const prisma = new PrismaClient()
let passwordHash
let previousStorageRoot
let storageRoot

function email() {
  return `phase10-test-${randomUUID()}@example.com`
}

async function createAdmin({ role = 'ADMIN', permissions = ['MANAGE_BLOGS'], address = email(), name = 'Phase 10 admin' } = {}) {
  return prisma.adminUser.create({
    data: {
      name,
      email: address,
      phone: '+971500000010',
      passwordHash,
      role,
      active: true,
      permissions:
        role === 'ADMIN' ? { create: permissions.map((permission) => ({ permission })) } : undefined,
    },
    include: { permissions: { select: { permission: true } } },
  })
}

async function makePhoto() {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])
  const validated = validateProfilePhoto({ filename: 'me.png', bytes: png })
  assert.equal(validated.ok, true)
  const storageKey = await writeStoredFile('PRIVATE', png)
  return {
    storageKey,
    mimeType: validated.mimeType,
    byteSize: validated.byteSize,
    originalFilename: validated.originalFilename,
  }
}

async function cleanup() {
  await prisma.session.deleteMany({
    where: { adminUser: { email: { startsWith: 'phase10-test-' } } },
  })
  const admins = await prisma.adminUser.findMany({
    where: { email: { startsWith: 'phase10-test-' } },
    select: { id: true, profileMediaId: true },
  })
  await prisma.adminUser.deleteMany({ where: { email: { startsWith: 'phase10-test-' } } })
  const mediaIds = admins.map((admin) => admin.profileMediaId).filter(Boolean)
  if (mediaIds.length) {
    await prisma.mediaAsset.deleteMany({ where: { id: { in: mediaIds } } })
  }
}

before(async () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set.')
  previousStorageRoot = process.env.STORAGE_ROOT
  storageRoot = mkdtempSync(join(tmpdir(), 'alzboon-phase10-'))
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

test('loads own account and rejects unauthenticated ids', async () => {
  const admin = await createAdmin({ role: 'SUPER_ADMIN' })

  try {
    const account = await getOwnAccount(prisma, admin.id)
    assert.equal(account.email, admin.email)
    assert.equal(account.role, 'SUPER_ADMIN')
    assert.deepEqual(account.permissions, [])

    await assert.rejects(() => getOwnAccount(prisma, randomUUID()), (error) => error.code === 'UNAUTHENTICATED')
  } finally {
    await prisma.adminUser.delete({ where: { id: admin.id } })
  }
})

test('updates profile with email normalization and duplicate rejection', async () => {
  const admin = await createAdmin({ address: email() })
  const other = await createAdmin({ address: email(), name: 'Other admin' })

  try {
    const updated = await updateOwnProfile(prisma, admin.id, {
      name: '  Updated Name  ',
      email: `  ${admin.email.toUpperCase()}  `,
      phone: '+971511111111',
    })

    assert.equal(updated.account.name, 'Updated Name')
    assert.equal(updated.account.email, admin.email)
    assert.equal(updated.account.phone, '+971511111111')

    await assert.rejects(
      () =>
        updateOwnProfile(prisma, admin.id, {
          name: 'Updated Name',
          email: other.email,
          phone: '',
        }),
      (error) => error instanceof AuthError && error.code === 'DUPLICATE_EMAIL',
    )
  } finally {
    await prisma.adminUser.deleteMany({ where: { id: { in: [admin.id, other.id] } } })
  }
})

test('uploads and removes profile photo safely', async () => {
  const admin = await createAdmin()
  const photo = await makePhoto()

  try {
    const withPhoto = await updateOwnProfile(prisma, admin.id, {
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      profileMedia: photo,
    })
    assert.ok(withPhoto.account.profileMediaId)
    assert.ok(withPhoto.account.profileUrl.startsWith('/admin/media/'))

    const replacement = await makePhoto()
    const replaced = await updateOwnProfile(prisma, admin.id, {
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      profileMedia: replacement,
    })
    assert.ok(replaced.removedStorageKey)
    assert.notEqual(replaced.account.profileMediaId, withPhoto.account.profileMediaId)
    await removeStoredFile('PRIVATE', replaced.removedStorageKey)

    const removed = await updateOwnProfile(prisma, admin.id, {
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      removeProfile: true,
    })
    assert.equal(removed.account.profileMediaId, null)
    assert.ok(removed.removedStorageKey)
    await removeStoredFile('PRIVATE', removed.removedStorageKey)
  } finally {
    await cleanup()
  }
})

test('password change verifies current password and revokes sessions', async () => {
  const admin = await createAdmin()
  const session = await createSession(prisma, admin.id)

  try {
    await assert.rejects(
      () =>
        changeOwnPassword(prisma, admin.id, {
          currentPassword: 'Wrong-Password-1a',
          password: 'Phase10-NewPass-1a',
          confirmPassword: 'Phase10-NewPass-1a',
        }),
      (error) => error.code === 'WRONG_PASSWORD',
    )

    await assert.rejects(
      () =>
        changeOwnPassword(prisma, admin.id, {
          currentPassword: password,
          password: 'short',
          confirmPassword: 'short',
        }),
      (error) => error.code === 'WEAK_PASSWORD',
    )

    await assert.rejects(
      () =>
        changeOwnPassword(prisma, admin.id, {
          currentPassword: password,
          password: 'Phase10-NewPass-1a',
          confirmPassword: 'Phase10-NewPass-2a',
        }),
      (error) => error.code === 'PASSWORD_MISMATCH',
    )

    await changeOwnPassword(prisma, admin.id, {
      currentPassword: password,
      password: 'Phase10-NewPass-1a',
      confirmPassword: 'Phase10-NewPass-1a',
    })

    const refreshed = await prisma.adminUser.findUnique({ where: { id: admin.id } })
    assert.equal(await verifyPassword(refreshed.passwordHash, 'Phase10-NewPass-1a'), true)

    const revoked = await prisma.session.findUnique({ where: { id: session.sessionId } })
    assert.ok(revoked.revokedAt)

    const openSessions = await prisma.session.count({
      where: { adminUserId: admin.id, revokedAt: null },
    })
    assert.equal(openSessions, 0)
  } finally {
    await cleanup()
  }
})

test('self-service cannot change role or permissions through profile update', async () => {
  const admin = await createAdmin({ permissions: ['MANAGE_BLOGS'] })

  try {
    const updated = await updateOwnProfile(prisma, admin.id, {
      name: 'Still Admin',
      email: admin.email,
      phone: admin.phone,
      role: 'SUPER_ADMIN',
      permissions: ['MANAGE_ADMINS'],
      active: false,
    })

    assert.equal(updated.account.role, 'ADMIN')
    assert.equal(updated.account.active, true)
    assert.deepEqual(updated.account.permissions, ['MANAGE_BLOGS'])
  } finally {
    await prisma.adminUser.delete({ where: { id: admin.id } })
  }
})
