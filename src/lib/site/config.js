export function getAppUrl() {
  const value = String(process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '')
  return value || 'http://localhost:3000'
}

export function absoluteUrl(path = '/') {
  const base = getAppUrl()
  if (!path || path === '/') return base
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
