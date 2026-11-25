import { notFound } from 'next/navigation'

/** Catch unmatched /admin/* paths so the workspace not-found UI is shown. */
export default function AdminUnmatchedPage() {
  notFound()
}
