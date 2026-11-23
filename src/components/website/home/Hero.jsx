import courthouse from '@/assets/images/hero-courthouse.jpg'
import panel from '@/assets/images/hero-diagonal-panel.svg'
import outline from '@/assets/images/hero-split-outline.svg'
import arrow from '@/assets/icons/icon-arrow-right.svg'
import { assetSrc } from '@/lib/utils/assetSrc'
import { outlineButton, tealButton } from '@/components/website/buttonStyles'

const HERO_VIDEO_SRC = '/videos/hero-promo.mp4'

function Hero({ locale = 'en', messages }) {
  const copy = messages?.home?.hero || {}
  const isArabic = locale === 'ar'

  return (
    <section
      className="relative m-0 w-full overflow-hidden bg-cream-deep p-0"
      aria-labelledby="hero-title"
      dir="ltr"
    >
      {/*
        Layout stays LTR so the copy column remains on the photo side.
        Arabic copy uses RTL text direction inside that left column only.
      */}
      <div className="relative h-[700px] w-full max-[1439px]:grid max-[1439px]:h-auto max-[1439px]:min-h-[620px] max-[1439px]:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] max-[1439px]:items-center max-[1023px]:block max-[1023px]:min-h-0">
        <img
          className="absolute top-0 left-0 z-0 h-[700px] w-[790px] object-cover object-center max-[1439px]:h-full max-[1439px]:w-[62%] max-[1023px]:relative max-[1023px]:h-[360px] max-[1023px]:w-full max-[767px]:h-[240px]"
          src={assetSrc(courthouse)}
          alt=""
        />
        <div className="absolute top-0 left-0 z-0 h-[700px] w-[790px] bg-[rgba(32,53,97,0.55)] max-[1439px]:h-full max-[1439px]:w-[62%] max-[1023px]:h-[360px] max-[1023px]:w-full max-[767px]:h-[240px]" />

        <img
          className="pointer-events-none absolute top-px left-[790px] z-[1] h-[700px] w-[650px] max-[1439px]:hidden"
          src={assetSrc(outline)}
          alt=""
        />
        <img
          className="pointer-events-none absolute top-0 left-[679px] z-[1] h-[701px] w-[761px] max-[1439px]:left-[46%] max-[1439px]:h-full max-[1439px]:w-[58%] max-[1023px]:hidden"
          src={assetSrc(panel)}
          alt=""
        />

        <p
          className="pointer-events-none absolute top-[13px] right-2 z-[1] m-0 rotate-[7.26deg] font-georgia text-[300px] leading-[0.78] font-normal text-[rgba(186,168,122,0.2)] select-none max-[1439px]:text-[180px] max-[1023px]:hidden"
          aria-hidden="true"
        >
          30
        </p>

        <div
          className="relative z-[2] w-full max-w-[620px] px-6 pt-[145px] pr-6 pb-[72px] pl-[75px] max-[1439px]:px-5 max-[1439px]:pt-[72px] max-[1439px]:pr-5 max-[1439px]:pb-12 max-[1439px]:pl-10 max-[1023px]:w-full max-[1023px]:max-w-none max-[1023px]:bg-[#071624] max-[1023px]:px-8 max-[1023px]:pt-10 max-[1023px]:pb-2 max-[767px]:px-5 max-[767px]:pt-8"
          lang={isArabic ? 'ar' : 'en'}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <div className={`flex items-center gap-3.5 ${isArabic ? 'flex-row-reverse justify-end' : ''}`}>
            <span className="h-0.5 w-11 bg-gold-deep" />
            <p className="font-abu text-base leading-6 font-normal tracking-[0.5px] text-gold-deep">
              {copy.eyebrow || 'OVER 25 YEARS OF LEGAL EXPERIENCE'}
            </p>
          </div>
          <h1 id="hero-title" className="mt-7 grid font-abu text-[64px] leading-[1.08] font-normal max-[1439px]:text-[48px] max-[1023px]:text-[42px] max-[767px]:text-[34px]">
            <span className="text-ivory">{copy.titleLine1 || 'Legal Expertise.'}</span>
            <span className="text-gold-deep">{copy.titleLine2 || 'Strategic Vision.'}</span>
          </h1>
          <p className="mt-9 max-w-[540px] font-abu text-[20px] leading-[26px] font-normal text-ivory max-[1439px]:text-[18px] max-[767px]:text-base max-[767px]:leading-6">
            {copy.body ||
              'We provide innovative consultancy and effective legal solutions, empowering our clients to achieve sustainable success and protect their intellectual and organizational rights.'}
          </p>
          <div
            className={`mt-12 flex flex-wrap gap-[34px] max-[767px]:mt-8 max-[767px]:gap-2.5 ${isArabic ? 'flex-row-reverse justify-end' : ''}`}
          >
            <a
              className={`${tealButton} w-[157px] px-4 max-[767px]:h-11 max-[767px]:min-h-11 max-[767px]:flex-1 max-[767px]:px-3 max-[767px]:text-[15px] max-[767px]:tracking-normal`}
              href="#consultation"
            >
              {copy.contact || 'Contact Us'}
              <img
                src={assetSrc(arrow)}
                alt=""
                width="12"
                height="12"
                className={`h-3 w-3 transition-transform duration-300 ease-out max-[767px]:h-2.5 max-[767px]:w-2.5 ${isArabic ? 'rotate-180 group-hover:-translate-x-1.5' : 'group-hover:translate-x-1.5'}`}
              />
            </a>
            <button
              type="button"
              className={`${outlineButton} w-[157px] px-4 max-[767px]:h-11 max-[767px]:min-h-11 max-[767px]:flex-1 max-[767px]:px-3 max-[767px]:text-[15px] max-[767px]:tracking-normal`}
            >
              {copy.profile || 'View Our Profile'}
            </button>
          </div>
        </div>

        <div className="absolute top-[220px] left-[820px] z-[2] w-[550px] max-[1439px]:relative max-[1439px]:top-auto max-[1439px]:left-auto max-[1439px]:mt-12 max-[1439px]:mr-7 max-[1439px]:mb-12 max-[1439px]:ml-0 max-[1439px]:w-auto max-[1023px]:mx-auto max-[1023px]:mt-7 max-[1023px]:mb-12 max-[1023px]:w-[calc(100%-64px)] max-[767px]:mb-9 max-[767px]:w-[calc(100%-40px)]">
          <span
            className="absolute top-[101px] -left-[17px] h-[205px] w-1.5 rounded-[3px] bg-teal-deep max-[1439px]:top-[22%] max-[1439px]:h-[46%] max-[767px]:hidden"
            aria-hidden="true"
          />
          <div className="relative h-[400px] w-[550px] overflow-hidden rounded-2xl border-2 border-gold-deep bg-ink max-[1439px]:aspect-[550/400] max-[1439px]:h-auto max-[1439px]:w-full">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={HERO_VIDEO_SRC}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={copy.videoLabel || 'Awwad Alzboon legal consultancy introduction'}
            />
          </div>
          <p
            className="mt-[18px] flex items-center justify-center gap-4 text-center font-abu text-base leading-[26px] font-bold tracking-[4px] text-teal-deep max-[1023px]:text-[13px] max-[1023px]:tracking-[2px] max-[767px]:gap-2 max-[767px]:tracking-[1px]"
            lang={isArabic ? 'ar' : 'en'}
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            <span className="h-[1.5px] w-[75px] shrink-0 bg-gold-deep max-[767px]:w-7" />
            {copy.legacy || 'A LEGACY OF LEGAL EXPERTISE'}
            <span className="h-[1.5px] w-[75px] shrink-0 bg-gold-deep max-[767px]:w-7" />
          </p>
        </div>
      </div>
    </section>
  )
}

export default Hero
