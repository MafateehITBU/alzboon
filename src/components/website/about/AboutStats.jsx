'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

function parseStatValue(raw) {
  const text = String(raw || '')
  const numeric = Number(text.replace(/[^\d.]/g, ''))
  const prefix = text.match(/^[^\d]*/)?.[0] || ''
  const suffix = text.match(/[^\d.]*$/)?.[0] || ''
  const useComma = text.includes(',')
  return { numeric: Number.isFinite(numeric) ? numeric : 0, prefix, suffix, useComma }
}

function formatStatValue(value, meta) {
  const rounded = Math.round(value)
  const body = meta.useComma ? rounded.toLocaleString('en-US') : String(rounded)
  return `${meta.prefix}${body}${meta.suffix}`
}

function AboutStats({ copy }) {
  const stats = useMemo(() => copy?.stats || [], [copy?.stats])
  const sectionRef = useRef(null)
  const [displayValues, setDisplayValues] = useState(() => stats.map(() => '0'))
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started || !stats.length) return undefined

    const metas = stats.map((stat) => parseStatValue(stat.value))
    const duration = 1400
    const start = performance.now()
    let frame = 0

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) ** 3
      setDisplayValues(metas.map((meta) => formatStatValue(meta.numeric * eased, meta)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [started, stats])

  return (
    <section
      ref={sectionRef}
      className="relative z-20 -mt-20 bg-transparent max-[1023px]:-mt-16 max-[767px]:-mt-14"
      aria-label="Institutional statistics"
    >
      <div className="mx-auto max-w-[1440px] px-[80px] max-[1439px]:px-10 max-[1023px]:px-8 max-[767px]:px-5">
        <div className="rounded-[16px] bg-white p-4 shadow-[0_16px_40px_rgba(1,19,32,0.14)] max-[767px]:p-3">
          <div className="grid grid-cols-4 gap-3 max-[1023px]:grid-cols-2 max-[767px]:grid-cols-1 max-[767px]:gap-2.5">
            {stats.map((stat, index) => (
              <article
                key={stat.label}
                className="rounded-[12px] bg-[#F3F4F6] pt-3.5 pr-3 pb-4 pl-5 max-[1439px]:pt-3 max-[1439px]:pr-2.5 max-[1439px]:pb-3.5 max-[1439px]:pl-4 max-[767px]:px-4 max-[767px]:py-3.5"
              >
                <p className="font-jakarta text-[13px] font-bold tracking-[0.14em] text-[#6C8793] uppercase max-[767px]:text-[12px]">
                  {stat.label}
                </p>
                <p
                  className={`mt-2 font-abu text-[40px] leading-none font-bold tracking-[-0.03em] max-[1439px]:text-[36px] max-[767px]:text-[32px] ${
                    index === stats.length - 1 ? 'text-[#BBA97A]' : 'text-ink'
                  }`}
                >
                  {displayValues[index] || '0'}
                </p>
                <p className="mt-2 whitespace-nowrap font-abu text-[14px] leading-5 text-[#43474C] max-[767px]:whitespace-normal">
                  {stat.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutStats
