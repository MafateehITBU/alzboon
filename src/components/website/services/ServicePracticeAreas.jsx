import ServicePracticeAccordion from '@/components/website/services/ServicePracticeAccordion'

function ServicePracticeAreas({ locale = 'en', service, copy }) {
  const areas = service?.practiceAreas || []

  return (
    <section className="bg-white" aria-labelledby="service-practice-title">
      <div className="mx-auto max-w-[1440px] px-[80px] pt-16 pb-20 max-[1439px]:px-10 max-[1023px]:px-8 max-[1023px]:pt-12 max-[1023px]:pb-14 max-[767px]:px-5 max-[767px]:pt-10 max-[767px]:pb-12">
        <p className="flex items-center justify-center gap-4 font-abu text-[13px] leading-4 font-bold tracking-[0.55px] text-gold uppercase">
          <span className="h-px w-8 shrink-0 bg-gold" aria-hidden="true" />
          {copy?.practiceAreasEyebrow || copy?.practiceAreas || 'OUR PRACTICE AREAS'}
          <span className="h-px w-8 shrink-0 bg-gold" aria-hidden="true" />
        </p>
        <h2
          id="service-practice-title"
          className="mx-auto mt-4 max-w-[720px] text-center font-abu text-[34px] leading-[1.2] font-normal tracking-[0.5px] text-ink max-[1439px]:text-[30px] max-[767px]:text-[26px] max-[767px]:tracking-normal"
        >
          {service?.overviewTitle}
        </h2>
        {service?.overviewDescription ? (
          <p className="mx-auto mt-4 max-w-[620px] text-center font-abu text-[16px] leading-6 text-body max-[767px]:text-sm max-[767px]:leading-6">
            {service.overviewDescription}
          </p>
        ) : null}

        <div className="mt-12 grid grid-cols-[minmax(0,0.85fr)_minmax(280px,1.05fr)] items-start gap-12 max-[1023px]:mt-10 max-[1023px]:grid-cols-1 max-[1023px]:gap-8">
          <ServicePracticeAccordion items={areas} locale={locale} />

          {service?.practiceAreaUrl ? (
            <div className="mx-auto w-full max-w-[520px] p-3 max-[1023px]:max-w-[560px]">
              <div className="relative rounded-lg bg-[#f2f2f2] shadow-[0_18px_40px_rgba(1,19,32,0.1)]">
                <span
                  className="pointer-events-none absolute -top-3 -left-3 h-16 w-16 rounded-tl-lg border-t-2 border-l-2 border-gold"
                  aria-hidden="true"
                />
                <span
                  className="pointer-events-none absolute -right-3 -bottom-3 h-16 w-16 rounded-br-lg border-r-2 border-b-2 border-gold"
                  aria-hidden="true"
                />
                <img
                  src={service.practiceAreaUrl}
                  alt=""
                  width="520"
                  height="624"
                  className="aspect-[5/6] h-auto w-full rounded-lg object-cover"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default ServicePracticeAreas
