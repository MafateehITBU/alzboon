'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Briefcase,
  FolderTree,
  Globe,
  Handshake,
  Inbox,
  LayoutDashboard,
  Menu,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import logo from '@/assets/images/logo-header.png'
import { assetSrc } from '@/lib/utils/assetSrc'
import { accountInitials } from '@/lib/admin/navigation'
import { logoutAction } from '@/app/admin/actions'
import { adminGhostButton, adminOutlineButton, adminTealButton } from '@/components/admin/adminStyles'

const icons = {
  Briefcase,
  FolderTree,
  Globe,
  Handshake,
  Inbox,
  LayoutDashboard,
  Newspaper,
  UserRound,
  Users,
}

export default function AdminShell({ admin, groups, children }) {
  const pathname = usePathname()
  const [navPath, setNavPath] = useState(pathname)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const menuId = useId()
  const accountMenuId = useId()
  const closeMenuRef = useRef(null)

  if (navPath !== pathname) {
    setNavPath(pathname)
    setMobileOpen(false)
    setAccountOpen(false)
  }

  useEffect(() => {
    if (mobileOpen) closeMenuRef.current?.focus()
  }, [mobileOpen])

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        setAccountOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function closeMobile() {
    setMobileOpen(false)
  }

  return (
    <div className="min-h-svh bg-[#f3f1eb] text-ink">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(63,131,119,0.12),transparent_34%),radial-gradient(circle_at_85%_12%,rgba(187,169,122,0.16),transparent_28%),linear-gradient(180deg,#f7f5ef_0%,#f1efe8_100%)]"
        aria-hidden="true"
      />
      <div className="relative flex min-h-svh">
        <Sidebar
          groups={groups}
          pathname={pathname}
          collapsed={collapsed}
          onToggle={() => setCollapsed((open) => !open)}
          onNavigate={closeMobile}
          className="sticky top-0 hidden h-svh min-[1024px]:flex"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-white/60 bg-white/70 px-4 backdrop-blur-xl min-[1024px]:px-8">
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-xl border border-line/80 bg-white text-ink shadow-sm transition hover:border-teal/30 hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/35 min-[1024px]:hidden"
              aria-expanded={mobileOpen}
              aria-controls={menuId}
              onClick={() => setMobileOpen(true)}
            >
              <Menu aria-hidden="true" size={18} />
              <span className="sr-only">Open menu</span>
            </button>
            <div className="hidden min-[1024px]:block">
              <p className="font-jakarta text-[11px] font-medium tracking-[0.18em] text-teal/80 uppercase">Workspace</p>
              <p className="font-jakarta text-sm font-semibold text-ink">Awwad AlZboon CMS</p>
            </div>
            <AccountMenu
              admin={admin}
              open={accountOpen}
              menuId={accountMenuId}
              onToggle={() => setAccountOpen((open) => !open)}
              onClose={() => setAccountOpen(false)}
            />
          </header>
          <div className="min-w-0 flex-1 px-4 py-6 min-[820px]:px-6 min-[1024px]:px-8 min-[1024px]:py-8">{children}</div>
        </div>
      </div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 min-[1024px]:hidden">
          <button type="button" className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" aria-label="Close menu" onClick={closeMobile} />
          <Sidebar
            id={menuId}
            groups={groups}
            pathname={pathname}
            collapsed={false}
            closeRef={closeMenuRef}
            onToggle={null}
            onNavigate={closeMobile}
            className="relative z-10 flex h-full w-[288px]"
          />
        </div>
      ) : null}
    </div>
  )
}

