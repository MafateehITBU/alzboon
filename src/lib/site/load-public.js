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

  try {
    if (process.env.DATABASE_URL) {
      const db = getPrisma()
      ;[contact, services] = await Promise.all([
        getPublicWebsiteContact(db),
        listAvailableServices(db, { take: 24 }),
      ])
      services = services.map((service) => serializePublicServiceCard(service, locale)).filter(Boolean)
    }
  } catch {
    contact = null
    services = []
  }

  return { locale, messages, contact, services }
}
