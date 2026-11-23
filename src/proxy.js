import { NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/auth/constants'
import { adminProxyDecision } from '@/lib/auth/proxy-decision'

export function proxy(request) {
  const decision = adminProxyDecision({
    pathname: request.nextUrl.pathname,
    hasSessionCookie: Boolean(request.cookies.get(SESSION_COOKIE)?.value),
  })

  if (decision === 'login') return NextResponse.redirect(new URL('/admin/login', request.url))
  if (decision === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
