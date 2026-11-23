export const SESSION_COOKIE = 'alzboon_admin_session'

export const SESSION_TTL_MS = 12 * 60 * 60 * 1000

export const LOGIN_FAILURE_LIMIT = 5

export const LOGIN_WINDOW_MS = 15 * 60 * 1000

/** Failed login attempts per IP within LOGIN_WINDOW_MS when TRUST_PROXY is enabled. */
export const LOGIN_IP_FAILURE_LIMIT = 30

export const LOGIN_ATTEMPT_RETENTION_MS = 24 * 60 * 60 * 1000

export const SESSION_RETENTION_MS = 24 * 60 * 60 * 1000

export const PERMISSIONS = [
  'MANAGE_ADMINS',
  'MANAGE_BLOGS',
  'MANAGE_SERVICES',
  'MANAGE_CONTACT_ENQUIRIES',
  'MANAGE_WEBSITE_SETTINGS',
]

export const INVALID_LOGIN_MESSAGE = 'The email or password is incorrect.'

export const RATE_LIMIT_MESSAGE = 'Too many attempts. Try again later.'
