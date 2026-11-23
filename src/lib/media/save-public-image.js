import 'server-only'
import { AuthError } from '../auth/errors.js'
import { removeStoredFile, writeStoredFile } from '../storage/objects.js'
import { validatePublicImage } from './public-image.js'

export async function savePublicImage(file) {
  if (!file || typeof file !== 'object' || typeof file.arrayBuffer !== 'function') return null
  if (!file.size) return null

  const bytes = Buffer.from(await file.arrayBuffer())
  const validated = validatePublicImage({ filename: file.name, bytes })
  if (!validated.ok) throw new AuthError('INVALID_IMAGE')

  const storageKey = await writeStoredFile('PUBLIC', bytes)

  return {
    storageKey,
    mimeType: validated.mimeType,
    byteSize: validated.byteSize,
    originalFilename: validated.originalFilename,
  }
}

export async function discardPublicImage(storageKey) {
  if (!storageKey) return
  await removeStoredFile('PUBLIC', storageKey)
}
