/**
 * Hard stop: integration tests must never touch the app database.
 * `use-test-database.js` rewrites DATABASE_URL to `*_test` before Prisma connects.
 */
export function assertTestDatabase() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set. Refusing to run against an unknown database.')
  }

  let dbName = ''
  try {
    const pathname = new URL(url).pathname.replace(/^\//, '')
    dbName = pathname.split('/')[0] || ''
  } catch {
    throw new Error('DATABASE_URL is not a valid URL.')
  }

  if (!dbName.endsWith('_test')) {
    throw new Error(
      `Refusing to run against non-test database "${dbName}". Use \`npm test\` only (loads tests/use-test-database.js).`,
    )
  }
}
