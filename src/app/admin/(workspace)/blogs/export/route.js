import { requirePermission } from '@/lib/auth/current-admin'
import { csvResponse } from '@/lib/csv/csv'
import { exportBlogsCsv } from '@/lib/csv/blogs-csv'
import { getPrisma } from '@/lib/prisma/client'

export async function GET() {
  const current = await requirePermission('MANAGE_BLOGS')
  const csv = await exportBlogsCsv(getPrisma(), current.admin.id)
  return csvResponse('blogs.csv', csv)
}
