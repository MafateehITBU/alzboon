import fs from 'node:fs/promises'
import path from 'node:path'
import { absoluteUrl } from '../site/config.js'
import { listActiveBriefSubscribers } from '../newsletter/subscribe.js'
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
 * Absolute public article URL for production and local.
 * Uses APP_URL so live links resolve correctly.
 */
export function blogPublicUrl(slug) {
  return absoluteUrl(`/blogs/${encodeURIComponent(String(slug || '').trim())}`)
}

function buildBlogEmail({ title, excerpt, url }) {
  const safeTitle = escapeHtml(title)
  const safeExcerpt = excerpt ? escapeHtml(excerpt) : ''
  const subject = `New legal brief: ${title}`

  const text = [
    'Awwad AlZboon Legal Consultancy — New Judicial Brief',
    '',
    title,
    excerpt ? `\n${excerpt}\n` : '',
    `Read the full article: ${url}`,
  ].join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
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
                Judicial Briefs
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#BBA97A;">
                New publication
              </p>
              <h1 style="margin:0 0 14px;font-size:26px;line-height:1.25;font-weight:400;color:#011320;">
                ${safeTitle}
              </h1>
              ${
                safeExcerpt
                  ? `<p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#555555;">${safeExcerpt}</p>`
                  : `<p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#555555;">A new legal brief is now available on the Awwad AlZboon website.</p>`
              }
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:4px;background:#BBA97A;">
                    <a href="${escapeAttr(url)}" style="display:inline-block;padding:14px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.04em;color:#FAFAFA;text-decoration:none;">
                      Read the Brief
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:22px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#6C8793;word-break:break-all;">
                ${escapeHtml(url)}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#011320;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:rgba(255,255,255,0.65);">
                You are receiving this because you subscribed to Judicial Briefs on alzboon.com.
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
 * Notify active Judicial Briefs subscribers about a newly public blog.
 * Uses APP_URL-based absolute links. Failures are logged and never thrown.
 */
export async function notifyBriefSubscribers(db, blog) {
  if (!blog?.slug || !blog?.titleEn) return { sent: false, reason: 'missing-blog' }
  if (!isSmtpConfigured()) {
    console.warn('[mail] SMTP is not configured; skipping blog subscriber notification.')
    return { sent: false, reason: 'smtp-not-configured' }
  }

  const transport = createSmtpTransport()
  if (!transport) return { sent: false, reason: 'smtp-invalid' }

  const subscribers = await listActiveBriefSubscribers(db)
  if (!subscribers.length) return { sent: false, reason: 'no-subscribers' }

  const url = blogPublicUrl(blog.slug)
  const { subject, text, html } = buildBlogEmail({
    title: blog.titleEn,
    excerpt: blog.descriptionEn || '',
    url,
  })

  let logoContent
  try {
    logoContent = await fs.readFile(LOGO_PATH)
  } catch (error) {
    console.error('[mail] Failed to read logo for blog notification.', error)
  }

  try {
    await transport.sendMail({
      from: getSmtpFrom(),
      bcc: subscribers.map((row) => row.email),
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
    return { sent: true, recipientCount: subscribers.length, url }
  } catch (error) {
    console.error('[mail] Failed to send blog subscriber notification.', error)
    return { sent: false, reason: 'send-failed' }
  }
}
