export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024

export const ATTACHMENT_MIME_TYPES = ['application/pdf']

/**
 * Blog attachments: PDF only, up to 10 MB.
 * Executables and other types are rejected.
 */
export function validateAttachment({ filename, bytes }) {
  const fileBytes = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes || [])

  if (fileBytes.length === 0 || fileBytes.length > ATTACHMENT_MAX_BYTES) {
    return { ok: false }
  }

  const extension = extensionOf(filename)
  if (extension !== 'pdf') return { ok: false }
  if (!isPdf(fileBytes)) return { ok: false }

  return {
    ok: true,
    mimeType: 'application/pdf',
    byteSize: fileBytes.length,
    originalFilename: safeFilename(filename, 'pdf'),
  }
}

function isPdf(bytes) {
  return bytes.length >= 5 && bytes.toString('ascii', 0, 5) === '%PDF-'
}

function extensionOf(filename) {
  const base = basename(filename).toLowerCase()
  const match = base.match(/\.([a-z0-9]+)$/)
  return match ? match[1] : ''
}

function safeFilename(filename, extension) {
  const cleaned = basename(filename)
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .slice(0, 120)

  return cleaned || `attachment.${extension}`
}

function basename(filename) {
  return String(filename || '')
    .split(/[/\\]/)
    .pop() || ''
}
