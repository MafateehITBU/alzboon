import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createStorageKey, resolveStoredFile, storageDirectory } from './paths.js'

export async function writeStoredFile(visibility, bytes) {
  const storageKey = createStorageKey()
  await mkdir(storageDirectory(visibility), { recursive: true })
  await writeFile(resolveStoredFile(visibility, storageKey), bytes, { flag: 'wx' })
  return storageKey
}

export async function readStoredFile(visibility, storageKey) {
  return readFile(resolveStoredFile(visibility, storageKey))
}

export async function removeStoredFile(visibility, storageKey) {
  await rm(resolveStoredFile(visibility, storageKey), { force: true })
}
