'use client'

import { Search } from 'lucide-react'
import { adminFieldClass } from '@/components/admin/adminStyles'

export const adminListToolbarClass =
  'flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm sm:p-3.5'

export const adminSearchInputClass = `${adminFieldClass} pe-3.5 ps-10`

/**
 * Shared admin list toolbar: live search (no Filter button) + optional filters + actions.
 */
export default function AdminListToolbar({
  searchId,
  searchLabel = 'Search',
  searchPlaceholder = 'Search',
  searchValue,
  onSearchChange,
  filters = null,
  actions = null,
}) {
  return (
    <div className={adminListToolbarClass}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block min-w-0 flex-1 sm:max-w-md">
            <span className="sr-only">{searchLabel}</span>
            <Search
              aria-hidden="true"
              size={16}
              className="pointer-events-none absolute top-1/2 start-3.5 -translate-y-1/2 text-muted"
            />
            <input
              id={searchId}
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className={adminSearchInputClass}
              autoComplete="off"
            />
          </label>
          {filters}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2 lg:justify-end">{actions}</div> : null}
      </div>
    </div>
  )
}
