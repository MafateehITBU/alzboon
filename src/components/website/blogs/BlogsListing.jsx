import Link from 'next/link'
import BlogsCard from '@/components/website/blogs/BlogsCard'
import { withLocale } from '@/lib/i18n/paths'

function buildListHref(locale, { categorySlug = '', page } = {}) {
  const base = withLocale('/blogs', locale)
  const params = new URLSearchParams()
  if (categorySlug) params.set('category', categorySlug)
  if (page && page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${base}?${query}` : base
}

export default function BlogsListing({
  locale = 'en',
  copy,
  blogs = [],
  categories = [],
  categorySlug = '',
  page = 1,
  pageCount = 1,
}) {
  const isArabic = locale === 'ar'

  return (
    <section className="bg-[#f7f9fb] px-[80px] py-16 max-[1439px]:px-10 max-[1023px]:px-8 max-[1023px]:py-12 max-[767px]:px-5 max-[767px]:py-10">
      <div className="mx-auto w-full max-w-[1280px]">
        <header className="max-w-[720px]">
          <p className="font-jakarta text-[11px] font-semibold tracking-[0.2em] text-[#BBA97A] uppercase">
            <span aria-hidden="true">— </span>
            {copy.sectionEyebrow}
          </p>
          <h2 className="mt-3 font-abu text-[32px] leading-[1.15] tracking-[-0.02em] text-ink max-[1023px]:text-[28px] max-[767px]:text-[24px]">
            {copy.sectionTitle}
          </h2>
        </header>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href={buildListHref(locale)}
            className={`rounded-full px-3.5 py-1.5 font-jakarta text-xs font-semibold transition-colors ${
              !categorySlug ? 'bg-[#06252C] text-white' : 'bg-white text-body ring-1 ring-[rgba(1,19,32,0.08)] hover:text-ink'
            }`}
          >
            {copy.allCategories}
          </Link>
          {categories.map((category) => {
            const label = isArabic ? category.nameAr : category.nameEn
            const active = categorySlug === category.slug
            return (
              <Link
                key={category.id}
                href={buildListHref(locale, { categorySlug: category.slug })}
                className={`rounded-full px-3.5 py-1.5 font-jakarta text-xs font-semibold transition-colors ${
                  active ? 'bg-[#06252C] text-white' : 'bg-white text-body ring-1 ring-[rgba(1,19,32,0.08)] hover:text-ink'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {blogs.length === 0 ? (
          <p className="mt-10 rounded-[12px] border border-[rgba(1,19,32,0.08)] bg-white p-6 font-jakarta text-sm text-body">
            {copy.empty}
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-3 gap-6 max-[1279px]:grid-cols-2 max-[767px]:grid-cols-1 max-[767px]:gap-5">
            {blogs.map((blog) => (
              <BlogsCard key={blog.id} locale={locale} blog={blog} copy={copy} />
            ))}
          </div>
        )}

        {pageCount > 1 ? (
          <nav className="mt-12 flex items-center justify-between gap-4" aria-label="Pagination">
            {page > 1 ? (
              <Link
                href={buildListHref(locale, { categorySlug, page: page - 1 })}
                className="font-jakarta text-sm font-semibold text-teal transition-colors hover:text-ink"
              >
                {copy.previous}
              </Link>
            ) : (
              <span />
            )}
            <p className="font-jakarta text-xs tracking-[0.08em] text-body uppercase">
              {page} / {pageCount}
            </p>
            {page < pageCount ? (
              <Link
                href={buildListHref(locale, { categorySlug, page: page + 1 })}
                className="font-jakarta text-sm font-semibold text-teal transition-colors hover:text-ink"
              >
                {copy.next}
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </div>
    </section>
  )
}
