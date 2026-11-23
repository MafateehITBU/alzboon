export function adminActionMessage(code) {
  switch (code) {
    case 'DUPLICATE_EMAIL':
      return 'Another admin already uses that email address.'
    case 'WEAK_PASSWORD':
      return 'Use a password with at least 12 characters, including uppercase, lowercase, and a number.'
    case 'INVALID_NAME':
      return 'Enter a full name.'
    case 'INVALID_EMAIL':
      return 'Enter a valid email address.'
    case 'INVALID_PHONE':
      return 'Enter a shorter phone number, or leave it blank.'
    case 'INVALID_ROLE':
      return 'Choose a valid role.'
    case 'INVALID_PHOTO':
      return 'Use a JPEG, PNG, or WebP photo up to 2 MB.'
    case 'PASSWORD_MISMATCH':
      return 'Password confirmation does not match.'
    case 'WRONG_PASSWORD':
      return 'The current password is incorrect.'
    case 'FORBIDDEN':
      return 'That change is not allowed for this account.'
    case 'UNAUTHENTICATED':
      return 'Sign in again to continue.'
    default:
      return 'The admin account could not be saved.'
  }
}
