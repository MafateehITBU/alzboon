import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test, { after, before } from 'node:test'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth/password.js'
import {
  createBlogCategory,
  deleteBlogCategory,
  updateBlogCategory,
} from '../src/lib/blog/categories.js'
import {
  createBlog,
  deleteBlog,
  updateBlog,
} from '../src/lib/blog/blogs.js'
import { BlogError } from '../src/lib/blog/errors.js'
import { getPublishedBlogById, listPublishedBlogs, publishedBlogWhere } from '../src/lib/blog/public.js'
import { sanitizeTipTapDocument } from '../src/lib/blog/sanitize-document.js'
import { slugifyCategoryName, uniqueCategorySlug } from '../src/lib/blog/slug.js'
import { validateAttachment } from '../src/lib/media/attachment.js'
import { deleteMediaIfOrphan } from '../src/lib/media/orphan.js'
import { validatePublicImage } from '../src/lib/media/public-image.js'
import { removeStoredFile, writeStoredFile } from '../src/lib/storage/objects.js'

const password = 'Phase7-Test-1a'
const prisma = new PrismaClient()
let passwordHash
let previousStorageRoot
let storageRoot

function email() {
  return `phase7-test-${randomUUID()}@example.com`
}

function doc(text) {
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  }
}

async function createAdmin({ role = 'ADMIN', permissions = [], address = email() } = {}) {
  return prisma.adminUser.create({
    data: {
      name: 'Phase 7 test',
      email: address,
      passwordHash,
      role,
      active: true,
      permissions: { create: permissions.map((permission) => ({ permission })) },
    },
  })
}

async function makeImageMedia() {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])
  const validated = validatePublicImage({ filename: 'cover.png', bytes: png })
  assert.equal(validated.ok, true)
  const storageKey = await writeStoredFile('PUBLIC', png)
  return {
    storageKey,
    mimeType: validated.mimeType,
    byteSize: validated.byteSize,
    originalFilename: validated.originalFilename,
  }
}

async function makePdfMedia() {
  const pdf = Buffer.from('%PDF-1.4\n% test attachment\n')
  const validated = validateAttachment({ filename: 'brief.pdf', bytes: pdf })
  assert.equal(validated.ok, true)
  const storageKey = await writeStoredFile('PRIVATE', pdf)
  return {
    storageKey,
    mimeType: validated.mimeType,
    byteSize: validated.byteSize,
    originalFilename: validated.originalFilename,
  }
}

async function cleanup() {
  await prisma.blogTranslation.deleteMany({})
  await prisma.blog.deleteMany({})
  await prisma.blogCategory.deleteMany({})
  await prisma.mediaAsset.deleteMany({
    where: {
      OR: [{ visibility: 'PUBLIC' }, { mimeType: 'application/pdf' }],
    },
  })
  await prisma.adminUser.deleteMany({ where: { email: { startsWith: 'phase7-test-' } } })
}

before(async () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set.')
  previousStorageRoot = process.env.STORAGE_ROOT
  storageRoot = mkdtempSync(join(tmpdir(), 'alzboon-phase7-'))
  process.env.STORAGE_ROOT = storageRoot
  passwordHash = await hashPassword(password)
  await cleanup()
})

after(async () => {
  await cleanup()
  await prisma.$disconnect()
  if (previousStorageRoot === undefined) delete process.env.STORAGE_ROOT
  else process.env.STORAGE_ROOT = previousStorageRoot
  rmSync(storageRoot, { recursive: true, force: true })
})

