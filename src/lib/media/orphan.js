export async function deleteMediaIfOrphan(tx, mediaId) {
  if (!mediaId) return null

  const media = await tx.mediaAsset.findUnique({
    where: { id: mediaId },
    include: {
      profileAdmins: { select: { id: true }, take: 1 },
      websiteSettings: { select: { id: true }, take: 1 },
      partners: { select: { id: true }, take: 1 },
      featuredBlogs: { select: { id: true }, take: 1 },
      attachmentBlogs: { select: { id: true }, take: 1 },
      heroServices: { select: { id: true }, take: 1 },
      practiceServices: { select: { id: true }, take: 1 },
    },
  })

  if (!media) return null

  const referenced =
    media.profileAdmins.length +
      media.websiteSettings.length +
      media.partners.length +
      media.featuredBlogs.length +
      media.attachmentBlogs.length +
      media.heroServices.length +
      media.practiceServices.length >
    0

  if (referenced) return null

  await tx.mediaAsset.delete({ where: { id: mediaId } })
  return { storageKey: media.storageKey, visibility: media.visibility }
}
