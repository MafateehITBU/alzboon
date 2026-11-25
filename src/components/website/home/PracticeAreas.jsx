import Link from 'next/link'
import curve from '@/assets/images/practice-areas-curve.svg'
import dispute from '@/assets/icons/icon-dispute.svg'
import corporate from '@/assets/icons/icon-corporate.svg'
import regulatory from '@/assets/icons/icon-regulatory.svg'
import arrow from '@/assets/icons/icon-arrow-details.svg'
import { assetSrc } from '@/lib/utils/assetSrc'
import { withLocale } from '@/lib/i18n/paths'
import MobileAutoCarousel from '@/components/website/MobileAutoCarousel'

const icons = [
  { icon: dispute, iconWidth: 24, iconHeight: 26 },
  { icon: corporate, iconWidth: 24, iconHeight: 24 },
  { icon: regulatory, iconWidth: 11, iconHeight: 18 },
]

function PracticeCard({ area, detailsLabel }) {
  return (
    <article
      id={area.id}
      className="flex h-full min-h-[301px] scroll-mt-20 flex-col rounded-lg bg-card p-6 shadow-card"
    >
      <div className="grid h-12 w-12 place-items-center rounded bg-[rgba(63,131,119,0.1)]">
        <img src={assetSrc(area.icon)} alt="" width={area.iconWidth} height={area.iconHeight} />
      </div>
      {area.eyebrow ? (
        <p className="mt-[18px] font-abu text-[13px] leading-4 tracking-[0.55px] text-[#3F8377] uppercase">
          {area.eyebrow}
        </p>
      ) : null}
      <h3
        className={`${area.eyebrow ? 'mt-2.5' : 'mt-[18px]'} font-abu text-[22px] leading-[28px] font-bold tracking-[1.5px] text-ink uppercase max-[767px]:text-[20px] max-[767px]:tracking-[0.5px]`}
      >
        {area.title}
      </h3>
      <p className="mt-3 font-abu text-[15px] leading-[22px] text-body-strong max-[767px]:text-sm max-[767px]:leading-[1.45]">
        {area.body}
      </p>
      {area.href ? (
        <Link
          href={area.href}
          className="mt-auto inline-flex items-center gap-2 pt-[18px] font-abu text-[14px] leading-6 font-bold tracking-[1px] text-gold"
        >
          {detailsLabel}
          <img src={assetSrc(arrow)} alt="" width="11" height="11" className="h-[11px] w-[11px]" />
        </Link>
      ) : (
        <p className="mt-auto inline-flex items-center gap-2 pt-[18px] font-abu text-[14px] leading-6 font-bold tracking-[1px] text-gold">
          {detailsLabel}
          <img src={assetSrc(arrow)} alt="" width="11" height="11" className="h-[11px] w-[11px]" />
        </p>
      )}
    </article>
  )
}

function PracticeAreas({ locale = 'en', messages, services = [] }) {
  const copy = messages?.home?.practice || {}
  const serviceBySlug = new Map(services.map((service) => [service.slug, service]))
  const detailsLabel = messages?.home?.forMoreDetails || 'For more details'

  const areas = (copy.fallbacks || []).map((area, index) => {
    const icon = icons[index % icons.length]
    const linked = serviceBySlug.get(area.id)
    return {
      id: area.id,
      eyebrow: area.eyebrow,
      title: area.title,
      body: area.body,
      icon: icon.icon,
      iconWidth: icon.iconWidth,
      iconHeight: icon.iconHeight,
      href: linked ? withLocale(`/services/${linked.slug}`, locale) : null,
    }
  })

  return (
    <section
      className="relative min-h-[800px] overflow-hidden bg-white px-20 pt-[52px] pb-20 max-[1439px]:min-h-0 max-[1439px]:px-10 max-[1023px]:px-8 max-[1023px]:pt-12 max-[1023px]:pb-14 max-[767px]:px-5 max-[767px]:pt-10 max-[767px]:pb-12"
      aria-labelledby="practice-title"
    >
      <img
        className="pointer-events-none absolute top-[220px] left-1/2 h-auto w-[min(1452px,120%)] -translate-x-1/2 max-[1023px]:hidden"
        src={assetSrc(curve)}
        alt=""
      />
      <div className="relative z-[1] mx-auto max-w-[1280px]">
        <p className="flex items-center justify-center gap-4 font-abu text-[14px] leading-4 font-bold tracking-[0.55px] text-gold uppercase">
          <span className="h-0.5 w-[30px] bg-gold" />
          {copy.eyebrow || 'Disciplines & Retainers'}
          <span className="h-0.5 w-[30px] bg-gold" />
        </p>
        <h2
          id="practice-title"
          className="mx-auto mt-[18px] max-w-[640px] text-center font-abu text-[44px] leading-[1.15] font-normal tracking-[-0.5px] text-ink max-[1439px]:text-[38px] max-[1023px]:text-[34px] max-[767px]:text-[28px] max-[767px]:tracking-normal"
        >
          {copy.title || 'Awaad Alzboon Legal Practice Areas'}
        </h2>
        <p className="mx-auto mt-[22px] max-w-[494px] text-center font-abu text-[16px] leading-[24px] text-body-strong max-[767px]:text-sm max-[767px]:leading-[1.45]">
          {copy.description ||
            'At Awaad Alzboon Consultancy, we offer a comprehensive range of legal and administrative services, specifically designed to meet the needs of individuals and companies across 12 core disciplines.'}
        </p>
      </div>

      <div className="relative z-[1] mx-auto mt-24 hidden max-w-[1280px] grid-cols-[repeat(3,minmax(0,379px))] items-start justify-center gap-[23px] min-[1024px]:grid">
        {areas.map((area, index) => (
          <div
            key={area.id}
            className={index === 1 ? '-translate-y-8 motion-safe:animate-float-card' : 'translate-y-0'}
          >
            <PracticeCard area={area} detailsLabel={detailsLabel} />
          </div>
        ))}
      </div>

      <div className="relative z-[1] mx-auto mt-12 max-w-[1280px] min-[1024px]:hidden">
        <MobileAutoCarousel intervalMs={4500} slideClassName="h-full">
          {areas.map((area) => (
            <PracticeCard key={area.id} area={area} detailsLabel={detailsLabel} />
          ))}
        </MobileAutoCarousel>
      </div>
    </section>
  )
}

export default PracticeAreas
