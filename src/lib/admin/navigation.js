import { hasPermission } from '../auth/permissions.js'

const permissionLabels = {
  MANAGE_ADMINS: 'Manage admins',
  MANAGE_BLOGS: 'Manage blogs',
  MANAGE_SERVICES: 'Manage services',
  MANAGE_CONTACT_ENQUIRIES: 'Manage contact enquiries',
  MANAGE_WEBSITE_SETTINGS: 'Manage website settings',
}

export function roleLabel(role) {
  return role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'
}

export function permissionLabel(permission) {
  return permissionLabels[permission] ?? permission
}

export function accountInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  const letters = parts.map((part) => part[0]?.toUpperCase()).join('')
  return letters || 'A'
}

export function adminNavigation(admin) {
  const groups = [
    {
      label: null,
      items: [{ href: '/admin', label: 'Dashboard', icon: 'LayoutDashboard', enabled: true }],
    },
    {
      label: 'Management',
      items: [
        ...(hasPermission(admin, 'MANAGE_ADMINS')
          ? [{ href: '/admin/admins', label: 'Admins', icon: 'Shield', enabled: true }]
          : []),
        ...(hasPermission(admin, 'MANAGE_WEBSITE_SETTINGS')
          ? [
              { href: '/admin/website', label: 'Website Information', icon: 'Globe', enabled: true },
              { href: '/admin/partners', label: 'Partners', icon: 'Handshake', enabled: true },
            ]
          : []),
      ],
    },
    {
      label: 'Content',
      items: [
        ...(hasPermission(admin, 'MANAGE_BLOGS')
          ? [
              { href: '/admin/blog-categories', label: 'Blog Categories', icon: 'FolderTree', enabled: true },
              { href: '/admin/blogs', label: 'Blogs', icon: 'FileText', enabled: true },
            ]
          : []),
        ...(hasPermission(admin, 'MANAGE_SERVICES')
          ? [{ href: '/admin/services', label: 'Services', icon: 'Wrench', enabled: true }]
          : []),
      ],
    },
    {
      label: 'Enquiries',
      items: hasPermission(admin, 'MANAGE_CONTACT_ENQUIRIES')
        ? [{ href: '/admin/contact-enquiries', label: 'Contact Enquiries', icon: 'Mail', enabled: true }]
        : [],
    },
    {
      label: 'Account',
      items: [{ href: '/admin/account', label: 'Profile', icon: 'UserRound', enabled: true }],
    },
  ]

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((entry) => entry.enabled || entry.permitted),
    }))
    .filter((group) => group.items.length > 0)
}

export function dashboardCardsFor(admin) {
  return [
    { key: 'admins', label: 'Admins', permission: 'MANAGE_ADMINS' },
    { key: 'blogCategories', label: 'Blog categories', permission: 'MANAGE_BLOGS' },
    { key: 'blogs', label: 'Blogs', permission: 'MANAGE_BLOGS' },
    { key: 'services', label: 'Services', permission: 'MANAGE_SERVICES' },
    { key: 'enquiries', label: 'Contact enquiries', permission: 'MANAGE_CONTACT_ENQUIRIES' },
  ].filter((card) => hasPermission(admin, card.permission))
}

export function quickActionsFor(admin) {
  return [
    { key: 'messages', label: 'Contact messages', permission: 'MANAGE_CONTACT_ENQUIRIES', href: '/admin/contact-enquiries' },
    { key: 'newBlog', label: 'New blog', permission: 'MANAGE_BLOGS', href: '/admin/blogs/new' },
    { key: 'manageBlogs', label: 'Manage blogs', permission: 'MANAGE_BLOGS', href: '/admin/blogs' },
    { key: 'newService', label: 'New service', permission: 'MANAGE_SERVICES', href: '/admin/services/new' },
    {
      key: 'website',
      label: 'Website information',
      permission: 'MANAGE_WEBSITE_SETTINGS',
      href: '/admin/website',
    },
    {
      key: 'partners',
      label: 'Partners',
      permission: 'MANAGE_WEBSITE_SETTINGS',
      href: '/admin/partners',
    },
  ].filter((action) => hasPermission(admin, action.permission))
}
