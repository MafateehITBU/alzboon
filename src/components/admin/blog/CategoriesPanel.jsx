'use client'

import { useActionState, useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { adminOutlineButton, adminTealButton } from '@/components/admin/adminStyles'
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from '@/app/admin/(workspace)/blog-categories/actions'

const inputClass =
  'min-h-11 w-full rounded-xl border border-line/90 bg-white px-3.5 font-jakarta text-sm text-ink shadow-[inset_0_1px_2px_rgba(1,19,32,0.03)] transition-[border-color,box-shadow] duration-200 hover:border-teal/25 focus:border-teal/50 focus:shadow-[0_0_0_4px_rgba(63,131,119,0.12)] focus-visible:outline-none'

const initialState = { ok: false, message: '' }

export default function CategoriesPanel({ query, listing, loadError }) {
  const router = useRouter()
  const [toast, setToast] = useState(null)
  const [editor, setEditor] = useState(null)
  const [deleting, setDeleting] = useState(null)

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

  return (
    <div className="grid gap-4">
      {toast ? (
        <p role="status" className={`rounded-lg border px-4 py-3 font-jakarta text-sm ${toast.tone === 'success' ? 'border-success/30 bg-white text-success' : 'border-danger/30 bg-white text-danger'}`}>
          {toast.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <form
          className="flex min-w-0 flex-1 flex-wrap gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            const q = String(new FormData(event.currentTarget).get('q') || '').trim()
            router.push(q ? `/admin/blog-categories?q=${encodeURIComponent(q)}` : '/admin/blog-categories')
          }}
        >
          <label className="sr-only" htmlFor="category-search">
            Search categories
          </label>
          <input id="category-search" name="q" defaultValue={query.search} placeholder="Search name or slug" className={`${inputClass} min-w-[12rem] flex-1`} />
          <button type="submit" className={adminTealButton}>
            Filter
          </button>
        </form>
        <button type="button" onClick={() => setEditor({ mode: 'create' })} className={adminTealButton}>
          <Plus aria-hidden="true" size={16} />
          Add category
        </button>
      </div>

      {loadError ? <p className="rounded-lg border border-danger/30 bg-white p-5 font-jakarta text-sm text-danger">{loadError}</p> : null}
      {!loadError && listing?.categories.length === 0 ? (
        <p className="rounded-2xl border border-white/70 bg-white/90 p-5 font-jakarta text-sm text-body shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">No categories match these filters.</p>
      ) : null}

      {!loadError && listing?.categories.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white/90 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">
            <table className="min-w-full border-collapse text-left">
              <thead className="border-b border-line/70 bg-[#f7f5ef]/70">
                <tr className="font-jakarta text-xs tracking-wide text-muted uppercase">
                  <th className="px-4 py-3 font-semibold">English</th>
                  <th className="px-4 py-3 font-semibold">Arabic</th>
                  <th className="px-4 py-3 font-semibold">Slug</th>
                  <th className="px-4 py-3 font-semibold">Blogs</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listing.categories.map((category) => (
                  <tr key={category.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3 font-jakarta text-sm font-semibold text-ink">{category.nameEn}</td>
                    <td className="px-4 py-3 font-jakarta text-sm text-ink" dir="rtl" lang="ar">
                      {category.nameAr}
                    </td>
                    <td className="px-4 py-3 font-jakarta text-sm text-body">{category.slug}</td>
                    <td className="px-4 py-3 font-jakarta text-sm text-body">{category.blogCount}</td>
                    <td className="px-4 py-3 font-jakarta text-sm whitespace-nowrap text-body">{formatDate(category.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setEditor({ mode: 'edit', category })} className="inline-flex size-10 items-center justify-center rounded border border-line">
                          <Pencil aria-hidden="true" size={16} />
                          <span className="sr-only">Edit {category.nameEn}</span>
                        </button>
                        <button type="button" onClick={() => setDeleting(category)} className="inline-flex size-10 items-center justify-center rounded border border-line text-danger">
                          <Trash2 aria-hidden="true" size={16} />
                          <span className="sr-only">Delete {category.nameEn}</span>
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

      {editor ? <CategoryEditor mode={editor.mode} category={editor.category || null} onClose={() => setEditor(null)} onSaved={onSaved} /> : null}
      {deleting ? <DeleteDialog category={deleting} onClose={() => setDeleting(null)} onSaved={onSaved} /> : null}
    </div>
  )
}

function CategoryEditor({ mode, category, onClose, onSaved }) {
  const titleId = useId()
  const action = mode === 'create' ? createCategoryAction : updateCategoryAction
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
          {mode === 'create' ? 'Add category' : `Edit ${category.nameEn}`}
        </h2>
        <form action={formAction} className="mt-5 grid gap-4">
          {mode === 'edit' ? <input type="hidden" name="categoryId" value={category.id} /> : null}
          <div>
            <label htmlFor="nameEn" className="font-jakarta text-sm text-body">
              English name
            </label>
            <input id="nameEn" name="nameEn" required defaultValue={category?.nameEn || ''} className={`${inputClass} mt-1`} />
          </div>
          <div>
            <label htmlFor="nameAr" className="font-jakarta text-sm text-body">
              Arabic name
            </label>
            <input id="nameAr" name="nameAr" required dir="rtl" lang="ar" defaultValue={category?.nameAr || ''} className={`${inputClass} mt-1`} />
          </div>
          <p className="font-jakarta text-xs text-body">The slug is generated on the server from the English name.</p>
          {state?.message && !state.ok ? <p className="font-jakarta text-sm text-danger">{state.message}</p> : null}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className={adminOutlineButton}>
              Cancel
            </button>
            <button type="submit" disabled={pending} className={adminTealButton}>
              {pending ? 'Saving…' : mode === 'create' ? 'Create category' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteDialog({ category, onClose, onSaved }) {
  const titleId = useId()
  const [state, formAction, pending] = useActionState(deleteCategoryAction, initialState)
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
          Delete category
        </h2>
        <p className="mt-3 font-jakarta text-sm leading-6 text-body">
          Delete <span className="font-semibold text-ink">{category.nameEn}</span>? Categories with blogs cannot be deleted.
        </p>
        {category.blogCount > 0 ? (
          <p className="mt-2 font-jakarta text-sm text-warning">This category has {category.blogCount} blog{category.blogCount === 1 ? '' : 's'}.</p>
        ) : null}
        {state?.message && !state.ok ? <p className="mt-3 font-jakarta text-sm text-danger">{state.message}</p> : null}
        <form action={formAction} className="mt-5 flex justify-end gap-3">
          <input type="hidden" name="categoryId" value={category.id} />
          <button type="button" onClick={onClose} className="min-h-11 rounded border border-line px-4 font-jakarta text-sm">
            Cancel
          </button>
          <button type="submit" disabled={pending || category.blogCount > 0} className="min-h-11 rounded bg-danger px-4 font-jakarta text-sm font-semibold text-white disabled:opacity-60">
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
  router.push(next ? `/admin/blog-categories?${next}` : '/admin/blog-categories')
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}
