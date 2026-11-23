'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import FileUploadField from '@/components/admin/FileUploadField'
import ImageUploadField from '@/components/admin/ImageUploadField'
import RichTextEditor from '@/components/admin/blog/RichTextEditor'
import { adminOutlineButton, adminTealButton } from '@/components/admin/adminStyles'
import { createBlogAction, updateBlogAction } from '@/app/admin/(workspace)/blogs/actions'
import { emptyDocument } from '@/lib/blog/sanitize-document'

const inputClass =
  'min-h-11 w-full rounded-xl border border-line/90 bg-white px-3.5 font-jakarta text-sm text-ink shadow-[inset_0_1px_2px_rgba(1,19,32,0.03)] transition-[border-color,box-shadow] duration-200 hover:border-teal/25 focus:border-teal/50 focus:shadow-[0_0_0_4px_rgba(63,131,119,0.12)] focus-visible:outline-none'

export default function BlogEditorForm({ mode, blog = null, categories, savedNotice = false }) {
  const action = mode === 'create' ? createBlogAction : updateBlogAction
  const [state, formAction, pending] = useActionState(action, { ok: false, message: '' })
  const [documentEn, setDocumentEn] = useState(blog?.documentEn || emptyDocument())
  const [documentAr, setDocumentAr] = useState(blog?.documentAr || emptyDocument())
  const [removeAttachment, setRemoveAttachment] = useState(false)

  return (
    <form action={formAction} className="grid gap-6">
      {mode === 'edit' ? <input type="hidden" name="blogId" value={blog.id} /> : null}
      {(savedNotice || state?.message) && (
        <p
          role="status"
          className={`rounded-lg border px-4 py-3 font-jakarta text-sm ${
            (state?.ok ?? savedNotice) ? 'border-success/30 bg-white text-success' : 'border-danger/30 bg-white text-danger'
          }`}
        >
          {state?.message || 'The blog was saved.'}
        </p>
      )}

      <section className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">
        <h2 className="font-abu text-2xl text-ink">English content</h2>
        <div className="mt-4 grid gap-4">
          <Field label="English title" htmlFor="titleEn">
            <input id="titleEn" name="titleEn" required defaultValue={blog?.titleEn || ''} className={inputClass} />
          </Field>
          <RichTextEditor label="English content" value={documentEn} onChange={setDocumentEn} name="documentEn" dir="ltr" />
        </div>
      </section>

      <section className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">
        <h2 className="font-abu text-2xl text-ink">Arabic content</h2>
        <div className="mt-4 grid gap-4">
          <Field label="Arabic title" htmlFor="titleAr">
            <input id="titleAr" name="titleAr" required dir="rtl" lang="ar" defaultValue={blog?.titleAr || ''} className={inputClass} />
          </Field>
          <RichTextEditor label="Arabic content" value={documentAr} onChange={setDocumentAr} name="documentAr" dir="rtl" />
        </div>
      </section>

      <section className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">
        <h2 className="font-abu text-2xl text-ink">Publishing information</h2>
        <div className="mt-4 grid gap-4 min-[820px]:grid-cols-2">
          <Field label="Author" htmlFor="authorName">
            <input id="authorName" name="authorName" required defaultValue={blog?.authorName || ''} className={inputClass} />
          </Field>
          <Field label="Publish date" htmlFor="publishedOn">
            <input id="publishedOn" name="publishedOn" type="date" required defaultValue={blog?.publishedOn || new Date().toISOString().slice(0, 10)} className={inputClass} />
          </Field>
          <Field label="Category" htmlFor="categoryId">
            <select id="categoryId" name="categoryId" required defaultValue={blog?.categoryId || ''} className={inputClass}>
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nameEn}
                </option>
              ))}
            </select>
          </Field>
          <label className="mt-7 flex items-center gap-2 font-jakarta text-sm text-ink">
            <input type="checkbox" name="published" value="1" defaultChecked={Boolean(blog?.published)} />
            Published
          </label>
        </div>
        <p className="mt-3 font-jakarta text-xs text-body">Hidden blogs stay out of every public query, even with a past publish date.</p>
      </section>

      <section className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm">
        <h2 className="font-abu text-2xl text-ink">Media</h2>
        <div className="mt-4 grid gap-4">
          <ImageUploadField
            id="featuredImage"
            name="featuredImage"
            label="Featured image"
            required={mode === 'create'}
            currentUrl={blog?.featuredUrl || null}
            hint="JPEG, PNG, or WebP up to 2 MB. Stored as public media."
          />
          <FileUploadField
            id="attachment"
            name="attachment"
            label="Optional attachment (PDF)"
            currentName={!removeAttachment ? blog?.attachmentDisplayName || null : null}
            hint="PDF only, up to 10 MB. Stored privately and served only to authorized admins."
          />
          {blog?.attachmentMediaId ? (
            <label className="flex items-center gap-2 font-jakarta text-sm text-body">
              <input type="checkbox" checked={removeAttachment} onChange={(event) => setRemoveAttachment(event.target.checked)} />
              Remove current attachment
            </label>
          ) : null}
          {removeAttachment ? <input type="hidden" name="removeAttachment" value="1" /> : null}
          <Field label="Attachment display name" htmlFor="attachmentDisplayName">
            <input id="attachmentDisplayName" name="attachmentDisplayName" defaultValue={blog?.attachmentDisplayName || ''} className={inputClass} />
          </Field>
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex flex-wrap justify-between gap-3 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-[0_18px_40px_-24px_rgba(1,19,32,0.35)] backdrop-blur-xl">
        <Link href="/admin/blogs" className={adminOutlineButton}>
          Back to blogs
        </Link>
        <button type="submit" disabled={pending || categories.length === 0} className={adminTealButton}>
          {pending ? 'Saving…' : mode === 'create' ? 'Create blog' : 'Save changes'}
        </button>
      </div>
      {categories.length === 0 ? (
        <p className="font-jakarta text-sm text-warning">
          Create a blog category before publishing a blog.{' '}
          <Link href="/admin/blog-categories" className="underline">
            Manage categories
          </Link>
        </p>
      ) : null}
    </form>
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
