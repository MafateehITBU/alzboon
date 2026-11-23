import dispute from '@/assets/icons/icon-dispute.svg'
import corporate from '@/assets/icons/icon-corporate.svg'
import regulatory from '@/assets/icons/icon-regulatory.svg'

const FALLBACK_ICONS = [
  { src: dispute, width: 22, height: 24 },
  { src: corporate, width: 22, height: 22 },
  { src: regulatory, width: 12, height: 20 },
]

const SLUG_ICONS = {
  'dispute-defense': FALLBACK_ICONS[0],
  'corporate-finance': FALLBACK_ICONS[1],
  'ip-regulatory': FALLBACK_ICONS[2],
}

export function getServiceNavIcon(slug, index = 0) {
  if (slug && SLUG_ICONS[slug]) return SLUG_ICONS[slug]
  return FALLBACK_ICONS[index % FALLBACK_ICONS.length]
}
