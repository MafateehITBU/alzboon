function Approach({ messages }) {
  const copy = messages?.home?.approach || {}
  const steps = copy.steps || [
    { number: '01', title: 'Fully Aligned With Our Clients' },
    { number: '02', title: 'Highest Quality, Faster and More Reliable' },
    { number: '03', title: 'The Future of Legal Practice' },
  ]
  const statement =
    copy.statement ||
    'Traditional law firms are structured around billing hours. Our model is structured around client outcomes.'

  return (
    <section className="m-0 w-full bg-cream p-0" aria-labelledby="approach-title">
      <div className="min-h-[570px] w-full px-[75px] pt-16 pb-[72px] max-[1439px]:min-h-0 max-[1439px]:px-10 max-[1023px]:px-8 max-[1023px]:pt-12 max-[1023px]:pb-14 max-[767px]:px-5 max-[767px]:pt-10 max-[767px]:pb-12">
        <p className="font-abu text-[18px] leading-8 text-[#252525] uppercase max-[767px]:text-[16px] max-[767px]:leading-[1.4]">
          {copy.eyebrow || 'Our Approach'}
        </p>
        <h2
          id="approach-title"
          className="max-w-[465px] font-abu text-[34px] leading-[1.2] font-normal text-heading max-[1439px]:text-[30px] max-[1439px]:leading-[1.2] max-[767px]:text-[26px] max-[767px]:leading-[1.35]"
        >
          {copy.title || 'A different kind of law firm, built for global institutions.'}
        </h2>
        <span className="mt-[22px] block h-[3px] w-40 bg-gold-deep" />
        <div className="mt-[42px] grid w-full grid-cols-3 justify-between gap-10 max-[1023px]:max-w-[520px] max-[1023px]:grid-cols-1">
          {steps.map((step) => (
            <article key={step.number}>
              <p className="font-abu text-[36px] leading-10 font-bold text-[rgba(186,168,122,0.6)]">{step.number}</p>
              <h3 className="mt-4 max-w-[280px] font-abu text-[25px] leading-[30px] font-normal text-[#1b1c1c] max-[767px]:max-w-none max-[767px]:text-[20px] max-[767px]:leading-[1.4]">
                {step.title}
              </h3>
              <p className="mt-4 font-abu text-[17px] leading-[25px] text-copy max-[767px]:text-[15px] max-[767px]:leading-[1.45]">
                {statement}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Approach