test('category create edit slug uniqueness and arabic-only english rejection', async () => {
  const actor = await createAdmin({ role: 'SUPER_ADMIN' })

  try {
    await assert.rejects(
      () => createBlogCategory(prisma, actor.id, { nameEn: 'مقالات', nameAr: 'مقالات' }),
      (error) => error instanceof BlogError && error.code === 'INVALID_SLUG',
    )

    const first = await createBlogCategory(prisma, actor.id, {
      nameEn: 'Corporate Law',
      nameAr: 'قانون الشركات',
    })
    assert.equal(first.slug, 'corporate-law')
    assert.equal(first.nameAr, 'قانون الشركات')

    const second = await createBlogCategory(prisma, actor.id, {
      nameEn: 'Corporate Law',
      nameAr: 'قانون الشركات ٢',
    })
    assert.equal(second.slug, 'corporate-law-2')

    const updated = await updateBlogCategory(prisma, actor.id, first.id, {
      nameEn: 'Dispute Resolution',
      nameAr: 'حل النزاعات',
    })
    assert.equal(updated.slug, 'dispute-resolution')
    assert.equal(slugifyCategoryName('Hello World!'), 'hello-world')
    assert.equal(await uniqueCategorySlug(prisma, 'Dispute Resolution', first.id), 'dispute-resolution')
  } finally {
    await prisma.blogCategory.deleteMany({})
    await prisma.adminUser.delete({ where: { id: actor.id } })
  }
})

test('category deletion is blocked while blogs reference it', async () => {
  const actor = await createAdmin({ role: 'SUPER_ADMIN' })
  const category = await createBlogCategory(prisma, actor.id, {
    nameEn: 'In Use',
    nameAr: 'مستخدم',
  })
  const featured = await makeImageMedia()

  try {
    const created = await createBlog(prisma, actor.id, {
      titleEn: 'Keep category',
      titleAr: 'إبقاء التصنيف',
      authorName: 'Editor',
      publishedOn: '2020-01-01',
      published: false,
      categoryId: category.id,
      documentEn: doc('English body'),
      documentAr: doc('نص عربي'),
      featuredMedia: featured,
    })

    await assert.rejects(
      () => deleteBlogCategory(prisma, actor.id, category.id),
      (error) => error instanceof BlogError && error.code === 'CATEGORY_IN_USE',
    )

    const deleted = await deleteBlog(prisma, actor.id, created.blog.id)
    for (const media of deleted.removedMedia) {
      await removeStoredFile(media.visibility, media.storageKey)
    }

    await deleteBlogCategory(prisma, actor.id, category.id)
  } finally {
    await prisma.blogTranslation.deleteMany({})
    await prisma.blog.deleteMany({})
    await prisma.blogCategory.deleteMany({})
    await prisma.adminUser.delete({ where: { id: actor.id } })
  }
})

test('blog create edit bilingual content category and media', async () => {
  const actor = await createAdmin({ role: 'SUPER_ADMIN' })
  const denied = await createAdmin({ permissions: ['MANAGE_WEBSITE_SETTINGS'] })
  const category = await createBlogCategory(prisma, actor.id, {
    nameEn: 'Insights',
    nameAr: 'رؤى',
  })
  const featured = await makeImageMedia()
  const attachment = await makePdfMedia()

  try {
    await assert.rejects(
      () =>
        createBlog(prisma, denied.id, {
          titleEn: 'Denied',
          titleAr: 'مرفوض',
          authorName: 'X',
          publishedOn: '2024-01-01',
          published: true,
          categoryId: category.id,
          documentEn: doc('Denied'),
          documentAr: doc('مرفوض'),
          featuredMedia: featured,
        }),
      (error) => error.code === 'FORBIDDEN',
    )

    const created = await createBlog(prisma, actor.id, {
      titleEn: 'Market update',
      titleAr: 'تحديث السوق',
      authorName: 'Awwad Team',
      publishedOn: '2024-06-01',
      published: true,
      categoryId: category.id,
      documentEn: doc('English insight'),
      documentAr: doc('رؤية عربية'),
      featuredMedia: featured,
      attachmentMedia: attachment,
      attachmentDisplayName: 'Briefing PDF',
    })

    assert.equal(created.blog.titleEn, 'Market update')
    assert.equal(created.blog.titleAr, 'تحديث السوق')
    assert.equal(created.blog.categoryId, category.id)
    assert.equal(created.blog.attachmentDisplayName, 'Briefing PDF')
    assert.ok(created.blog.attachmentUrl.startsWith('/admin/media/'))
    assert.ok(created.blog.featuredUrl.startsWith('/media/'))

    const replacement = await makeImageMedia()
    const updated = await updateBlog(prisma, actor.id, created.blog.id, {
      titleEn: 'Market update revised',
      titleAr: 'تحديث السوق المعدل',
      authorName: 'Editorial Desk',
      publishedOn: '2024-06-02',
      published: false,
      categoryId: category.id,
      documentEn: doc('Revised English'),
      documentAr: doc('نص معدل'),
      featuredMedia: replacement,
      removeAttachment: true,
      attachmentDisplayName: '',
    })

    assert.equal(updated.blog.titleEn, 'Market update revised')
    assert.equal(updated.blog.published, false)
    assert.equal(updated.blog.attachmentMediaId, null)
    assert.ok(updated.removedMedia.length >= 1)

    for (const media of updated.removedMedia) {
      await removeStoredFile(media.visibility, media.storageKey)
    }

    const deleted = await deleteBlog(prisma, actor.id, created.blog.id)
    for (const media of deleted.removedMedia) {
      await removeStoredFile(media.visibility, media.storageKey)
    }
  } finally {
    await prisma.blogTranslation.deleteMany({})
    await prisma.blog.deleteMany({})
    await prisma.blogCategory.deleteMany({})
    await prisma.adminUser.deleteMany({ where: { id: { in: [actor.id, denied.id] } } })
  }
})

