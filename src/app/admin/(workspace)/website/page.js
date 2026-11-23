import PageHeader from '@/components/admin/PageHeader'
import WebsiteSettingsForm from '@/components/admin/website/WebsiteSettingsForm'
import { requirePermission } from '@/lib/auth/current-admin'
import { getPrisma } from '@/lib/prisma/client'
import { getWebsiteSettingsForAdmin } from '@/lib/website/settings'

export const metadata = {
  title: 'Website information',
  robots: { index: false, follow: false },
}

export default async function WebsiteSettingsPage() {
  const current = await requirePermission('MANAGE_WEBSITE_SETTINGS')
  let settings = null
  let loadError = null

  try {
    settings = await getWebsiteSettingsForAdmin(getPrisma(), current.admin.id)
  } catch {
    loadError = 'Website information could not be loaded.'
  }

  return (
    <>
      <PageHeader
        title="Website information"
        description="Manage the contact details, hours, locations, and social links used by the public website."
      />
      {loadError ? (
        <p className="rounded-lg border border-danger/30 bg-white p-5 font-jakarta text-sm text-danger">{loadError}</p>
      ) : (
        <WebsiteSettingsForm initialSettings={settings} />
      )}
    </>
  )
}
