/**
 * Resolve a client IP for rate limiting.
 *
 * Forwarded headers are only trusted when TRUST_PROXY is enabled (production
 * Nginx should set real client IP and strip untrusted X-Forwarded-For).
 * Without TRUST_PROXY, returns "unknown" so email/user limits still apply.
 */
export function resolveClientIp(headerStore) {
  if (!trustProxyEnabled()) return 'unknown'

  const forwarded = headerStore.get('x-forwarded-for') || ''
  const first = forwarded.split(',')[0]?.trim()
  if (first && isPlausibleIp(first)) return first.slice(0, 120)

  const real = headerStore.get('x-real-ip')?.trim()
  if (real && isPlausibleIp(real)) return real.slice(0, 120)

  return 'unknown'
}

export function trustProxyEnabled() {
  const value = String(process.env.TRUST_PROXY || '')
    .trim()
    .toLowerCase()
  return value === '1' || value === 'true' || value === 'yes'
}

function isPlausibleIp(value) {
  if (!value || value.length > 120) return false
  if (value.includes(' ')) return false
  // Basic IPv4 / IPv6 character check; full validation is not required for rate keys.
  return /^[0-9a-fA-F:.]+$/.test(value)
}
