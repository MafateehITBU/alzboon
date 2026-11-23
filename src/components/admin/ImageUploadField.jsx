'use client'

import { useId, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { adminLabelClass } from '@/components/admin/adminStyles'

export default function ImageUploadField({
  id,
  name,
  label,
  hint = 'JPEG, PNG, or WebP up to 2 MB.',
  required = false,
  currentUrl = null,
  previewClassName = 'h-44 w-full max-w-md rounded-xl object-cover',
  onFileChange,
  inputRef,
}) {
  const generatedId = useId()
  const fieldId = id || generatedId
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState('')

  function onChange(event) {
    const file = event.target.files?.[0]
    if (!file) {
      setPreview(null)
      setFileName('')
      onFileChange?.('')
      return
    }
    setFileName(file.name)
    const url = URL.createObjectURL(file)
    setPreview(url)
    onFileChange?.(file.name)
  }

  function clearSelection(event) {
    event.preventDefault()
    const input = document.getElementById(fieldId)
    if (input) input.value = ''
    setPreview(null)
    setFileName('')
    onFileChange?.('')
  }

  const shownPreview = preview || currentUrl

  return (
    <div>
      <label htmlFor={fieldId} className={adminLabelClass}>
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      <div className="mt-2 overflow-hidden rounded-2xl border border-dashed border-teal/30 bg-gradient-to-b from-white to-cream/80 transition hover:border-teal/50">
        {shownPreview ? (
          <div className="grid gap-4 p-4">
            <img src={shownPreview} alt="" className={previewClassName} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-jakarta text-sm font-semibold text-ink">{preview ? 'New image selected' : 'Current image'}</p>
                <p className="mt-1 truncate font-jakarta text-xs text-body">{fileName || hint}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {preview ? (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full border border-danger/20 bg-white px-4 font-jakarta text-xs font-semibold text-danger"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    Clear selection
                  </button>
                ) : null}
                <label
                  htmlFor={fieldId}
                  className="inline-flex min-h-9 cursor-pointer items-center rounded-full bg-teal/10 px-4 font-jakarta text-xs font-semibold text-teal"
                >
                  Replace image
                </label>
              </div>
            </div>
          </div>
        ) : (
          <label
            htmlFor={fieldId}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 px-4 py-9 text-center transition-colors hover:bg-teal/[0.03]"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-teal/10 text-teal shadow-[inset_0_0_0_1px_rgba(63,131,119,0.12)]">
              <ImagePlus size={22} aria-hidden="true" />
            </span>
            <span className="font-jakarta text-base font-semibold text-ink">Upload image</span>
            <span className="max-w-sm font-jakarta text-xs leading-5 text-body">{hint}</span>
            <span className="inline-flex min-h-9 items-center rounded-full bg-teal/10 px-4 font-jakarta text-xs font-semibold text-teal">
              Choose file
            </span>
          </label>
        )}
        <input
          ref={inputRef}
          id={fieldId}
          name={name}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={required && !currentUrl}
          className="sr-only"
          onChange={onChange}
        />
      </div>
    </div>
  )
}
