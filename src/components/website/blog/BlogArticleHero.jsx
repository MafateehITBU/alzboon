import Link from 'next/link'
import { withLocale } from '@/lib/i18n/paths'
import { HomeIcon } from '@/components/website/contact/contactIcons'

function formatPublishedOn(isoDate, locale) {
  if (!isoDate) return ''
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${isoDate}T00:00:00.000Z`))
  } catch {
    return isoDate
  }
}

function ClockIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 4.5V8l2.25 1.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function BlogArticleHero({ locale = 'en', copy, blog }) {
  const publishedLabel = formatPublishedOn(blog.publishedOn, locale)

  return (
    <header className="bg-[#f7f9fb]">
      <div className="mx-auto w-full max-w-[1280px] px-[80px] pt-12 pb-10 max-[1439px]:px-10 max-[1023px]:px-8 max-[1023px]:pt-10 max-[767px]:px-5 max-[767px]:pt-8 max-[767px]:pb-8">
        <nav
          className="flex flex-wrap items-center gap-1.5 font-jakarta text-[10px] font-medium tracking-[0.14em] uppercase text-body/70"
          aria-label="Breadcrumb"
        >
          <Link
            href={withLocale('/', locale)}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
          >
            <HomeIcon className="h-3.5 w-3.5" />
            {copy.breadcrumbHome}
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={withLocale('/blogs', locale)} className="transition-colors hover:text-ink">
            {copy.breadcrumbCurrent}
          </Link>
          {blog.categoryName ? (
            <>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-[#BBA97A]">{blog.categoryName}</span>
            </>
          ) : null}
        </nav>

        {blog.categoryName ? (
          <p className="mt-8 inline-flex items-center gap-2 font-jakarta text-[11px] font-semibold tracking-[0.18em] text-[#BBA97A] uppercase max-[767px]:mt-6">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#BBA97A]" aria-hidden="true" />
            {blog.categoryName}
          </p>
        ) : null}

        <h1 className="mt-4 max-w-[920px] font-abu text-[48px] leading-[1.12] font-normal tracking-[-0.03em] text-ink max-[1439px]:text-[40px] max-[1023px]:text-[34px] max-[767px]:mt-3 max-[767px]:text-[28px] max-[767px]:tracking-normal">
          {blog.title}
        </h1>

        {blog.excerpt ? (
          <p className="mt-5 max-w-[720px] font-abu text-[18px] leading-7 text-body max-[767px]:mt-4 max-[767px]:text-[16px] max-[767px]:leading-6">
            {blog.excerpt}
          </p>
        ) : null}

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[rgba(1,19,32,0.08)] pt-5 font-jakarta text-[13px] text-body max-[767px]:mt-5">
          <p>
            <span className="text-muted">{copy.by} </span>
            <span className="font-semibold text-ink">{blog.authorName}</span>
          </p>
          {publishedLabel ? (
            <p>
              <span className="text-muted">{copy.publishedOn}: </span>
              <time dateTime={blog.publishedOn}>{publishedLabel}</time>
            </p>
          ) : null}
          {blog.readingMinutes ? (
            <p className="inline-flex items-center gap-1.5">
              <ClockIcon className="h-3.5 w-3.5 text-teal" />
              <span>
                {blog.readingMinutes} {copy.minRead}
              </span>
            </p>
          ) : null}
        </div>

        {blog.featuredUrl ? (
          <figure className="mt-10 overflow-hidden rounded-[14px] border border-[rgba(1,19,32,0.08)] bg-[#0b2c33] shadow-[0_22px_48px_-28px_rgba(1,19,32,0.45)] max-[767px]:mt-8 max-[767px]:rounded-[10px]">
            <img
              src={blog.featuredUrl}
              alt={blog.title || ''}
              className="aspect-[21/9] w-full object-cover max-[1023px]:aspect-[16/9] max-[767px]:aspect-[4/3]"
            />
          </figure>
        ) : null}
      </div>
    </header>
  )
}