function Sidebar({ id, groups, pathname, collapsed, onToggle, onNavigate, closeRef, className }) {
  return (
    <aside
      id={id}
      className={`shrink-0 flex-col border-r border-white/70 bg-white/80 text-ink shadow-[8px_0_40px_-28px_rgba(1,19,32,0.35)] backdrop-blur-xl ${collapsed ? 'w-[88px]' : 'w-[280px]'} ${className}`}
    >
      <div className={`flex items-center border-b border-line/60 ${collapsed ? 'flex-col gap-2 px-2 py-4' : 'h-16 justify-between gap-2 px-4'}`}>
        {collapsed ? (
          <span className="grid size-10 place-items-center rounded-2xl bg-teal font-jakarta text-sm font-bold text-white shadow-[0_10px_20px_-12px_rgba(63,131,119,0.8)]" aria-hidden="true">
            AZ
          </span>
        ) : (
          <div className="min-w-0">
            <img src={assetSrc(logo)} alt="Awwad AlZboon" width="168" height="34" className="h-8 w-auto" />
            <p className="mt-1 font-jakarta text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Admin</p>
          </div>
        )}
        {onToggle ? (
          <button
            type="button"
            className={adminGhostButton}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onToggle}
          >
            {collapsed ? <PanelLeftOpen aria-hidden="true" size={18} /> : <PanelLeftClose aria-hidden="true" size={18} />}
          </button>
        ) : (
          <button type="button" ref={closeRef} className={adminGhostButton} onClick={onNavigate}>
            <X aria-hidden="true" size={18} />
            <span className="sr-only">Close menu</span>
          </button>
        )}
      </div>
      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <section key={group.label} className="mb-5">
            {collapsed ? null : (
              <h2 className="px-3 pb-2 font-jakarta text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">{group.label}</h2>
            )}
            <ul className="grid gap-1">
              {group.items.map((entry) => (
                <li key={entry.label}>
                  <NavItem entry={entry} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  )
}

function NavItem({ entry, pathname, collapsed, onNavigate }) {
  const Icon = icons[entry.icon]
  const active =
    entry.href === '/admin' ? pathname === '/admin' : pathname === entry.href || pathname.startsWith(`${entry.href}/`)
  const className = `group flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left font-jakarta text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/35 ${collapsed ? 'justify-center' : ''} ${
    entry.enabled
      ? active
        ? 'bg-teal text-white shadow-[0_12px_24px_-16px_rgba(63,131,119,0.9)]'
        : 'text-body hover:bg-teal/8 hover:text-ink'
      : 'cursor-not-allowed text-muted/50'
  }`

  if (!entry.enabled) {
    return (
      <button type="button" className={className} disabled aria-label={`${entry.label}, not available yet`} title={entry.note}>
        <Icon aria-hidden="true" size={18} />
        {collapsed ? null : (
          <>
            <span className="min-w-0 flex-1">{entry.label}</span>
            <span className="rounded-full bg-line/70 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted uppercase">Soon</span>
          </>
        )}
      </button>
    )
  }

  return (
    <Link href={entry.href} aria-current={active ? 'page' : undefined} aria-label={collapsed ? entry.label : undefined} className={className} onClick={onNavigate}>
      <Icon aria-hidden="true" size={18} className={active ? '' : 'text-teal/80 group-hover:text-teal'} />
      {collapsed ? null : <span className={active ? 'font-semibold' : 'font-medium'}>{entry.label}</span>}
    </Link>
  )
}

function AccountMenu({ admin, open, menuId, onToggle, onClose }) {
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) onClose()
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, onClose])

  return (
    <div ref={rootRef} className="relative ml-auto">
      <button
        type="button"
        className="inline-flex min-h-11 items-center gap-3 rounded-2xl border border-line/80 bg-white/90 px-2 pr-3 shadow-sm transition hover:border-teal/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/35"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={onToggle}
      >
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-teal to-[#2f655c] font-jakarta text-sm font-bold text-white" aria-hidden="true">
          {accountInitials(admin.name)}
        </span>
        <span className="hidden text-left min-[768px]:block">
          <span className="block font-jakarta text-sm font-semibold text-ink">{admin.name}</span>
          <span className="block font-jakarta text-xs text-muted">{admin.roleLabel}</span>
        </span>
        <span className="sr-only">Account menu for {admin.name}</span>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute top-14 right-0 z-40 w-72 overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_24px_60px_-28px_rgba(1,19,32,0.45)] backdrop-blur-xl"
        >
          <p className="font-jakarta text-sm break-all text-ink">{admin.email}</p>
          <p className="mt-1 font-jakarta text-xs font-medium tracking-wide text-teal uppercase">{admin.roleLabel}</p>
          <Link href="/admin/account" role="menuitem" className={`${adminTealButton} mt-4 w-full`} onClick={onClose}>
            Account
          </Link>
          <form action={logoutAction} className="mt-2">
            <button type="submit" role="menuitem" className={`${adminOutlineButton} w-full`}>
              Log out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  )
}
