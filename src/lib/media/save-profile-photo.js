import 'server-only'
import { AuthError } from '../auth/errors.js'
import { removeStoredFile, writeStoredFile } from '../storage/objects.js'
import { validateProfilePhoto } from './profile-photo.js'

export async function saveProfilePhoto(file) {
  if (!file || typeof file !== 'object' || typeof file.arrayBuffer !== 'function') return null
  if (!file.size) return null

  const bytes = Buffer.from(await file.arrayBuffer())
  const validated = validateProfilePhoto({ filename: file.name, bytes })
  if (!validated.ok) throw new AuthError('INVALID_PHOTO')

  const storageKey = await writeStoredFile('PRIVATE', bytes)

  return {
    storageKey,
    mimeType: validated.mimeType,
    byteSize: validated.byteSize,
    originalFilename: validated.originalFilename,
  }
}

export async function discardStoredPhoto(storageKey) {
  if (!storageKey) return
  await removeStoredFile('PRIVATE', storageKey)
}
