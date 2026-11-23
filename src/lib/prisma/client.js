import 'server-only'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export function getPrisma() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. PostgreSQL is required. There is no in-memory or file database fallback.',
    )
  }

  if (!globalForPrisma.__alzboonPrisma) {
    globalForPrisma.__alzboonPrisma = new PrismaClient()
  }

  return globalForPrisma.__alzboonPrisma
}
