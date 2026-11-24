'use client'

import { useActionState, useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Trash2 } from 'lucide-react'
import AdminListToolbar from '@/components/admin/AdminListToolbar'
import useLiveSearch from '@/components/admin/useLiveSearch'
import { adminFieldClass, adminTealButton } from '@/components/admin/adminStyles'
import {
  deleteEnquiryAction,
  updateEnquiryStatusAction,
} from '@/app/admin/(workspace)/contact-enquiries/actions'

const inputClass = `${adminFieldClass} sm:w-auto`

const initialState = { ok: false, message: '' }

const statusStyles = {
  NEW: 'bg-warning/10 text-warning',
  READ: 'bg-info/10 text-info',
  ARCHIVED: 'bg-muted/15 text-muted',
}

export default function EnquiriesPanel({ query, listing, services, loadError }) {
  const router = useRouter()
  const [toast, setToast] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [status, setStatus] = useState(query.status || '')
  const [serviceId, setServiceId] = useState(query.serviceId || '')

  useEffect(() => {
    setStatus(query.status || '')
    setServiceId(query.serviceId || '')
  }, [query.status, query.serviceId])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const [search, onSearchChange] = useLiveSearch(query.search || '', (value) => {
    const params = new URLSearchParams()
    const trimmed = String(value || '').trim()
    if (trimmed) params.set('q', trimmed)
    if (status) params.set('status', status)
    if (serviceId) params.set('service', serviceId)
    const next = params.toString()
    router.push(next ? `/admin/contact-enquiries?${next}` : '/admin/contact-enquiries')
  })

  function pushFilters({ q = search, nextStatus = status, service = serviceId } = {}) {
    const params = new URLSearchParams()
    const trimmed = String(q || '').trim()
    if (trimmed) params.set('q', trimmed)
    if (nextStatus) params.set('status', nextStatus)
    if (service) params.set('service', service)
    const next = params.toString()
    router.push(next ? `/admin/contact-enquiries?${next}` : '/admin/contact-enquiries')
  }

  function onSaved(result) {
    if (!result?.message) return
    setToast({ tone: result.ok ? 'success' : 'danger', message: result.message })
    if (result.ok) {
      if (result.status && viewing?.id === result.enquiryId) {
        setViewing((current) => (current ? { ...current, status: result.status } : current))
      }
      if (result.message.includes('deleted')) {
        setDeleting(null)
        setViewing(null)
      }
      router.refresh()
    }
  }

  return (
    <div className="grid gap-4">
      {toast ? (
        <p
          role="status"
          className={`rounded-lg border px-4 py-3 font-jakarta text-sm ${
            toast.tone === 'success' ? 'border-success/30 bg-white text-success' : 'border-danger/30 bg-white text-danger'
          }`}
        >
          {toast.message}
        </p>
      ) : null}

      <AdminListToolbar
        searchId="enquiry-search"
        searchLabel="Search enquiries"
        searchPlaceholder="Search contact, service, message, status"
        searchValue={search}
        onSearchChange={onSearchChange}
        filters={
          <>
            <select
              value={status}
              onChange={(event) => {
                const next = event.target.value
                setStatus(next)
                pushFilters({ q: search, nextStatus: next })
              }}
              className={inputClass}
              aria-label="Status"
            >
              <option value="">All statuses</option>
              <option value="NEW">New</option>
              <option value="READ">Read</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <select
              value={serviceId}
              onChange={(event) => {
                const next = event.target.value
                setServiceId(next)
                pushFilters({ q: search, service: next })
              }}
              className={inputClass}
              aria-label="Service"
            >
              <option value="">All services</option>
              <option value="none">No service selected</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </>
        }
      />

      {loadError ? <p className="rounded-lg border border-danger/30 bg-white p-5 font-jakarta text-sm text-danger">{loadError}</p> : null}
      {!loadError && listing?.enquiries.length === 0 ? (
        <p className="rounded-2xl border border-white/70 bg-white/90 p-5 font-jakarta text-sm text-body shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">No enquiries match these filters.</p>
      ) : null}

      {!loadError && listing?.enquiries.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white/90 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">
            <table className="min-w-full border-collapse text-left">
              <thead className="border-b border-line/70 bg-[#f7f5ef]/70">
                <tr className="font-jakarta text-xs tracking-wide text-muted uppercase">
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listing.enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="font-jakarta text-sm font-semibold text-ink">{enquiry.name}</p>
                      <p className="mt-1 font-jakarta text-xs text-body">{enquiry.email}</p>
                      <p className="mt-1 font-jakarta text-xs text-body">{enquiry.phone}</p>
                    </td>
                    <td className="px-4 py-3 font-jakarta text-sm text-body">{enquiry.serviceName}</td>
                    <td className="px-4 py-3 font-jakarta text-sm whitespace-nowrap text-body">{formatDate(enquiry.createdAt)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={enquiry.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setViewing(enquiry)} className="inline-flex size-10 items-center justify-center rounded border border-line">
                          <Eye aria-hidden="true" size={16} />
                          <span className="sr-only">View {enquiry.name}</span>
                        </button>
                        <button type="button" onClick={() => setDeleting(enquiry)} className="inline-flex size-10 items-center justify-center rounded border border-line text-danger">
                          <Trash2 aria-hidden="true" size={16} />
                          <span className="sr-only">Delete {enquiry.name}</span>
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

      {viewing ? <DetailDialog enquiry={viewing} onClose={() => setViewing(null)} onSaved={onSaved} onDelete={() => setDeleting(viewing)} /> : null}
      {deleting ? <DeleteDialog enquiry={deleting} onClose={() => setDeleting(null)} onSaved={onSaved} /> : null}
    </div>
  )
}

function DetailDialog({ enquiry, onClose, onSaved, onDelete }) {
  const titleId = useId()
  const [state, formAction, pending] = useActionState(updateEnquiryStatusAction, initialState)
  const handled = useRef(null)

  useEffect(() => {
    if (!state?.message || handled.current === state) return
    handled.current = state
    onSaved(state)
  }, [state, onSaved])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4">
      <button type="button" className="absolute inset-0" aria-label="Close dialog" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/80 bg-white/95 p-5 shadow-[0_30px_80px_-36px_rgba(1,19,32,0.5)] backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="font-abu text-2xl text-ink">
              {enquiry.name}
            </h2>
            <p className="mt-1 font-jakarta text-sm text-body">Submitted {formatDateTime(enquiry.createdAt)}</p>
          </div>
          <StatusBadge status={enquiry.status} />
        </div>

        <dl className="mt-5 grid gap-3 min-[720px]:grid-cols-2">
          <DetailItem label="Email" value={enquiry.email} />
          <DetailItem label="Phone" value={enquiry.phone} />
          <DetailItem label="Service" value={enquiry.serviceName} />
          <DetailItem label="Status" value={statusLabel(enquiry.status)} />
        </dl>

        <div className="mt-5">
          <p className="font-jakarta text-sm text-body">Message</p>
          <pre className="mt-2 whitespace-pre-wrap rounded border border-line bg-cream px-4 py-3 font-jakarta text-sm leading-6 text-ink">{enquiry.message}</pre>
        </div>

        {state?.message && !state.ok ? <p className="mt-3 font-jakarta text-sm text-danger">{state.message}</p> : null}

        <form action={formAction} className="mt-5 flex flex-wrap gap-2">
          <input type="hidden" name="enquiryId" value={enquiry.id} />
          {['NEW', 'READ', 'ARCHIVED'].map((status) => (
            <button
              key={status}
              type="submit"
              name="status"
              value={status}
              disabled={pending || enquiry.status === status}
              className="min-h-11 rounded border border-line px-4 font-jakarta text-sm font-semibold text-ink disabled:opacity-40"
            >
              Mark {statusLabel(status)}
            </button>
          ))}
        </form>

        <div className="mt-5 flex flex-wrap justify-between gap-3">
          <button type="button" onClick={onDelete} className="min-h-11 rounded border border-danger px-4 font-jakarta text-sm font-semibold text-danger">
            Delete enquiry
          </button>
          <button type="button" onClick={onClose} className={adminTealButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteDialog({ enquiry, onClose, onSaved }) {
  const titleId = useId()
  const [state, formAction, pending] = useActionState(deleteEnquiryAction, initialState)
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
          Delete enquiry
        </h2>
        <p className="mt-3 font-jakarta text-sm leading-6 text-body">
          Delete the enquiry from <span className="font-semibold text-ink">{enquiry.name}</span>?
        </p>
        {state?.message && !state.ok ? <p className="mt-3 font-jakarta text-sm text-danger">{state.message}</p> : null}
        <form action={formAction} className="mt-5 flex justify-end gap-3">
          <input type="hidden" name="enquiryId" value={enquiry.id} />
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

function DetailItem({ label, value }) {
  return (
    <div>
      <dt className="font-jakarta text-xs tracking-wide text-muted uppercase">{label}</dt>
      <dd className="mt-1 font-jakarta text-sm text-ink">{value}</dd>
    </div>
  )
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded px-2 py-1 font-jakarta text-xs font-semibold ${statusStyles[status] || statusStyles.ARCHIVED}`}>
      {statusLabel(status)}
    </span>
  )
}

function statusLabel(status) {
  if (status === 'NEW') return 'New'
  if (status === 'READ') return 'Read'
  if (status === 'ARCHIVED') return 'Archived'
  return status
}

function goPage(router, query, page) {
  const params = new URLSearchParams()
  if (query.search) params.set('q', query.search)
  if (query.status) params.set('status', query.status)
  if (query.serviceId) params.set('service', query.serviceId)
  if (page > 1) params.set('page', String(page))
  const next = params.toString()
  router.push(next ? `/admin/contact-enquiries?${next}` : '/admin/contact-enquiries')
}

function formatDate(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}
