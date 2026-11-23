import PageHeader from '@/components/admin/PageHeader'
import EnquiriesPanel from '@/components/admin/enquiries/EnquiriesPanel'
import { requirePermission } from '@/lib/auth/current-admin'
import { EnquiryError } from '@/lib/enquiry/errors'
import { listEnquiries, listEnquiryServices, parseEnquiryListQuery } from '@/lib/enquiry/enquiries'
import { getPrisma } from '@/lib/prisma/client'

export const metadata = {
  title: 'Contact enquiries',
  robots: { index: false, follow: false },
}

export default async function ContactEnquiriesPage({ searchParams }) {
  const current = await requirePermission('MANAGE_CONTACT_ENQUIRIES')
  const query = parseEnquiryListQuery(await searchParams)

  let listing = null
  let services = []
  let loadError = null

  try {
    ;[listing, services] = await Promise.all([
      listEnquiries(getPrisma(), current.admin.id, query),
      listEnquiryServices(getPrisma(), current.admin.id),
    ])
  } catch (error) {
    if (error instanceof EnquiryError && (error.code === 'FORBIDDEN' || error.code === 'UNAUTHENTICATED')) throw error
    loadError = 'The enquiry inbox could not be loaded.'
  }

  return (
    <>
      <PageHeader title="Contact enquiries" description="Review submitted messages, update their status, and keep the dashboard new count accurate." />
      <EnquiriesPanel query={query} listing={listing} services={services} loadError={loadError} />
    </>
  )
}
