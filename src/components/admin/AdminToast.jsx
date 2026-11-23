'use client'

import { useEffect } from 'react'

export default function AdminToast({ toast, onClose, durationMs = 5000 }) {
  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => onClose?.(), durationMs)
    return () => clearTimeout(timer)
  }, [toast, onClose, durationMs])

  if (!toast?.message) return null

  const success = toast.tone === 'success'

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-5 right-5 z-[60] max-w-md rounded-2xl border px-4 py-3 font-jakarta text-sm shadow-[0_18px_40px_-24px_rgba(1,19,32,0.45)] backdrop-blur-xl ${
        success ? 'border-success/30 bg-white text-success' : 'border-danger/30 bg-white text-danger'
      }`}
    >
      <p className="font-semibold">{success ? 'Success' : 'Error'}</p>
      <p className="mt-1 leading-5 text-ink/80">{toast.message}</p>
    </div>
  )
}
