import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import PageHeader from '@/components/admin/PageHeader'
import { adminPanelClass } from '@/components/admin/adminStyles'
import { loadDashboardCards } from '@/lib/admin/dashboard'
import { quickActionsFor } from '@/lib/admin/navigation'
import { requireAdmin } from '@/lib/auth/current-admin'
import { getPrisma } from '@/lib/prisma/client'

export const metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default async function DashboardPage() {
  const current = await requireAdmin()
  const cards = await loadDashboardCards(getPrisma(), current.admin)
  const actions = quickActionsFor(current.admin)

  return (
    <>
      <PageHeader title={`Welcome, ${current.admin.name}`} description="Overview of the records this account is allowed to see." />
      {cards.length > 0 ? (
        <section aria-label="Statistics" className="grid gap-4 min-[820px]:grid-cols-2 min-[1280px]:grid-cols-3">
          {cards.map((card) => (
            <article key={card.key} className={`${adminPanelClass} group transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-30px_rgba(1,19,32,0.4)]`}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-jakarta text-sm font-medium text-body">{card.label}</h2>
                <span className="size-2.5 rounded-full bg-teal/70 shadow-[0_0_0_4px_rgba(63,131,119,0.12)]" aria-hidden="true" />
              </div>
              {card.status === 'error' ? (
                <p className="mt-4 font-jakarta text-sm text-danger">This count could not be loaded.</p>
              ) : (
                <p className="mt-4 font-abu text-5xl leading-none tracking-[-0.04em] text-ink">{card.count}</p>
              )}
              {card.status === 'ok' && card.newCount > 0 ? (
                <p className="mt-3 inline-flex rounded-full bg-warning/10 px-2.5 py-1 font-jakarta text-xs font-semibold text-warning">
                  {`${card.newCount} new`}
                </p>
              ) : null}
            </article>
          ))}
        </section>
      ) : (
        <p className={`${adminPanelClass} font-jakarta text-sm text-body`}>No module statistics are available for this account.</p>
      )}
      {actions.length > 0 ? (
        <section aria-label="Quick actions" className="mt-8">
          <h2 className="font-jakarta text-lg font-semibold text-ink">Quick actions</h2>
          <div className="mt-4 grid gap-4 min-[820px]:grid-cols-2 min-[1280px]:grid-cols-3">
            {actions.map((action) =>
              action.href ? (
                <Link
                  key={action.key}
                  href={action.href}
                  className={`${adminPanelClass} group transition duration-200 hover:-translate-y-0.5 hover:border-teal/25 hover:shadow-[0_24px_48px_-30px_rgba(1,19,32,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/35`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-jakarta text-base font-semibold text-ink">{action.label}</h3>
                    <span className="grid size-9 place-items-center rounded-xl bg-teal/10 text-teal transition group-hover:bg-teal group-hover:text-white">
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-2 font-jakarta text-sm leading-6 text-body">Open this module.</p>
                </Link>
              ) : (
                <article key={action.key} className="rounded-2xl border border-dashed border-line/80 bg-white/50 p-5">
                  <h3 className="font-jakarta text-base font-semibold text-ink">{action.label}</h3>
                  <p className="mt-2 font-jakarta text-sm leading-6 text-body">This module is not available yet.</p>
                  <p className="mt-3 font-jakarta text-xs font-semibold tracking-wide text-muted uppercase">Unavailable</p>
                </article>
              ),
            )}
          </div>
        </section>
      ) : null}
    </>
  )
}
