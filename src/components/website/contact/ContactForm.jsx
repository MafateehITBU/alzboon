'use client'

import { useActionState } from 'react'
import { submitContactAction } from '@/app/(website)/contact/actions'
import { adminFieldClass, adminTealButton, adminTextareaClass } from '@/components/admin/adminStyles'

const initialState = { ok: false, code: '', message: '' }

export default function ContactForm({ locale, messages, services }) {
  const [state, action, pending] = useActionState(submitContactAction, initialState)
  const copy = messages.contact

  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="locale" value={locale} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <label className="grid gap-2 font-jakarta text-sm font-medium text-body">
        {copy.name}
        <input name="name" required className={adminFieldClass} />
      </label>
      <label className="grid gap-2 font-jakarta text-sm font-medium text-body">
        {copy.email}
        <input name="email" type="email" required className={adminFieldClass} />
      </label>
      <div className="grid gap-4 min-[720px]:grid-cols-2">
        <label className="grid gap-2 font-jakarta text-sm font-medium text-body">
          {copy.phone}
          <input name="phone" required className={adminFieldClass} />
        </label>
        <label className="grid gap-2 font-jakarta text-sm font-medium text-body">
          {copy.company}
          <input name="company" required className={adminFieldClass} />
        </label>
      </div>
      <label className="grid gap-2 font-jakarta text-sm font-medium text-body">
        {copy.country}
        <input name="country" required className={adminFieldClass} />
      </label>
      <label className="grid gap-2 font-jakarta text-sm font-medium text-body">
        {copy.service}
        <select name="serviceId" className={adminFieldClass} defaultValue="">
          <option value="">{copy.serviceOptional}</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 font-jakarta text-sm font-medium text-body">
        {copy.message}
        <textarea name="message" required className={adminTextareaClass} />
      </label>

      {state?.message ? (
        <p
          role="status"
          className={`rounded-2xl border px-4 py-3 font-jakarta text-sm ${state.ok ? 'border-success/20 bg-success/5 text-success' : 'border-danger/20 bg-danger/5 text-danger'}`}
        >
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={`${adminTealButton} w-full min-[520px]:w-auto`}>
        {pending ? copy.sending : copy.submit}
      </button>
    </form>
  )
}
