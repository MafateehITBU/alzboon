'use client'

import { useId, useState } from 'react'

function ServicePracticeAccordion({ items = [], locale = 'en' }) {
  const baseId = useId()
  const [openId, setOpenId] = useState(null)
  const isArabic = locale === 'ar'

  function toggle(id) {
    setOpenId((current) => (current === id ? null : id))
  }

  return (
    <ul className="mx-auto grid w-full max-w-[460px] list-none gap-4 p-0 max-[1023px]:mx-0 max-[1023px]:max-w-none">
      {items.map((item, index) => {
        const expanded = openId === item.id
        const panelId = `${baseId}-panel-${item.id}`
        const buttonId = `${baseId}-button-${item.id}`
        const number = String(index + 1).padStart(2, '0')

        return (
          <li key={item.id}>
            <div
              className={`group/card relative overflow-hidden rounded-[14px] border border-[#BBA97A] transition-[background-color,box-shadow] duration-300 ease-out ${
                expanded
                  ? 'bg-[#f8f6f1] shadow-[0_10px_24px_rgba(1,19,32,0.06)]'
                  : 'bg-white hover:bg-[#f8f6f1]'
              }`}
            >
              <span
                className={`pointer-events-none absolute inset-y-0 w-[2px] bg-[#BBA97A] transition-opacity duration-300 ease-out ${
                  isArabic ? 'end-0' : 'start-0'
                } ${expanded ? 'opacity-100' : 'opacity-0 group-hover/card:opacity-100'}`}
                aria-hidden="true"
              />

              <button
                id={buttonId}
                type="button"
                className="flex w-full items-start gap-4 px-5 py-5 text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal max-[767px]:px-4 max-[767px]:py-4"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
              >
                <span className="pt-1 font-georgia text-[20px] leading-none text-[#BBA97A] tabular-nums max-[767px]:text-[18px]">
                  {number}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block font-georgia text-[24px] leading-8 transition-colors duration-300 max-[767px]:text-[20px] max-[767px]:leading-7 ${
                      expanded ? 'text-[#171717]' : 'text-[#171717] group-hover/card:text-[#171717]'
                    }`}
                  >
                    {item.title}
                  </span>
                  {item.subtitle ? (
                    <span className="mt-1.5 block font-georgia text-[16px] leading-6 text-[#BBA97A] max-[767px]:text-[15px]">
                      {item.subtitle}
                    </span>
                  ) : null}
                </span>
                <span
                  className={`mt-2 inline-flex shrink-0 text-[#BBA97A] transition-transform duration-300 ease-out ${
                    expanded ? 'rotate-90' : ''
                  } ${isArabic && !expanded ? 'rotate-180' : ''} ${isArabic && expanded ? '-rotate-90' : ''}`}
                  aria-hidden="true"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M5 2.5L9.5 7L5 11.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                  expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="px-5 pb-5 ps-[3.75rem] max-[767px]:px-4 max-[767px]:ps-4">
                    <p className="font-georgia text-[16px] leading-7 text-[#171717] max-[767px]:text-[15px] max-[767px]:leading-6">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default ServicePracticeAccordion
