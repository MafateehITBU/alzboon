import path from 'node:path'
import { randomUUID } from 'node:crypto'

const STORAGE_KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const VISIBILITY_DIRECTORY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
}

export function requireStorageRoot() {
  const configured = process.env.STORAGE_ROOT

  if (!configured || !configured.trim()) {
    throw new Error(
      'STORAGE_ROOT is not set. Production media belongs at /var/www/alzboon/shared/uploads. There is no in-memory fallback.',
    )
  }

  return path.resolve(configured)
}

export function storageDirectory(visibility) {
  const child = VISIBILITY_DIRECTORY[visibility]

  if (!child) {
    throw new Error('Media visibility must be PUBLIC or PRIVATE.')
  }

  return path.resolve(requireStorageRoot(), child)
}

export function createStorageKey() {
  return randomUUID()
}

export function isStorageKey(storageKey) {
  return typeof storageKey === 'string' && STORAGE_KEY.test(storageKey)
}

export function resolveStoredFile(visibility, storageKey) {
  if (!isStorageKey(storageKey)) {
    throw new Error('Storage key must be a generated identifier. Client paths are not accepted.')
  }

  const directory = storageDirectory(visibility)
  const filePath = path.resolve(directory, storageKey)
  const relative = path.relative(directory, filePath)

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Resolved media path is outside the configured storage directory.')
  }

  return filePath
}
