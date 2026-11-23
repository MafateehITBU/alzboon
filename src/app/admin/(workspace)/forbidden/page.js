import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'
import { adminTealButton } from '@/components/admin/adminStyles'
import { requireAdmin } from '@/lib/auth/current-admin'

export const metadata = {
  title: 'Forbidden',
  robots: { index: false, follow: false },
}

export default async function ForbiddenPage() {
  await requireAdmin()

  return (
    <>
      <PageHeader title="You do not have permission" description="This account cannot open that part of the admin workspace." />
      <Link href="/admin" className={adminTealButton}>
        Back to dashboard
      </Link>
    </>
  )
}
