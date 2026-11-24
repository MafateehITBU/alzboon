import Link from 'next/link'
import heroPresence from '@/assets/images/about-hero-presence.jpg'
import { assetSrc } from '@/lib/utils/assetSrc'
import { withLocale } from '@/lib/i18n/paths'
import { HomeIcon } from '@/components/website/contact/contactIcons'

const accentGradient =
  'inline bg-[linear-gradient(90deg,#FFFFFF_15%,#E2BC56_50%,#FDF8E6_85%)] bg-clip-text font-normal text-transparent not-italic'

export default function BlogsHero({ locale = 'en', copy }) {
  const isArabic = locale === 'ar'

  return (
    <section className="relative overflow-hidden bg-[#06252C]" aria-labelledby="blogs-hero-title">
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

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)_minmax(220px,280px)] items-end gap-10 max-[1023px]:mt-8 max-[1023px]:grid-cols-1 max-[1023px]:gap-8 max-[767px]:mt-6">
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-jakarta text-[11px] font-semibold tracking-[0.2em] text-[#BBA97A] uppercase">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#BBA97A]" aria-hidden="true" />
              {copy.heroEyebrow}
            </p>

            <h1
              id="blogs-hero-title"
              className="mt-5 max-w-[720px] font-abu text-[56px] leading-[1.08] font-normal tracking-[-1.2px] text-white max-[1439px]:text-[44px] max-[1023px]:text-[38px] max-[767px]:mt-4 max-[767px]:text-[32px] max-[767px]:tracking-normal"
            >
              {copy.heroTitleBefore}
              <em className={accentGradient}>{copy.heroTitleAccent1}</em>
              {copy.heroTitleMiddle}
              <em className={accentGradient}>{copy.heroTitleAccent2}</em>
            </h1>

            <p className="mt-5 max-w-[560px] font-abu text-[18px] leading-7 font-normal text-white/70 max-[767px]:mt-4 max-[767px]:text-base max-[767px]:leading-6">
              {copy.heroBody}
            </p>
          </div>

          <aside
            className="rounded-[10px] border border-[rgba(187,169,122,0.35)] bg-[rgba(8,42,48,0.72)] px-5 py-5 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.55)] backdrop-blur-[2px] max-[1023px]:max-w-[320px]"
            aria-label={copy.repositoryLabel}
          >
            <p className="font-jakarta text-[10px] font-semibold tracking-[0.2em] text-[#BBA97A] uppercase">
              {copy.repositoryLabel}
            </p>
            <p className="mt-2 font-abu text-[42px] leading-none tracking-[-0.04em] text-white max-[767px]:text-[36px]">
              {copy.repositoryFigure}
            </p>
            <p className="mt-2 font-jakarta text-[13px] leading-5 text-white/80">{copy.repositoryDescription}</p>
            <p className="mt-4 flex items-center gap-2 font-jakarta text-[11px] leading-4 text-white/55">
              <span className="relative inline-flex h-2 w-2 shrink-0">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/50" aria-hidden="true" />
                <span className="relative inline-block h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
              </span>
              {copy.repositoryStatus}
            </p>
          </aside>
        </div>
      </div>
    </section>
  )
}
