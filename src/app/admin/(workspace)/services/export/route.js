import { requirePermission } from '@/lib/auth/current-admin'
import { csvResponse } from '@/lib/csv/csv'
import { exportServicesCsv } from '@/lib/csv/services-csv'
import { getPrisma } from '@/lib/prisma/client'

export async function GET() {
  const current = await requirePermission('MANAGE_SERVICES')
  const csv = await exportServicesCsv(getPrisma(), current.admin.id)
  return csvResponse('services.csv', csv)
}
