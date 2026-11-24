import Link from 'next/link'
import heroPresence from '@/assets/images/about-hero-presence.jpg'
import { assetSrc } from '@/lib/utils/assetSrc'
import { withLocale } from '@/lib/i18n/paths'
import { GlobeIcon, ScalesIcon } from '@/components/website/about/aboutIcons'

const accentGradient =
  'inline bg-[linear-gradient(90deg,#FFFFFF_15%,#E2BC56_50%,#FDF8E6_85%)] bg-clip-text text-transparent'

function HomeIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 6.2 8 1.75l5.5 4.45V13.5A.75.75 0 0 1 12.75 14.25H9.25V10H6.75v4.25H3.25A.75.75 0 0 1 2.5 13.5V6.2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function renderTitleParts(parts) {
  const nodes = []
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index]
    const next = parts[index + 1]

    if (part.glueNext && next) {
      nodes.push(
        <span key={`glue-${index}`} className="whitespace-nowrap">
          {part.text}
          <span className={next.accent ? accentGradient : undefined}>{next.text}</span>
        </span>,
      )
      index += 1
      continue
    }

    nodes.push(
      <span key={`${part.text}-${index}`} className={part.accent ? accentGradient : undefined}>
        {part.text}
      </span>,
    )
  }
  return nodes
}

function AboutHero({ locale = 'en', copy }) {
  const isArabic = locale === 'ar'
  const parts = copy?.heroTitleParts?.length
    ? copy.heroTitleParts
    : [{ text: copy?.heroTitle || '', accent: false }]
  const cards = copy?.heroCards || []
  const icons = [ScalesIcon, GlobeIcon]

  return (
    <section className="relative overflow-hidden bg-[#06252C]" aria-labelledby="about-hero-title">
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

      <div className="relative mx-auto w-full max-w-[1440px] px-[80px] pt-14 pb-36 max-[1439px]:px-10 max-[1023px]:px-8 max-[1023px]:pt-10 max-[1023px]:pb-28 max-[767px]:px-5 max-[767px]:pt-8 max-[767px]:pb-24">
        <nav
          className="flex items-center gap-1.5 font-jakarta text-[10px] font-medium tracking-[0.14em] uppercase text-white/50"
          aria-label="Breadcrumb"
        >
          <Link
            href={withLocale('/', locale)}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <HomeIcon className="h-3.5 w-3.5" />
            {copy?.breadcrumbHome || 'HOME'}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-[#BBA97A]">{copy?.breadcrumbCurrent || 'ABOUT US'}</span>
        </nav>

        <div className="mt-12 grid grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] items-start gap-16 max-[1023px]:mt-8 max-[1023px]:grid-cols-1 max-[1023px]:gap-10">
          <div className="max-w-[720px]">
            <h1
              id="about-hero-title"
              className="font-abu text-[64px] leading-[1.08] font-normal tracking-[-1.4px] text-white max-[1439px]:text-[48px] max-[1023px]:text-[42px] max-[767px]:text-[34px] max-[767px]:tracking-normal"
            >
              {renderTitleParts(parts)}
            </h1>
            <p className="mt-9 max-w-[560px] font-abu text-[20px] leading-[26px] font-normal text-white/70 max-[1439px]:text-[18px] max-[767px]:mt-6 max-[767px]:text-base max-[767px]:leading-6">
              {copy?.heroBody}
            </p>
          </div>

          <aside className="flex flex-col gap-4 pt-2 max-[1023px]:pt-0">
            {cards.map((card, index) => {
              const Icon = icons[index] || ScalesIcon
              const iconTone =
                index === 0
                  ? 'border-[rgba(186,168,122,0.55)] bg-[rgba(186,168,122,0.12)] text-gold'
                  : 'border-[rgba(63,131,119,0.55)] bg-[rgba(63,131,119,0.16)] text-teal'
              return (
                <div
                  key={card.title}
                  className="flex items-start gap-4 rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.06)] px-5 py-5 backdrop-blur-[2px]"
                >
                  <span
                    className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] border ${iconTone}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-abu text-[20px] leading-6 font-bold text-white max-[767px]:text-[18px]">
                      {card.title}
                    </p>
                    <p className="mt-1.5 font-abu text-[16px] leading-[22px] text-white/65 max-[767px]:text-[15px]">
                      {card.body}
                    </p>
                  </div>
                </div>
              )
            })}
          </aside>
        </div>
      </div>
    </section>
  )
}

export default AboutHero
