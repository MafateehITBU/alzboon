import { AuthError } from './errors.js'
import { normalizeEmail } from './email.js'
import { hashPassword, isStrongPassword } from './password.js'
import { publicAdmin } from './session.js'

/**
 * Read initial Super Admin accounts from env.
 * Supports SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD and optional
 * SUPER_ADMIN_EMAIL_2 / SUPER_ADMIN_PASSWORD_2 (and matching optional NAME / NAME_2).
 */
export function readBootstrapAccounts(env = process.env) {
  const accounts = []

  const firstEmail = normalizeEmail(env.SUPER_ADMIN_EMAIL ?? '')
  const firstPassword = env.SUPER_ADMIN_PASSWORD
  if (firstEmail || (typeof firstPassword === 'string' && firstPassword.length > 0)) {
    accounts.push({
      email: firstEmail,
      password: firstPassword,
      name: String(env.SUPER_ADMIN_NAME || 'Super Admin').trim() || 'Super Admin',
    })
  }

  const secondEmail = normalizeEmail(env.SUPER_ADMIN_EMAIL_2 ?? '')
  const secondPassword = env.SUPER_ADMIN_PASSWORD_2
  if (secondEmail || (typeof secondPassword === 'string' && secondPassword.length > 0)) {
    accounts.push({
      email: secondEmail,
      password: secondPassword,
      name: String(env.SUPER_ADMIN_NAME_2 || 'Super Admin').trim() || 'Super Admin',
    })
  }

  return accounts
}

/**
 * Idempotent seed: create each configured Super Admin if the email is missing.
 * Does not reset passwords for existing accounts. Safe to run on every deploy.
 */
export async function bootstrapSuperAdmins(db, env = process.env) {
  const accounts = readBootstrapAccounts(env)

  if (accounts.length === 0) {
    throw new AuthError('BOOTSTRAP_CONFIG')
  }

  for (const account of accounts) {
    if (!account.email || typeof account.password !== 'string' || account.password.length === 0) {
      throw new AuthError('BOOTSTRAP_CONFIG')
    }
    if (!isStrongPassword(account.password)) {
      throw new AuthError('WEAK_PASSWORD')
    }
  }

  const results = []

  for (const account of accounts) {
    const existing = await db.adminUser.findUnique({
      where: { email: account.email },
      include: { permissions: { select: { permission: true } } },
    })

    if (existing) {
      results.push({ status: 'exists', admin: publicAdmin(existing) })
      continue
    }

    const passwordHash = await hashPassword(account.password)
    const created = await db.adminUser.create({
      data: {
        name: account.name.slice(0, 120),
        email: account.email,
        passwordHash,
        role: 'SUPER_ADMIN',
        active: true,
      },
      include: { permissions: { select: { permission: true } } },
    })

    results.push({ status: 'created', admin: publicAdmin(created) })
  }

  return results
}

/** @deprecated Prefer bootstrapSuperAdmins. Creates/ensures the first env account only. */
export async function bootstrapSuperAdmin(db, env = process.env) {
  const singleEnv = {
    SUPER_ADMIN_EMAIL: env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: env.SUPER_ADMIN_PASSWORD,
    SUPER_ADMIN_NAME: env.SUPER_ADMIN_NAME,
  }
  const results = await bootstrapSuperAdmins(db, singleEnv)
  return results[0]?.admin
}
