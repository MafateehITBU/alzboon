import { hasPermission } from '../auth/permissions.js'
import { publicAdmin } from '../auth/session.js'
import { EnquiryError } from './errors.js'

export async function assertCanManageEnquiries(db, actorId) {
  const actor = await db.adminUser.findUnique({
    where: { id: actorId },
    include: { permissions: { select: { permission: true } } },
  })

  if (!actor?.active) throw new EnquiryError('UNAUTHENTICATED')
  if (!hasPermission(publicAdmin(actor), 'MANAGE_CONTACT_ENQUIRIES')) throw new EnquiryError('FORBIDDEN')
  return actor
}
