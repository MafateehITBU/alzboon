'use client'

import { useActionState, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import AdminToast from '@/components/admin/AdminToast'
import { adminTealButton } from '@/components/admin/adminStyles'
import { deleteServiceAction } from '@/app/admin/(workspace)/services/actions'

const inputClass =
  'min-h-11 rounded-xl border border-line/90 bg-white px-3.5 font-jakarta text-sm text-ink shadow-[inset_0_1px_2px_rgba(1,19,32,0.03)] transition-[border-color,box-shadow] duration-200 hover:border-teal/25 focus:border-teal/50 focus:shadow-[0_0_0_4px_rgba(63,131,119,0.12)] focus-visible:outline-none'

const initialState = { ok: false, message: '' }

const NOTICE_MESSAGES = {
  created: 'The service was created successfully.',
  updated: 'The service was updated successfully.',
}

export default function ServicesPanel({ query, listing, loadError, notice = '' }) {
  const router = useRouter()
  const [toast, setToast] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    if (!notice || !NOTICE_MESSAGES[notice]) return
    setToast({ tone: 'success', message: NOTICE_MESSAGES[notice] })
    const params = new URLSearchParams()
    if (query.search) params.set('q', query.search)
    if (query.page > 1) params.set('page', String(query.page))
    const next = params.toString()
    router.replace(next ? `/admin/services?${next}` : '/admin/services')
  }, [notice, query.page, query.search, router])

  function onSaved(result) {
    if (!result?.message) return
    setToast({ tone: result.ok ? 'success' : 'danger', message: result.message })
    if (result.ok) {
      setDeleting(null)
      router.refresh()
    }
  }

  return (
    <div className="grid gap-4">
      <AdminToast toast={toast} onClose={() => setToast(null)} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <form
          className="flex min-w-0 flex-1 flex-wrap gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            const data = new FormData(event.currentTarget)
            const params = new URLSearchParams()
            const q = String(data.get('q') || '').trim()
            if (q) params.set('q', q)
            const next = params.toString()
            router.push(next ? `/admin/services?${next}` : '/admin/services')
          }}
        >
          <label className="sr-only" htmlFor="service-search">
            Search services
          </label>
          <input id="service-search" name="q" defaultValue={query.search} placeholder="Search names" className={`${inputClass} min-w-[12rem] flex-1`} />
          <button type="submit" className={adminTealButton}>
            Filter
          </button>
        </form>
        <Link href="/admin/services/new" className={adminTealButton}>
          <Plus aria-hidden="true" size={16} />
          New service
        </Link>
      </div>

      {loadError ? <p className="rounded-lg border border-danger/30 bg-white p-5 font-jakarta text-sm text-danger">{loadError}</p> : null}
      {!loadError && listing?.services.length === 0 ? (
        <p className="rounded-2xl border border-white/70 bg-white/90 p-5 font-jakarta text-sm text-body shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">No services match these filters.</p>
      ) : null}

      {!loadError && listing?.services.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white/90 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">
            <table className="min-w-full border-collapse text-left">
              <thead className="border-b border-line/70 bg-[#f7f5ef]/70">
                <tr className="font-jakarta text-xs tracking-wide text-muted uppercase">
                  <th className="px-4 py-3 font-semibold">Practice area image</th>
                  <th className="px-4 py-3 font-semibold">Service name</th>
                  <th className="px-4 py-3 font-semibold">Practice area title</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listing.services.map((service) => (
                  <tr key={service.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">
                      <img
                        src={service.practiceAreaUrl}
                        alt=""
                        width="72"
                        height="52"
                        className="h-[52px] w-[72px] rounded-lg object-cover"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-jakarta text-sm font-semibold text-ink">{service.nameEn}</p>
                      <p className="mt-1 font-jakarta text-xs text-body" dir="rtl" lang="ar">
                        {service.nameAr}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-jakarta text-sm text-body">{service.overviewTitleEn || '—'}</p>
                      {service.overviewTitleAr ? (
                        <p className="mt-1 font-jakarta text-xs text-muted" dir="rtl" lang="ar">
                          {service.overviewTitleAr}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/admin/services/${service.id}/edit`} className="inline-flex size-10 items-center justify-center rounded border border-line">
                          <Pencil aria-hidden="true" size={16} />
                          <span className="sr-only">Edit {service.nameEn}</span>
                        </Link>
                        <button type="button" onClick={() => setDeleting(service)} className="inline-flex size-10 items-center justify-center rounded border border-line text-danger">
                          <Trash2 aria-hidden="true" size={16} />
                          <span className="sr-only">Delete {service.nameEn}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {listing.pageCount > 1 ? (
            <div className="flex justify-between gap-3">
              <p className="font-jakarta text-sm text-body">
                Page {listing.page} of {listing.pageCount}
              </p>
              <div className="flex gap-2">
                <button type="button" disabled={listing.page <= 1} onClick={() => goPage(router, query, listing.page - 1)} className="min-h-11 rounded border border-line px-4 disabled:opacity-40">
                  Previous
                </button>
                <button type="button" disabled={listing.page >= listing.pageCount} onClick={() => goPage(router, query, listing.page + 1)} className="min-h-11 rounded border border-line px-4 disabled:opacity-40">
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {deleting ? <DeleteDialog service={deleting} onClose={() => setDeleting(null)} onSaved={onSaved} /> : null}
    </div>
  )
}

function DeleteDialog({ service, onClose, onSaved }) {
  const titleId = useId()
  const [state, formAction, pending] = useActionState(deleteServiceAction, initialState)
  const handled = useRef(null)

  useEffect(() => {
    if (!state?.message || handled.current === state) return
    handled.current = state
    onSaved(state)
  }, [state, onSaved])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4">
      <button type="button" className="absolute inset-0" aria-label="Close dialog" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative z-10 w-full max-w-md rounded-2xl border border-white/80 bg-white/95 p-5 shadow-[0_30px_80px_-36px_rgba(1,19,32,0.5)] backdrop-blur-xl">
        <h2 id={titleId} className="font-abu text-2xl text-ink">
          Delete service
        </h2>
        <p className="mt-3 font-jakarta text-sm leading-6 text-body">
          Delete <span className="font-semibold text-ink">{service.nameEn}</span>?
        </p>
        {state?.message && !state.ok ? <p className="mt-3 font-jakarta text-sm text-danger">{state.message}</p> : null}
        <form action={formAction} className="mt-5 flex justify-end gap-3">
          <input type="hidden" name="serviceId" value={service.id} />
          <button type="button" onClick={onClose} className="min-h-11 rounded border border-line px-4 font-jakarta text-sm">
            Cancel
          </button>
          <button type="submit" disabled={pending} className="min-h-11 rounded bg-danger px-4 font-jakarta text-sm font-semibold text-white disabled:opacity-60">
            {pending ? 'Deleting…' : 'Delete'}
          </button>
        </form>
      </div>
    </div>
  )
}

function goPage(router, query, page) {
  const params = new URLSearchParams()
  if (query.search) params.set('q', query.search)
  if (page > 1) params.set('page', String(page))
  const next = params.toString()
  router.push(next ? `/admin/services?${next}` : '/admin/services')
}
