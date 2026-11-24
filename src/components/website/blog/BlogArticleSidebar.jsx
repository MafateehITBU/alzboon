import Link from 'next/link'
import BlogTableOfContents from '@/components/website/blog/BlogTableOfContents'
import { withLocale } from '@/lib/i18n/paths'
import { goldButton } from '@/components/website/buttonStyles'

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

export default function BlogArticleSidebar({ locale = 'en', copy, blog, headings = [] }) {
  const publishedLabel = formatPublishedOn(blog.publishedOn, locale)

  return (
    <aside className="grid gap-6">
      <div className="rounded-[12px] border border-[rgba(1,19,32,0.08)] bg-white p-5 shadow-[0_14px_32px_-28px_rgba(1,19,32,0.35)]">
        <p className="font-jakarta text-[11px] font-semibold tracking-[0.16em] text-[#BBA97A] uppercase">
          {copy.articleMeta}
        </p>
        <dl className="mt-4 grid gap-3 font-jakarta text-[13px]">
          {blog.categoryName ? (
            <div>
              <dt className="text-muted">{copy.shareCategory}</dt>
              <dd className="mt-1 font-semibold text-ink">{blog.categoryName}</dd>
            </div>
          ) : null}
          {publishedLabel ? (
            <div>
              <dt className="text-muted">{copy.publishedOn}</dt>
              <dd className="mt-1 text-ink">
                <time dateTime={blog.publishedOn}>{publishedLabel}</time>
              </dd>
            </div>
          ) : null}
          {blog.readingMinutes ? (
            <div>
              <dt className="text-muted">{copy.readingTime}</dt>
              <dd className="mt-1 text-ink">
                {blog.readingMinutes} {copy.minRead}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-muted">{copy.by}</dt>
            <dd className="mt-1 font-semibold text-ink">{blog.authorName}</dd>
          </div>
        </dl>
      </div>

      {headings.length ? (
        <div className="rounded-[12px] border border-[rgba(1,19,32,0.08)] bg-white p-5 shadow-[0_14px_32px_-28px_rgba(1,19,32,0.35)]">
          <BlogTableOfContents copy={copy} headings={headings} />
        </div>
      ) : null}

      <div className="rounded-[12px] border border-[rgba(187,169,122,0.35)] bg-[#06252C] p-5 text-white shadow-[0_18px_40px_-28px_rgba(1,19,32,0.55)]">
        <p className="font-jakarta text-[11px] font-semibold tracking-[0.16em] text-[#BBA97A] uppercase">
          {copy.consultLabel}
        </p>
        <p className="mt-3 font-abu text-[20px] leading-7">{copy.consultTitle}</p>
        <p className="mt-2 font-jakarta text-[13px] leading-5 text-white/70">{copy.consultBody}</p>
        <Link
          href={withLocale('/contact', locale)}
          className={`${goldButton} mt-5 w-full px-4 text-[14px] max-[767px]:h-11`}
        >
          {copy.consultPrimary}
        </Link>
      </div>
    </aside>
  )
}
