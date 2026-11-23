export function adminProxyDecision({ pathname, hasSessionCookie }) {
  if (pathname !== '/admin' && !pathname.startsWith('/admin/')) return 'next'

  const isLogin = pathname === '/admin/login'

  if (!hasSessionCookie && !isLogin) return 'login'
  if (hasSessionCookie && isLogin) return 'admin'
  return 'next'
}
