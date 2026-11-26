function PhaseIcon({ name }) {
  if (name === 'clock') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.3" />
        <path d="M7 4.2V7l1.8 1.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    )
  }
  if (name === 'layers') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 2.2 12 5.2 7 8.2 2 5.2 7 2.2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M2 7.3 7 10.3 12 7.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 9.4 7 12.4 12 9.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (name === 'scales') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 2.2V11.5M4.2 11.5h5.6M3 5.2h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M3 5.2 1.8 8.4h2.4L3 5.2ZM11 5.2l-1.2 3.2h2.4L11 5.2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.4 7.1 6.1 8.8 9.6 5.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ServiceMethodology({ copy }) {
  const phases = copy?.phases || []

  return (
    <section className="bg-cream" aria-labelledby="service-methodology-title">
      <div className="mx-auto max-w-[1440px] px-[80px] py-20 max-[1439px]:px-10 max-[1023px]:px-8 max-[1023px]:py-14 max-[767px]:px-5 max-[767px]:py-12">
        <p className="text-center font-abu text-[18px] leading-4 font-bold tracking-[1.1px] text-gold uppercase">
          {copy?.eyebrow || 'STRATEGIC METHODOLOGY'}
        </p>
        <h2
          id="service-methodology-title"
          className="mx-auto mt-4 max-w-[760px] text-center font-abu text-[42px] leading-[1.15] font-bold tracking-[1px] text-ink-soft max-[1439px]:text-[36px] max-[767px]:text-[28px] max-[767px]:tracking-normal"
        >
          {copy?.title}
        </h2>
        {copy?.body ? (
          <p className="mx-auto mt-4 max-w-[680px] text-center font-abu text-[18px] leading-6 text-body max-[767px]:text-base max-[767px]:leading-6">
            {copy.body}
          </p>
        ) : null}

        <div className="relative mt-16 max-[1023px]:mt-12">
          <div
            className="pointer-events-none absolute top-[27px] right-0 left-[27px] hidden h-[3px] bg-[linear-gradient(90deg,#BBA97A_0%,#BBA97A_35%,#3F8377_70%,#3F8377_100%)] max-[1023px]:hidden min-[1024px]:block"
            aria-hidden="true"
          />

          <ol className="relative z-[1] grid list-none grid-cols-4 gap-8 p-0 max-[1023px]:grid-cols-2 max-[1023px]:gap-x-6 max-[1023px]:gap-y-10 max-[767px]:grid-cols-1 max-[767px]:gap-8">
            {phases.map((phase, index) => {
              const gold = index % 2 === 0
              return (
                <li key={phase.roman || phase.title} className="text-start">
                  <div className="flex flex-col items-start">
                    <span
                      className={`relative z-[1] inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] font-abu text-[18px] font-bold text-white ${
                        gold ? 'bg-gold' : 'bg-teal'
                      }`}
                    >
                      {phase.roman}
                    </span>

                    <div className="mt-7 w-full">
                      {phase.phase ? (
                        <p className="font-jakarta text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
                          {phase.phase}
                        </p>
                      ) : null}
                      <h3 className="mt-2 font-abu text-[22px] leading-7 font-bold text-ink-soft max-[767px]:text-[20px]">
                        {phase.title}
                      </h3>
                      <p className="mt-3 font-abu text-[15px] leading-6 text-body">{phase.body}</p>
                      {phase.footer ? (
                        <p className="mt-5 inline-flex items-center gap-2 font-jakarta text-[12px] font-medium tracking-[0.02em] text-ink-soft">
                          <span className={gold ? 'text-gold' : 'text-teal'}>
                            <PhaseIcon name={phase.icon} />
                          </span>
                          {phase.footer}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}

export default ServiceMethodology
