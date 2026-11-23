export class ServiceError extends Error {
  constructor(code, message) {
    super(message || code)
    this.name = 'ServiceError'
    this.code = code
  }
}

export function serviceActionMessage(code) {
  switch (code) {
    case 'INVALID_NAME':
      return 'Enter both the English and Arabic service names before saving.'
    case 'INVALID_SLUG':
      return 'The English service name could not be turned into a valid URL slug. Use letters or numbers in the English name.'
    case 'INVALID_HERO':
      return 'Complete the hero section: English and Arabic titles and descriptions are required.'
    case 'INVALID_OVERVIEW':
      return 'Complete the practice-area section: English and Arabic titles and descriptions are required.'
    case 'INVALID_PRACTICE_AREAS':
      return 'Each practice-area point needs an English and Arabic title, subtitle, and description. Add at least one complete point.'
    case 'INVALID_BENEFITS':
      return 'Add at least one benefit in English and Arabic.'
    case 'MISSING_HERO_IMAGE':
      return 'Upload a hero image (JPEG, PNG, or WebP up to 2 MB).'
    case 'MISSING_PRACTICE_IMAGE':
      return 'Upload a practice-area image (JPEG, PNG, or WebP up to 2 MB).'
    case 'INVALID_IMAGE':
      return 'One of the images is invalid. Use JPEG, PNG, or WebP only, up to 2 MB each.'
    case 'FORBIDDEN':
      return 'You do not have permission to change services with this account.'
    case 'UNAUTHENTICATED':
      return 'Your session expired. Sign in again, then retry saving.'
    case 'NOT_FOUND':
      return 'That service was not found. It may have been deleted.'
    default:
      return 'The service could not be saved. Check the required fields and images, then try again.'
  }
}
