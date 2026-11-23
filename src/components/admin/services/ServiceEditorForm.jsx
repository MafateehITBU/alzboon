'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import AdminToast from '@/components/admin/AdminToast'
import ImageUploadField from '@/components/admin/ImageUploadField'
import {
  adminFieldClass,
  adminLabelClass,
  adminOutlineButton,
  adminPanelClass,
  adminTealButton,
  adminTextareaClass,
} from '@/components/admin/adminStyles'
import { createServiceAction, updateServiceAction } from '@/app/admin/(workspace)/services/actions'

function emptyPracticePoint() {
  return {
    key: crypto.randomUUID(),
    titleEn: '',
    titleAr: '',
    subtitleEn: '',
    subtitleAr: '',
    descriptionEn: '',
    descriptionAr: '',
  }
}

export default function ServiceEditorForm({ mode, service = null }) {
  const action = mode === 'create' ? createServiceAction : updateServiceAction
  const [state, formAction, pending] = useActionState(action, { ok: false, message: '' })
  const [toast, setToast] = useState(null)
  const [practiceAreas, setPracticeAreas] = useState(
    service?.practiceAreas?.length
      ? service.practiceAreas.map((area) => ({
          key: area.id || crypto.randomUUID(),
          titleEn: area.titleEn || '',
          titleAr: area.titleAr || '',
          subtitleEn: area.subtitleEn || '',
          subtitleAr: area.subtitleAr || '',
          descriptionEn: area.descriptionEn || '',
          descriptionAr: area.descriptionAr || '',
        }))
      : [emptyPracticePoint()],
  )

  useEffect(() => {
    if (!state?.message || state.ok) return
    setToast({ tone: 'danger', message: state.message })
  }, [state])

  return (
    <form action={formAction} className="grid gap-6">
      <AdminToast toast={toast} onClose={() => setToast(null)} />
      {mode === 'edit' ? <input type="hidden" name="serviceId" value={service.id} /> : null}
      <input
        type="hidden"
        name="practiceAreas"
        value={JSON.stringify(
          practiceAreas.map(({ titleEn, titleAr, subtitleEn, subtitleAr, descriptionEn, descriptionAr }) => ({
            titleEn,
            titleAr,
            subtitleEn,
            subtitleAr,
            descriptionEn,
            descriptionAr,
          })),
        )}
      />
      {state?.message && !state.ok ? (
        <p role="status" className="rounded-2xl border border-danger/30 bg-white px-4 py-3 font-jakarta text-sm text-danger">
          {state.message}
        </p>
      ) : null}

      <section className={adminPanelClass}>
        <h2 className="font-abu text-2xl text-ink">Basic information</h2>
        <div className="mt-4 grid gap-4 min-[820px]:grid-cols-2">
          <Field label="English service name" htmlFor="nameEn">
            <input id="nameEn" name="nameEn" required defaultValue={service?.nameEn || ''} className={adminFieldClass} />
          </Field>
          <Field label="Arabic service name" htmlFor="nameAr">
            <input id="nameAr" name="nameAr" required dir="rtl" lang="ar" defaultValue={service?.nameAr || ''} className={adminFieldClass} />
          </Field>
        </div>
      </section>

      <section className={adminPanelClass}>
        <h2 className="font-abu text-2xl text-ink">Hero section</h2>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-4 min-[820px]:grid-cols-2">
            <Field label="English hero title" htmlFor="heroTitleEn">
              <input id="heroTitleEn" name="heroTitleEn" required defaultValue={service?.heroTitleEn || ''} className={adminFieldClass} />
            </Field>
            <Field label="Arabic hero title" htmlFor="heroTitleAr">
              <input id="heroTitleAr" name="heroTitleAr" required dir="rtl" lang="ar" defaultValue={service?.heroTitleAr || ''} className={adminFieldClass} />
            </Field>
          </div>
          <div className="grid gap-4 min-[820px]:grid-cols-2">
            <Field label="English hero description" htmlFor="heroDescriptionEn">
              <textarea id="heroDescriptionEn" name="heroDescriptionEn" required defaultValue={service?.heroDescriptionEn || ''} className={adminTextareaClass} />
            </Field>
            <Field label="Arabic hero description" htmlFor="heroDescriptionAr">
              <textarea id="heroDescriptionAr" name="heroDescriptionAr" required dir="rtl" lang="ar" defaultValue={service?.heroDescriptionAr || ''} className={adminTextareaClass} />
            </Field>
          </div>
          <ImageUploadField
            id="heroImage"
            name="heroImage"
            label="Hero image"
            required={mode === 'create'}
            currentUrl={service?.heroUrl || null}
          />
        </div>
      </section>

      <section className={adminPanelClass}>
        <div>
          <h2 className="font-abu text-2xl text-ink">Practice areas</h2>
          <p className="mt-1 font-jakarta text-sm text-body">
            Set the section title and description, then add points with title, subtitle, and description.
          </p>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="grid gap-4 min-[820px]:grid-cols-2">
            <Field label="English section title" htmlFor="overviewTitleEn">
              <input
                id="overviewTitleEn"
                name="overviewTitleEn"
                required
                defaultValue={service?.overviewTitleEn || ''}
                className={adminFieldClass}
              />
            </Field>
            <Field label="Arabic section title" htmlFor="overviewTitleAr">
              <input
                id="overviewTitleAr"
                name="overviewTitleAr"
                required
                dir="rtl"
                lang="ar"
                defaultValue={service?.overviewTitleAr || ''}
                className={adminFieldClass}
              />
            </Field>
          </div>
          <div className="grid gap-4 min-[820px]:grid-cols-2">
            <Field label="English section description" htmlFor="overviewDescriptionEn">
              <textarea
                id="overviewDescriptionEn"
                name="overviewDescriptionEn"
                required
                defaultValue={service?.overviewDescriptionEn || ''}
                className={adminTextareaClass}
              />
            </Field>
            <Field label="Arabic section description" htmlFor="overviewDescriptionAr">
              <textarea
                id="overviewDescriptionAr"
                name="overviewDescriptionAr"
                required
                dir="rtl"
                lang="ar"
                defaultValue={service?.overviewDescriptionAr || ''}
                className={adminTextareaClass}
              />
            </Field>
          </div>
          <ImageUploadField
            id="practiceAreaImage"
            name="practiceAreaImage"
            label="Practice-area image"
            required={mode === 'create'}
            currentUrl={service?.practiceAreaUrl || null}
          />
        </div>

        <div className="mt-6 grid gap-4">
          <h3 className="font-jakarta text-base font-semibold text-ink">Practice area points</h3>
          {practiceAreas.map((area, index) => (
            <div key={area.key} className="rounded-2xl border border-line/70 bg-cream/60 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="font-jakarta text-sm font-semibold text-ink">Point {index + 1}</p>
                <div className="flex gap-2">
                  <IconButton label="Move up" disabled={index === 0} onClick={() => setPracticeAreas((current) => moveItem(current, index, -1))}>
                    <ArrowUp size={16} />
                  </IconButton>
                  <IconButton
                    label="Move down"
                    disabled={index === practiceAreas.length - 1}
                    onClick={() => setPracticeAreas((current) => moveItem(current, index, 1))}
                  >
                    <ArrowDown size={16} />
                  </IconButton>
                  <IconButton
                    label="Remove"
                    danger
                    disabled={practiceAreas.length === 1}
                    onClick={() => setPracticeAreas((current) => current.filter((item) => item.key !== area.key))}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              </div>
              <div className="grid gap-3 min-[820px]:grid-cols-2">
                <Field label="English title">
                  <input
                    value={area.titleEn}
                    onChange={(event) => updatePracticePoint(setPracticeAreas, area.key, { titleEn: event.target.value })}
                    className={adminFieldClass}
                  />
                </Field>
                <Field label="Arabic title">
                  <input
                    dir="rtl"
                    lang="ar"
                    value={area.titleAr}
                    onChange={(event) => updatePracticePoint(setPracticeAreas, area.key, { titleAr: event.target.value })}
                    className={adminFieldClass}
                  />
                </Field>
                <Field label="English subtitle">
                  <input
                    value={area.subtitleEn}
                    onChange={(event) => updatePracticePoint(setPracticeAreas, area.key, { subtitleEn: event.target.value })}
                    className={adminFieldClass}
                  />
                </Field>
                <Field label="Arabic subtitle">
                  <input
                    dir="rtl"
                    lang="ar"
                    value={area.subtitleAr}
                    onChange={(event) => updatePracticePoint(setPracticeAreas, area.key, { subtitleAr: event.target.value })}
                    className={adminFieldClass}
                  />
                </Field>
                <Field label="English description">
                  <textarea
                    value={area.descriptionEn}
                    onChange={(event) => updatePracticePoint(setPracticeAreas, area.key, { descriptionEn: event.target.value })}
                    className={adminTextareaClass}
                  />
                </Field>
                <Field label="Arabic description">
                  <textarea
                    dir="rtl"
                    lang="ar"
                    value={area.descriptionAr}
                    onChange={(event) => updatePracticePoint(setPracticeAreas, area.key, { descriptionAr: event.target.value })}
                    className={adminTextareaClass}
                  />
                </Field>
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setPracticeAreas((current) => [...current, emptyPracticePoint()])}
              className={adminOutlineButton}
            >
              <Plus aria-hidden="true" size={16} />
              Add point
            </button>
          </div>
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex flex-wrap justify-between gap-3 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-[0_18px_40px_-24px_rgba(1,19,32,0.35)] backdrop-blur-xl">
        <Link href="/admin/services" className={adminOutlineButton}>
          Back to services
        </Link>
        <button type="submit" disabled={pending} className={adminTealButton}>
          {pending ? 'Saving…' : mode === 'create' ? 'Create service' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className={adminLabelClass}>
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function IconButton({ label, onClick, disabled, danger = false, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex size-9 items-center justify-center rounded-xl border border-line bg-white disabled:opacity-40 ${danger ? 'text-danger' : 'text-ink'}`}
    >
      {children}
    </button>
  )
}

function updatePracticePoint(setPracticeAreas, key, patch) {
  setPracticeAreas((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)))
}

function moveItem(items, index, delta) {
  const nextIndex = index + delta
  if (nextIndex < 0 || nextIndex >= items.length) return items
  const copy = [...items]
  const [item] = copy.splice(index, 1)
  copy.splice(nextIndex, 0, item)
  return copy
}
