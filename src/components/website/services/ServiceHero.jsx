import Link from 'next/link'
import arrow from '@/assets/icons/icon-arrow-right.svg'
import { assetSrc } from '@/lib/utils/assetSrc'
import { tealButton } from '@/components/website/buttonStyles'
import { withLocale } from '@/lib/i18n/paths'
import { getHeroCapabilityItems, getServicePresentation } from '@/lib/services/service-presentation'
import { MarkIcon, ScalesIcon, ShieldIcon } from '@/components/website/about/aboutIcons'

const CAPABILITY_ICONS = [ScalesIcon, ShieldIcon, MarkIcon]

const titleGradient =
  'bg-[linear-gradient(90deg,#FFFFFF_15%,#E2BC56_50%,#FDF8E6_85%)] bg-clip-text text-transparent'

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

function ServiceHero({ locale = 'en', service, copy }) {
  const isArabic = locale === 'ar'
  const presentation = getServicePresentation(service?.slug, locale)
  const capabilities = getHeroCapabilityItems(service?.practiceAreas, 3)
  const contactHref = withLocale('/contact', locale)
  const homeHref = withLocale('/', locale)

  return (
    <section className="relative overflow-hidden bg-[#06252C]" aria-labelledby="service-hero-title">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {service?.heroUrl ? (
          <img
            src={service.heroUrl}
            alt=""
            width="1440"
            height="720"
            className={`absolute inset-0 h-full w-full object-cover blur-[2.5px] max-[1023px]:object-[60%_center] max-[767px]:object-center ${
              isArabic
                ? 'origin-center scale-105 -scale-x-105 object-left max-[1023px]:object-[40%_center]'
                : 'scale-105 object-[72%_center]'
            }`}
          />
        ) : null}
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

      <div className="relative mx-auto w-full max-w-[1440px] px-[80px] pt-12 pb-20 max-[1439px]:px-10 max-[1023px]:px-8 max-[1023px]:pt-10 max-[1023px]:pb-16 max-[767px]:px-5 max-[767px]:pt-8 max-[767px]:pb-12">
        <nav
          className="flex flex-wrap items-center gap-1.5 font-jakarta text-[10px] font-medium tracking-[0.14em] uppercase"
          aria-label="Breadcrumb"
        >
          <Link href={homeHref} className="inline-flex items-center gap-1.5 text-[#6C8793] transition-colors hover:text-white">
            <HomeIcon className="h-3.5 w-3.5" />
            {copy?.breadcrumbHome || 'HOME'}
          </Link>
          <span className="text-[#6C8793]" aria-hidden="true">
            /
          </span>
          <span className="font-semibold text-gold">{service?.name || service?.heroTitle}</span>
        </nav>

        <div className="mt-10 grid grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] items-start gap-12 max-[1023px]:mt-8 max-[1023px]:grid-cols-1 max-[1023px]:gap-8">
          <div className="max-w-[640px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#BBA97A]/45 bg-white/5 px-3.5 py-1.5 font-jakarta text-[11px] font-semibold tracking-[0.14em] text-[#BBA97A] uppercase">
              <ScalesIcon className="h-3.5 w-3.5 shrink-0 text-[#BBA97A]" />
              {presentation.expertiseBadge}
            </span>
            <h1
              id="service-hero-title"
              className={`mt-5 font-abu text-[44px] leading-[1.12] font-normal tracking-[-0.8px] max-[1439px]:text-[38px] max-[1023px]:text-[32px] max-[767px]:text-[28px] max-[767px]:tracking-normal ${titleGradient}`}
            >
              {service?.heroTitle || service?.name}
            </h1>
            <p className="mt-5 max-w-[540px] font-abu text-[16px] leading-[26px] text-white/75 max-[767px]:mt-4 max-[767px]:text-sm max-[767px]:leading-6">
              {service?.heroDescription}
            </p>
            <Link
              href={contactHref}
              className={`${tealButton} mt-8 px-6 max-[767px]:mt-6 max-[767px]:h-11 max-[767px]:min-h-11 max-[767px]:w-full max-[767px]:text-[15px]`}
            >
              {copy?.cta || 'Discuss a Business Matter'}
              <img
                src={assetSrc(arrow)}
                alt=""
                width="12"
                height="12"
                className={`h-3 w-3 transition-transform duration-300 group-hover:translate-x-1 ${isArabic ? 'rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0' : ''}`}
              />
            </Link>
          </div>

          <aside className="flex flex-col gap-3 pt-1 max-[1023px]:pt-0">
            <div className="rounded-[12px] border border-white/10 bg-[rgba(1,19,32,0.55)] px-4 py-3.5 backdrop-blur-[2px]">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border border-gold/55 bg-transparent text-gold">
                  <ScalesIcon className="h-4 w-4" />
                </span>
                <p className="font-abu text-[14px] leading-5 font-bold tracking-[0.04em] text-white uppercase">
                  {presentation.capabilitiesHeading}
                </p>
              </div>
            </div>

            {presentation.capabilitiesTagline ? (
              <div className="rounded-[12px] border border-white/10 bg-[rgba(1,19,32,0.45)] px-4 py-3.5 backdrop-blur-[2px]">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border border-teal/55 bg-transparent text-teal">
                    <ShieldIcon className="h-4 w-4" />
                  </span>
                  <p className="pt-1.5 font-abu text-[14px] leading-6 text-white">{presentation.capabilitiesTagline}</p>
                </div>
              </div>
            ) : null}

            {capabilities.length > 0 ? (
              <div className="rounded-[12px] border border-white/10 bg-[rgba(1,19,32,0.55)] px-4 py-4 backdrop-blur-[2px]">
                <ul className="grid list-none gap-3.5 p-0">
                  {capabilities.map((item, index) => {
                    const Icon = CAPABILITY_ICONS[index % CAPABILITY_ICONS.length]
                    return (
                      <li key={item.id || item.title} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] border border-gold/55 bg-transparent text-gold">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-abu text-[14px] leading-5 font-bold text-white">{item.title}</p>
                          {item.body ? (
                            <p className="mt-1 font-abu text-[13px] leading-5 text-white/85 line-clamp-2">{item.body}</p>
                          ) : null}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  )
}

export default ServiceHero
