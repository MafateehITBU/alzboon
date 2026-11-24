'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import logo from '@/assets/images/logo-footer-white.png'
import phoneIcon from '@/assets/icons/icon-phone.svg'
import emailIcon from '@/assets/icons/icon-email.svg'
import location from '@/assets/icons/icon-location.svg'
import { assetSrc } from '@/lib/utils/assetSrc'
import { withLocale } from '@/lib/i18n/paths'
import { subscribeBriefsAction } from '@/app/(website)/newsletter/actions'

const companyItem =
  'mt-2.5 block w-full border-b border-white/5 pb-2 font-abu text-[17px] leading-7 font-normal text-muted'

const fallbackContact = {
  contactEmail: 'info@alzboon.com',
  phones: [{ number: '+971 562511154', href: 'tel:+971562511154' }],
}

function Footer({ locale = 'en', messages, contact = null }) {
  const copy = messages?.home?.footer || {}
  const nav = messages?.nav || {}
  const [state, formAction, pending] = useActionState(subscribeBriefsAction, { ok: false, message: '' })
  const [address, setAddress] = useState('')
  const [message, setMessage] = useState('')
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    if (!state?.message) return
    setMessage(state.message)
    setInvalid(!state.ok)
    if (state.ok) setAddress('')
  }, [state])

  const email = contact?.contactEmail || fallbackContact.contactEmail
  const phones =
    contact?.phones?.length > 0
      ? contact.phones.map((entry) => ({
          number: entry.number,
          href: `tel:${entry.number.replace(/[^\d+]/g, '')}`,
          label: entry.label,
        }))
      : fallbackContact.phones
  const addresses =
    contact?.addresses?.length > 0
      ? contact.addresses.map((entry) => ({
          text: locale === 'ar' ? entry.textAr || entry.textEn : entry.textEn || entry.textAr,
        }))
      : [{ text: copy.address || 'Al Muroor Road, Abu Dhabi, United Arab Emirates' }]

  return (
    <footer className="w-full bg-navy px-[75px] pt-16 pb-8 text-muted max-[1439px]:px-10 max-[1023px]:px-8 max-[1023px]:pt-12 max-[1023px]:pb-7 max-[767px]:px-5 max-[767px]:pt-10 max-[767px]:pb-6">
      <div className="grid w-full grid-cols-[minmax(240px,395px)_minmax(140px,1fr)_minmax(180px,1fr)_minmax(220px,284px)] gap-x-12 gap-y-10 max-[1023px]:grid-cols-2 max-[767px]:grid-cols-1">
        <div>
          <img
            src={assetSrc(logo)}
            alt="Awwad Alzboon Legal Consultancy"
            width="166"
            height="166"
            className="h-[166px] w-[166px] object-contain"
          />
          <p className="mt-4 font-jakarta text-[15px] leading-[24.38px]">
            {copy.blurb ||
              'Senior Legal Counsel & Strategic Advisory. IP protection, corporate advisory, and cross-border dispute resolution for ambitious businesses.'}
          </p>
          <div className="mt-[18px] flex flex-wrap gap-2.5">
            <span className="rounded-[3px] border border-[rgba(187,169,122,0.45)] bg-field px-3.5 py-2.5 font-abu text-[13px] leading-5 font-bold tracking-[0.02em] text-gold">
              {copy.trademarkAgent || 'Certified Trademark Agent'}
            </span>
            <span className="rounded-[3px] border border-[rgba(187,169,122,0.45)] bg-field px-3.5 py-2.5 font-abu text-[13px] leading-5 font-bold tracking-[0.02em] text-gold">
              {copy.arbitrator || 'Licensed Arbitrator'}
            </span>
          </div>
        </div>

        <div>
          <h2 className="font-jakarta text-base leading-6 font-bold tracking-[0.8px] text-gold uppercase">
            {copy.company || 'Company'}
          </h2>
          <Link href={withLocale('/', locale)} className={companyItem}>
            {nav.home || 'Home'}
          </Link>
          <Link href={withLocale('/about', locale)} className={companyItem}>
            {nav.about || 'About Us'}
          </Link>
          <Link href={withLocale('/contact', locale)} className={companyItem}>
            {nav.contact || 'Contact Us'}
          </Link>
          <Link href={withLocale('/privacy', locale)} className={companyItem}>
            {nav.privacy || 'Privacy Policy'}
          </Link>
          <Link href={withLocale('/blogs', locale)} className={companyItem}>
            {nav.blogs || 'Blogs'}
          </Link>
        </div>

        <div>
          <h2 className="font-jakarta text-base leading-6 font-bold tracking-[0.8px] text-gold uppercase">
            {copy.getInTouch || 'Get in Touch'}
          </h2>
          {phones.map((entry) => (
            <a
              key={`${entry.href}-${entry.number}`}
              className="mt-3.5 flex items-start gap-2.5 font-roboto text-base leading-normal text-muted"
              href={entry.href}
            >
              <img src={assetSrc(phoneIcon)} alt="" width="24" height="24" className="h-6 w-6 shrink-0" />
              <span>
                {entry.number}
                {entry.label ? <span className="mt-1 block text-sm">{entry.label}</span> : null}
              </span>
            </a>
          ))}
          <a className="mt-3.5 flex items-start gap-2.5 font-roboto text-base leading-normal text-muted" href={`mailto:${email}`}>
            <img src={assetSrc(emailIcon)} alt="" width="24" height="24" className="h-6 w-6 shrink-0" />
            {email}
          </a>
          {addresses.map((entry) => (
            <p key={entry.text} className="mt-3.5 flex items-start gap-2.5 font-roboto text-base leading-normal text-muted">
              <img src={assetSrc(location)} alt="" width="24" height="24" className="h-6 w-6 shrink-0" />
              <span>{entry.text}</span>
            </p>
          ))}
        </div>

        <div>
          <h2 className="font-jakarta text-base leading-6 font-bold tracking-[0.8px] text-gold uppercase">
            {copy.briefs || 'Judicial Briefs'}
          </h2>
          <p className="mt-4 font-jakarta text-[15px] leading-[24.38px]">
            {copy.briefsBody || 'Receive quarterly regulatory alerts and high-level strategic legal updates.'}
          </p>
          <form className="mt-4 grid gap-2.5" action={formAction} noValidate>
            <input type="hidden" name="locale" value={locale} />
            <label className="sr-only" htmlFor="brief-email">
              {copy.emailLabel || 'Email address'}
            </label>
            <input
              id="brief-email"
              type="email"
              name="email"
              value={address}
              placeholder={copy.emailPlaceholder || 'counsel@enterprise.com'}
              aria-invalid={invalid}
              aria-describedby="brief-status"
              className="min-h-11 w-full rounded border border-white/10 bg-field px-3 py-2.5 font-jakarta text-[13px] text-offwhite placeholder:text-muted"
              onChange={(event) => setAddress(event.target.value)}
              required
            />
            <button
              type="submit"
              disabled={pending}
              className="min-h-11 w-full rounded bg-gold text-center font-jakarta text-sm leading-5 font-semibold text-offwhite hover:bg-[#a89564] disabled:opacity-70"
            >
              {pending ? copy.subscribing || 'Subscribing…' : copy.subscribe || 'Subscribe to Briefs'}
            </button>
            <p
              id="brief-status"
              role="status"
              className={`min-h-[1.2em] font-jakarta text-[13px] leading-snug ${invalid ? 'text-[#f0b4b4]' : 'text-[#9fceb8]'}`}
            >
              {message}
            </p>
          </form>
        </div>
      </div>
      <p className="mt-9 w-full border-t border-white/10 pt-5 font-dm text-[18px] leading-[30px] text-muted max-[767px]:text-[15px]">
        Copyright © 2026&nbsp;&nbsp;Mafateeh Group
      </p>
    </footer>
  )
}

export default Footer
