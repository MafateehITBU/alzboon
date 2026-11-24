'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { withLocale } from '@/lib/i18n/paths'

export default function PrivacyToc({ locale = 'en', copy }) {
  const [activeId, setActiveId] = useState(copy.toc[0]?.id || '')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const nodes = copy.toc
      .map((item) => document.getElementById(item.id))
      .filter(Boolean)
    if (!nodes.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.15, 0.35, 0.6] },
    )

    for (const node of nodes) observer.observe(node)
    return () => observer.disconnect()
  }, [copy.toc])

  return (
    <div className="grid gap-4">
      <div className="rounded-[12px] border border-line bg-white p-4 shadow-[0_10px_30px_-22px_rgba(1,19,32,0.35)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-abu text-[18px] leading-6 text-ink">{copy.tocTitle}</p>
            <p className="mt-1 font-jakarta text-[11px] font-semibold tracking-[0.14em] text-[#8F6E15] uppercase">
              {copy.tocBadge}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-line text-ink min-[1024px]:hidden"
            aria-expanded={open}
            aria-controls="privacy-toc-list"
            onClick={() => setOpen((value) => !value)}
          >
            <ChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} size={18} aria-hidden="true" />
            <span className="sr-only">Toggle sections</span>
          </button>
        </div>

        <nav
          id="privacy-toc-list"
          aria-label={copy.tocTitle}
          className={`${open ? 'mt-4 grid' : 'mt-4 hidden'} gap-1 min-[1024px]:mt-4 min-[1024px]:grid`}
        >
          {copy.toc.map((item) => {
            const active = activeId === item.id
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className={`group flex items-start gap-3 rounded-[8px] border-s-2 px-3 py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${
                  active
                    ? 'border-[#BBA97A] bg-[rgba(187,169,122,0.08)] text-ink'
                    : 'border-transparent text-body hover:bg-[#f7f9fb] hover:text-ink'
                }`}
              >
                <span className={`font-jakarta text-[12px] font-bold ${active ? 'text-[#8F6E15]' : 'text-muted'}`}>
                  {item.number}
                </span>
                <span className="font-jakarta text-[14px] leading-5 font-medium">{item.label}</span>
              </a>
            )
          })}
        </nav>
      </div>

      <aside className="rounded-[12px] border border-[#BBA97A]/35 bg-[#0f1c26] p-5 text-white shadow-[0_18px_40px_-28px_rgba(1,19,32,0.55)]">
        <p className="font-jakarta text-[11px] font-semibold tracking-[0.14em] text-[#BBA97A] uppercase">
          {copy.shieldEyebrow}
        </p>
        <h2 className="mt-2 font-abu text-[22px] leading-7">{copy.shieldTitle}</h2>
        <p className="mt-3 font-jakarta text-[14px] leading-6 text-white/75">{copy.shieldBody}</p>
        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="font-jakarta text-[11px] tracking-[0.12em] text-[#6c8793] uppercase">{copy.shieldMeta}</p>
          <p className="mt-1 font-jakarta text-[13px] font-semibold text-[#BBA97A]">{copy.shieldMetaValue}</p>
        </div>
      </aside>

      <aside className="rounded-[12px] border border-line bg-[#f2f4f6] p-5">
        <h2 className="font-abu text-[20px] leading-7 text-ink">{copy.intakeTitle}</h2>
        <p className="mt-2 font-jakarta text-[14px] leading-6 text-body">{copy.intakeBody}</p>
        <Link
          href={withLocale('/contact', locale)}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-[4px] bg-[#162836] px-4 font-jakarta text-[13px] font-semibold tracking-[0.04em] text-white transition-colors hover:bg-[#0f1c26] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          {copy.intakeCta}
        </Link>
      </aside>
    </div>
  )
}
