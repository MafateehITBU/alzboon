import Link from 'next/link'
import heroPresence from '@/assets/images/about-hero-presence.jpg'
import { assetSrc } from '@/lib/utils/assetSrc'
import { withLocale } from '@/lib/i18n/paths'
import { HomeIcon } from '@/components/website/contact/contactIcons'

export default function PrivacyHero({ locale = 'en', copy }) {
  const isArabic = locale === 'ar'

  return (
    <section className="relative overflow-hidden bg-[#06252C]" aria-labelledby="privacy-hero-title">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <img
          src={assetSrc(heroPresence)}
          alt=""
          width="1024"
          height="576"
          className={`absolute inset-0 h-full w-full object-cover blur-[2.5px] max-[1023px]:object-[60%_center] max-[767px]:object-center ${
            isArabic
              ? 'origin-center scale-105 -scale-x-105 object-left max-[1023px]:object-[40%_center]'
              : 'scale-105 object-[72%_center]'
          }`}
        />
        <div className="absolute inset-0 bg-[rgba(8,42,48,0.42)] max-[1023px]:bg-[rgba(8,42,48,0.5)] max-[767px]:bg-[rgba(6,35,42,0.62)]" />
        <div
          className={`absolute inset-0 max-[767px]:from-[rgba(6,35,42,0.78)] ${
            isArabic
              ? 'bg-gradient-to-l from-[rgba(6,35,42,0.72)] via-[rgba(6,35,42,0.38)] to-transparent'
              : 'bg-gradient-to-r from-[rgba(6,35,42,0.72)] via-[rgba(6,35,42,0.38)] to-transparent'
          }`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_35%,rgba(226,188,86,0.12),transparent_42%)] max-[767px]:opacity-70" />
      </div>

      <div className="relative mx-auto w-full max-w-[1440px] px-[80px] pt-14 pb-16 max-[1439px]:px-10 max-[1023px]:px-8 max-[1023px]:pt-10 max-[1023px]:pb-12 max-[767px]:px-5 max-[767px]:pt-8 max-[767px]:pb-10">
        <nav
          className="flex flex-wrap items-center gap-1.5 font-jakarta text-[10px] font-medium tracking-[0.14em] uppercase text-white/50"
          aria-label="Breadcrumb"
        >
          <Link
            href={withLocale('/', locale)}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <HomeIcon className="h-3.5 w-3.5" />
            {copy.breadcrumbHome}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-[#BBA97A]">{copy.breadcrumbCurrent}</span>
        </nav>

        <div className="mt-10 grid grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)] items-start gap-10 max-[1023px]:mt-8 max-[1023px]:grid-cols-1 max-[1023px]:gap-8">
          <div className="max-w-[720px]">
            <p className="inline-flex rounded-[2px] border border-[#BBA97A]/70 px-3 py-1.5 font-jakarta text-[11px] font-semibold tracking-[0.14em] text-[#BBA97A] uppercase">
              {copy.eyebrow}
            </p>
            <h1
              id="privacy-hero-title"
              className="mt-6 font-abu text-[44px] leading-[1.12] font-normal tracking-[-0.8px] text-white max-[1439px]:text-[38px] max-[1023px]:text-[32px] max-[767px]:text-[28px] max-[767px]:tracking-normal"
            >
              <span className="block">{copy.heroTitleLine1}</span>
              <span className="block">{copy.heroTitleLine2}</span>
            </h1>
            <p className="mt-5 max-w-[560px] font-abu text-[16px] leading-6 font-normal text-white/70 max-[767px]:mt-4 max-[767px]:text-sm max-[767px]:leading-6">
              {copy.heroBody}
            </p>
          </div>

          <aside className="rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.06)] p-5 backdrop-blur-[2px]">
            <p className="font-jakarta text-[11px] font-semibold tracking-[0.16em] text-[#BBA97A] uppercase">
              {copy.ledgerLabel}
            </p>
            <p className="mt-2 font-abu text-[22px] leading-7 text-white">{copy.ledgerVolume}</p>
            <dl className="mt-5 grid gap-4">
              {copy.ledgerRows.map((row) => (
                <div key={row.label} className="border-t border-white/10 pt-3">
                  <dt className="font-jakarta text-[11px] font-semibold tracking-[0.12em] text-white/45 uppercase">
                    {row.label}
                  </dt>
                  <dd className="mt-1 font-abu text-[15px] leading-5 text-white/80">{row.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </div>
    </section>
  )
}
