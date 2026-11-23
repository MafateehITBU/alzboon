import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/current-admin'
import { hasPermission } from '@/lib/auth/permissions'
import { getPrisma } from '@/lib/prisma/client'
import { readStoredFile } from '@/lib/storage/objects'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(_request, context) {
  const current = await requireAdmin()
  const { mediaId } = await context.params

  if (!UUID.test(mediaId || '')) {
    return new NextResponse('Not found', { status: 404 })
  }

  const media = await getPrisma().mediaAsset.findUnique({
    where: { id: mediaId },
    include: {
      profileAdmins: { select: { id: true } },
      attachmentBlogs: { select: { id: true }, take: 1 },
    },
  })

  if (!media || media.visibility !== 'PRIVATE') {
    return new NextResponse('Not found', { status: 404 })
  }

  const isProfilePhoto = media.profileAdmins.length > 0
  const ownsPhoto = media.profileAdmins.some((admin) => admin.id === current.admin.id)
  const isBlogAttachment = media.attachmentBlogs.length > 0
  const canManageAdmins = hasPermission(current.admin, 'MANAGE_ADMINS')
  const canReadPhoto = ownsPhoto || (isProfilePhoto && canManageAdmins)
  const canReadAttachment = isBlogAttachment && hasPermission(current.admin, 'MANAGE_BLOGS')

  // Unlinked private objects stay 404. Linked objects deny with 403 when unauthorized.
  if (!isProfilePhoto && !isBlogAttachment) {
    return new NextResponse('Not found', { status: 404 })
  }
  if (!canReadPhoto && !canReadAttachment) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const bytes = await readStoredFile('PRIVATE', media.storageKey)
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': media.mimeType,
        'Content-Length': String(bytes.length),
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        ...(isBlogAttachment
          ? { 'Content-Disposition': `attachment; filename="${sanitizeFilename(media.originalFilename)}"` }
          : {}),
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}

function sanitizeFilename(name) {
  return String(name || 'attachment.pdf').replace(/[^\w.\-]+/g, '_').slice(0, 120)
}
