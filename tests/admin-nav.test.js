import assert from 'node:assert/strict'
import test from 'node:test'
import { PrismaClient } from '@prisma/client'
import { loadDashboardCards } from '../src/lib/admin/dashboard.js'
import { adminNavigation, dashboardCardsFor, quickActionsFor } from '../src/lib/admin/navigation.js'

const superAdmin = { active: true, role: 'SUPER_ADMIN', permissions: [] }
const blogAdmin = { active: true, role: 'ADMIN', permissions: ['MANAGE_BLOGS'] }
const plainAdmin = { active: true, role: 'ADMIN', permissions: [] }

function labels(admin) {
  return adminNavigation(admin).flatMap((group) => group.items.map((item) => item.label))
}

test('dashboard and profile stay available without module permissions', () => {
  assert.deepEqual(labels(plainAdmin), ['Dashboard', 'Profile'])
  assert.deepEqual(dashboardCardsFor(plainAdmin), [])
  assert.deepEqual(quickActionsFor(plainAdmin), [])
})

test('navigation follows assigned permissions and links live modules', () => {
  assert.deepEqual(labels(blogAdmin), ['Dashboard', 'Blog Categories', 'Blogs', 'Profile'])
  const items = adminNavigation(superAdmin).flatMap((group) => group.items)
  const unfinished = items.filter((item) => item.enabled === false)
  const groups = adminNavigation(superAdmin).map((group) => group.label)

  assert.deepEqual(groups, [null, 'Management', 'Content', 'Enquiries', 'Account'])
  assert.equal(items.find((item) => item.label === 'Admins').href, '/admin/admins')
  assert.equal(items.find((item) => item.label === 'Website Information').href, '/admin/website')
  assert.equal(items.find((item) => item.label === 'Partners').href, '/admin/partners')
  assert.equal(items.find((item) => item.label === 'Blogs').href, '/admin/blogs')
  assert.equal(items.find((item) => item.label === 'Blog Categories').href, '/admin/blog-categories')
  assert.equal(items.find((item) => item.label === 'Services').href, '/admin/services')
  assert.equal(items.find((item) => item.label === 'Contact Enquiries').href, '/admin/contact-enquiries')
  assert.equal(unfinished.length, 0)
  assert.deepEqual(
    dashboardCardsFor(blogAdmin).map((card) => card.key),
    ['blogCategories', 'blogs'],
  )
  assert.deepEqual(
    quickActionsFor(blogAdmin).map((action) => ({ key: action.key, href: action.href })),
    [
      { key: 'newBlog', href: '/admin/blogs/new' },
      { key: 'manageBlogs', href: '/admin/blogs' },
    ],
  )
  assert.deepEqual(
    quickActionsFor(superAdmin)
      .filter((action) => action.key === 'messages')
      .map((action) => action.href),
    ['/admin/contact-enquiries'],
  )
})

test('dashboard counts are read from the database', async () => {
  const db = new PrismaClient()

  try {
    const cards = await loadDashboardCards(db, superAdmin)
    assert.equal(cards.length, 5)

    for (const card of cards) {
      assert.equal(card.status, 'ok')
      assert.equal(typeof card.count, 'number')
      assert.ok(card.count >= 0)
    }

    const enquiries = cards.find((card) => card.key === 'enquiries')
    assert.equal(typeof enquiries.newCount, 'number')
    assert.ok(enquiries.newCount >= 0)
    assert.ok(enquiries.newCount <= enquiries.count)
  } finally {
    await db.$disconnect()
  }
})
