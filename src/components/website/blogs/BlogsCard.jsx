import Link from 'next/link'
import { withLocale } from '@/lib/i18n/paths'

function ClockIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 4.5V8l2.25 1.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function BlogsCard({ locale = 'en', blog, copy }) {
  const href = withLocale(`/blogs/${blog.slug}`, locale)
  const isArabic = locale === 'ar'

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[12px] border border-[rgba(1,19,32,0.08)] bg-white shadow-[0_14px_32px_-24px_rgba(1,19,32,0.35)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_-24px_rgba(1,19,32,0.4)]">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-[#0b2c33]">
        {blog.featuredUrl ? (
          <img
            src={blog.featuredUrl}
            alt={blog.title || ''}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(135deg,#0b2c33,#163a43)]" aria-hidden="true" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,37,44,0.18)_0%,rgba(6,37,44,0.08)_40%,rgba(6,37,44,0.35)_100%)]" />

        {blog.categoryName ? (
          <span
            className={`absolute top-3 rounded-[4px] bg-[rgba(6,37,44,0.88)] px-2.5 py-1 font-jakarta text-[10px] font-semibold tracking-[0.08em] text-[#BBA97A] uppercase ${
              isArabic ? 'right-3' : 'left-3'
            }`}
          >
            {blog.categoryName}
          </span>
        ) : null}

        {blog.readingMinutes ? (
          <span
            className={`absolute bottom-3 inline-flex items-center gap-1.5 rounded-full bg-[rgba(6,37,44,0.78)] px-2.5 py-1 font-jakarta text-[11px] font-medium text-white ${
              isArabic ? 'left-3' : 'right-3'
            }`}
          >
            <ClockIcon className="h-3.5 w-3.5" />
            {blog.readingMinutes} {copy.minRead}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col px-5 pt-5 pb-5">
        <h3 className="font-abu text-[22px] leading-7 tracking-[-0.02em] text-ink max-[767px]:text-[20px]">
          <Link href={href} className="transition-colors hover:text-teal">
            {blog.title}
          </Link>
        </h3>

        {blog.excerpt ? (
          <p className="mt-3 line-clamp-3 font-jakarta text-[14px] leading-6 text-body">{blog.excerpt}</p>
        ) : null}

        <div className="mt-auto flex justify-end pt-5">
          <Link
            href={href}
            className="inline-flex items-center gap-2 font-jakarta text-[13px] font-semibold tracking-[0.02em] text-[#BBA97A] transition-colors hover:text-[#a89564]"
          >
            {copy.reviewPrecedent}
            <span aria-hidden="true" className={isArabic ? 'rotate-180' : undefined}>
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  )
}
