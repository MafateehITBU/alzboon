import portrait from '@/assets/images/expertise-portrait.jpg'
import governance from '@/assets/icons/icon-governance.svg'
import crossBorder from '@/assets/icons/icon-cross-border.svg'
import { assetSrc } from '@/lib/utils/assetSrc'

function Expertise({ messages }) {
  const copy = messages?.home?.expertise || {}

  return (
    <section
      className="bg-white px-[75px] py-24 max-[1439px]:px-10 max-[1023px]:px-8 max-[1023px]:py-14 max-[767px]:px-5 max-[767px]:py-12"
      aria-labelledby="expertise-title"
    >
      <div className="grid w-full grid-cols-[minmax(280px,505px)_minmax(0,727px)] items-center gap-12 max-[1023px]:grid-cols-1">
        <div className="p-3">
          <div className="relative h-[480px] rounded-lg bg-[#f2f2f2] shadow-portrait max-[1023px]:h-[420px] max-[767px]:h-[320px]">
            <span className="pointer-events-none absolute -top-3 -left-3 h-16 w-16 rounded-tl-lg border-t-2 border-l-2 border-gold" />
            <span className="pointer-events-none absolute -right-3 -bottom-3 h-16 w-16 rounded-br-lg border-r-2 border-b-2 border-gold" />
            <img
              src={assetSrc(portrait)}
              alt={copy.portraitAlt || 'Counsel reviewing documents at a desk'}
              className="h-full w-full rounded-lg object-cover object-[center_30%] mix-blend-multiply"
            />
            <div className="absolute right-4 bottom-4 left-4 rounded-lg border border-white/10 bg-[rgba(248,246,241,0.4)] px-[25px] py-5 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] backdrop-blur-[6px]">
              <p className="font-abu text-xs font-bold tracking-[1.2px] text-gold uppercase">
                {copy.noteLabel || 'Executive Counsel Note'}
              </p>
              <blockquote className="mt-2 font-abu text-base leading-[22px] text-white">
                &quot;{copy.noteQuote || 'Protecting enterprise intellect and operational sovereignty across global markets.'}&quot;
              </blockquote>
              <span className="mt-4 block h-px w-full bg-white/35" aria-hidden="true" />
              <ul className="mt-4 flex list-none items-center justify-between gap-3 p-0">
                <li className="grid gap-0.5">
                  <span className="font-abu text-lg leading-6 font-normal text-white">{copy.wipo || 'WIPO'}</span>
                  <span className="font-abu text-base leading-5 font-normal text-white/90">{copy.wipoSub || 'Registered'}</span>
                </li>
                <li className="shrink-0 text-lg leading-none text-white/55" aria-hidden="true">
                  ·
                </li>
                <li className="grid gap-0.5">
                  <span className="font-abu text-lg leading-6 font-normal text-white">{copy.arbitration || 'Commercial'}</span>
                  <span className="font-abu text-base leading-5 font-normal text-white/90">
                    {copy.arbitrationSub || 'Arbitration'}
                  </span>
                </li>
                <li className="shrink-0 text-lg leading-none text-white/55" aria-hidden="true">
                  ·
                </li>
                <li className="grid gap-0.5">
                  <span className="font-abu text-lg leading-6 font-normal text-white">{copy.countries || '40+'}</span>
                  <span className="font-abu text-base leading-5 font-normal text-white/90">
                    {copy.countriesSub || 'Countries'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <p className="flex items-center gap-3.5 font-abu text-[20px] leading-4 font-bold tracking-[0.55px] text-gold uppercase max-[767px]:text-base max-[767px]:leading-normal">
            <span className="h-[3px] w-10 bg-gold" />
            {copy.eyebrow || 'Authority & Foresight'}
          </p>
          <h2
            id="expertise-title"
            className="mt-[18px] max-w-[560px] font-abu text-[42px] leading-[50px] font-normal tracking-[1px] text-ink-soft max-[1439px]:text-4xl max-[1439px]:leading-[1.2] max-[767px]:text-[30px] max-[767px]:tracking-normal"
          >
            {copy.title || 'Deep Expertise and a Vision for the Future'}
          </h2>
          <p className="mt-[23px] font-abu text-[20px] leading-[29.25px] text-body max-[767px]:text-base max-[767px]:leading-normal">
            {copy.body1 ||
              'With over 25 years of experience in providing successful and diverse consultancy services, we take pride in our ability to offer our clients deep strategic insights that help them make informed decisions to enhance their future growth.'}
          </p>
          <p className="mt-[23px] font-abu text-[20px] leading-[24.38px] text-body max-[767px]:text-base max-[767px]:leading-normal">
            {copy.body2 ||
              'We work closely with each client to understand their unique challenges and needs, enabling us to develop innovative and tailored solutions that align with their goals. From safeguarding nascent industrial inventions to stewarding intricate international trademarks and resolving complex institutional restructuring, our advisory framework is built on uncompromising diligence.'}
          </p>
          <div className="mt-7 grid grid-cols-[repeat(2,minmax(0,327px))] gap-4 max-[1023px]:grid-cols-1">
            <article className="rounded-lg bg-[rgba(248,246,241,0.5)] p-5 shadow-soft">
              <img src={assetSrc(governance)} alt="" width="36" height="36" className="h-9 w-9" />
              <h3 className="mt-3 font-abu text-lg leading-7 font-bold text-ink-soft">
                {copy.governanceTitle || 'Institutional Governance'}
              </h3>
              <p className="mt-1.5 font-abu text-lg leading-6 text-body">
                {copy.governanceBody || 'Robust legal compliance and executive decision safeguarding.'}
              </p>
            </article>
            <article className="rounded-lg bg-paper p-5">
              <img src={assetSrc(crossBorder)} alt="" width="44" height="44" className="h-11 w-11" />
              <h3 className="mt-3 font-abu text-lg leading-7 font-bold text-ink-soft">
                {copy.crossBorderTitle || 'Cross-Border Protection'}
              </h3>
              <p className="mt-1.5 font-abu text-lg leading-6 text-body">
                {copy.crossBorderBody || 'Madrid Protocol, PCT national phase filings, and multi-region enforcement.'}
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Expertise
