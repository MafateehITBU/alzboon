import SiteShell from '@/components/website/SiteShell'
import BlogsHero from '@/components/website/blogs/BlogsHero'
import BlogsListing from '@/components/website/blogs/BlogsListing'

export default function BlogsPageView({
  locale,
  messages,
  contact,
  services = [],
  blogs = [],
  categories = [],
  categorySlug = '',
  page = 1,
  pageCount = 1,
}) {
  const copy = messages.blogs

  return (
    <SiteShell locale={locale} messages={messages} contact={contact} services={services}>
      <BlogsHero locale={locale} copy={copy} />
      <BlogsListing
        locale={locale}
        copy={copy}
        blogs={blogs}
        categories={categories}
        categorySlug={categorySlug}
        page={page}
        pageCount={pageCount}
      />
    </SiteShell>
  )
}
