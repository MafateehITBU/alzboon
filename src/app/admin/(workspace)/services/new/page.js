import PageHeader from '@/components/admin/PageHeader'
import ServiceEditorForm from '@/components/admin/services/ServiceEditorForm'
import { requirePermission } from '@/lib/auth/current-admin'

export const metadata = {
  title: 'New service',
  robots: { index: false, follow: false },
}

export default async function NewServicePage() {
  await requirePermission('MANAGE_SERVICES')

  return (
    <>
      <PageHeader title="New service" description="Create bilingual service content with a practice-area section, points, and images." />
      <ServiceEditorForm mode="create" />
    </>
  )
}
