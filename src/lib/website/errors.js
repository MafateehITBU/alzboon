export class WebsiteError extends Error {
  constructor(code) {
    super(code)
    this.name = 'WebsiteError'
    this.code = code
  }
}

export function websiteActionMessage(code) {
  switch (code) {
    case 'INVALID_EMAIL':
      return 'Enter a valid contact email address.'
    case 'INVALID_HOURS':
      return 'Enter business hours in English and Arabic.'
    case 'INVALID_PHONE':
      return 'Each phone needs a number and a region.'
    case 'INVALID_ADDRESS':
      return 'Each address needs English text, Arabic text, and a region.'
    case 'INVALID_MAP':
      return 'Each map location needs a label and valid latitude and longitude.'
    case 'INVALID_SOCIAL_URL':
      return 'Social links must be blank or a valid http(s) URL.'
    case 'INVALID_IMAGE':
      return 'Use a JPEG, PNG, or WebP image up to 2 MB. SVG is not accepted.'
    case 'INVALID_NAME':
      return 'Enter a partner name.'
    case 'MISSING_LOGO':
      return 'Upload a partner logo.'
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
