import { FileQuestion } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="grid min-h-svh content-start justify-items-start gap-3 px-6 py-8">
      <FileQuestion size={32} aria-hidden="true" />
      <h1 className="font-abu text-[32px] leading-tight text-ink">Page not found</h1>
      <p className="text-body">The page you requested does not exist.</p>
      <Link href="/" className="font-abu text-teal-deep">
        Back to home
      </Link>
    </section>
  )
}
