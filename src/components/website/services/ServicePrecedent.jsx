function ServicePrecedent({ copy }) {
  if (!copy?.title && !copy?.quote) return null

  return (
    <section className="bg-white" aria-labelledby="service-precedent-title">
      <div className="mx-auto max-w-[1440px] px-[80px] py-20 max-[1439px]:px-10 max-[1023px]:px-8 max-[1023px]:py-14 max-[767px]:px-5 max-[767px]:py-12">
        <div className="grid grid-cols-[minmax(280px,0.95fr)_minmax(0,1.05fr)] items-stretch gap-10 max-[1023px]:grid-cols-1 max-[1023px]:gap-8">
          <article className="relative flex min-h-[310px] flex-col overflow-hidden rounded-3xl bg-cream p-[48px] shadow-cta max-[1023px]:p-9 max-[767px]:rounded-2xl max-[767px]:px-5 max-[767px]:py-7">
            <span
              className="pointer-events-none absolute -right-10 -bottom-20 h-80 w-80 rounded-xl bg-[rgba(187,169,122,0.2)] blur-[32px]"
              aria-hidden="true"
            />
            <div className="relative z-[1] flex h-full flex-col">
              <p className="font-abu text-[18px] leading-4 font-bold tracking-[1.1px] text-gold uppercase">
                {copy?.eyebrow || 'LEAD PRECEDENT'}
              </p>
              <h2
                id="service-precedent-title"
                className="mt-4 max-w-[520px] font-abu text-[36px] leading-[42px] font-bold tracking-[1px] text-ink-soft max-[1439px]:text-[32px] max-[1439px]:leading-[1.2] max-[767px]:text-[26px] max-[767px]:tracking-normal"
              >
                {copy?.title}
              </h2>
              {copy?.body ? (
                <p className="mt-3.5 max-w-[480px] font-abu text-[18px] leading-6 text-body">{copy.body}</p>
              ) : null}
              {copy?.attribution ? (
                <p className="mt-auto pt-8 font-abu text-[15px] font-bold text-ink-soft">{copy.attribution}</p>
              ) : null}
            </div>
          </article>

          <div className="flex flex-col justify-center px-2 max-[1023px]:px-0">
            <p className="font-abu text-[13px] font-bold tracking-[0.14em] text-gold uppercase">
              {copy?.trustEyebrow || 'JUDICIAL TRUST'}
            </p>
            {copy?.quote ? (
              <blockquote className="mt-5">
                <p className="font-abu text-[28px] leading-[1.35] font-normal text-ink max-[1439px]:text-[24px] max-[767px]:text-[20px]">
                  “{copy.quote}”
                </p>
                {copy?.quoteAttribution ? (
                  <footer className="mt-6 flex items-center gap-3">
                    <span
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgba(63,131,119,0.12)] font-abu text-sm font-bold text-teal"
                      aria-hidden="true"
                    >
                      AZ
                    </span>
                    <cite className="font-abu text-[14px] leading-5 text-body not-italic">{copy.quoteAttribution}</cite>
                  </footer>
                ) : null}
              </blockquote>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServicePrecedent
