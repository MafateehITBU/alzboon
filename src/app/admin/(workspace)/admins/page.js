import PageHeader from '@/components/admin/PageHeader'
import AdminAccountsPanel from '@/components/admin/admins/AdminAccountsPanel'
import { listAdminAccounts, parseAdminListQuery } from '@/lib/auth/admin-access'
import { AuthError } from '@/lib/auth/errors'
import { requirePermission } from '@/lib/auth/current-admin'
import { getPrisma } from '@/lib/prisma/client'

export const metadata = {
  title: 'Admins',
  robots: { index: false, follow: false },
}

export default async function AdminsPage({ searchParams }) {
  const current = await requirePermission('MANAGE_ADMINS')
  const params = await searchParams
  const query = parseAdminListQuery(params)

  let listing = null
  let loadError = null

  try {
    listing = await listAdminAccounts(getPrisma(), current.admin.id, query)
  } catch (error) {
    if (error instanceof AuthError && error.code === 'FORBIDDEN') throw error
    loadError = 'The admin list could not be loaded.'
  }

  return (
    <>
      <PageHeader title="Admins" description="Create and manage CMS accounts, roles, and permissions." />
      <AdminAccountsPanel
        actor={{
          id: current.admin.id,
          role: current.admin.role,
        }}
        query={query}
        listing={listing}
        loadError={loadError}
      />
    </>
  )
}
