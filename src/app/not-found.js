import { headers } from 'next/headers'
import NotFoundView from '@/components/website/NotFoundView'
import { loadPublicSiteData } from '@/lib/site/load-public'

async function localeFromRequest() {
  try {
    const headerStore = await headers()
    const candidates = [
      headerStore.get('x-invoke-path'),
      headerStore.get('x-matched-path'),
      headerStore.get('x-pathname'),
      headerStore.get('next-url'),
      headerStore.get('referer'),
    ].filter(Boolean)

    for (const value of candidates) {
      try {
        const path = value.startsWith('http') ? new URL(value).pathname : value
        if (path === '/ar' || path.startsWith('/ar/')) return 'ar'
      } catch {
        // Ignore malformed header values.
      }
    }
  } catch {
    // Fall through to English.
  }

  return 'en'
}

export default async function NotFound() {
  const locale = await localeFromRequest()
  const { messages, contact, services } = await loadPublicSiteData(locale)

  return <NotFoundView locale={locale} messages={messages} contact={contact} services={services} />
}
