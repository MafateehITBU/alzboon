'use client'

import { useId, useState } from 'react'
import { FileUp, Trash2 } from 'lucide-react'
import { adminLabelClass } from '@/components/admin/adminStyles'

export default function FileUploadField({
  id,
  name,
  label,
  hint = 'PDF up to 10 MB.',
  accept = 'application/pdf',
  required = false,
  currentName = null,
}) {
  const generatedId = useId()
  const fieldId = id || generatedId
  const [fileName, setFileName] = useState('')

  function onChange(event) {
    const file = event.target.files?.[0]
    setFileName(file?.name || '')
  }

  function clearSelection(event) {
    event.preventDefault()
    const input = document.getElementById(fieldId)
    if (input) input.value = ''
    setFileName('')
  }

  return (
    <div>
      <label htmlFor={fieldId} className={adminLabelClass}>
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      <div className="mt-2 overflow-hidden rounded-2xl border border-dashed border-teal/30 bg-gradient-to-b from-white to-cream/80 transition hover:border-teal/50">
        {(fileName || currentName) && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 bg-white/90 px-4 py-3">
            <p className="min-w-0 truncate font-jakarta text-sm text-ink">{fileName || currentName}</p>
            {fileName ? (
              <button type="button" onClick={clearSelection} className="inline-flex items-center gap-2 font-jakarta text-xs font-semibold text-danger">
                <Trash2 size={14} aria-hidden="true" />
                Clear
              </button>
            ) : null}
          </div>
        )}
        <label htmlFor={fieldId} className="flex cursor-pointer flex-col items-center justify-center gap-3 px-4 py-9 text-center transition-colors hover:bg-teal/[0.03]">
          <span className="grid size-12 place-items-center rounded-2xl bg-teal/10 text-teal shadow-[inset_0_0_0_1px_rgba(63,131,119,0.12)]">
            <FileUp size={22} aria-hidden="true" />
          </span>
          <span className="font-jakarta text-base font-semibold text-ink">{fileName || currentName ? 'Replace file' : 'Upload file'}</span>
          <span className="max-w-sm font-jakarta text-xs leading-5 text-body">{hint}</span>
          <span className="inline-flex min-h-9 items-center rounded-full bg-teal/10 px-4 font-jakarta text-xs font-semibold text-teal">
            Choose file
          </span>
        </label>
        <input id={fieldId} name={name} type="file" accept={accept} required={required} className="sr-only" onChange={onChange} />
      </div>
    </div>
  )
}
