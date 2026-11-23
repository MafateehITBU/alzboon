import { PrismaClient } from '@prisma/client'
import { bootstrapSuperAdmin } from '../src/lib/auth/bootstrap.js'
import { AuthError } from '../src/lib/auth/errors.js'

const prisma = new PrismaClient()

function safeMessage(error) {
  return String(error?.message || error).replace(/postgres(?:ql)?:\/\/\S+/gi, 'postgresql://***')
}

try {
  const admin = await bootstrapSuperAdmin(prisma)
  console.log(`Super Admin is ready for ${admin.email}.`)
  console.log('Remove SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD from the environment after this command.')
} catch (error) {
  if (error instanceof AuthError && error.code === 'BOOTSTRAP_CONFIG') {
    console.error('Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD before running this command.')
  } else if (error instanceof AuthError && error.code === 'BOOTSTRAP_EXISTS') {
    console.error('A Super Admin already exists. This command will not create another one.')
  } else if (error instanceof AuthError && error.code === 'WEAK_PASSWORD') {
    console.error('SUPER_ADMIN_PASSWORD must be 12 to 200 characters and include an uppercase letter, a lowercase letter, and a number.')
  } else {
    console.error(`Super Admin setup failed. ${safeMessage(error)}`)
  }
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
