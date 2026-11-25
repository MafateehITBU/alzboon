import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'
import { adminTealButton } from '@/components/admin/adminStyles'

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
}

export default function AdminNotFound() {
  return (
    <>
      <PageHeader
        title="Page not found"
        description="That admin URL does not exist. Return to the dashboard to continue."
      />
      <Link href="/admin" className={adminTealButton}>
        Back to dashboard
      </Link>
    </>
  )
}
