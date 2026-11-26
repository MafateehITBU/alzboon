import award from '@/assets/icons/icon-award.svg'
import star from '@/assets/icons/icon-star.svg'
import nexacore from '@/assets/images/testimonial-nexacore.png'
import aurelia from '@/assets/images/testimonial-aurelia.png'
import meridian from '@/assets/images/testimonial-meridian.png'
import { assetSrc } from '@/lib/utils/assetSrc'
import MobileAutoCarousel from '@/components/website/MobileAutoCarousel'

const logos = [nexacore, aurelia, meridian]

function ReviewCard({ review }) {
  return (
    <article className="flex h-full min-h-[360px] flex-col rounded-2xl border border-line bg-white p-[33px] shadow-card max-[767px]:min-h-[320px] max-[767px]:p-6">
      <div className="flex gap-1" aria-label="5 stars">
        {Array.from({ length: 5 }, (_, index) => (
          <img
            key={index}
            src={assetSrc(star)}
            alt=""
            width="17"
            height="16"
            className="h-[15.83px] w-[16.67px]"
          />
        ))}
      </div>
      <p className="mt-4 font-abu text-xs leading-[16.5px] tracking-[0.6px] text-muted uppercase">{review.label}</p>
      <blockquote className="mt-3 font-abu text-base leading-[24.38px] text-quote">“{review.quote}”</blockquote>
      <footer className="mt-auto flex items-center gap-3 pt-6">
        <img src={assetSrc(review.logo)} alt="" width="40" height="40" className="h-10 w-10 rounded-lg" />
        <div>
          <p className="font-jakarta text-base leading-6 font-semibold text-ink">{review.company}</p>
          <span className="font-jakarta text-[13px] leading-5 text-muted">{review.descriptor}</span>
        </div>
      </footer>
    </article>
  )
}

function Testimonials({ messages }) {
  const copy = messages?.home?.testimonials || {}
  const reviews = (copy.reviews || []).map((review, index) => ({
    ...review,
    logo: logos[index % logos.length],
  }))

  return (
    <section
      className="bg-white px-20 pt-20 pb-10 max-[1439px]:px-10 max-[1023px]:px-8 max-[1023px]:pt-14 max-[1023px]:pb-6 max-[767px]:px-5 max-[767px]:pt-12 max-[767px]:pb-4"
      aria-labelledby="testimonials-title"
    >
      <div className="mx-auto max-w-[672px] text-center">
        <p className="inline-flex items-center gap-2 rounded-xl bg-[#f1f5f8] px-3 py-1 font-jakarta text-[15px] leading-4 font-bold tracking-[0.4px] text-gold uppercase">
          <img src={assetSrc(award)} alt="" width="13" height="13" className="h-[13px] w-[13px]" />
          {copy.eyebrow || 'Client Validation'}
        </p>
        <h2
          id="testimonials-title"
          className="mt-[18px] font-abu text-[45px] leading-[50px] font-normal tracking-[-1px] text-ink max-[1439px]:text-[38px] max-[1439px]:leading-[1.15] max-[767px]:text-[30px]"
        >
          {copy.title || 'Recognized by Leading Enterprises'}
        </h2>
        <p className="mt-3 font-abu text-[20px] leading-6 text-body-strong">
          {copy.description || 'Over two decades of discretion, landmark resolutions, and fortified brand equity.'}
        </p>
      </div>

      <div className="mx-auto mt-10 hidden max-w-[1280px] grid-cols-[repeat(3,minmax(0,379px))] justify-center gap-6 min-[1024px]:grid">
        {reviews.map((review) => (
          <ReviewCard key={review.company} review={review} />
        ))}
      </div>

      <div className="mx-auto mt-8 max-w-[1280px] min-[1024px]:hidden">
        <MobileAutoCarousel intervalMs={5000} slideClassName="h-full">
          {reviews.map((review) => (
            <ReviewCard key={review.company} review={review} />
          ))}
        </MobileAutoCarousel>
      </div>
    </section>
  )
}

export default Testimonials
