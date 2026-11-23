'use client'

import { adminPanelClass, adminTealButton } from '@/components/admin/adminStyles'

export default function AdminError({ reset }) {
  return (
    <div className={`max-w-xl ${adminPanelClass}`}>
      <h1 className="font-abu text-3xl tracking-[-0.02em] text-ink">The admin page could not be loaded</h1>
      <p className="mt-3 font-jakarta text-sm leading-6 text-body">The workspace is still protected. Try the page again.</p>
      <button type="button" onClick={reset} className={`${adminTealButton} mt-5`}>
        Try again
      </button>
    </div>
  )
}
