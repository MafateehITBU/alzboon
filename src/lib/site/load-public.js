import { getMessages } from '../i18n/messages.js'
import { normalizeLocale } from '../i18n/locale.js'
import { getPrisma } from '../prisma/client.js'
import { listAvailableServices, serializePublicServiceCard } from '../service/public.js'
import { getPublicWebsiteContact } from '../website/settings.js'

export async function loadPublicSiteData(localeInput = 'en') {
  const locale = normalizeLocale(localeInput)
  const messages = getMessages(locale)
  let contact = null
  let services = []

  if (!process.env.DATABASE_URL) {
    return { locale, messages, contact, services }
  }

  const db = getPrisma()

  try {
    contact = await getPublicWebsiteContact(db)
  } catch {
    contact = null
  }

  try {
    const rows = await listAvailableServices(db, { take: 50 })
    services = rows.map((service) => serializePublicServiceCard(service, locale)).filter(Boolean)
  } catch {
    services = []
  }

  return { locale, messages, contact, services }
}
