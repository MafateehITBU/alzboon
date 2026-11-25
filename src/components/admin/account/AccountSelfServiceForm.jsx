'use client'

import { useActionState, useState } from 'react'
import ImageUploadField from '@/components/admin/ImageUploadField'
import { adminTealButton } from '@/components/admin/adminStyles'
import { permissionLabel, roleLabel } from '@/lib/admin/navigation'
import { PERMISSIONS } from '@/lib/auth/constants'
import {
  changeOwnPasswordAction,
  updateOwnProfileAction,
} from '@/app/admin/(workspace)/account/actions'

const inputClass =
  'min-h-11 w-full rounded-xl border border-line/90 bg-white px-3.5 font-jakarta text-sm text-ink shadow-[inset_0_1px_2px_rgba(1,19,32,0.03)] transition-[border-color,box-shadow] duration-200 hover:border-teal/25 focus:border-teal/50 focus:shadow-[0_0_0_4px_rgba(63,131,119,0.12)] focus-visible:outline-none'

export default function AccountSelfServiceForm({ account }) {
  const permissions = account.role === 'SUPER_ADMIN' ? PERMISSIONS : account.permissions
  const [removeProfile, setRemoveProfile] = useState(false)
  const [profileState, profileAction, profilePending] = useActionState(updateOwnProfileAction, {
    ok: false,
    message: '',
  })
  const [passwordState, passwordAction, passwordPending] = useActionState(changeOwnPasswordAction, {
    ok: false,
    message: '',
  })

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">
        <h2 className="font-abu text-2xl text-ink">Profile information</h2>
        <form action={profileAction} className="mt-4 grid gap-4">
          {profileState?.message ? (
            <p
              role="status"
              className={`rounded-lg border px-4 py-3 font-jakarta text-sm ${
                profileState.ok ? 'border-success/30 bg-cream text-success' : 'border-danger/30 bg-cream text-danger'
              }`}
            >
              {profileState.message}
            </p>
          ) : null}

          <ImageUploadField
            id="photo"
            name="photo"
            label="Profile photo"
            currentUrl={!removeProfile ? account.profileUrl : null}
            previewClassName="size-20 rounded-full object-cover"
            hint="JPEG, PNG, or WebP up to 2 MB. Stored privately."
          />
          {account.profileMediaId ? (
            <label className="flex items-center gap-2 font-jakarta text-sm text-body">
              <input type="checkbox" checked={removeProfile} onChange={(event) => setRemoveProfile(event.target.checked)} />
              Remove current photo
            </label>
          ) : null}
          {removeProfile ? <input type="hidden" name="removeProfile" value="1" /> : null}

          <Field label="Full name" htmlFor="name">
            <input id="name" name="name" required defaultValue={account.name} className={inputClass} />
          </Field>
          <Field label="Email address" htmlFor="email">
            <input id="email" name="email" type="email" required defaultValue={account.email} className={inputClass} />
          </Field>
          <Field label="Phone number" htmlFor="phone">
            <input id="phone" name="phone" defaultValue={account.phone || ''} className={inputClass} />
          </Field>

          <div className="flex flex-wrap justify-end gap-3">
            <button type="submit" disabled={profilePending} className={adminTealButton}>
              {profilePending ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">
        <h2 className="font-abu text-2xl text-ink">Change password</h2>
        <p className="mt-2 font-jakarta text-sm text-body">After a successful change you will be signed out and must sign in again.</p>
        <form action={passwordAction} className="mt-4 grid gap-4">
          {passwordState?.message ? (
            <p role="status" className="rounded-lg border border-danger/30 bg-cream px-4 py-3 font-jakarta text-sm text-danger">
              {passwordState.message}
            </p>
          ) : null}

          <Field label="Current password" htmlFor="currentPassword">
            <input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" className={inputClass} />
          </Field>
          <Field label="New password" htmlFor="password">
            <input id="password" name="password" type="password" required autoComplete="new-password" className={inputClass} />
          </Field>
          <Field label="Confirm new password" htmlFor="confirmPassword">
            <input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" className={inputClass} />
          </Field>
          <p className="font-jakarta text-xs text-body">Use at least 8 characters with uppercase, lowercase, and a number.</p>

          <div className="flex flex-wrap justify-end gap-3">
            <button type="submit" disabled={passwordPending} className={adminTealButton}>
              {passwordPending ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">
        <h2 className="font-abu text-2xl text-ink">Account details</h2>
        <p className="mt-2 font-jakarta text-sm text-body">Role and permissions are managed by Super Admins and cannot be changed here.</p>
        <dl className="mt-4 grid gap-4">
          <Row label="Role" value={roleLabel(account.role)} />
          <Row label="Status" value={account.active ? 'Active' : 'Inactive'} />
          <div>
            <dt className="font-jakarta text-sm text-body">Permissions</dt>
            <dd className="mt-2">
              <ul className="grid gap-1">
                {permissions.map((permission) => (
                  <li key={permission} className="font-jakarta text-base text-ink">
                    {permissionLabel(permission)}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </section>
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

function Row({ label, value }) {
  return (
    <div>
      <dt className="font-jakarta text-sm text-body">{label}</dt>
      <dd className="mt-1 font-jakarta text-base break-all text-ink">{value}</dd>
    </div>
  )
}
