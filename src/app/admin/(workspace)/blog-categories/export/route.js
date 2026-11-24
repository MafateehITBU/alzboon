import { requirePermission } from '@/lib/auth/current-admin'
import { csvResponse } from '@/lib/csv/csv'
import { exportBlogCategoriesCsv } from '@/lib/csv/categories-csv'
import { getPrisma } from '@/lib/prisma/client'

export async function GET() {
  const current = await requirePermission('MANAGE_BLOGS')
  const csv = await exportBlogCategoriesCsv(getPrisma(), current.admin.id)
  return csvResponse('blog-categories.csv', csv)
}
