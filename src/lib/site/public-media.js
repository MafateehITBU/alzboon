const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function publicMediaUrl(mediaId) {
  if (typeof mediaId !== 'string' || !UUID_RE.test(mediaId)) return null
  return `/media/${mediaId}`
}
