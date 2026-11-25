import Link from 'next/link'
import SiteShell from '@/components/website/SiteShell'
import { tealButton } from '@/components/website/buttonStyles'
import { withLocale } from '@/lib/i18n/paths'

export default function NotFoundView({ locale = 'en', messages, contact = null, services = [] }) {
  const copy = messages?.notFound || {}
  const homeHref = withLocale('/', locale)

  return (
    <SiteShell locale={locale} messages={messages} contact={contact} services={services}>
      <section
        className="relative overflow-hidden bg-white"
        aria-labelledby="not-found-title"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(187,169,122,0.12),transparent_55%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex min-h-[62vh] w-full max-w-[720px] flex-col items-center justify-center px-6 py-20 text-center max-[767px]:min-h-[56vh] max-[767px]:py-14">
          <div className="relative mb-8 flex h-36 w-36 items-center justify-center max-[767px]:mb-6 max-[767px]:h-28 max-[767px]:w-28">
            <span
              className="absolute inset-0 rounded-full border border-gold/40 bg-[rgba(187,169,122,0.1)] motion-safe:animate-not-found-pulse"
              aria-hidden="true"
            />
            <span
              className="absolute inset-3 rounded-full border border-teal/25"
              aria-hidden="true"
            />
            <p className="relative font-abu text-[56px] leading-none tracking-[-0.04em] text-ink motion-safe:animate-not-found-float max-[767px]:text-[44px]">
              404
            </p>
          </div>

          <div className="motion-safe:animate-not-found-fade">
            <p className="font-jakarta text-[11px] font-semibold tracking-[0.2em] text-gold uppercase">
              {copy.eyebrow || '404'}
            </p>
            <h1
              id="not-found-title"
              className="mt-3 font-abu text-[40px] leading-[1.15] font-normal tracking-[-0.03em] text-ink max-[767px]:text-[28px] max-[767px]:tracking-normal"
            >
              {copy.title || 'Page not found'}
            </h1>
            <p className="mx-auto mt-4 max-w-[440px] font-abu text-[16px] leading-6 text-body max-[767px]:text-sm">
              {copy.body || 'The page you requested is not available.'}
            </p>
            <div className="mt-8 flex justify-center">
              <Link href={homeHref} className={`${tealButton} px-6`}>
                {copy.home || 'Return home'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  )
}
