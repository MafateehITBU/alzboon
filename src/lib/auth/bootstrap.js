import { AuthError } from './errors.js'
import { normalizeEmail } from './email.js'
import { hashPassword, isStrongPassword } from './password.js'
import { publicAdmin } from './session.js'

export async function bootstrapSuperAdmin(db, env = process.env) {
  const email = normalizeEmail(env.SUPER_ADMIN_EMAIL ?? '')
  const password = env.SUPER_ADMIN_PASSWORD

  if (!email || typeof password !== 'string' || password.length === 0) {
    throw new AuthError('BOOTSTRAP_CONFIG')
  }

  if (!isStrongPassword(password)) throw new AuthError('WEAK_PASSWORD')

  const passwordHash = await hashPassword(password)

  try {
    const created = await db.$transaction(
      async (tx) => {
        const existing = await tx.adminUser.findFirst({
          where: { role: 'SUPER_ADMIN' },
          select: { id: true },
        })

        if (existing) throw new AuthError('BOOTSTRAP_EXISTS')

        return tx.adminUser.create({
          data: {
            name: 'Super Admin',
            email,
            passwordHash,
            role: 'SUPER_ADMIN',
            active: true,
          },
          include: { permissions: { select: { permission: true } } },
        })
      },
      { isolationLevel: 'Serializable' },
    )

    return publicAdmin(created)
  } catch (error) {
    if (error instanceof AuthError) throw error
    if (error?.code === 'P2002') throw new AuthError('BOOTSTRAP_EXISTS')
    throw error
  }
}
