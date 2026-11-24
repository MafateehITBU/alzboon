import './use-test-database.js'
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


before(async () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set.')
  previousStorageRoot = process.env.STORAGE_ROOT
  storageRoot = mkdtempSync(join(tmpdir(), 'alzboon-phase10-'))
  process.env.STORAGE_ROOT = storageRoot
  passwordHash = await hashPassword(password)
})

after(async () => {
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
    assert.ok(revoked.revokedAt)

    const openSessions = await prisma.session.count({
      where: { adminUserId: admin.id, revokedAt: null },
    })
    assert.equal(openSessions, 0)
  } finally {
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
  }
})
