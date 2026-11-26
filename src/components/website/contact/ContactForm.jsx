'use client'

import { useActionState, useEffect, useState } from 'react'
import { submitContactAction } from '@/app/(website)/contact/actions'
import SiteToast from '@/components/website/SiteToast'
import chevron from '@/assets/icons/icon-chevron-down.svg'
import { isValidInternationalPhone } from '@/lib/enquiry/phone'
import { assetSrc } from '@/lib/utils/assetSrc'

const emptyFields = {
  name: '',
  email: '',
  phone: '',
  serviceId: '',
  message: '',
}

const initialState = { ok: false, code: '', message: '', values: emptyFields }

function GoldArrow({ className = 'h-3 w-3' }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M9.13 6.75H0v-1.5h9.13L4.93 1.05 6 0l6 6-6 6-1.07-1.05 4.2-4.2Z" fill="currentColor" />
    </svg>
  )
}

const fieldLabel =
  'font-jakarta text-[11px] font-semibold tracking-[0.12em] text-muted uppercase'

const fieldInput =
  'mt-2 w-full rounded-[4px] border border-line bg-white px-3.5 py-3 font-jakarta text-[15px] leading-5 text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted/70 focus:border-teal focus:shadow-[0_0_0_3px_rgba(63,131,119,0.12)]'

export default function ContactForm({ locale, messages, services = [] }) {
  const [state, action, pending] = useActionState(submitContactAction, initialState)
  const [toast, setToast] = useState(null)
  const [fields, setFields] = useState(emptyFields)
  const copy = messages.contact
  const isArabic = locale === 'ar'
  const serviceOptions = (Array.isArray(services) ? services : [])
    .filter((service) => service?.id && service?.name)
    .map((service) => ({ id: service.id, name: service.name }))

  useEffect(() => {
    if (!state?.message) return
    if (state.ok) {
      setFields(emptyFields)
    } else if (state.values) {
      setFields({
        name: state.values.name || '',
        email: state.values.email || '',
        phone: state.values.phone || '',
        serviceId: state.values.serviceId || '',
        message: state.values.message || '',
      })
    }
    setToast({
      tone: state.ok ? 'success' : 'danger',
      title: state.ok ? copy.toastSuccessTitle || 'Sent' : copy.toastErrorTitle || 'Could not send',
      message: state.message,
    })
  }, [state, copy.toastSuccessTitle, copy.toastErrorTitle])

  function updateField(name, value) {
    setFields((current) => ({ ...current, [name]: value }))
  }

  function onSubmit(event) {
    const phone = fields.phone.trim()
    if (!phone) return
    if (isValidInternationalPhone(phone)) return
    event.preventDefault()
    setToast({
      tone: 'danger',
      title: copy.toastErrorTitle || 'Could not send',
      message: copy.invalidPhone || 'Enter a valid international phone number.',
    })
  }

  return (
    <>
      <SiteToast toast={toast} onClose={() => setToast(null)} />
      <form action={action} onSubmit={onSubmit} className="grid gap-5" noValidate>
        <input type="hidden" name="locale" value={locale} />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

        <div>
          <h2 className="font-abu text-[32px] leading-tight tracking-[-0.4px] text-ink max-[767px]:text-[28px]">
            {copy.formTitle || 'Send an Inquiry'}
          </h2>
          <p className="mt-2 font-jakarta text-[14px] leading-6 text-body">
            {copy.formBody || 'Complete the fields below and our counsel will respond promptly.'}
          </p>
        </div>

        <label className="grid">
          <span className={fieldLabel}>
            {copy.name}
            <span className="text-gold"> *</span>
          </span>
          <input
            name="name"
            required
            autoComplete="name"
            value={fields.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder={copy.namePlaceholder || 'Your full legal name'}
            className={fieldInput}
          />
        </label>

        <div className="grid gap-5 min-[640px]:grid-cols-2">
          <label className="grid">
            <span className={fieldLabel}>
              {copy.email}
              <span className="text-gold"> *</span>
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              value={fields.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder={copy.emailPlaceholder || 'name@company.com'}
              className={fieldInput}
            />
          </label>
          <label className="grid">
            <span className={fieldLabel}>{copy.phone}</span>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={fields.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              placeholder={copy.phonePlaceholder || '+971 50 123 4567'}
              title={copy.phoneHint || 'Use a valid international number starting with + or 00'}
              className={fieldInput}
            />
          </label>
        </div>

        <label className="grid">
          <span className={fieldLabel}>{copy.service}</span>
          <span className="relative mt-2 block">
            <select
              name="serviceId"
              className={`${fieldInput} mt-0 appearance-none pe-10`}
              value={fields.serviceId}
              onChange={(event) => updateField('serviceId', event.target.value)}
              disabled={serviceOptions.length === 0}
            >
              <option value="">
                {serviceOptions.length === 0
                  ? copy.serviceEmpty || 'No services available'
                  : copy.serviceOptional || 'Select a service (optional)'}
              </option>
              {serviceOptions.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            <img
              src={assetSrc(chevron)}
              alt=""
              width="10"
              height="6"
              className="pointer-events-none absolute top-1/2 end-3.5 h-1.5 w-2.5 -translate-y-1/2 opacity-60"
            />
          </span>
        </label>

        <label className="grid">
          <span className={fieldLabel}>
            {copy.message}
            <span className="text-gold"> *</span>
          </span>
          <textarea
            name="message"
            required
            rows={5}
            value={fields.message}
            onChange={(event) => updateField('message', event.target.value)}
            placeholder={copy.messagePlaceholder || 'Briefly describe your matter or objective…'}
            className={`${fieldInput} min-h-[140px] resize-y`}
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-[4px] bg-gold px-5 font-abu text-[17px] font-bold tracking-[0.3px] text-offwhite shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] transition-[background-color,opacity] hover:bg-[#a89564] disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? copy.sending : copy.submit}
          <GoldArrow className={`h-3 w-3 text-offwhite ${isArabic ? 'rotate-180' : ''}`} />
        </button>
      </form>
    </>
  )
}
