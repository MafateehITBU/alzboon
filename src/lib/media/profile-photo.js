export const PROFILE_PHOTO_MAX_BYTES = 2 * 1024 * 1024

const MIME_BY_EXTENSION = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

export const PROFILE_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validateProfilePhoto({ filename, bytes }) {
  const fileBytes = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes || [])

  if (fileBytes.length === 0 || fileBytes.length > PROFILE_PHOTO_MAX_BYTES) {
    return { ok: false }
  }

  const extension = extensionOf(filename)
  const expectedMime = MIME_BY_EXTENSION[extension]
  const detectedMime = detectMime(fileBytes)

  if (!expectedMime || detectedMime !== expectedMime) {
    return { ok: false }
  }

  return {
    ok: true,
    mimeType: detectedMime,
    byteSize: fileBytes.length,
    originalFilename: safeFilename(filename, extension),
  }
}

function extensionOf(filename) {
  const base = basename(filename).toLowerCase()
  const match = base.match(/\.([a-z0-9]+)$/)
  return match ? match[1] : ''
}

function detectMime(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png'
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp'
  return null
}

function safeFilename(filename, extension) {
  const cleaned = basename(filename)
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .slice(0, 120)

  return cleaned || `photo.${extension}`
}

function basename(filename) {
  return String(filename || '').split(/[/\\]/).pop() || ''
}