test('published blogs exclude hidden and future dates', async () => {
  const actor = await createAdmin({ role: 'SUPER_ADMIN' })
  const category = await createBlogCategory(prisma, actor.id, {
    nameEn: 'Publish Rules',
    nameAr: 'قواعد النشر',
  })

  const pastImage = await makeImageMedia()
  const hiddenImage = await makeImageMedia()
  const futureImage = await makeImageMedia()

  try {
    const visible = await createBlog(prisma, actor.id, {
      titleEn: 'Visible now',
      titleAr: 'ظاهر الآن',
      authorName: 'Desk',
      publishedOn: '2020-01-01',
      published: true,
      categoryId: category.id,
      documentEn: doc('Visible'),
      documentAr: doc('ظاهر'),
      featuredMedia: pastImage,
    })

    const hidden = await createBlog(prisma, actor.id, {
      titleEn: 'Hidden draft',
      titleAr: 'مسودة مخفية',
      authorName: 'Desk',
      publishedOn: '2020-01-01',
      published: false,
      categoryId: category.id,
      documentEn: doc('Hidden'),
      documentAr: doc('مخفي'),
      featuredMedia: hiddenImage,
    })

    const future = await createBlog(prisma, actor.id, {
      titleEn: 'Future post',
      titleAr: 'منشور مستقبلي',
      authorName: 'Desk',
      publishedOn: '2099-01-01',
      published: true,
      categoryId: category.id,
      documentEn: doc('Future'),
      documentAr: doc('مستقبل'),
      featuredMedia: futureImage,
    })

    const listed = await listPublishedBlogs(prisma, { take: 50 })
    const ids = listed.map((row) => row.id)
    assert.ok(ids.includes(visible.blog.id))
    assert.equal(ids.includes(hidden.blog.id), false)
    assert.equal(ids.includes(future.blog.id), false)

    assert.equal(await getPublishedBlogById(prisma, hidden.blog.id), null)
    assert.equal(await getPublishedBlogById(prisma, future.blog.id), null)
    assert.ok(await getPublishedBlogById(prisma, visible.blog.id))

    const where = publishedBlogWhere(new Date('2024-01-01T00:00:00.000Z'))
    assert.equal(where.published, true)
    assert.ok(where.publishedOn.lte instanceof Date)

    for (const blog of [visible, hidden, future]) {
      const deleted = await deleteBlog(prisma, actor.id, blog.blog.id)
      for (const media of deleted.removedMedia) {
        await removeStoredFile(media.visibility, media.storageKey)
      }
    }
  } finally {
    await prisma.blogTranslation.deleteMany({})
    await prisma.blog.deleteMany({})
    await prisma.blogCategory.deleteMany({})
    await prisma.adminUser.delete({ where: { id: actor.id } })
  }
})

