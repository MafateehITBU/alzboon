'use client'

import { useActionState, useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import ImageUploadField from '@/components/admin/ImageUploadField'
import { adminDangerButton, adminOutlineButton, adminTealButton } from '@/components/admin/adminStyles'
import { accountInitials, permissionLabel, roleLabel } from '@/lib/admin/navigation'
import { createAdminAction, deleteAdminAction, updateAdminAction } from '@/app/admin/(workspace)/admins/actions'

const PERMISSIONS = [
  'MANAGE_ADMINS',
  'MANAGE_BLOGS',
  'MANAGE_SERVICES',
  'MANAGE_CONTACT_ENQUIRIES',
  'MANAGE_WEBSITE_SETTINGS',
]

const initialState = { ok: false, message: '' }

export default function AdminAccountsPanel({ actor, query, listing, loadError }) {
  const router = useRouter()
  const [toast, setToast] = useState(null)
  const [editor, setEditor] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  function applyFilters(formData) {
    const params = new URLSearchParams()
    const q = String(formData.get('q') || '').trim()
    const role = String(formData.get('role') || '')
    const status = String(formData.get('status') || '')
    if (q) params.set('q', q)
    if (role) params.set('role', role)
    if (status) params.set('status', status)
    const next = params.toString()
    router.push(next ? `/admin/admins?${next}` : '/admin/admins')
  }

  function goToPage(page) {
    const params = new URLSearchParams()
    if (query.search) params.set('q', query.search)
    if (query.role) params.set('role', query.role)
    if (query.status) params.set('status', query.status)
    if (page > 1) params.set('page', String(page))
    const next = params.toString()
    router.push(next ? `/admin/admins?${next}` : '/admin/admins')
  }

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
        <p
          role="status"
          className={`rounded-lg border px-4 py-3 font-jakarta text-sm ${toast.tone === 'success' ? 'border-success/30 bg-white text-success' : 'border-danger/30 bg-white text-danger'}`}
        >
          {toast.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <form
          className="flex min-w-0 flex-1 flex-wrap gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            applyFilters(new FormData(event.currentTarget))
          }}
        >
          <label className="sr-only" htmlFor="admin-search">
            Search admins
          </label>
          <input
            id="admin-search"
            name="q"
            defaultValue={query.search}
            placeholder="Search name or email"
            className="min-h-11 min-w-[12rem] flex-1 rounded border border-line bg-white px-3 font-jakarta text-sm text-ink focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          />
          <label className="sr-only" htmlFor="admin-role">
            Role
          </label>
          <select
            id="admin-role"
            name="role"
            defaultValue={query.role}
            className="min-h-11 rounded-xl border border-line/90 bg-white px-3.5 font-jakarta text-sm text-ink shadow-[inset_0_1px_2px_rgba(1,19,32,0.03)] transition-[border-color,box-shadow] duration-200 hover:border-teal/25 focus:border-teal/50 focus:shadow-[0_0_0_4px_rgba(63,131,119,0.12)] focus-visible:outline-none"
          >
            <option value="">All roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
          </select>
          <label className="sr-only" htmlFor="admin-status">
            Status
          </label>
          <select
            id="admin-status"
            name="status"
            defaultValue={query.status}
            className="min-h-11 rounded-xl border border-line/90 bg-white px-3.5 font-jakarta text-sm text-ink shadow-[inset_0_1px_2px_rgba(1,19,32,0.03)] transition-[border-color,box-shadow] duration-200 hover:border-teal/25 focus:border-teal/50 focus:shadow-[0_0_0_4px_rgba(63,131,119,0.12)] focus-visible:outline-none"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button type="submit" className={adminTealButton}>
            Filter
          </button>
        </form>
        <button type="button" onClick={() => setEditor({ mode: 'create' })} className={adminTealButton}>
          <Plus aria-hidden="true" size={16} />
          Add Admin
        </button>
      </div>

      {loadError ? (
        <p className="rounded-lg border border-danger/30 bg-white p-5 font-jakarta text-sm text-danger">{loadError}</p>
      ) : null}

      {!loadError && listing?.admins.length === 0 ? (
        <p className="rounded-2xl border border-white/70 bg-white/90 p-5 font-jakarta text-sm text-body shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">No admin accounts match these filters.</p>
      ) : null}

      {!loadError && listing?.admins.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white/90 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">
            <table className="min-w-full border-collapse text-left">
              <thead className="border-b border-line/70 bg-[#f7f5ef]/70">
                <tr className="font-jakarta text-xs tracking-wide text-muted uppercase">
                  <th className="px-4 py-3 font-semibold">Admin</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Permissions</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listing.admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar admin={admin} />
                        <div>
                          <p className="font-jakarta text-sm font-semibold text-ink">{admin.name}</p>
                          {admin.isSelf ? <p className="font-jakarta text-xs text-muted">You</p> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-jakarta text-sm break-all text-ink">{admin.email}</p>
                      <p className="mt-1 font-jakarta text-xs text-body">{admin.phone || 'No phone'}</p>
                    </td>
                    <td className="px-4 py-3 font-jakarta text-sm text-ink">{roleLabel(admin.role)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded px-2 py-1 font-jakarta text-xs font-semibold ${admin.active ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {admin.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-jakarta text-xs leading-5 text-body">
                      {admin.role === 'SUPER_ADMIN' ? 'All permissions' : admin.permissions.length ? admin.permissions.map(permissionLabel).join(', ') : 'None'}
                    </td>
                    <td className="px-4 py-3 font-jakarta text-sm whitespace-nowrap text-body">{formatDate(admin.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={!admin.canEdit}
                          onClick={() => setEditor({ mode: 'edit', admin })}
                          className="inline-flex size-10 items-center justify-center rounded border border-line text-ink disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                        >
                          <Pencil aria-hidden="true" size={16} />
                          <span className="sr-only">Edit {admin.name}</span>
                        </button>
                        <button
                          type="button"
                          disabled={!admin.canDelete}
                          onClick={() => setDeleting(admin)}
                          className="inline-flex size-10 items-center justify-center rounded border border-line text-danger disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                        >
                          <Trash2 aria-hidden="true" size={16} />
                          <span className="sr-only">Delete {admin.name}</span>
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
                Page {listing.page} of {listing.pageCount} · {listing.total} accounts
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={listing.page <= 1}
                  onClick={() => goToPage(listing.page - 1)}
                  className="min-h-11 rounded border border-line bg-white px-4 font-jakarta text-sm disabled:opacity-40 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={listing.page >= listing.pageCount}
                  onClick={() => goToPage(listing.page + 1)}
                  className="min-h-11 rounded border border-line bg-white px-4 font-jakarta text-sm disabled:opacity-40 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {editor ? (
        <AdminEditorDialog
          actor={actor}
          mode={editor.mode}
          admin={editor.admin || null}
          onClose={() => setEditor(null)}
          onSaved={onSaved}
        />
      ) : null}

      {deleting ? <DeleteDialog admin={deleting} onClose={() => setDeleting(null)} onSaved={onSaved} /> : null}
    </div>
  )
}

function Avatar({ admin }) {
  if (admin.profileMediaId) {
    return (
      <img
        src={`/admin/media/${admin.profileMediaId}`}
        alt=""
        width="40"
        height="40"
        className="size-10 rounded-full object-cover"
      />
    )
  }

  return (
    <span className="grid size-10 place-items-center rounded-full bg-teal font-jakarta text-sm font-semibold text-white" aria-hidden="true">
      {accountInitials(admin.name)}
    </span>
  )
}

function AdminEditorDialog({ actor, mode, admin, onClose, onSaved }) {
  const titleId = useId()
  const closeRef = useRef(null)
  const action = mode === 'create' ? createAdminAction : updateAdminAction
  const [state, formAction, pending] = useActionState(action, initialState)
  const [role, setRole] = useState(admin?.role || 'ADMIN')
  const [removePhoto, setRemovePhoto] = useState(false)
  const canAssignSuper = actor.role === 'SUPER_ADMIN'
  const canChangeRole = mode === 'create' ? canAssignSuper : Boolean(admin?.canChangeRole)
  const canChangePermissions = mode === 'create' ? true : Boolean(admin?.canChangePermissions)
  const canChangeActive = mode === 'edit' ? Boolean(admin?.canChangeActive) : false

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const handledState = useRef(null)

  useEffect(() => {
    if (!state?.message || handledState.current === state) return
    handledState.current = state
    onSaved(state)
  }, [state, onSaved])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/45 px-4 py-8">
      <button type="button" className="absolute inset-0" aria-label="Close dialog" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/80 bg-white/95 p-5 shadow-[0_30px_80px_-36px_rgba(1,19,32,0.5)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="font-abu text-2xl text-ink">
            {mode === 'create' ? 'Add Admin' : `Edit ${admin.name}`}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center rounded border border-line px-3 font-jakarta text-sm focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            Close
          </button>
        </div>
        <form action={formAction} className="mt-5 grid gap-4">
          {mode === 'edit' ? <input type="hidden" name="adminId" value={admin.id} /> : null}
          <ImageUploadField
            id="admin-photo"
            name="photo"
            label="Profile photo"
            currentUrl={mode === 'edit' && !removePhoto && admin.profileMediaId ? `/admin/media/${admin.profileMediaId}` : null}
            previewClassName="size-20 rounded-full object-cover"
            hint="JPEG, PNG, or WebP up to 2 MB. Stored privately."
          />
          {mode === 'edit' && admin.profileMediaId ? (
            <label className="flex items-center gap-2 font-jakarta text-sm text-body">
              <input type="checkbox" checked={removePhoto} onChange={(event) => setRemovePhoto(event.target.checked)} />
              Remove current photo
            </label>
          ) : null}
          {removePhoto ? <input type="hidden" name="removePhoto" value="1" /> : null}
          <Field label="Full name" htmlFor="admin-name">
            <input id="admin-name" name="name" required defaultValue={admin?.name || ''} className={inputClass} />
          </Field>
          <Field label="Email" htmlFor="admin-email">
            <input id="admin-email" name="email" type="email" required defaultValue={admin?.email || ''} className={inputClass} />
          </Field>
          <Field label="Phone" htmlFor="admin-phone">
            <input id="admin-phone" name="phone" defaultValue={admin?.phone || ''} className={inputClass} />
          </Field>
          <div className="grid gap-4 min-[820px]:grid-cols-2">
            <Field label={mode === 'create' ? 'Password' : 'New password (optional)'} htmlFor="admin-password">
              <input id="admin-password" name="password" type="password" autoComplete="new-password" required={mode === 'create'} className={inputClass} />
            </Field>
            <Field label="Confirm password" htmlFor="admin-confirm">
              <input id="admin-confirm" name="confirmPassword" type="password" autoComplete="new-password" required={mode === 'create'} className={inputClass} />
            </Field>
          </div>
          <Field label="Role" htmlFor="admin-form-role">
            <select
              id="admin-form-role"
              name="role"
              value={role}
              disabled={!canChangeRole && mode === 'edit'}
              onChange={(event) => setRole(event.target.value)}
              className={inputClass}
            >
              <option value="ADMIN">Admin</option>
              {canAssignSuper ? <option value="SUPER_ADMIN">Super Admin</option> : null}
            </select>
            {!canChangeRole && mode === 'edit' ? <input type="hidden" name="role" value={admin.role} /> : null}
          </Field>
          {mode === 'edit' ? (
            <fieldset>
              <legend className="font-jakarta text-sm text-body">Account status</legend>
              {canChangeActive ? (
                <label className="mt-2 flex items-center gap-2 font-jakarta text-sm text-ink">
                  <input type="checkbox" name="active" value="1" defaultChecked={admin.active} />
                  Active
                </label>
              ) : (
                <>
                  <input type="hidden" name="active" value={admin.active ? '1' : '0'} />
                  <p className="mt-2 font-jakarta text-sm text-ink">{admin.active ? 'Active' : 'Inactive'}</p>
                </>
              )}
              {admin.isLastActiveSuperAdmin ? (
                <p className="mt-1 font-jakarta text-xs text-warning">This is the last active Super Admin and cannot be disabled.</p>
              ) : null}
            </fieldset>
          ) : null}
          {role === 'SUPER_ADMIN' ? (
            <p className="rounded border border-line bg-cream px-3 py-2 font-jakarta text-sm text-body">Super Admin receives every permission automatically.</p>
          ) : (
            <fieldset disabled={!canChangePermissions && mode === 'edit'}>
              <legend className="font-jakarta text-sm text-body">Permissions</legend>
              <div className="mt-2 grid gap-2">
                {PERMISSIONS.map((permission) => (
                  <label key={permission} className="flex items-center gap-2 font-jakarta text-sm text-ink">
                    <input
                      type="checkbox"
                      name={`permission_${permission}`}
                      value="1"
                      defaultChecked={admin?.permissions?.includes(permission)}
                    />
                    {permissionLabel(permission)}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {state?.message && !state.ok ? <p className="font-jakarta text-sm text-danger">{state.message}</p> : null}
          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={onClose} className={adminOutlineButton}>
              Cancel
            </button>
            <button type="submit" disabled={pending} className={adminTealButton}>
              {pending ? 'Saving…' : mode === 'create' ? 'Create admin' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteDialog({ admin, onClose, onSaved }) {
  const titleId = useId()
  const [state, formAction, pending] = useActionState(deleteAdminAction, initialState)
  const handledState = useRef(null)

  useEffect(() => {
    if (!state?.message || handledState.current === state) return
    handledState.current = state
    onSaved(state)
  }, [state, onSaved])

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4">
      <button type="button" className="absolute inset-0" aria-label="Close dialog" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative z-10 w-full max-w-md rounded-2xl border border-white/80 bg-white/95 p-5 shadow-[0_30px_80px_-36px_rgba(1,19,32,0.5)] backdrop-blur-xl">
        <h2 id={titleId} className="font-abu text-2xl text-ink">
          Delete admin
        </h2>
        <p className="mt-3 font-jakarta text-sm leading-6 text-body">
          Delete <span className="font-semibold text-ink">{admin.name}</span> ({admin.email})? This also ends their sessions.
        </p>
        {state?.message && !state.ok ? <p className="mt-3 font-jakarta text-sm text-danger">{state.message}</p> : null}
        <form action={formAction} className="mt-5 flex justify-end gap-3">
          <input type="hidden" name="adminId" value={admin.id} />
          <button type="button" onClick={onClose} className={adminOutlineButton}>
            Cancel
          </button>
          <button type="submit" disabled={pending} className={adminDangerButton}>
            {pending ? 'Deleting…' : 'Delete'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="font-jakarta text-sm text-body">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

const inputClass =
  'min-h-11 w-full rounded-xl border border-line/90 bg-white px-3.5 font-jakarta text-sm text-ink shadow-[inset_0_1px_2px_rgba(1,19,32,0.03)] transition-[border-color,box-shadow] duration-200 hover:border-teal/25 focus:border-teal/50 focus:shadow-[0_0_0_4px_rgba(63,131,119,0.12)] focus-visible:outline-none'

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}
