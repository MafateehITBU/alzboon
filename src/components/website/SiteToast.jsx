'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, CircleAlert, X } from 'lucide-react'

const EXIT_MS = 320

export default function SiteToast({ toast, onClose, durationMs = 5500 }) {
  const [current, setCurrent] = useState(null)
  const [shown, setShown] = useState(false)
  const hideTimer = useRef(null)
  const exitTimer = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  function clearTimers() {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    if (exitTimer.current) clearTimeout(exitTimer.current)
    hideTimer.current = null
    exitTimer.current = null
  }

  function beginExit() {
    setShown(false)
    exitTimer.current = setTimeout(() => {
      setCurrent(null)
      onCloseRef.current?.()
    }, EXIT_MS)
  }

  useEffect(() => {
    if (!toast?.message) return undefined

    clearTimers()
    setCurrent(toast)
    setShown(false)

    const enterFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setShown(true))
    })

    hideTimer.current = setTimeout(() => beginExit(), durationMs)

    return () => {
      cancelAnimationFrame(enterFrame)
      clearTimers()
    }
    // Only re-run when a new toast payload arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, durationMs])

  if (!current?.message) return null

  const success = current.tone === 'success'

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed top-5 end-5 z-[70] w-[min(100%-1.5rem,24rem)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        shown ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-2 scale-[0.98] opacity-0'
      }`}
    >
      <div
        className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white/95 px-4 py-3.5 shadow-[0_22px_50px_-28px_rgba(1,19,32,0.55)] backdrop-blur-xl ${
          success ? 'border-success/35' : 'border-danger/35'
        }`}
      >
        <span
          className={`mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full ${
            success ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          }`}
        >
          {success ? <CheckCircle2 aria-hidden="true" size={18} /> : <CircleAlert aria-hidden="true" size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`font-jakarta text-sm font-semibold ${success ? 'text-success' : 'text-danger'}`}>
            {success ? current.title || 'Success' : current.title || 'Error'}
          </p>
          <p className="mt-1 font-jakarta text-sm leading-5 text-ink/75">{current.message}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            clearTimers()
            beginExit()
          }}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-cream hover:text-ink"
          aria-label="Dismiss"
        >
          <X aria-hidden="true" size={16} />
        </button>
      </div>
    </div>
  )
}
