import PageHeader from '@/components/admin/PageHeader'
import PartnersPanel from '@/components/admin/partners/PartnersPanel'
import { requirePermission } from '@/lib/auth/current-admin'
import { getPrisma } from '@/lib/prisma/client'
import { listPartners, parsePartnerListQuery } from '@/lib/website/partners'
import { WebsiteError } from '@/lib/website/errors'

export const metadata = {
  title: 'Partners',
  robots: { index: false, follow: false },
}

export default async function PartnersPage({ searchParams }) {
  const current = await requirePermission('MANAGE_WEBSITE_SETTINGS')
  const params = await searchParams
  const query = parsePartnerListQuery(params)

  let listing = null
  let loadError = null

  try {
    listing = await listPartners(getPrisma(), current.admin.id, query)
  } catch (error) {
    if (error instanceof WebsiteError && (error.code === 'FORBIDDEN' || error.code === 'UNAUTHENTICATED')) throw error
    loadError = 'The partners list could not be loaded.'
  }

  return (
    <>
      <PageHeader title="Partners" description="Manage partner names and logos shown when the public partners section is connected." />
      <PartnersPanel query={query} listing={listing} loadError={loadError} />
    </>
  )
}
