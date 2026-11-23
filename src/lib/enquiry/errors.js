export class EnquiryError extends Error {
  constructor(code, message) {
    super(message || code)
    this.name = 'EnquiryError'
    this.code = code
  }
}

export const ENQUIRY_STATUSES = ['NEW', 'READ', 'ARCHIVED']

export function enquiryActionMessage(code) {
  switch (code) {
    case 'INVALID_STATUS':
      return 'Choose a valid enquiry status.'
    case 'FORBIDDEN':
      return 'That change is not allowed for this account.'
    case 'UNAUTHENTICATED':
      return 'Sign in again to continue.'
    case 'NOT_FOUND':
      return 'That enquiry was not found.'
    default:
      return 'The change could not be saved.'
  }
}
