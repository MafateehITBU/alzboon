import { DEFAULT_LOCALE, normalizeLocale } from './locale.js'

export function withLocale(path, locale) {
  const normalized = normalizeLocale(locale)
  const clean = path.startsWith('/') ? path : `/${path}`
  if (normalized === DEFAULT_LOCALE) return clean === '' ? '/' : clean
  if (clean === '/') return '/ar'
  return `/ar${clean}`
}

export function stripLocale(pathname) {
  const path = pathname || '/'
  if (path === '/ar' || path.startsWith('/ar/')) {
    const rest = path.slice(3) || '/'
    return { locale: 'ar', path: rest.startsWith('/') ? rest : `/${rest}` }
  }
  return { locale: 'en', path: path.startsWith('/') ? path : `/${path}` }
}

export function switchLocalePath(pathname, nextLocale) {
  const { path } = stripLocale(pathname)
  return withLocale(path, nextLocale)
}
