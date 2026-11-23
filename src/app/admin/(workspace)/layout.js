import AdminShell from '@/components/admin/AdminShell'
import { requireAdmin } from '@/lib/auth/current-admin'
import { adminNavigation, roleLabel } from '@/lib/admin/navigation'

export default async function WorkspaceLayout({ children }) {
  const current = await requireAdmin()

  return (
    <AdminShell
      admin={{
        name: current.admin.name,
        email: current.admin.email,
        roleLabel: roleLabel(current.admin.role),
      }}
      groups={adminNavigation(current.admin)}
    >
      {children}
    </AdminShell>
  )
}
