import { LOGIN_OTP_ALERT_EMAIL } from '../auth/constants.js'
import { createSmtpTransport, getSmtpFrom, isSmtpConfigured } from './smtp.js'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function sendLoginOtpEmail({ to, name, code }) {
  if (!isSmtpConfigured()) return { ok: false, reason: 'smtp_unconfigured' }

  const transport = createSmtpTransport()
  if (!transport) return { ok: false, reason: 'smtp_unconfigured' }

  const safeName = escapeHtml(name || 'Administrator')
  const safeCode = escapeHtml(code)

  try {
    await transport.sendMail({
      from: getSmtpFrom(),
      to,
      subject: 'Your Alzboon admin verification code',
      text: `Hello ${name || 'Administrator'},\n\nYour verification code is ${code}. It expires in 10 minutes.\n\nIf you did not try to sign in, contact support immediately.`,
      html: `
        <div style="font-family:Georgia,serif;color:#011320;line-height:1.5">
          <p>Hello ${safeName},</p>
          <p>Your Alzboon admin verification code is:</p>
          <p style="font-size:28px;letter-spacing:0.2em;font-weight:700">${safeCode}</p>
          <p>This code expires in 10 minutes. If you did not try to sign in, contact support immediately.</p>
        </div>
      `,
    })
    return { ok: true }
  } catch (error) {
    console.error('[login-otp] failed to send OTP email', error)
    return { ok: false, reason: 'send_failed' }
  }
}

export async function sendLoginOtpAlertEmail({ targetEmail, attemptCount }) {
  if (!isSmtpConfigured()) return { ok: false, reason: 'smtp_unconfigured' }

  const transport = createSmtpTransport()
  if (!transport) return { ok: false, reason: 'smtp_unconfigured' }

  const safeEmail = escapeHtml(targetEmail)
  const safeCount = escapeHtml(attemptCount)

  try {
    await transport.sendMail({
      from: getSmtpFrom(),
      to: LOGIN_OTP_ALERT_EMAIL,
      subject: 'Alzboon admin login OTP failures',
      text: `Someone is trying to sign in to the Alzboon admin dashboard for ${targetEmail}. They entered an incorrect email OTP ${attemptCount} times. Please contact Mafateeh Support.`,
      html: `
        <div style="font-family:Georgia,serif;color:#011320;line-height:1.5">
          <p>Someone is trying to sign in to the Alzboon admin dashboard.</p>
          <p><strong>Account email:</strong> ${safeEmail}</p>
          <p><strong>Incorrect OTP attempts:</strong> ${safeCount}</p>
          <p>Please contact Mafateeh Support.</p>
        </div>
      `,
    })
    return { ok: true }
  } catch (error) {
    console.error('[login-otp] failed to send OTP alert email', error)
    return { ok: false, reason: 'send_failed' }
  }
}
