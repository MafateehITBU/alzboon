import Link from 'next/link'
import chat from '@/assets/icons/icon-chat.svg'
import { assetSrc } from '@/lib/utils/assetSrc'
import { goldButton, whatsappButton } from '@/components/website/buttonStyles'
import { withLocale } from '@/lib/i18n/paths'

function Consultation({ locale = 'en', messages, contact = null }) {
  const phone = contact?.phones?.[0]?.number || '+971562511154'
  const whatsappNumber = phone.replace(/[^\d]/g, '') || '971562511154'
  const copy = messages?.home?.consultation || {}

  return (
    <section
      className="scroll-mt-20 bg-white px-20 pt-10 pb-20 max-[1439px]:px-10 max-[1023px]:p-8 max-[767px]:px-5 max-[767px]:pt-6 max-[767px]:pb-12"
      id="consultation"
      aria-labelledby="consultation-title"
    >
      <div className="relative mx-auto min-h-[310px] max-w-[1280px] overflow-hidden rounded-3xl bg-cream p-[57px] shadow-cta max-[1023px]:p-9 max-[767px]:rounded-2xl max-[767px]:px-5 max-[767px]:py-7">
        <span className="pointer-events-none absolute -right-10 -bottom-20 h-80 w-80 rounded-xl bg-[rgba(187,169,122,0.2)] blur-[32px]" />
        <div className="relative z-[1]">
          <p className="font-abu text-[14px] leading-4 font-bold tracking-[1.1px] text-gold uppercase">
            {copy.eyebrow || 'We are here to serve you and meet your needs'}
          </p>
          <h2
            id="consultation-title"
            className="mt-4 max-w-[760px] font-abu text-[36px] leading-[1.2] font-bold tracking-[0.5px] text-ink-soft max-[1439px]:text-[32px] max-[1439px]:leading-[1.2] max-[767px]:text-[26px] max-[767px]:tracking-normal"
          >
            {copy.title || 'Consult With Our Senior Legal Advisors Today'}
          </h2>
          <p className="mt-3.5 max-w-[680px] font-abu text-[16px] leading-6 text-body">
            {copy.body ||
              "Gain the strategic clarity and legal certainty required to accelerate your enterprise's trajectory. Direct consultations available via WhatsApp or structured retainer."}
          </p>
          <div className="mt-7 flex flex-wrap gap-4 max-[767px]:mt-5 max-[767px]:gap-2.5">
            <Link
              href={withLocale('/contact', locale)}
              className={`${goldButton} px-6 max-[767px]:h-11 max-[767px]:min-h-11 max-[767px]:flex-1 max-[767px]:px-3 max-[767px]:text-[15px] max-[767px]:tracking-normal`}
            >
              {messages?.home?.bookConsultation || 'Book A Consultation'}
            </Link>
            <a
              className={`${whatsappButton} px-6 max-[767px]:h-11 max-[767px]:min-h-11 max-[767px]:flex-1 max-[767px]:px-3 max-[767px]:text-[15px] max-[767px]:tracking-normal`}
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={assetSrc(chat)}
                alt=""
                width="15"
                height="15"
                className="h-[15px] w-[15px] max-[767px]:h-3.5 max-[767px]:w-3.5"
              />
              {messages?.home?.instantWhatsapp || 'Instant WhatsApp'}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Consultation
