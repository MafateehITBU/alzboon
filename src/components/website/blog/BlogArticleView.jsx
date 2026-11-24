import SiteShell from '@/components/website/SiteShell'
import BlogArticleContent from '@/components/website/blog/BlogArticleContent'
import BlogArticleHero from '@/components/website/blog/BlogArticleHero'
import BlogArticleSidebar from '@/components/website/blog/BlogArticleSidebar'
import BlogConsultation from '@/components/website/blog/BlogConsultation'
import BlogTableOfContents from '@/components/website/blog/BlogTableOfContents'
import RelatedBlogs from '@/components/website/blog/RelatedBlogs'
import { extractDocumentHeadings } from '@/lib/blog/headings'

export default function BlogArticleView({
  locale,
  messages,
  contact,
  services = [],
  blog,
  related = [],
}) {
  const copy = messages.blogs
  const headings = extractDocumentHeadings(blog.document)

  return (
    <SiteShell locale={locale} messages={messages} contact={contact} services={services}>
      <BlogArticleHero locale={locale} copy={copy} blog={blog} />

      <section className="scroll-smooth bg-[#f7f9fb] px-[80px] py-14 max-[1439px]:px-10 max-[1023px]:px-8 max-[1023px]:py-10 max-[767px]:px-5 max-[767px]:py-8">
        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-[minmax(0,1fr)_minmax(240px,300px)] items-start gap-12 max-[1023px]:grid-cols-1 max-[1023px]:gap-8">
          <div className="min-w-0">
            {headings.length ? (
              <div className="mb-8 hidden rounded-[12px] border border-[rgba(1,19,32,0.08)] bg-white p-5 max-[1023px]:block">
                <BlogTableOfContents copy={copy} headings={headings} />
              </div>
            ) : null}

            <BlogArticleContent locale={locale} document={blog.document} />

            <div className="mt-10 hidden max-[1023px]:block">
              <BlogArticleSidebar locale={locale} copy={copy} blog={blog} headings={[]} />
            </div>
          </div>

          <div className="sticky top-24 max-[1023px]:hidden">
            <BlogArticleSidebar locale={locale} copy={copy} blog={blog} headings={headings} />
          </div>
        </div>
      </section>

      <RelatedBlogs locale={locale} copy={copy} blogs={related} />
      <BlogConsultation locale={locale} copy={copy} contact={contact} />
    </SiteShell>
  )
}
