import portrait from '@/assets/images/about-founder.png'
import { assetSrc } from '@/lib/utils/assetSrc'
import {
  AwardIcon,
  GlobeIcon,
  MarkIcon,
  ScalesIcon,
  ShieldIcon,
  ShieldOutlineIcon,
} from '@/components/website/about/aboutIcons'

const CREDENTIAL_ICONS = [ShieldIcon, GlobeIcon, ScalesIcon, MarkIcon]

function AboutFounder({ copy }) {
  const credentials = copy?.credentials || []
  const featured = credentials[0]

  return (
    <section className="bg-white" aria-labelledby="about-founder-title">
      <div className="mx-auto max-w-[1440px] px-[80px] pt-16 pb-20 max-[1439px]:px-10 max-[1023px]:px-8 max-[1023px]:pt-12 max-[1023px]:pb-14 max-[767px]:px-5 max-[767px]:pt-10 max-[767px]:pb-12">
        <div className="grid grid-cols-[minmax(280px,0.92fr)_minmax(0,1.08fr)] items-start gap-14 max-[1023px]:grid-cols-1 max-[1023px]:gap-10">
          <div className="relative max-w-[480px] self-start pb-6 sticky top-24 max-[1023px]:static max-[1023px]:mx-auto max-[1023px]:w-full max-[1023px]:max-w-[420px] max-[1023px]:pb-0">
            <div className="relative overflow-hidden rounded-[22px] bg-ink shadow-[0_18px_40px_rgba(1,19,32,0.12)]">
              <img
                src={assetSrc(portrait)}
                alt={copy?.founderPortraitAlt || 'Counselor Awaad Alzboon, Senior Counsel and Founder'}
                width="522"
                height="653"
                className="aspect-[522/653] h-auto w-full object-cover object-center"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(1,19,32,0.94)] via-[rgba(1,19,32,0.55)] to-transparent px-6 pt-28 pb-6">
                <p className="flex items-center gap-2 font-jakarta text-[11px] font-bold tracking-[0.18em] text-gold uppercase">
                  <ShieldOutlineIcon className="h-3.5 w-3.5 shrink-0 text-gold" />
                  {copy?.founderRole}
                </p>
                <p className="mt-2 font-abu text-[24px] leading-none font-bold text-white max-[767px]:text-[22px]">
                  {copy?.founderName}
                </p>
                <p className="mt-2 max-w-[300px] font-jakarta text-[13px] leading-5 text-white/75">
                  {copy?.founderCredentials}
                </p>
              </div>
            </div>

            {featured ? (
              <div className="absolute -end-3 -bottom-5 z-10 w-[230px] rounded-[12px] bg-white px-3.5 py-3 shadow-[0_14px_34px_rgba(1,19,32,0.16)] max-[1023px]:end-3 max-[767px]:relative max-[767px]:end-auto max-[767px]:bottom-auto max-[767px]:mt-4 max-[767px]:w-full">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-teal text-white">
                    <AwardIcon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-abu text-[14px] leading-5 font-bold text-ink">{featured.title}</p>
                    <p className="mt-0.5 font-abu text-[12px] leading-4 text-[#66707A]">{featured.body}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="min-w-0 pt-1">
            <p className="flex items-center gap-3 font-abu text-[13px] leading-4 font-bold tracking-[0.55px] text-teal uppercase max-[767px]:text-[12px] max-[767px]:leading-normal">
              <span className="h-px w-8 shrink-0 bg-teal" aria-hidden="true" />
              {copy?.founderEyebrow}
            </p>
            <h2
              id="about-founder-title"
              className="mt-[18px] max-w-[560px] font-abu text-[34px] leading-[1.2] font-normal tracking-[0.5px] text-ink-soft max-[1439px]:text-[30px] max-[1439px]:leading-[1.2] max-[767px]:text-[26px] max-[767px]:tracking-normal"
            >
              {copy?.founderHeading}
            </h2>

            <div className="mt-[23px] max-w-[620px] space-y-[23px]">
              <p className="font-abu text-[16px] leading-[26px] text-body max-[767px]:text-sm max-[767px]:leading-normal">{copy?.founderBio1}</p>
              <p className="font-abu text-[16px] leading-[24px] text-body max-[767px]:text-sm max-[767px]:leading-normal">{copy?.founderBio2}</p>
            </div>

            <blockquote className="relative mt-8 overflow-hidden rounded-[16px] bg-[#EEF1F4] px-7 py-7 max-[767px]:px-5 max-[767px]:py-6">
              <span
                className="pointer-events-none absolute top-3 end-5 font-abu text-[72px] leading-none text-gold/35 select-none"
                aria-hidden="true"
              >
                ”
              </span>
              <p className="relative max-w-[540px] font-abu text-[20px] leading-[29.25px] text-ink max-[767px]:text-base max-[767px]:leading-normal">
                {copy?.founderQuote}
              </p>
              <footer className="relative mt-5">
                <cite className="font-abu text-[14px] font-bold text-[#3F4A54] not-italic">
                  — {copy?.founderAttribution}
                </cite>
              </footer>
            </blockquote>

            <div className="mt-10">
              <h3 className="font-jakarta text-[12px] font-semibold tracking-[0.16em] text-[#7A8694] uppercase">
                {copy?.credentialsHeading}
              </h3>
              <ul className="mt-5 grid list-none grid-cols-2 gap-x-8 gap-y-6 p-0 max-[767px]:grid-cols-1 max-[767px]:gap-y-5">
                {credentials.map((item, index) => {
                  const Icon = CREDENTIAL_ICONS[index] || ShieldIcon
                  const tone = index % 2 === 0 ? 'text-teal bg-[rgba(63,131,119,0.1)]' : 'text-gold bg-[rgba(186,168,122,0.14)]'
                  return (
                    <li key={item.title} className="flex items-start gap-3">
                      <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone}`}>
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="font-abu text-[16px] leading-5 font-bold text-ink">{item.title}</p>
                        <p className="mt-1 font-abu text-[13px] leading-5 text-[#66707A]">{item.body}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutFounder
