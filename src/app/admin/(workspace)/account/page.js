import PageHeader from '@/components/admin/PageHeader'
import AccountSelfServiceForm from '@/components/admin/account/AccountSelfServiceForm'
import { requireAdmin } from '@/lib/auth/current-admin'
import { getOwnAccount } from '@/lib/auth/self-account'
import { getPrisma } from '@/lib/prisma/client'

export const metadata = {
  title: 'Account',
  robots: { index: false, follow: false },
}

export default async function AccountPage() {
  const current = await requireAdmin()
  const account = await getOwnAccount(getPrisma(), current.admin.id)

  return (
    <>
      <PageHeader title="Account" description="Update your profile details and password. Role and permissions stay read-only." />
      <AccountSelfServiceForm account={account} />
    </>
  )
}