test('rich-text sanitization strips unsafe nodes marks and protocols', () => {
  const dirty = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Safe',
            marks: [
              { type: 'bold' },
              { type: 'link', attrs: { href: 'javascript:alert(1)' } },
              { type: 'link', attrs: { href: 'https://example.com/a' } },
            ],
          },
        ],
      },
      { type: 'script', content: [{ type: 'text', text: 'evil' }] },
      {
        type: 'heading',
        attrs: { level: 2, textAlign: 'center' },
        content: [{ type: 'text', text: 'Title' }],
      },
    ],
  }

  const clean = sanitizeTipTapDocument(dirty)
  assert.equal(clean.type, 'doc')
  assert.equal(clean.content.length, 2)
  assert.equal(clean.content[0].content[0].marks.length, 2)
  assert.equal(clean.content[0].content[0].marks.some((mark) => mark.type === 'link' && mark.attrs.href.startsWith('https://')), true)
  assert.equal(clean.content[0].content[0].marks.some((mark) => mark.attrs?.href?.startsWith('javascript:')), false)
  assert.equal(clean.content.some((node) => node.type === 'script'), false)
})

test('featured image and attachment validation', () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0, 1, 2, 3])
  assert.equal(validatePublicImage({ filename: 'a.jpg', bytes: jpeg }).ok, true)
  assert.equal(validatePublicImage({ filename: 'a.svg', bytes: Buffer.from('<svg></svg>') }).ok, false)

  const pdf = Buffer.from('%PDF-1.4\ntrailer\n')
  assert.equal(validateAttachment({ filename: 'a.pdf', bytes: pdf }).ok, true)
  assert.equal(validateAttachment({ filename: 'a.exe', bytes: Buffer.from('MZ') }).ok, false)
  assert.equal(validateAttachment({ filename: 'a.pdf', bytes: Buffer.from('not-pdf') }).ok, false)
})

test('orphan media cleanup keeps referenced attachment and removes unused file', async () => {
  const actor = await createAdmin({ role: 'SUPER_ADMIN' })
  const category = await createBlogCategory(prisma, actor.id, {
    nameEn: 'Media Rules',
    nameAr: 'وسائط',
  })
  const featured = await makeImageMedia()
  const attachment = await makePdfMedia()

  try {
    const created = await createBlog(prisma, actor.id, {
      titleEn: 'With attachment',
      titleAr: 'مع مرفق',
      authorName: 'Desk',
      publishedOn: '2021-01-01',
      published: false,
      categoryId: category.id,
      documentEn: doc('Body'),
      documentAr: doc('نص'),
      featuredMedia: featured,
      attachmentMedia: attachment,
      attachmentDisplayName: 'Memo',
    })

    const kept = await deleteMediaIfOrphan(prisma, created.blog.attachmentMediaId)
    assert.equal(kept, null)

    const privateAsset = await prisma.mediaAsset.findUnique({
      where: { id: created.blog.attachmentMediaId },
    })
    assert.equal(privateAsset.visibility, 'PRIVATE')

    const deleted = await deleteBlog(prisma, actor.id, created.blog.id)
    assert.ok(deleted.removedMedia.some((media) => media.visibility === 'PRIVATE'))
    for (const media of deleted.removedMedia) {
      await removeStoredFile(media.visibility, media.storageKey)
    }
  } finally {
    await prisma.blogTranslation.deleteMany({})
    await prisma.blog.deleteMany({})
    await prisma.blogCategory.deleteMany({})
    await prisma.adminUser.delete({ where: { id: actor.id } })
  }
})
