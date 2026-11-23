import { PERMISSIONS } from './constants.js'

export function hasPermission(admin, permission) {
  if (!admin?.active) return false
  if (!PERMISSIONS.includes(permission)) return false
  if (admin.role === 'SUPER_ADMIN') return true
  return admin.permissions.includes(permission)
}

export function canManageAdmins(admin) {
  return hasPermission(admin, 'MANAGE_ADMINS')
}
