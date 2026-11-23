'use client'

import { useEffect } from 'react'

/** Syncs documentElement lang/dir with the public locale (root layout defaults to en). */
export default function DocumentLocale({ locale }) {
  useEffect(() => {
    const root = document.documentElement
    const previousLang = root.lang
    const previousDir = root.dir
    root.lang = locale === 'ar' ? 'ar' : 'en'
    root.dir = locale === 'ar' ? 'rtl' : 'ltr'
    return () => {
      root.lang = previousLang || 'en'
      root.dir = previousDir || 'ltr'
    }
  }, [locale])

  return null
}
