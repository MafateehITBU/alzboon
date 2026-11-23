'use client'

import { useActionState, useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import ImageUploadField from '@/components/admin/ImageUploadField'
import { adminOutlineButton, adminTealButton } from '@/components/admin/adminStyles'
import { saveWebsiteSettingsAction } from '@/app/admin/(workspace)/website/actions'

const inputClass =
  'min-h-11 w-full rounded-xl border border-line/90 bg-white px-3.5 font-jakarta text-sm text-ink shadow-[inset_0_1px_2px_rgba(1,19,32,0.03)] transition-[border-color,box-shadow] duration-200 hover:border-teal/25 focus:border-teal/50 focus:shadow-[0_0_0_4px_rgba(63,131,119,0.12)] focus-visible:outline-none'

const socialPlatforms = [
  { key: 'LINKEDIN', label: 'LinkedIn' },
  { key: 'FACEBOOK', label: 'Facebook' },
  { key: 'INSTAGRAM', label: 'Instagram' },
  { key: 'X', label: 'X' },
]

export default function WebsiteSettingsForm({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings)
  const [savedSettings, setSavedSettings] = useState(initialSettings)
  const [baseline, setBaseline] = useState(() => snapshot(initialSettings))
  const [removeLogo, setRemoveLogo] = useState(false)
  const [logoFileName, setLogoFileName] = useState('')
  const [logoFieldKey, setLogoFieldKey] = useState(0)
  const [state, formAction, pending] = useActionState(saveWebsiteSettingsAction, { ok: false, message: '' })
  const [appliedState, setAppliedState] = useState(null)
  const fileRef = useRef(null)

  if (state?.ok && state.settings && state !== appliedState) {
    setAppliedState(state)
    setSettings(state.settings)
    setSavedSettings(state.settings)
    setBaseline(snapshot(state.settings))
    setRemoveLogo(false)
    setLogoFileName('')
    setLogoFieldKey((key) => key + 1)
  }

  const currentSnapshot = useMemo(
    () => snapshot(settings, { removeLogo, logoFileName }),
    [settings, removeLogo, logoFileName],
  )
  const dirty = currentSnapshot !== baseline

  useEffect(() => {
    if (state?.ok && fileRef.current) fileRef.current.value = ''
  }, [state])

  useEffect(() => {
    if (!dirty) return undefined

    function onBeforeUnload(event) {
      event.preventDefault()
      event.returnValue = ''
    }

    function onDocumentClick(event) {
      const link = event.target.closest('a[href]')
      if (!link || link.target === '_blank' || link.getAttribute('download') != null) return
      const href = link.getAttribute('href')
      if (!href || href.startsWith('#')) return
      if (!window.confirm('You have unsaved changes. Leave this page?')) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('click', onDocumentClick, true)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('click', onDocumentClick, true)
    }
  }, [dirty])

  function cancel() {
    if (dirty && !window.confirm('Discard unsaved changes?')) return
    setSettings(savedSettings)
    setBaseline(snapshot(savedSettings))
    setRemoveLogo(false)
    setLogoFileName('')
    setLogoFieldKey((key) => key + 1)
    if (fileRef.current) fileRef.current.value = ''
  }

  function updatePhone(index, patch) {
    setSettings((current) => ({
      ...current,
      phones: current.phones.map((phone, phoneIndex) => (phoneIndex === index ? { ...phone, ...patch } : phone)),
    }))
  }

  function updateAddress(index, patch) {
    setSettings((current) => ({
      ...current,
      addresses: current.addresses.map((address, addressIndex) => (addressIndex === index ? { ...address, ...patch } : address)),
    }))
  }

  function updateMap(index, patch) {
    setSettings((current) => ({
      ...current,
      mapLocations: current.mapLocations.map((location, locationIndex) =>
        locationIndex === index ? { ...location, ...patch } : location,
      ),
    }))
  }

  return (
    <form action={formAction} className="grid gap-6">
      {state?.message ? (
        <p
          role="status"
          className={`rounded-lg border px-4 py-3 font-jakarta text-sm ${state.ok ? 'border-success/30 bg-white text-success' : 'border-danger/30 bg-white text-danger'}`}
        >
          {state.message}
        </p>
      ) : null}
      {dirty ? (
        <p className="rounded-lg border border-warning/30 bg-white px-4 py-3 font-jakarta text-sm text-warning">
          You have unsaved changes.
        </p>
      ) : null}

      <section className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">
        <h2 className="font-abu text-2xl text-ink">General information</h2>
        <div className="mt-4 grid gap-4">
          <ImageUploadField
            key={logoFieldKey}
            id="website-logo"
            name="logo"
            label="Website logo"
            inputRef={fileRef}
            currentUrl={settings.logoUrl && !removeLogo ? settings.logoUrl : null}
            previewClassName="h-12 w-auto max-w-[160px] object-contain"
            hint="JPEG, PNG, or WebP up to 2 MB. SVG is not accepted. Stored as public media."
            onFileChange={setLogoFileName}
          />
          {settings.logoMediaId ? (
            <label className="flex items-center gap-2 font-jakarta text-sm text-body">
              <input type="checkbox" checked={removeLogo} onChange={(event) => setRemoveLogo(event.target.checked)} />
              Remove current logo
            </label>
          ) : null}
          {removeLogo ? <input type="hidden" name="removeLogo" value="1" /> : null}
          <Field label="Contact email" htmlFor="contact-email">
            <input
              id="contact-email"
              name="contactEmail"
              type="email"
              required
              value={settings.contactEmail}
              onChange={(event) => setSettings((current) => ({ ...current, contactEmail: event.target.value }))}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">
        <h2 className="font-abu text-2xl text-ink">Business hours</h2>
        <div className="mt-4 grid gap-4 min-[820px]:grid-cols-2">
          <Field label="English" htmlFor="hours-en">
            <textarea
              id="hours-en"
              name="businessHoursEn"
              required
              rows={4}
              value={settings.businessHoursEn}
              onChange={(event) => setSettings((current) => ({ ...current, businessHoursEn: event.target.value }))}
              className={`${inputClass} min-h-28 py-3`}
            />
          </Field>
          <Field label="Arabic" htmlFor="hours-ar">
            <textarea
              id="hours-ar"
              name="businessHoursAr"
              required
              rows={4}
              dir="rtl"
              lang="ar"
              value={settings.businessHoursAr}
              onChange={(event) => setSettings((current) => ({ ...current, businessHoursAr: event.target.value }))}
              className={`${inputClass} min-h-28 py-3`}
            />
          </Field>
        </div>
      </section>

      <RepeatableSection
        title="Phone numbers"
        onAdd={() =>
          setSettings((current) => ({
            ...current,
            phones: [...current.phones, { id: `new-${Date.now()}`, number: '', region: 'UAE', label: '' }],
          }))
        }
      >
        {settings.phones.length === 0 ? <EmptyRow text="No phone numbers yet." /> : null}
        {settings.phones.map((phone, index) => (
          <div key={phone.id || index} className="grid gap-3 rounded border border-line p-3 min-[820px]:grid-cols-[1fr_10rem_1fr_auto]">
            <input
              aria-label={`Phone number ${index + 1}`}
              value={phone.number}
              onChange={(event) => updatePhone(index, { number: event.target.value })}
              placeholder="Phone number"
              className={inputClass}
            />
            <select
              aria-label={`Phone region ${index + 1}`}
              value={phone.region}
              onChange={(event) => updatePhone(index, { region: event.target.value })}
              className={inputClass}
            >
              <option value="UAE">UAE</option>
              <option value="JORDAN">Jordan</option>
            </select>
            <input
              aria-label={`Phone label ${index + 1}`}
              value={phone.label || ''}
              onChange={(event) => updatePhone(index, { label: event.target.value })}
              placeholder="Optional label"
              className={inputClass}
            />
            <IconButton label={`Remove phone ${index + 1}`} onClick={() => setSettings((current) => ({ ...current, phones: current.phones.filter((_, phoneIndex) => phoneIndex !== index) }))} />
          </div>
        ))}
      </RepeatableSection>

      <RepeatableSection
        title="Addresses"
        onAdd={() =>
          setSettings((current) => ({
            ...current,
            addresses: [...current.addresses, { id: `new-${Date.now()}`, textEn: '', textAr: '', region: 'UAE' }],
          }))
        }
      >
        {settings.addresses.length === 0 ? <EmptyRow text="No addresses yet." /> : null}
        {settings.addresses.map((address, index) => (
          <div key={address.id || index} className="grid gap-3 rounded border border-line p-3">
            <div className="grid gap-3 min-[820px]:grid-cols-[1fr_10rem_auto]">
              <input
                aria-label={`English address ${index + 1}`}
                value={address.textEn}
                onChange={(event) => updateAddress(index, { textEn: event.target.value })}
                placeholder="English address"
                className={inputClass}
              />
              <select
                aria-label={`Address region ${index + 1}`}
                value={address.region}
                onChange={(event) => updateAddress(index, { region: event.target.value })}
                className={inputClass}
              >
                <option value="UAE">UAE</option>
                <option value="JORDAN">Jordan</option>
              </select>
              <IconButton
                label={`Remove address ${index + 1}`}
                onClick={() =>
                  setSettings((current) => ({
                    ...current,
                    addresses: current.addresses.filter((_, addressIndex) => addressIndex !== index),
                  }))
                }
              />
            </div>
            <input
              aria-label={`Arabic address ${index + 1}`}
              dir="rtl"
              lang="ar"
              value={address.textAr}
              onChange={(event) => updateAddress(index, { textAr: event.target.value })}
              placeholder="العنوان بالعربية"
              className={inputClass}
            />
          </div>
        ))}
      </RepeatableSection>

      <RepeatableSection
        title="Map locations"
        onAdd={() =>
          setSettings((current) => ({
            ...current,
            mapLocations: [...current.mapLocations, { id: `new-${Date.now()}`, label: '', latitude: '', longitude: '' }],
          }))
        }
      >
        <p className="rounded border border-line bg-cream px-3 py-2 font-jakarta text-sm text-body">
          Map search and draggable markers need an approved map provider. Until then, enter a label with latitude and longitude manually.
        </p>
        {settings.mapLocations.length === 0 ? <EmptyRow text="No map locations yet." /> : null}
        {settings.mapLocations.map((location, index) => (
          <div key={location.id || index} className="grid gap-3 rounded border border-line p-3 min-[820px]:grid-cols-[1.4fr_1fr_1fr_auto]">
            <input
              aria-label={`Map label ${index + 1}`}
              value={location.label}
              onChange={(event) => updateMap(index, { label: event.target.value })}
              placeholder="Label"
              className={inputClass}
            />
            <input
              aria-label={`Latitude ${index + 1}`}
              value={location.latitude}
              onChange={(event) => updateMap(index, { latitude: event.target.value })}
              placeholder="Latitude"
              className={inputClass}
            />
            <input
              aria-label={`Longitude ${index + 1}`}
              value={location.longitude}
              onChange={(event) => updateMap(index, { longitude: event.target.value })}
              placeholder="Longitude"
              className={inputClass}
            />
            <IconButton
              label={`Remove map location ${index + 1}`}
              onClick={() =>
                setSettings((current) => ({
                  ...current,
                  mapLocations: current.mapLocations.filter((_, locationIndex) => locationIndex !== index),
                }))
              }
            />
          </div>
        ))}
      </RepeatableSection>

      <section className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">
        <h2 className="font-abu text-2xl text-ink">Social media</h2>
        <p className="mt-2 font-jakarta text-sm text-body">Leave a URL blank to remove that icon from the public website when social icons are shown.</p>
        <div className="mt-4 grid gap-4">
          {socialPlatforms.map((platform) => (
            <Field key={platform.key} label={platform.label} htmlFor={`social-${platform.key}`}>
              <input
                id={`social-${platform.key}`}
                name={`social_${platform.key}`}
                type="url"
                value={settings.socialLinks[platform.key] || ''}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    socialLinks: { ...current.socialLinks, [platform.key]: event.target.value },
                  }))
                }
                placeholder="https://"
                className={inputClass}
              />
            </Field>
          ))}
        </div>
      </section>

      <input type="hidden" name="phonesJson" value={JSON.stringify(settings.phones)} />
      <input type="hidden" name="addressesJson" value={JSON.stringify(settings.addresses)} />
      <input type="hidden" name="mapLocationsJson" value={JSON.stringify(settings.mapLocations)} />

      <div className="sticky bottom-4 z-10 flex flex-wrap justify-end gap-3 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-[0_18px_40px_-24px_rgba(1,19,32,0.35)] backdrop-blur-xl">
        <button type="button" onClick={cancel} className={adminOutlineButton}>
          Cancel
        </button>
        <button type="submit" disabled={pending || !dirty} className={adminTealButton}>
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

function RepeatableSection({ title, onAdd, children }) {
  return (
    <section className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-abu text-2xl text-ink">{title}</h2>
        <button type="button" onClick={onAdd} className={adminOutlineButton}>
          <Plus aria-hidden="true" size={16} />
          Add
        </button>
      </div>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
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

function EmptyRow({ text }) {
  return <p className="font-jakarta text-sm text-body">{text}</p>
}

function IconButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex size-11 items-center justify-center rounded border border-line text-danger focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
    >
      <Trash2 aria-hidden="true" size={16} />
      <span className="sr-only">{label}</span>
    </button>
  )
}

function snapshot(settings, extras = {}) {
  return JSON.stringify({
    contactEmail: settings.contactEmail,
    businessHoursEn: settings.businessHoursEn,
    businessHoursAr: settings.businessHoursAr,
    phones: settings.phones,
    addresses: settings.addresses,
    mapLocations: settings.mapLocations,
    socialLinks: settings.socialLinks,
    logoMediaId: settings.logoMediaId,
    removeLogo: Boolean(extras.removeLogo),
    logoFileName: extras.logoFileName || '',
  })
}
