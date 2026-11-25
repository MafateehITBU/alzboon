import BlogsCard from '@/components/website/blogs/BlogsCard'

export default function RelatedBlogs({ locale = 'en', copy, blogs = [] }) {
  if (!blogs.length) return null

  return (
    <section
      className="bg-white px-[80px] py-16 max-[1439px]:px-10 max-[1023px]:px-8 max-[1023px]:py-12 max-[767px]:px-5 max-[767px]:py-10"
      aria-labelledby="related-blogs-title"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <p className="font-jakarta text-[11px] font-semibold tracking-[0.2em] text-[#BBA97A] uppercase">
          <span aria-hidden="true">— </span>
          {copy.relatedEyebrow}
        </p>
        <h2
          id="related-blogs-title"
          className="mt-3 font-abu text-[30px] leading-[1.2] tracking-[-0.02em] text-ink max-[1023px]:text-[26px] max-[767px]:text-[22px]"
        >
          {copy.relatedTitle}
        </h2>

        <div className="mt-10 grid grid-cols-3 gap-6 max-[1279px]:grid-cols-2 max-[767px]:grid-cols-1 max-[767px]:gap-5">
          {blogs.map((blog) => (
            <BlogsCard key={blog.id} locale={locale} blog={blog} copy={copy} />
          ))}
        </div>
      </div>
    </section>
  )
}
