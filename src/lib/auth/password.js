import { Algorithm, hash, verify } from '@node-rs/argon2'

const options = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
}

export function isStrongPassword(password) {
  if (typeof password !== 'string') return false
  if (password.length < 8 || password.length > 200) return false
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) return false
  return true
}

export function hashPassword(password) {
  return hash(password, options)
}

export function verifyPassword(passwordHash, password) {
  return verify(passwordHash, password)
}

let dummyHash

export async function verifyAgainstStoredOrDummy(passwordHash, password) {
  const stored = passwordHash ?? (dummyHash ??= await hashPassword('dummy-password-not-used-for-login'))
  return verifyPassword(stored, password)
}
