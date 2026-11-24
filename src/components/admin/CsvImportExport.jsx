'use client'

import { useRef, useState, useTransition } from 'react'
import { Download, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CsvImportExport({ exportHref, importAction, entityLabel = 'records' }) {
  const router = useRouter()
  const inputRef = useRef(null)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [tone, setTone] = useState('success')

  function onPickFile() {
    inputRef.current?.click()
  }

  function onFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const formData = new FormData()
    formData.set('file', file)

    startTransition(async () => {
      setMessage('')
      const result = await importAction(formData)
      if (!result?.ok) {
        setTone('danger')
        setMessage(result?.message || `Could not import ${entityLabel}.`)
        return
      }
      setTone('success')
      setMessage(result.message)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="inline-flex overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(1,19,32,0.04)]">
        <a
          href={exportHref}
          className="inline-flex min-h-11 items-center gap-2 border-e border-line px-4 font-jakarta text-sm font-semibold text-ink transition-colors hover:bg-cream/80 hover:text-teal"
        >
          <Download aria-hidden="true" size={16} />
          Export
        </a>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 px-4 font-jakarta text-sm font-semibold text-ink transition-colors hover:bg-cream/80 hover:text-teal disabled:opacity-60"
          onClick={onPickFile}
          disabled={pending}
        >
          <Upload aria-hidden="true" size={16} />
          {pending ? 'Importing…' : 'Import'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={onFileChange}
        />
      </div>
      {message ? (
        <p
          role="status"
          className={`max-w-xl font-jakarta text-xs leading-5 ${tone === 'success' ? 'text-success' : 'text-danger'}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  )
}
