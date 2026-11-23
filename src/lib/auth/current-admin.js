import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPrisma } from '@/lib/prisma/client'
import { hasPermission } from './permissions.js'
import {
  clearedSessionCookieOptions,
  findValidSession,
  revokeSession,
  sessionCookieName,
  sessionCookieOptions,
} from './session.js'

async function readToken() {
  const jar = await cookies()
  return jar.get(sessionCookieName)?.value || ''
}

export async function getCurrentAdmin() {
  const token = await readToken()
  if (!token) return null
  return findValidSession(getPrisma(), token)
}

export async function requireAdmin() {
  const token = await readToken()
  const current = token ? await findValidSession(getPrisma(), token) : null
  if (current) return current
  redirect(token ? '/admin/session' : '/admin/login')
}

export async function requirePermission(permission) {
  const current = await requireAdmin()
  if (!hasPermission(current.admin, permission)) redirect('/admin/forbidden')
  return current
}

export async function setSessionCookie(token) {
  const jar = await cookies()
  jar.set(sessionCookieName, token, sessionCookieOptions())
}

export async function logoutCurrentSession() {
  const jar = await cookies()
  const token = jar.get(sessionCookieName)?.value
  if (token) await revokeSession(getPrisma(), token)
  jar.set(sessionCookieName, '', clearedSessionCookieOptions())
}

export { clearedSessionCookieOptions, sessionCookieName }
