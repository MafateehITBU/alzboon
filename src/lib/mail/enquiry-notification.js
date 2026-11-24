import fs from 'node:fs/promises'
import path from 'node:path'
import { absoluteUrl } from '../site/config.js'
import { createSmtpTransport, getSmtpFrom, isSmtpConfigured } from './smtp.js'

const LOGO_CID = 'alzboon-logo'
const LOGO_PATH = path.join(process.cwd(), 'src', 'assets', 'images', 'logo-header.png')

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/\n/g, ' ')
}

/**
 * Active Super Admins plus active Admins with MANAGE_CONTACT_ENQUIRIES.
 */
export async function listEnquiryNotificationRecipients(db) {
  const rows = await db.adminUser.findMany({
    where: {
      active: true,
      OR: [
        { role: 'SUPER_ADMIN' },
        { permissions: { some: { permission: 'MANAGE_CONTACT_ENQUIRIES' } } },
      ],
    },
    select: { email: true, name: true },
    orderBy: { email: 'asc' },
  })

  const seen = new Set()
  const recipients = []
  for (const row of rows) {
    const email = String(row.email || '')
      .trim()
      .toLowerCase()
    if (!email || seen.has(email)) continue
    seen.add(email)
    recipients.push({ email, name: row.name || '' })
  }
  return recipients
}

function buildEnquiryEmail({ enquiry, serviceName }) {
  const adminUrl = absoluteUrl('/admin/contact-enquiries')
  const name = escapeHtml(enquiry.name)
  const email = escapeHtml(enquiry.email)
  const phone = escapeHtml(enquiry.phone || '—')
  const service = escapeHtml(serviceName || 'General enquiry')
  const message = escapeHtml(enquiry.message).replace(/\n/g, '<br />')
  const submittedAt = enquiry.createdAt instanceof Date ? enquiry.createdAt.toISOString() : String(enquiry.createdAt || '')

  const subject = `New contact enquiry from ${enquiry.name}`

  const text = [
    'New contact enquiry — Awwad AlZboon Legal Consultancy',
    '',
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone || '—'}`,
    `Service: ${serviceName || 'General enquiry'}`,
    `Submitted: ${submittedAt}`,
    '',
    'Message:',
    enquiry.message,
    '',
    `Open admin: ${adminUrl}`,
  ].join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F8F6F1;font-family:Georgia,'Times New Roman',serif;color:#011320;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F6F1;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#06252C;padding:28px 32px;text-align:center;">
              <img src="cid:${LOGO_CID}" alt="Awwad AlZboon Legal Consultancy" width="180" style="display:inline-block;max-width:180px;height:auto;border:0;" />
              <p style="margin:18px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#BBA97A;">
                New Contact Enquiry
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;font-weight:400;color:#011320;">
                A new enquiry requires counsel review
              </h1>
              <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#555555;">
                A visitor submitted the public contact form. Details are below for your confidential follow-up.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#F7F9FB;border:1px solid #E2E8F0;border-radius:8px;">
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #E2E8F0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6C8793;width:34%;">Name</td>
                  <td style="padding:14px 18px;border-bottom:1px solid #E2E8F0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#011320;"><strong>${name}</strong></td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #E2E8F0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6C8793;">Email</td>
                  <td style="padding:14px 18px;border-bottom:1px solid #E2E8F0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#011320;">
                    <a href="mailto:${escapeAttr(enquiry.email)}" style="color:#3F8377;text-decoration:none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #E2E8F0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6C8793;">Phone</td>
                  <td style="padding:14px 18px;border-bottom:1px solid #E2E8F0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#011320;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #E2E8F0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6C8793;">Service</td>
                  <td style="padding:14px 18px;border-bottom:1px solid #E2E8F0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#011320;">${service}</td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6C8793;">Submitted</td>
                  <td style="padding:14px 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#011320;">${escapeHtml(submittedAt)}</td>
                </tr>
              </table>
              <p style="margin:28px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#BBA97A;">
                Message
              </p>
              <div style="padding:18px 20px;border-left:3px solid #BBA97A;background:#FBFAF7;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#43474C;">
                ${message}
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0 0;">
                <tr>
                  <td style="border-radius:4px;background:#BBA97A;">
                    <a href="${escapeAttr(adminUrl)}" style="display:inline-block;padding:14px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.04em;color:#FAFAFA;text-decoration:none;">
                      Open Contact Enquiries
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#011320;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:rgba(255,255,255,0.65);">
                Awwad AlZboon Legal Consultancy · Confidential administrative notification
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, text, html }
}

/**
 * Notify Super Admins and enquiry-permission admins.
 * Failures are logged and never thrown — enquiry creation must stay successful.
 */
export async function notifyEnquiryRecipients(db, enquiry, { serviceName = '' } = {}) {
  if (!enquiry?.id) return { sent: false, reason: 'missing-enquiry' }
  if (!isSmtpConfigured()) {
    console.warn('[mail] SMTP is not configured; skipping enquiry notification.')
    return { sent: false, reason: 'smtp-not-configured' }
  }

  const transport = createSmtpTransport()
  if (!transport) {
    console.warn('[mail] SMTP transporter could not be created; skipping enquiry notification.')
    return { sent: false, reason: 'smtp-invalid' }
  }

  const recipients = await listEnquiryNotificationRecipients(db)
  if (!recipients.length) {
    console.warn('[mail] No active enquiry notification recipients found.')
    return { sent: false, reason: 'no-recipients' }
  }

  const { subject, text, html } = buildEnquiryEmail({ enquiry, serviceName })
  const from = getSmtpFrom()
  const to = recipients.map((row) => row.email)

  let logoContent
  try {
    logoContent = await fs.readFile(LOGO_PATH)
  } catch (error) {
    console.error('[mail] Failed to read header logo for enquiry email.', error)
  }

  try {
    await transport.sendMail({
      from,
      to,
      subject,
      text,
      html,
      attachments: logoContent
        ? [
            {
              filename: 'logo-header.png',
              content: logoContent,
              cid: LOGO_CID,
              contentDisposition: 'inline',
              contentType: 'image/png',
            },
          ]
        : [],
    })
    return { sent: true, recipientCount: to.length }
  } catch (error) {
    console.error('[mail] Failed to send enquiry notification.', error)
    return { sent: false, reason: 'send-failed' }
  }
}
