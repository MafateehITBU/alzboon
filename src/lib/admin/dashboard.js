import { dashboardCardsFor } from './navigation.js'

export async function loadDashboardCards(db, admin) {
  const cards = []

  for (const definition of dashboardCardsFor(admin)) {
    try {
      cards.push({ ...definition, status: 'ok', ...(await countCard(db, definition.key)) })
    } catch {
      cards.push({ ...definition, status: 'error' })
    }
  }

  return cards
}

async function countCard(db, key) {
  if (key === 'admins') return { count: await db.adminUser.count() }
  if (key === 'blogCategories') return { count: await db.blogCategory.count() }
  if (key === 'blogs') return { count: await db.blog.count() }
  if (key === 'services') return { count: await db.service.count() }

  const [count, newCount] = await Promise.all([
    db.contactEnquiry.count(),
    db.contactEnquiry.count({ where: { status: 'NEW' } }),
  ])

  return { count, newCount }
}
