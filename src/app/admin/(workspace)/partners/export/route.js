import { requirePermission } from '@/lib/auth/current-admin'
import { csvResponse } from '@/lib/csv/csv'
import { exportPartnersCsv } from '@/lib/csv/partners-csv'
import { getPrisma } from '@/lib/prisma/client'

export async function GET() {
  const current = await requirePermission('MANAGE_WEBSITE_SETTINGS')
  const csv = await exportPartnersCsv(getPrisma(), current.admin.id)
  return csvResponse('partners.csv', csv)
}
