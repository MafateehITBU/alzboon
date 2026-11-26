export const SESSION_COOKIE = 'alzboon_admin_session'

export const SESSION_TTL_MS = 12 * 60 * 60 * 1000

/** Consecutive wrong passwords before a lockout stage is applied. */
export const LOGIN_FAILURE_LIMIT = 5

/** Progressive lockout durations after each block of LOGIN_FAILURE_LIMIT failures. */
export const LOGIN_LOCKOUT_DURATIONS_MS = [
  60 * 60 * 1000, // 1 hour
  5 * 60 * 60 * 1000, // 5 hours
  12 * 60 * 60 * 1000, // 12 hours
  24 * 60 * 60 * 1000, // 24 hours
]

/** After the 24h stage, another LOGIN_FAILURE_LIMIT failures deactivates the account. */
export const LOGIN_LOCKOUT_MAX_LEVEL = LOGIN_LOCKOUT_DURATIONS_MS.length

export const LOGIN_WINDOW_MS = 15 * 60 * 1000

/** Failed login attempts per IP within LOGIN_WINDOW_MS when TRUST_PROXY is enabled. */
export const LOGIN_IP_FAILURE_LIMIT = 30

export const LOGIN_ATTEMPT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000

export const LOGIN_OTP_TTL_MS = 10 * 60 * 1000

export const LOGIN_OTP_MAX_ATTEMPTS = 3

export const LOGIN_OTP_ALERT_EMAIL = 'info@aipmcae.com'

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

export const ACCOUNT_LOCKED_MESSAGE =
  'This account is temporarily locked after too many failed sign-in attempts. Try again later.'

export const ACCOUNT_DEACTIVATED_MESSAGE =
  'This account has been deactivated after repeated failed sign-in attempts. Contact a Super Admin to reactivate it.'

export const OTP_REQUIRED_MESSAGE = 'Enter the 6-digit code sent to your email.'

export const OTP_INVALID_MESSAGE = 'That verification code is incorrect or has expired.'

export const OTP_ALERT_MESSAGE =
  'Too many incorrect verification codes. A security alert was sent. Start sign-in again.'

export const OTP_UNAVAILABLE_MESSAGE =
  'Email verification is not available right now. Contact support or check SMTP configuration.'
