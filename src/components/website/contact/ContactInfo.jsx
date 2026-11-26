import chat from '@/assets/icons/icon-chat.svg'
import { assetSrc } from '@/lib/utils/assetSrc'
import { whatsappButton } from '@/components/website/buttonStyles'
import { ClockIcon, EmailIcon, LocationIcon, PhoneIcon } from '@/components/website/contact/contactIcons'

const REGION_LABEL = {
  en: { UAE: 'Abu Dhabi', JORDAN: 'Amman' },
  ar: { UAE: 'أبوظبي', JORDAN: 'عمّان' },
}

const fallback = {
  email: 'info@alzboon.com',
  phones: [{ number: '+971 562511154' }],
  addresses: [{ region: 'UAE', text: 'Al Muroor Road, Abu Dhabi, United Arab Emirates' }],
  hours: 'Sunday – Thursday, 9:00 AM – 6:00 PM',
}

function splitHours(hours) {
  const text = String(hours || '').trim()
  if (!text) return { primary: '', secondary: '' }
  const comma = text.indexOf(',')
  if (comma > 0) {
    return { primary: text.slice(0, comma).trim(), secondary: text.slice(comma + 1).trim() }
  }
  return { primary: text, secondary: '' }
}

function ContactInfo({ locale = 'en', copy, contact = null }) {
  const isArabic = locale === 'ar'
  const email = contact?.contactEmail || fallback.email
  const phones =
    contact?.phones?.length > 0
      ? contact.phones.map((entry) => ({
          number: entry.number,
          href: `tel:${entry.number.replace(/[^\d+]/g, '')}`,
          label: entry.label,
        }))
      : fallback.phones.map((entry) => ({
          number: entry.number,
          href: `tel:${entry.number.replace(/[^\d+]/g, '')}`,
          label: null,
        }))
  const addresses =
    contact?.addresses?.length > 0
      ? contact.addresses.map((entry) => ({
          region: entry.region,
          text: isArabic ? entry.textAr || entry.textEn : entry.textEn || entry.textAr,
        }))
      : fallback.addresses
  const hoursRaw = isArabic
    ? contact?.businessHoursAr || contact?.businessHoursEn || fallback.hours
    : contact?.businessHoursEn || contact?.businessHoursAr || fallback.hours
  const hours = splitHours(hoursRaw)
  const whatsappNumber = (phones[0]?.number || '+971562511154').replace(/[^\d]/g, '') || '971562511154'
  const regionLabels = REGION_LABEL[isArabic ? 'ar' : 'en']

  return (
    <div className="max-w-[440px]">
      <h2 className="font-abu text-[32px] leading-[1.2] font-normal tracking-[-0.4px] text-ink max-[1023px]:text-[28px] max-[767px]:text-[24px]">
        {copy?.sectionTitle || 'Enquiries'}
      </h2>
      <p className="mt-4 font-jakarta text-[15px] leading-6 text-body">
        {copy?.sectionBody ||
          'All initial communications are handled with sovereign discretion and strict confidentiality.'}
      </p>

      <ul className="mt-10 grid list-none gap-8 p-0">
        <li className="flex items-start gap-4">
          <span className="mt-0.5 inline-flex h-12 w-12 shrink-0 items-center justify-center text-gold">
            <PhoneIcon className="h-7 w-7" />
          </span>
          <div>
            <p className="font-jakarta text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
              {copy?.labelPhone || 'Direct Telephone'}
            </p>
            {phones.map((entry, index) => (
              <a
                key={`${entry.href}-${entry.number}`}
                href={entry.href}
                className={`mt-1.5 block transition-colors hover:text-teal ${
                  index === 0
                    ? 'font-abu text-[18px] leading-6 text-ink'
                    : 'font-jakarta text-sm leading-5 text-body'
                }`}
              >
                {entry.number}
                {entry.label ? <span className="ms-1.5 text-sm text-body">({entry.label})</span> : null}
              </a>
            ))}
          </div>
        </li>

        <li className="flex items-start gap-4">
          <span className="mt-0.5 inline-flex h-12 w-12 shrink-0 items-center justify-center text-gold">
            <EmailIcon className="h-7 w-7" />
          </span>
          <div>
            <p className="font-jakarta text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
              {copy?.labelEmail || 'Direct Email'}
            </p>
            <a
              href={`mailto:${email}`}
              className="mt-1.5 block font-abu text-[18px] leading-6 text-ink transition-colors hover:text-teal"
            >
              {email}
            </a>
          </div>
        </li>

        <li className="flex items-start gap-4">
          <span className="mt-0.5 inline-flex h-12 w-12 shrink-0 items-center justify-center text-gold">
            <LocationIcon className="h-7 w-7" />
          </span>
          <div>
            <p className="font-jakarta text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
              {copy?.labelLocations || 'Office Locations'}
            </p>
            {addresses.map((entry) => (
              <div key={`${entry.region}-${entry.text}`} className="mt-1.5">
                <p className="font-abu text-[18px] leading-6 text-ink">
                  {regionLabels[entry.region] || entry.region}
                </p>
                <p className="mt-1 font-jakarta text-sm leading-5 text-body">{entry.text}</p>
              </div>
            ))}
          </div>
        </li>

        <li className="flex items-start gap-4">
          <span className="mt-0.5 inline-flex h-12 w-12 shrink-0 items-center justify-center text-gold">
            <ClockIcon className="h-7 w-7" />
          </span>
          <div>
            <p className="font-jakarta text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
              {copy?.labelHours || 'Consultation Hours'}
            </p>
            <p className="mt-1.5 font-abu text-[18px] leading-6 text-ink">{hours.primary}</p>
            {hours.secondary ? (
              <p className="mt-1 font-jakarta text-sm leading-5 text-body">{hours.secondary}</p>
            ) : null}
          </div>
        </li>
      </ul>

      <a
        className={`${whatsappButton} mt-10 px-6 max-[767px]:h-11 max-[767px]:min-h-11 max-[767px]:w-full max-[767px]:px-4 max-[767px]:text-[15px]`}
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noreferrer"
      >
        <img src={assetSrc(chat)} alt="" width="15" height="15" className="h-[15px] w-[15px]" />
        {copy?.whatsapp || 'Chat on WhatsApp'}
      </a>
    </div>
  )
}

export default ContactInfo
