/**
 * Presentation-only hero labels keyed by existing CMS service slug.
 * Capability list items come from PracticeArea records — not duplicated here.
 */
export const SERVICE_PRESENTATION = {
  'dispute-defense': {
    en: {
      expertiseBadge: 'EXPERTISE',
      capabilitiesHeading: 'OUR DISPUTE CAPABILITIES',
      capabilitiesTagline: 'Prepared for Complexity. Focused on Your Position.',
      titleAccentWord: 'Defense',
    },
    ar: {
      expertiseBadge: 'خبراتنا',
      capabilitiesHeading: 'قدراتنا في المنازعات والدفاع',
      capabilitiesTagline: 'استعداد للتعقيد. تركيز على مركزكم القانوني.',
      titleAccentWord: 'والدفاع القانوني',
    },
  },
  'ip-regulatory': {
    en: {
      expertiseBadge: 'IP & REGULATORY',
      capabilitiesHeading: 'OUR IP & REGULATORY CAPABILITIES',
      capabilitiesTagline: 'Protect What Matters. Navigate What Comes Next.',
      titleAccentWord: 'Regulatory',
    },
    ar: {
      expertiseBadge: 'الملكية الفكرية والشؤون التنظيمية',
      capabilitiesHeading: 'قدراتنا في الملكية الفكرية والشؤون التنظيمية',
      capabilitiesTagline: 'نحمي ما يهمّكم. ونوجّهكم لما يأتي لاحقاً.',
      titleAccentWord: 'والشؤون التنظيمية',
    },
  },
  'corporate-finance': {
    en: {
      expertiseBadge: 'LEGAL EXPERTISE',
      capabilitiesHeading: 'OUR CORPORATE CAPABILITIES',
      capabilitiesTagline: 'Commercial Insight. Legally Sound Decisions.',
      titleAccentWord: 'Finance',
    },
    ar: {
      expertiseBadge: 'خبرة قانونية',
      capabilitiesHeading: 'قدراتنا في شؤون الشركات',
      capabilitiesTagline: 'رؤية تجارية. وقرارات قانونية راسخة.',
      titleAccentWord: 'والتمويل',
    },
  },
}

export function getServicePresentation(slug, locale = 'en') {
  const entry = SERVICE_PRESENTATION[slug]
  if (!entry) {
    return {
      expertiseBadge: locale === 'ar' ? 'خبراتنا' : 'EXPERTISE',
      capabilitiesHeading: locale === 'ar' ? 'قدراتنا' : 'OUR CAPABILITIES',
      capabilitiesTagline: '',
      titleAccentWord: '',
    }
  }
  return entry[locale === 'ar' ? 'ar' : 'en'] || entry.en
}

/** First three practice points for the hero capability panel. */
export function getHeroCapabilityItems(practiceAreas = [], limit = 3) {
  return (practiceAreas || []).slice(0, limit).map((area) => ({
    id: area.id,
    title: area.title || '',
    body: area.subtitle || area.description || '',
  }))
}
