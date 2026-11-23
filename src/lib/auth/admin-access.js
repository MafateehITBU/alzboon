import { PERMISSIONS } from './constants.js'
import { AuthError } from './errors.js'
import { normalizeEmail } from './email.js'
import { PROFILE_PHOTO_MAX_BYTES, PROFILE_PHOTO_MIME_TYPES } from '../media/profile-photo.js'
import { isStorageKey } from '../storage/paths.js'
import { canManageAdmins } from './permissions.js'
import { hashPassword, isStrongPassword } from './password.js'
import { publicAdmin } from './session.js'

const adminRecord = {
  include: { permissions: { select: { permission: true } } },
}

export const ADMIN_PAGE_SIZE = 10

export function parseAdminListQuery(params = {}) {
  const search = firstValue(params.q).trim().slice(0, 100)
  const roleValue = firstValue(params.role)
  const statusValue = firstValue(params.status)
  const parsedPage = Number.parseInt(firstValue(params.page), 10)
  const role = roleValue === 'ADMIN' || roleValue === 'SUPER_ADMIN' ? roleValue : ''
  const status = statusValue === 'active' || statusValue === 'inactive' ? statusValue : ''
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 10000) : 1

  return { search, role, status, page }
}

export async function listAdminAccounts(db, actorId, query) {
  const actor = await db.adminUser.findUnique({ where: { id: actorId }, ...adminRecord })

  if (!actor?.active) throw new AuthError('UNAUTHENTICATED')
  if (!canManageAdmins(publicAdmin(actor))) throw new AuthError('FORBIDDEN')

  const where = {}

  if (query.role) where.role = query.role
  if (query.status === 'active') where.active = true
  if (query.status === 'inactive') where.active = false
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const page = query.page || 1
  const [total, rows, activeSuperAdminCount] = await Promise.all([
    db.adminUser.count({ where }),
    db.adminUser.findMany({
      where,
      ...adminRecord,
      orderBy: [{ createdAt: 'desc' }, { email: 'asc' }],
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    db.adminUser.count({ where: { role: 'SUPER_ADMIN', active: true } }),
  ])

  const actorView = publicAdmin(actor)

  return {
    total,
    page,
    pageSize: ADMIN_PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
    activeSuperAdminCount,
    admins: rows.map((row) => ({
      ...toAdminRecord(row),
      ...managementFlags(actorView, row, activeSuperAdminCount),
    })),
  }
}

export async function createAdminAccount(db, actorId, input) {
  const name = cleanName(input?.name)
  const email = normalizeEmail(input?.email)
  const phone = cleanPhone(input?.phone)
  const role = input?.role
  const permissions = normalizePermissions(input?.permissions)

  if (!name) throw new AuthError('INVALID_NAME')
  if (!email) throw new AuthError('INVALID_EMAIL')
  if (phone === undefined) throw new AuthError('INVALID_PHONE')
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') throw new AuthError('INVALID_ROLE')
  if (!isStrongPassword(input?.password)) throw new AuthError('WEAK_PASSWORD')
  assertProfileMedia(input?.profileMedia)

  const passwordHash = await hashPassword(input.password)

  return runInTransaction(db, async (tx) => {
    const actor = await tx.adminUser.findUnique({ where: { id: actorId }, ...adminRecord })

    if (!actor?.active) throw new AuthError('UNAUTHENTICATED')
    if (!canManageAdmins(publicAdmin(actor))) throw new AuthError('FORBIDDEN')
    if (actor.role !== 'SUPER_ADMIN' && role === 'SUPER_ADMIN') throw new AuthError('FORBIDDEN')

    const existing = await tx.adminUser.findUnique({ where: { email }, select: { id: true } })
    if (existing) throw new AuthError('DUPLICATE_EMAIL')

    let created

    try {
      created = await tx.adminUser.create({
        data: {
          name,
          email,
          phone,
          passwordHash,
          role,
          active: true,
          permissions:
            role === 'ADMIN' && permissions.length > 0
              ? { create: permissions.map((permission) => ({ permission })) }
              : undefined,
        },
        ...adminRecord,
      })
    } catch (error) {
      if (error?.code === 'P2002') throw new AuthError('DUPLICATE_EMAIL')
      throw error
    }

    const removedStorageKey = await replaceProfileMedia(tx, created, input.profileMedia, false)
    const updated = await tx.adminUser.findUniqueOrThrow({ where: { id: created.id }, ...adminRecord })

    return { ...toAdminRecord(updated), removedStorageKey }
  })
}

export async function updateAdminAccess(db, actorId, targetId, changes) {
  const name = changes.name === undefined ? undefined : cleanName(changes.name)
  const email = changes.email === undefined ? undefined : normalizeEmail(changes.email)
  const phone = changes.phone === undefined ? undefined : cleanPhone(changes.phone)
  let passwordHash

  if (changes.name !== undefined && !name) throw new AuthError('INVALID_NAME')
  if (changes.email !== undefined && !email) throw new AuthError('INVALID_EMAIL')
  if (phone === undefined && changes.phone !== undefined) throw new AuthError('INVALID_PHONE')
  if (changes.role !== undefined && changes.role !== 'ADMIN' && changes.role !== 'SUPER_ADMIN') {
    throw new AuthError('INVALID_ROLE')
  }
  if (typeof changes.password === 'string' && changes.password.length > 0) {
    if (!isStrongPassword(changes.password)) throw new AuthError('WEAK_PASSWORD')
    passwordHash = await hashPassword(changes.password)
  }
  assertProfileMedia(changes.profileMedia)

  return runInTransaction(db, async (tx) => {
    const actor = await tx.adminUser.findUnique({ where: { id: actorId }, ...adminRecord })
    const target = await tx.adminUser.findUnique({ where: { id: targetId }, ...adminRecord })

    if (!actor?.active) throw new AuthError('UNAUTHENTICATED')
    if (!target) throw new AuthError('FORBIDDEN')

    const actorView = publicAdmin(actor)
    const isSelf = actor.id === target.id

    if (!canManageAdmins(actorView)) throw new AuthError('FORBIDDEN')
    if (isSelf && (changes.role !== undefined || changes.permissions !== undefined)) {
      throw new AuthError('FORBIDDEN')
    }

    const nextRole = changes.role ?? target.role
    const nextActive = changes.active ?? target.active
    const nextPermissions =
      changes.permissions === undefined ? null : [...new Set(changes.permissions)]
    const currentPermissions = target.permissions.map((row) => row.permission)
    const roleChanging = changes.role !== undefined && changes.role !== target.role
    const permissionsChanging =
      nextPermissions !== null && nextRole === 'ADMIN' && !sameMembers(currentPermissions, nextPermissions)

    if (actor.role !== 'SUPER_ADMIN' && (target.role === 'SUPER_ADMIN' || nextRole === 'SUPER_ADMIN')) {
      throw new AuthError('FORBIDDEN')
    }
    if (nextPermissions && !nextPermissions.every((permission) => PERMISSIONS.includes(permission))) {
      throw new AuthError('FORBIDDEN')
    }
    if (email && email !== target.email) {
      const taken = await tx.adminUser.findUnique({ where: { email }, select: { id: true } })
      if (taken) throw new AuthError('DUPLICATE_EMAIL')
    }

    await assertKeepsActiveSuperAdmin(tx, target, nextRole, nextActive)

    await tx.adminUser.update({
      where: { id: target.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(passwordHash ? { passwordHash } : {}),
        ...(changes.role !== undefined ? { role: changes.role } : {}),
        ...(changes.active !== undefined ? { active: changes.active } : {}),
      },
    })

    let permissionsChanged = false

    if (nextRole === 'SUPER_ADMIN') {
      const hadPermissions = currentPermissions.length > 0
      await tx.adminPermission.deleteMany({ where: { adminUserId: target.id } })
      permissionsChanged = hadPermissions || roleChanging
    } else if (nextPermissions !== null && actor.id !== target.id) {
      permissionsChanged = permissionsChanging || roleChanging
      await tx.adminPermission.deleteMany({ where: { adminUserId: target.id } })
      if (nextPermissions.length > 0) {
        await tx.adminPermission.createMany({
          data: nextPermissions.map((permission) => ({ adminUserId: target.id, permission })),
        })
      }
    }

    const passwordChanged = Boolean(passwordHash)

    if (nextActive === false || roleChanging || permissionsChanged || passwordChanged) {
      await tx.session.updateMany({
        where: { adminUserId: target.id, revokedAt: null },
        data: { revokedAt: new Date() },
      })
    }

    const removedStorageKey = await replaceProfileMedia(tx, target, changes.profileMedia, changes.removeProfile === true)
    const updated = await tx.adminUser.findUniqueOrThrow({ where: { id: target.id }, ...adminRecord })

    return { ...toAdminRecord(updated), removedStorageKey }
  })
}

export async function deleteAdminAccount(db, actorId, targetId) {
  return runInTransaction(db, async (tx) => {
    const actor = await tx.adminUser.findUnique({ where: { id: actorId }, ...adminRecord })
    const target = await tx.adminUser.findUnique({ where: { id: targetId }, ...adminRecord })

    if (!actor?.active) throw new AuthError('UNAUTHENTICATED')
    if (!target) throw new AuthError('FORBIDDEN')
    if (!canManageAdmins(publicAdmin(actor))) throw new AuthError('FORBIDDEN')
    if (actor.id === target.id) throw new AuthError('FORBIDDEN')
    if (actor.role !== 'SUPER_ADMIN' && target.role === 'SUPER_ADMIN') throw new AuthError('FORBIDDEN')

    await assertKeepsActiveSuperAdmin(tx, target, 'ADMIN', false)

    const mediaId = target.profileMediaId
    await tx.adminUser.delete({ where: { id: target.id } })

    let removedStorageKey = null

    if (mediaId) {
      const media = await tx.mediaAsset.findUnique({ where: { id: mediaId }, select: { storageKey: true } })
      await tx.mediaAsset.delete({ where: { id: mediaId } })
      removedStorageKey = media?.storageKey ?? null
    }

    return { id: target.id, removedStorageKey }
  })
}

function toAdminRecord(admin) {
  return {
    ...publicAdmin(admin),
    createdAt: admin.createdAt instanceof Date ? admin.createdAt.toISOString() : admin.createdAt,
  }
}

function managementFlags(actor, target, activeSuperAdminCount) {
  const isSelf = actor.id === target.id
  const targetIsSuper = target.role === 'SUPER_ADMIN'
  const actorIsSuper = actor.role === 'SUPER_ADMIN'
  const isLastActiveSuperAdmin = targetIsSuper && target.active && activeSuperAdminCount <= 1

  return {
    isSelf,
    isLastActiveSuperAdmin,
    canEdit: actorIsSuper || !targetIsSuper,
    canDelete: !isSelf && (actorIsSuper || !targetIsSuper) && !isLastActiveSuperAdmin,
    canChangeRole: actorIsSuper && !isSelf,
    canChangePermissions: !isSelf && (actorIsSuper || !targetIsSuper),
    canChangeActive: (actorIsSuper || !targetIsSuper) && !isLastActiveSuperAdmin,
  }
}

function normalizePermissions(permissions) {
  if (permissions === undefined || permissions === null) return []
  if (!Array.isArray(permissions) || permissions.some((permission) => !PERMISSIONS.includes(permission))) {
    throw new AuthError('FORBIDDEN')
  }
  return [...new Set(permissions)]
}

function assertProfileMedia(media) {
  if (!media) return
  if (
    !isStorageKey(media.storageKey) ||
    !PROFILE_PHOTO_MIME_TYPES.includes(media.mimeType) ||
    !Number.isInteger(media.byteSize) ||
    media.byteSize < 1 ||
    media.byteSize > PROFILE_PHOTO_MAX_BYTES
  ) {
    throw new AuthError('INVALID_PHOTO')
  }
}

async function replaceProfileMedia(tx, target, media, removeOnly) {
  const previousId = target.profileMediaId
  if (!media && !(removeOnly && previousId)) return null

  if (media) {
    const created = await tx.mediaAsset.create({
      data: {
        storageKey: media.storageKey,
        visibility: 'PRIVATE',
        originalFilename: String(media.originalFilename || 'photo').slice(0, 120),
        mimeType: media.mimeType,
        byteSize: media.byteSize,
      },
    })
    await tx.adminUser.update({ where: { id: target.id }, data: { profileMediaId: created.id } })
  } else {
    await tx.adminUser.update({ where: { id: target.id }, data: { profileMediaId: null } })
  }

  if (!previousId) return null

  const previous = await tx.mediaAsset.findUnique({ where: { id: previousId }, select: { storageKey: true } })
  await tx.mediaAsset.delete({ where: { id: previousId } })
  return previous?.storageKey ?? null
}

async function assertKeepsActiveSuperAdmin(tx, target, nextRole, nextActive) {
  const removesLastActiveSuperAdmin =
    target.role === 'SUPER_ADMIN' && target.active && (nextRole !== 'SUPER_ADMIN' || nextActive !== true)

  if (!removesLastActiveSuperAdmin) return

  // Lock every active Super Admin row before counting so concurrent demotions,
  // deactivations, or deletions cannot leave zero active Super Admins.
  await tx.$queryRaw`
    SELECT id
    FROM admin_users
    WHERE role = CAST('SUPER_ADMIN' AS "AdminRole") AND active = true
    FOR UPDATE
  `

  const others = await tx.adminUser.count({
    where: {
      role: 'SUPER_ADMIN',
      active: true,
      NOT: { id: target.id },
    },
  })

  if (others === 0) throw new AuthError('FORBIDDEN')
}

function sameMembers(left, right) {
  const a = [...left].sort()
  const b = [...right].sort()
  return a.length === b.length && a.every((value, index) => value === b[index])
}

function cleanName(value) {
  if (typeof value !== 'string') return null
  const name = value.trim().replace(/\s+/g, ' ')
  if (name.length < 1 || name.length > 120) return null
  return name
}

function cleanPhone(value) {
  if (value === undefined || value === null) return null
  const phone = String(value).trim()
  if (!phone) return null
  if (phone.length > 40) return undefined
  return phone
}

function firstValue(value) {
  const picked = Array.isArray(value) ? value[0] : value
  return typeof picked === 'string' ? picked : ''
}

function runInTransaction(db, fn) {
  if (typeof db.$transaction === 'function') {
    return db.$transaction(fn, { maxWait: 10000, timeout: 15000 })
  }
  return fn(db)
}
