import { access } from 'node:fs/promises'
import { readStoredFile, writeStoredFile } from '../storage/objects.js'
import { resolveStoredFile } from '../storage/paths.js'

/** Minimal 1×1 transparent PNG used when CSV media cannot be restored. */
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

/**
 * Resolve a media reference from CSV.
 * Order: existing media id → on-disk storage key → embedded base64 payload.
 * When nothing works, returns null (never throws) so callers can import text without images.
 */
export async function resolveMediaRef(tx, ref, { visibility = 'PUBLIC' } = {}) {
  const mediaId = clean(ref?.mediaId)
  const storageKey = clean(ref?.storageKey)
  const base64 = clean(ref?.base64)

  if (mediaId) {
    const existing = await tx.mediaAsset.findUnique({ where: { id: mediaId } })
    if (existing) {
      try {
        await access(resolveStoredFile(existing.visibility || visibility, existing.storageKey))
        return existing
      } catch {
        // Media row exists but file is gone — fall through.
      }
    }
  }

  if (storageKey) {
    try {
      await access(resolveStoredFile(visibility, storageKey))
      const byKey = await tx.mediaAsset.findFirst({
        where: { storageKey, visibility },
        orderBy: { createdAt: 'asc' },
      })
      if (byKey) return byKey
      return tx.mediaAsset.create({
        data: {
          storageKey,
          visibility,
          originalFilename: String(ref?.originalFilename || 'image').slice(0, 120),
          mimeType: String(ref?.mimeType || 'image/png').slice(0, 120),
          byteSize: Number.parseInt(String(ref?.byteSize || '1'), 10) || 1,
        },
      })
    } catch {
      // File gone — try base64 next.
    }
  }

  if (base64) {
    try {
      const bytes = Buffer.from(base64, 'base64')
      if (bytes.length) {
        const nextKey = await writeStoredFile(visibility, bytes)
        return tx.mediaAsset.create({
          data: {
            storageKey: nextKey,
            visibility,
            originalFilename: String(ref?.originalFilename || 'image').slice(0, 120),
            mimeType: String(ref?.mimeType || 'image/png').slice(0, 120),
            byteSize: bytes.length,
          },
        })
      }
    } catch {
      // Invalid payload — treat as missing.
    }
  }

  return null
}

/** Create a tiny placeholder image so required media FKs can be satisfied on import. */
export async function createPlaceholderMedia(tx, { visibility = 'PUBLIC', label = 'pending-upload.png' } = {}) {
  const storageKey = await writeStoredFile(visibility, PLACEHOLDER_PNG)
  return tx.mediaAsset.create({
    data: {
      storageKey,
      visibility,
      originalFilename: String(label).slice(0, 120),
      mimeType: 'image/png',
      byteSize: PLACEHOLDER_PNG.length,
    },
  })
}

/**
 * Resolve media for import. Falls back to existing media on update, or a placeholder on create.
 * Returns { media, skipped } where skipped is true when CSV media was missing/unusable.
 */
export async function resolveMediaForImport(tx, ref, { visibility = 'PUBLIC', existingId = null, label = 'pending-upload.png' } = {}) {
  const resolved = await resolveMediaRef(tx, ref, { visibility })
  if (resolved) return { media: resolved, skipped: false }

  if (existingId) {
    const existing = await tx.mediaAsset.findUnique({ where: { id: existingId } })
    if (existing) return { media: existing, skipped: true }
  }

  const placeholder = await createPlaceholderMedia(tx, { visibility, label })
  return { media: placeholder, skipped: true }
}

export async function mediaExportFields(prefix, media, visibility = 'PUBLIC') {
  if (!media) {
    return {
      [`${prefix}MediaId`]: '',
      [`${prefix}StorageKey`]: '',
      [`${prefix}MimeType`]: '',
      [`${prefix}ByteSize`]: '',
      [`${prefix}OriginalFilename`]: '',
      [`${prefix}Base64`]: '',
    }
  }

  let base64 = ''
  try {
    const bytes = await readStoredFile(media.visibility || visibility, media.storageKey)
    base64 = bytes.toString('base64')
  } catch {
    base64 = ''
  }

  return {
    [`${prefix}MediaId`]: media.id || '',
    [`${prefix}StorageKey`]: media.storageKey || '',
    [`${prefix}MimeType`]: media.mimeType || '',
    [`${prefix}ByteSize`]: media.byteSize == null ? '' : String(media.byteSize),
    [`${prefix}OriginalFilename`]: media.originalFilename || '',
    [`${prefix}Base64`]: base64,
  }
}

export function mediaImportRef(row, prefix) {
  return {
    mediaId: row[`${prefix}MediaId`],
    storageKey: row[`${prefix}StorageKey`],
    mimeType: row[`${prefix}MimeType`],
    byteSize: row[`${prefix}ByteSize`],
    originalFilename: row[`${prefix}OriginalFilename`],
    base64: row[`${prefix}Base64`],
  }
}

function clean(value) {
  const text = String(value ?? '').trim()
  return text || ''
}
