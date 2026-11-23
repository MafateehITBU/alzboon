import PageHeader from '@/components/admin/PageHeader'
import ServiceEditorForm from '@/components/admin/services/ServiceEditorForm'
import { requirePermission } from '@/lib/auth/current-admin'
import { getPrisma } from '@/lib/prisma/client'
import { getServiceForAdmin } from '@/lib/service/services'

export const metadata = {
  title: 'Edit service',
  robots: { index: false, follow: false },
}

export default async function EditServicePage({ params }) {
  const current = await requirePermission('MANAGE_SERVICES')
  const { serviceId } = await params
  const service = await getServiceForAdmin(getPrisma(), current.admin.id, serviceId)

  return (
    <>
      <PageHeader title={service.nameEn || 'Edit service'} description="Update bilingual service content, practice-area section, points, and images." />
      <ServiceEditorForm mode="edit" service={service} />
    </>
  )
}
