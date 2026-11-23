'use client'

import { Children, useEffect, useRef, useState } from 'react'

/**
 * Mobile/tablet horizontal carousel with scroll-snap and auto-advance.
 * Hidden on desktop via parent layout; only mounts behavior when visible.
 */
function MobileAutoCarousel({ children, intervalMs = 4500, className = '', slideClassName = '' }) {
  const items = Children.toArray(children)
  const scrollerRef = useRef(null)
  const [active, setActive] = useState(0)
  const pausedRef = useRef(false)
  const activeRef = useRef(0)

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || items.length < 2) return undefined

    function onScroll() {
      const slides = Array.from(scroller.children)
      if (!slides.length) return
      const center = scroller.scrollLeft + scroller.clientWidth / 2
      let nearest = 0
      let best = Number.POSITIVE_INFINITY
      slides.forEach((slide, index) => {
        const mid = slide.offsetLeft + slide.offsetWidth / 2
        const distance = Math.abs(mid - center)
        if (distance < best) {
          best = distance
          nearest = index
        }
      })
      setActive(nearest)
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [items.length])

  useEffect(() => {
    if (items.length < 2) return undefined

    const timer = window.setInterval(() => {
      if (pausedRef.current) return
      const scroller = scrollerRef.current
      if (!scroller) return
      const next = (activeRef.current + 1) % items.length
      const slide = scroller.children[next]
      if (!slide) return
      scroller.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' })
      setActive(next)
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [items.length, intervalMs])

  function pause() {
    pausedRef.current = true
  }

  function resume() {
    pausedRef.current = false
  }

  function goTo(index) {
    const scroller = scrollerRef.current
    const slide = scroller?.children[index]
    if (!slide) return
    scroller.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' })
    setActive(index)
  }

  return (
    <div className={className}>
      <div
        ref={scrollerRef}
        dir="ltr"
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onPointerDown={pause}
        onTouchStart={pause}
        onPointerUp={resume}
        onTouchEnd={resume}
        onMouseEnter={pause}
        onMouseLeave={resume}
      >
        {items.map((child, index) => (
          <div key={index} className={`w-[min(100%,320px)] shrink-0 snap-center ${slideClassName}`}>
            {child}
          </div>
        ))}
      </div>
      {items.length > 1 ? (
        <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Slides">
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2.5 rounded-full transition-[width,background-color] duration-300 ${
                active === index ? 'w-6 bg-teal' : 'w-2.5 bg-line'
              }`}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default MobileAutoCarousel
