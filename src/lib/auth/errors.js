export class AuthError extends Error {
  constructor(code) {
    super(code)
    this.name = 'AuthError'
    this.code = code
  }
}
