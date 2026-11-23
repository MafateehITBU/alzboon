const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(value) {
  if (typeof value !== 'string') return null

  const email = value.trim().toLowerCase()

  if (email.length === 0 || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return null
  }

  return email
}
