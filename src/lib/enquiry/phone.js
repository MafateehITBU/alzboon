import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js'

/**
 * Accept +… or 00… international input and normalize 00 → +.
 */
export function normalizeInternationalPhoneInput(value) {
  const text = String(value ?? '').trim()
  if (!text) return ''
  if (text.startsWith('00')) return `+${text.slice(2)}`
  return text
}

/**
 * True when the value is a real international number (must start with + or 00)
 * and passes libphonenumber country/length checks.
 */
export function isValidInternationalPhone(value) {
  const text = String(value ?? '').trim()
  if (!text) return false
  if (!(text.startsWith('+') || text.startsWith('00'))) return false
  const normalized = normalizeInternationalPhoneInput(text)
  try {
    return isValidPhoneNumber(normalized)
  } catch {
    return false
  }
}

/** Store/display as E.164 when possible. */
export function toE164Phone(value) {
  const normalized = normalizeInternationalPhoneInput(value)
  if (!normalized) return ''
  try {
    const parsed = parsePhoneNumberFromString(normalized)
    if (parsed?.isValid()) return parsed.format('E.164')
  } catch {
    // fall through
  }
  return normalized
}
