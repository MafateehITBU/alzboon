import { hasPermission } from '../auth/permissions.js'
import { publicAdmin } from '../auth/session.js'
import { ServiceError } from './errors.js'

export async function assertCanManageServices(db, actorId) {
  const actor = await db.adminUser.findUnique({
    where: { id: actorId },
    include: { permissions: { select: { permission: true } } },
  })

  if (!actor?.active) throw new ServiceError('UNAUTHENTICATED')
  if (!hasPermission(publicAdmin(actor), 'MANAGE_SERVICES')) throw new ServiceError('FORBIDDEN')
  return actor
}
