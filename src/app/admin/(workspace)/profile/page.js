import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/current-admin'

export const metadata = {
  title: 'Profile',
  robots: { index: false, follow: false },
}

export default async function ProfilePage() {
  await requireAdmin()
  redirect('/admin/account')
}
