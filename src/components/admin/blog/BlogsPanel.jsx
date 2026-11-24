'use client'

import { useActionState, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import AdminListToolbar from '@/components/admin/AdminListToolbar'
import AdminToast from '@/components/admin/AdminToast'
import CsvImportExport from '@/components/admin/CsvImportExport'
import useLiveSearch from '@/components/admin/useLiveSearch'
import { adminFieldClass, adminTealButton } from '@/components/admin/adminStyles'
import { deleteBlogAction, importBlogsCsvAction } from '@/app/admin/(workspace)/blogs/actions'

const inputClass = `${adminFieldClass} sm:w-auto`

const initialState = { ok: false, message: '' }

const NOTICE_MESSAGES = {
  created: 'The blog was created successfully.',
  updated: 'The blog was updated successfully.',
}

export default function BlogsPanel({ query, listing, categories, loadError, notice = '' }) {
  const router = useRouter()
  const [toast, setToast] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [categoryId, setCategoryId] = useState(query.categoryId || '')
  const [status, setStatus] = useState(query.status || '')

  useEffect(() => {
    setCategoryId(query.categoryId || '')
    setStatus(query.status || '')
  }, [query.categoryId, query.status])

  useEffect(() => {
    if (!notice || !NOTICE_MESSAGES[notice]) return
    setToast({ tone: 'success', message: NOTICE_MESSAGES[notice] })
    const params = new URLSearchParams()
    if (query.search) params.set('q', query.search)
    if (query.categoryId) params.set('category', query.categoryId)
    if (query.status) params.set('status', query.status)
    if (query.page > 1) params.set('page', String(query.page))
    const next = params.toString()
    router.replace(next ? `/admin/blogs?${next}` : '/admin/blogs')
  }, [notice, query.categoryId, query.page, query.search, query.status, router])

  const [search, onSearchChange] = useLiveSearch(query.search || '', (value) => {
    const params = new URLSearchParams()
    const trimmed = String(value || '').trim()
    if (trimmed) params.set('q', trimmed)
    if (categoryId) params.set('category', categoryId)
    if (status) params.set('status', status)
    const next = params.toString()
    router.push(next ? `/admin/blogs?${next}` : '/admin/blogs')
  })

  function pushFilters({ q = search, category = categoryId, nextStatus = status } = {}) {
    const params = new URLSearchParams()
    const trimmed = String(q || '').trim()
    if (trimmed) params.set('q', trimmed)
    if (category) params.set('category', category)
    if (nextStatus) params.set('status', nextStatus)
    const next = params.toString()
    router.push(next ? `/admin/blogs?${next}` : '/admin/blogs')
  }

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

      <AdminListToolbar
        searchId="blog-search"
        searchLabel="Search blogs"
        searchPlaceholder="Search title, author, category, slug"
        searchValue={search}
        onSearchChange={onSearchChange}
        filters={
          <>
            <select
              value={categoryId}
              onChange={(event) => {
                const next = event.target.value
                setCategoryId(next)
                pushFilters({ q: search, category: next })
              }}
              className={inputClass}
              aria-label="Category"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nameEn}
                </option>
              ))}
            </select>
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
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
            </select>
          </>
        }
        actions={
          <>
            <CsvImportExport
              exportHref="/admin/blogs/export"
              importAction={importBlogsCsvAction}
              entityLabel="blogs"
            />
            <Link href="/admin/blogs/new" className={adminTealButton}>
              <Plus aria-hidden="true" size={16} />
              New blog
            </Link>
          </>
        }
      />

      {loadError ? <p className="rounded-lg border border-danger/30 bg-white p-5 font-jakarta text-sm text-danger">{loadError}</p> : null}
      {!loadError && listing?.blogs.length === 0 ? (
        <p className="rounded-2xl border border-white/70 bg-white/90 p-5 font-jakarta text-sm text-body shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">No blogs match these filters.</p>
      ) : null}

      {!loadError && listing?.blogs.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white/90 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">
            <table className="min-w-full border-collapse text-left">
              <thead className="border-b border-line/70 bg-[#f7f5ef]/70">
                <tr className="font-jakarta text-xs tracking-wide text-muted uppercase">
                  <th className="px-4 py-3 font-semibold">Blog</th>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Author</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Publish date</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listing.blogs.map((blog) => (
                  <tr key={blog.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={blog.featuredUrl} alt="" width="56" height="40" className="h-10 w-14 rounded object-cover" />
                        <div>
                          <p className="font-jakarta text-sm font-semibold text-ink">{blog.titleEn}</p>
                          <p className="mt-1 font-jakarta text-xs text-body" dir="rtl" lang="ar">
                            {blog.titleAr}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[240px] px-4 py-3 font-jakarta text-sm text-body">
                      <p className="line-clamp-2">{blog.descriptionEn || '—'}</p>
                    </td>
                    <td className="px-4 py-3 font-jakarta text-sm text-body">{blog.categoryName}</td>
                    <td className="px-4 py-3 font-jakarta text-sm text-body">{blog.authorName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded px-2 py-1 font-jakarta text-xs font-semibold ${blog.published ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {blog.published ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-jakarta text-sm whitespace-nowrap text-body">{blog.publishedOn}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/admin/blogs/${blog.id}/edit`} className="inline-flex size-10 items-center justify-center rounded border border-line">
                          <Pencil aria-hidden="true" size={16} />
                          <span className="sr-only">Edit {blog.titleEn}</span>
                        </Link>
                        <button type="button" onClick={() => setDeleting(blog)} className="inline-flex size-10 items-center justify-center rounded border border-line text-danger">
                          <Trash2 aria-hidden="true" size={16} />
                          <span className="sr-only">Delete {blog.titleEn}</span>
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

      {deleting ? <DeleteDialog blog={deleting} onClose={() => setDeleting(null)} onSaved={onSaved} /> : null}
    </div>
  )
}

function DeleteDialog({ blog, onClose, onSaved }) {
  const titleId = useId()
  const [state, formAction, pending] = useActionState(deleteBlogAction, initialState)
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
          Delete blog
        </h2>
        <p className="mt-3 font-jakarta text-sm leading-6 text-body">
          Delete <span className="font-semibold text-ink">{blog.titleEn}</span>?
        </p>
        {state?.message && !state.ok ? <p className="mt-3 font-jakarta text-sm text-danger">{state.message}</p> : null}
        <form action={formAction} className="mt-5 flex justify-end gap-3">
          <input type="hidden" name="blogId" value={blog.id} />
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
  if (query.categoryId) params.set('category', query.categoryId)
  if (query.status) params.set('status', query.status)
  if (page > 1) params.set('page', String(page))
  const next = params.toString()
  router.push(next ? `/admin/blogs?${next}` : '/admin/blogs')
}
