const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeSubscriberEmail(value) {
  const email = String(value ?? '')
    .trim()
    .toLowerCase()
  if (!email || email.length > 200 || !EMAIL_RE.test(email)) return null
  return email
}

/**
 * Upsert an active Judicial Briefs subscriber.
 * Existing inactive emails are reactivated. Never deletes other rows.
 */
export async function subscribeToBriefs(db, rawEmail) {
  const email = normalizeSubscriberEmail(rawEmail)
  if (!email) return { ok: false, code: 'INVALID_EMAIL' }

  const existing = await db.newsletterSubscriber.findUnique({ where: { email } })
  if (existing?.active) {
    return { ok: true, code: 'ALREADY_SUBSCRIBED', id: existing.id }
  }

  if (existing) {
    const updated = await db.newsletterSubscriber.update({
      where: { id: existing.id },
      data: { active: true },
    })
    return { ok: true, code: 'REACTIVATED', id: updated.id }
  }

  const created = await db.newsletterSubscriber.create({
    data: { email, active: true },
  })
  return { ok: true, code: 'CREATED', id: created.id }
}

export async function listActiveBriefSubscribers(db) {
  return db.newsletterSubscriber.findMany({
    where: { active: true },
    select: { id: true, email: true },
    orderBy: { createdAt: 'asc' },
  })
}
