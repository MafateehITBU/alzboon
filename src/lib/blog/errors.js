export class BlogError extends Error {
  constructor(code, message) {
    super(message || code)
    this.name = 'BlogError'
    this.code = code
  }
}

export function blogActionMessage(code) {
  switch (code) {
    case 'INVALID_NAME_EN':
      return 'Enter an English category name so a valid slug can be generated.'
    case 'INVALID_NAME_AR':
      return 'Enter an Arabic category name.'
    case 'INVALID_SLUG':
      return 'A unique slug could not be generated from the English name.'
    case 'DUPLICATE_SLUG':
      return 'Another category already uses that slug.'
    case 'CATEGORY_IN_USE':
      return 'This category still has blogs. Move or delete those blogs first.'
    case 'INVALID_TITLE':
      return 'Enter English and Arabic titles.'
    case 'INVALID_AUTHOR':
      return 'Enter an author name.'
    case 'INVALID_DATE':
      return 'Enter a valid publish date.'
    case 'INVALID_CATEGORY':
      return 'Choose a valid blog category.'
    case 'INVALID_DOCUMENT':
      return 'Enter English and Arabic content.'
    case 'INVALID_IMAGE':
      return 'Use a JPEG, PNG, or WebP featured image up to 2 MB.'
    case 'MISSING_IMAGE':
      return 'Upload a featured image.'
    case 'INVALID_ATTACHMENT':
      return 'Attachments must be PDF files up to 10 MB.'
    case 'FORBIDDEN':
      return 'That change is not allowed for this account.'
    case 'UNAUTHENTICATED':
      return 'Sign in again to continue.'
    case 'NOT_FOUND':
      return 'That record was not found.'
    default:
      return 'The change could not be saved.'
  }
}
