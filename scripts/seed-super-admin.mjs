import { PrismaClient } from '@prisma/client'
import { bootstrapSuperAdmins } from '../src/lib/auth/bootstrap.js'
import { AuthError } from '../src/lib/auth/errors.js'

const prisma = new PrismaClient()

function safeMessage(error) {
  return String(error?.message || error).replace(/postgres(?:ql)?:\/\/\S+/gi, 'postgresql://***')
}

try {
  const results = await bootstrapSuperAdmins(prisma)

  for (const result of results) {
    if (result.status === 'created') {
      console.log(`Created Super Admin ${result.admin.email}.`)
    } else {
      console.log(`Super Admin already present: ${result.admin.email}.`)
    }
  }
} catch (error) {
  if (error instanceof AuthError && error.code === 'BOOTSTRAP_CONFIG') {
    console.log('No SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD set; skipping Super Admin seed.')
    process.exitCode = 0
  } else if (error instanceof AuthError && error.code === 'WEAK_PASSWORD') {
    console.error(
      'Each SUPER_ADMIN_PASSWORD must be 8 to 200 characters and include an uppercase letter, a lowercase letter, and a number.',
    )
    process.exitCode = 1
  } else {
    console.error(`Super Admin setup failed. ${safeMessage(error)}`)
    process.exitCode = 1
  }
} finally {
  await prisma.$disconnect()
}
