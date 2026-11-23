import { PROFILE_PHOTO_MAX_BYTES, PROFILE_PHOTO_MIME_TYPES } from '../media/profile-photo.js'
import { isStorageKey } from '../storage/paths.js'
import { AuthError } from './errors.js'
import { normalizeEmail } from './email.js'
import { hashPassword, isStrongPassword, verifyPassword } from './password.js'
import { publicAdmin } from './session.js'

const adminRecord = {
  include: { permissions: { select: { permission: true } } },
}

export async function getOwnAccount(db, actorId) {
  const actor = await db.adminUser.findUnique({ where: { id: actorId }, ...adminRecord })
  if (!actor?.active) throw new AuthError('UNAUTHENTICATED')
  return serializeOwnAccount(actor)
}

export async function updateOwnProfile(db, actorId, input) {
  const name = cleanName(input?.name)
  const email = normalizeEmail(input?.email)
  const phone = cleanPhone(input?.phone)

  if (!name) throw new AuthError('INVALID_NAME')
  if (!email) throw new AuthError('INVALID_EMAIL')
  if (phone === undefined) throw new AuthError('INVALID_PHONE')
  assertProfileMedia(input?.profileMedia)

  return runInTransaction(db, async (tx) => {
    const actor = await tx.adminUser.findUnique({ where: { id: actorId }, ...adminRecord })
    if (!actor?.active) throw new AuthError('UNAUTHENTICATED')

    if (email !== actor.email) {
      const existing = await tx.adminUser.findUnique({ where: { email }, select: { id: true } })
      if (existing) throw new AuthError('DUPLICATE_EMAIL')
    }

    try {
      await tx.adminUser.update({
        where: { id: actor.id },
        data: { name, email, phone },
      })
    } catch (error) {
      if (error?.code === 'P2002') throw new AuthError('DUPLICATE_EMAIL')
      throw error
    }

    const removedStorageKey = await replaceOwnProfileMedia(
      tx,
      actor,
      input?.profileMedia,
      input?.removeProfile === true,
    )

    const updated = await tx.adminUser.findUniqueOrThrow({ where: { id: actor.id }, ...adminRecord })
    return { account: serializeOwnAccount(updated), removedStorageKey }
  })
}

export async function changeOwnPassword(db, actorId, input) {
  const currentPassword = typeof input?.currentPassword === 'string' ? input.currentPassword : ''
  const nextPassword = typeof input?.password === 'string' ? input.password : ''
  const confirmPassword = typeof input?.confirmPassword === 'string' ? input.confirmPassword : ''

  if (!currentPassword) throw new AuthError('WRONG_PASSWORD')
  if (!isStrongPassword(nextPassword)) throw new AuthError('WEAK_PASSWORD')
  if (nextPassword !== confirmPassword) throw new AuthError('PASSWORD_MISMATCH')

  return runInTransaction(db, async (tx) => {
    const actor = await tx.adminUser.findUnique({
      where: { id: actorId },
      select: { id: true, active: true, passwordHash: true },
    })

    if (!actor?.active) throw new AuthError('UNAUTHENTICATED')

    const matches = await verifyPassword(actor.passwordHash, currentPassword)
    if (!matches) throw new AuthError('WRONG_PASSWORD')

    const passwordHash = await hashPassword(nextPassword)

    await tx.adminUser.update({
      where: { id: actor.id },
      data: { passwordHash },
    })

    await tx.session.updateMany({
      where: { adminUserId: actor.id, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    return { id: actor.id }
  })
}

function serializeOwnAccount(admin) {
  return {
    ...publicAdmin(admin),
    profileUrl: admin.profileMediaId ? `/admin/media/${admin.profileMediaId}` : null,
    createdAt: admin.createdAt instanceof Date ? admin.createdAt.toISOString() : admin.createdAt,
  }
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

async function replaceOwnProfileMedia(tx, target, media, removeOnly) {
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

function runInTransaction(db, fn) {
  if (typeof db.$transaction === 'function') return db.$transaction(fn)
  return fn(db)
}
