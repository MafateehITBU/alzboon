import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma/client'
import { clearedSessionCookieOptions, findValidSession, sessionCookieName } from '@/lib/auth/session'

export async function GET(request) {
  const token = request.cookies.get(sessionCookieName)?.value
  const current = token ? await findValidSession(getPrisma(), token) : null

  if (current) return NextResponse.redirect(new URL('/admin', request.url))

  const response = NextResponse.redirect(new URL('/admin/login', request.url))
  response.cookies.set(sessionCookieName, '', clearedSessionCookieOptions())
  return response
}
