/**
 * Force DB integration tests onto a dedicated `*_test` database.
 * Never touch the development/production database from tests.
 * Tests must not wipe tables; there is no shared cleanup helper anymore.
 */
const url = process.env.DATABASE_URL
if (!url) {
  throw new Error('DATABASE_URL is not set. Tests need a PostgreSQL URL.')
}

let parsed
try {
  parsed = new URL(url)
} catch {
  throw new Error('DATABASE_URL is not a valid URL.')
}

const pathname = parsed.pathname.replace(/^\//, '')
const dbName = pathname.split('/')[0] || ''
if (!dbName) {
  throw new Error('DATABASE_URL must include a database name.')
}

if (!dbName.endsWith('_test')) {
  parsed.pathname = `/${dbName}_test`
  process.env.DATABASE_URL = parsed.toString()
}

const finalName = new URL(process.env.DATABASE_URL).pathname.replace(/^\//, '').split('/')[0]
if (!finalName.endsWith('_test')) {
  throw new Error(`Refusing to run tests against non-test database "${finalName}". Use a *_test database.`)
}
