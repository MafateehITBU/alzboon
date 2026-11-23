export const LOCALES = ['en', 'ar']
export const DEFAULT_LOCALE = 'en'

export function normalizeLocale(value) {
  const locale = String(value || '').toLowerCase()
  return LOCALES.includes(locale) ? locale : DEFAULT_LOCALE
}

export function localeToDb(locale) {
  return normalizeLocale(locale) === 'ar' ? 'AR' : 'EN'
}

export function isRtl(locale) {
  return normalizeLocale(locale) === 'ar'
}

export function dirForLocale(locale) {
  return isRtl(locale) ? 'rtl' : 'ltr'
}

export function alternateLocale(locale) {
  return normalizeLocale(locale) === 'ar' ? 'en' : 'ar'
}
