import 'server-only'
import { BlogError } from '../blog/errors.js'
import { removeStoredFile, writeStoredFile } from '../storage/objects.js'
import { validateAttachment } from './attachment.js'

export async function saveAttachment(file) {
  if (!file || typeof file !== 'object' || typeof file.arrayBuffer !== 'function') return null
  if (!file.size) return null

  const bytes = Buffer.from(await file.arrayBuffer())
  const validated = validateAttachment({ filename: file.name, bytes })
  if (!validated.ok) throw new BlogError('INVALID_ATTACHMENT')

  const storageKey = await writeStoredFile('PRIVATE', bytes)

  return {
    storageKey,
    mimeType: validated.mimeType,
    byteSize: validated.byteSize,
    originalFilename: validated.originalFilename,
  }
}

export async function discardAttachment(storageKey) {
  if (!storageKey) return
  await removeStoredFile('PRIVATE', storageKey)
}
