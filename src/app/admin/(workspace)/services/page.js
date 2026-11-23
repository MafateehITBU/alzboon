import PageHeader from '@/components/admin/PageHeader'
import ServicesPanel from '@/components/admin/services/ServicesPanel'
import { requirePermission } from '@/lib/auth/current-admin'
import { getPrisma } from '@/lib/prisma/client'
import { ServiceError } from '@/lib/service/errors'
import { listServices, parseServiceListQuery } from '@/lib/service/services'

export const metadata = {
  title: 'Services',
  robots: { index: false, follow: false },
}

export default async function ServicesPage({ searchParams }) {
  const current = await requirePermission('MANAGE_SERVICES')
  const params = await searchParams
  const query = parseServiceListQuery(params)
  const notice = typeof params?.notice === 'string' ? params.notice : ''

  let listing = null
  let loadError = null

  try {
    listing = await listServices(getPrisma(), current.admin.id, query)
  } catch (error) {
    if (error instanceof ServiceError && (error.code === 'FORBIDDEN' || error.code === 'UNAUTHENTICATED')) throw error
    loadError = 'The service list could not be loaded.'
  }

  return (
    <>
      <PageHeader title="Services" description="Manage bilingual service pages with hero content and practice-area sections." />
      <ServicesPanel query={query} listing={listing} loadError={loadError} notice={notice} />
    </>
  )
}
