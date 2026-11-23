import { hasPermission } from '../auth/permissions.js'
import { publicAdmin } from '../auth/session.js'
import { BlogError } from './errors.js'

export async function assertCanManageBlogs(db, actorId) {
  const actor = await db.adminUser.findUnique({
    where: { id: actorId },
    include: { permissions: { select: { permission: true } } },
  })

  if (!actor?.active) throw new BlogError('UNAUTHENTICATED')
  if (!hasPermission(publicAdmin(actor), 'MANAGE_BLOGS')) throw new BlogError('FORBIDDEN')
  return actor
}
