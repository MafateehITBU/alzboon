import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma/client'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(_request, context) {
  const { mediaId } = await context.params

  if (!UUID.test(mediaId || '')) {
    return new NextResponse('Not found', { status: 404 })
  }

  const media = await getPrisma().mediaAsset.findUnique({ where: { id: mediaId } })
  if (!media || media.visibility !== 'PUBLIC') {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const { readStoredFile } = await import('@/lib/storage/objects')
    const bytes = await readStoredFile('PUBLIC', media.storageKey)
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': media.mimeType,
        'Content-Length': String(bytes.length),
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
