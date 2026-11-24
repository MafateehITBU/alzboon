'use client'

import { useEffect, useRef, useState } from 'react'

/** Debounced controlled search value that syncs from the URL query. */
export default function useLiveSearch(initialValue = '', onCommit, delayMs = 280) {
  const [value, setValue] = useState(initialValue || '')
  const timer = useRef(null)
  const onCommitRef = useRef(onCommit)
  onCommitRef.current = onCommit

  useEffect(() => {
    setValue(initialValue || '')
  }, [initialValue])

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  function onChange(next) {
    setValue(next)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      onCommitRef.current?.(next)
    }, delayMs)
  }

  return [value, onChange]
}
