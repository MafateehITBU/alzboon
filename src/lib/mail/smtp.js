import nodemailer from 'nodemailer'

function env(name) {
  const value = process.env[name]
  return typeof value === 'string' ? value.trim() : ''
}

export function isSmtpConfigured() {
  return Boolean(env('SMTP_HOST') && env('SMTP_PORT') && env('SMTP_FROM'))
}

export function getSmtpFrom() {
  return env('SMTP_FROM') || env('SMTP_USER')
}

/** Create a Nodemailer transporter from SMTP_* env vars. Returns null when incomplete. */
export function createSmtpTransport() {
  if (!isSmtpConfigured()) return null

  const port = Number.parseInt(env('SMTP_PORT'), 10)
  if (!Number.isFinite(port) || port < 1) return null

  const secureFlag = env('SMTP_SECURE').toLowerCase()
  const secure = secureFlag === 'true' || secureFlag === '1' || port === 465

  const user = env('SMTP_USER')
  const pass = env('SMTP_PASS')

  return nodemailer.createTransport({
    host: env('SMTP_HOST'),
    port,
    secure,
    auth: user ? { user, pass } : undefined,
  })
}
