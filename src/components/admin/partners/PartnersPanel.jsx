'use client'

import { useActionState, useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import AdminListToolbar from '@/components/admin/AdminListToolbar'
import CsvImportExport from '@/components/admin/CsvImportExport'
import ImageUploadField from '@/components/admin/ImageUploadField'
import useLiveSearch from '@/components/admin/useLiveSearch'
import { adminFieldClass, adminOutlineButton, adminTealButton } from '@/components/admin/adminStyles'
import {
  createPartnerAction,
  deletePartnerAction,
  importPartnersCsvAction,
  updatePartnerAction,
} from '@/app/admin/(workspace)/partners/actions'

const inputClass = adminFieldClass

const initialState = { ok: false, message: '' }

export default function PartnersPanel({ query, listing, loadError }) {
  const router = useRouter()
  const [toast, setToast] = useState(null)
  const [editor, setEditor] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [search, onSearchChange] = useLiveSearch(query.search || '', (value) => {
    const params = new URLSearchParams()
    const q = value.trim()
    if (q) params.set('q', q)
    const next = params.toString()
    router.push(next ? `/admin/partners?${next}` : '/admin/partners')
  })

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  function onSaved(result) {
    if (!result?.message) return
    setToast({ tone: result.ok ? 'success' : 'danger', message: result.message })
    if (result.ok) {
      setEditor(null)
      setDeleting(null)
      router.refresh()
    }
  }

  function goToPage(page) {
    const params = new URLSearchParams()
    if (query.search) params.set('q', query.search)
    if (page > 1) params.set('page', String(page))
    const next = params.toString()
    router.push(next ? `/admin/partners?${next}` : '/admin/partners')
  }

  return (
    <div className="grid gap-4">
      {toast ? (
        <p
          role="status"
          className={`rounded-lg border px-4 py-3 font-jakarta text-sm ${toast.tone === 'success' ? 'border-success/30 bg-white text-success' : 'border-danger/30 bg-white text-danger'}`}
        >
          {toast.message}
        </p>
      ) : null}

      <AdminListToolbar
        searchId="partner-search"
        searchLabel="Search partners"
        searchPlaceholder="Search partners"
        searchValue={search}
        onSearchChange={onSearchChange}
        actions={
          <>
            <CsvImportExport
              exportHref="/admin/partners/export"
              importAction={importPartnersCsvAction}
              entityLabel="partners"
            />
            <button type="button" onClick={() => setEditor({ mode: 'create' })} className={adminTealButton}>
              <Plus aria-hidden="true" size={16} />
              Add partner
            </button>
          </>
        }
      />

      {loadError ? <p className="rounded-lg border border-danger/30 bg-white p-5 font-jakarta text-sm text-danger">{loadError}</p> : null}
      {!loadError && listing?.partners.length === 0 ? (
        <p className="rounded-2xl border border-white/70 bg-white/90 p-5 font-jakarta text-sm text-body shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">No partners match these filters.</p>
      ) : null}

      {!loadError && listing?.partners.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white/90 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">
            <table className="min-w-full border-collapse text-left">
              <thead className="border-b border-line/70 bg-[#f7f5ef]/70">
                <tr className="font-jakarta text-xs tracking-wide text-muted uppercase">
                  <th className="px-4 py-3 font-semibold">Partner</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listing.partners.map((partner) => (
                  <tr key={partner.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={partner.logoUrl} alt="" width="48" height="48" className="size-12 rounded object-contain" />
                        <p className="font-jakarta text-sm font-semibold text-ink">{partner.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-jakarta text-sm whitespace-nowrap text-body">{formatDate(partner.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditor({ mode: 'edit', partner })}
                          className="inline-flex size-10 items-center justify-center rounded border border-line text-ink focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                        >
                          <Pencil aria-hidden="true" size={16} />
                          <span className="sr-only">Edit {partner.name}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(partner)}
                          className="inline-flex size-10 items-center justify-center rounded border border-line text-danger focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                        >
                          <Trash2 aria-hidden="true" size={16} />
                          <span className="sr-only">Delete {partner.name}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {listing.pageCount > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-jakarta text-sm text-body">
                Page {listing.page} of {listing.pageCount} · {listing.total} partners
              </p>
              <div className="flex gap-2">
                <button type="button" disabled={listing.page <= 1} onClick={() => goToPage(listing.page - 1)} className="min-h-11 rounded border border-line bg-white px-4 font-jakarta text-sm disabled:opacity-40">
                  Previous
                </button>
                <button type="button" disabled={listing.page >= listing.pageCount} onClick={() => goToPage(listing.page + 1)} className="min-h-11 rounded border border-line bg-white px-4 font-jakarta text-sm disabled:opacity-40">
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {editor ? <PartnerEditor mode={editor.mode} partner={editor.partner || null} onClose={() => setEditor(null)} onSaved={onSaved} /> : null}
      {deleting ? <DeleteDialog partner={deleting} onClose={() => setDeleting(null)} onSaved={onSaved} /> : null}
    </div>
  )
}

function PartnerEditor({ mode, partner, onClose, onSaved }) {
  const titleId = useId()
  const action = mode === 'create' ? createPartnerAction : updatePartnerAction
  const [state, formAction, pending] = useActionState(action, initialState)
  const handled = useRef(null)

  useEffect(() => {
    if (!state?.message || handled.current === state) return
    handled.current = state
    onSaved(state)
  }, [state, onSaved])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/45 px-4 py-8">
      <button type="button" className="absolute inset-0" aria-label="Close dialog" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative z-10 w-full max-w-lg rounded-2xl border border-white/80 bg-white/95 p-5 shadow-[0_30px_80px_-36px_rgba(1,19,32,0.5)] backdrop-blur-xl">
        <h2 id={titleId} className="font-abu text-2xl text-ink">
          {mode === 'create' ? 'Add partner' : `Edit ${partner.name}`}
        </h2>
        <form action={formAction} className="mt-5 grid gap-4">
          {mode === 'edit' ? <input type="hidden" name="partnerId" value={partner.id} /> : null}
          <div>
            <label htmlFor="partner-name" className="font-jakarta text-sm text-body">
              Partner name
            </label>
            <input id="partner-name" name="name" required defaultValue={partner?.name || ''} className={`${inputClass} mt-1`} />
          </div>
          <ImageUploadField
            id="partner-logo"
            name="logo"
            label="Partner logo"
            required={mode === 'create'}
            currentUrl={partner?.logoUrl || null}
            previewClassName="size-16 object-contain"
            hint="JPEG, PNG, or WebP up to 2 MB. SVG is not accepted."
          />
          {state?.message && !state.ok ? <p className="font-jakarta text-sm text-danger">{state.message}</p> : null}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className={adminOutlineButton}>
              Cancel
            </button>
            <button type="submit" disabled={pending} className={adminTealButton}>
              {pending ? 'Saving…' : mode === 'create' ? 'Create partner' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteDialog({ partner, onClose, onSaved }) {
  const titleId = useId()
  const [state, formAction, pending] = useActionState(deletePartnerAction, initialState)
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
          Delete partner
        </h2>
        <p className="mt-3 font-jakarta text-sm leading-6 text-body">
          Delete <span className="font-semibold text-ink">{partner.name}</span>? The logo file is removed if nothing else uses it.
        </p>
        {state?.message && !state.ok ? <p className="mt-3 font-jakarta text-sm text-danger">{state.message}</p> : null}
        <form action={formAction} className="mt-5 flex justify-end gap-3">
          <input type="hidden" name="partnerId" value={partner.id} />
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

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}
