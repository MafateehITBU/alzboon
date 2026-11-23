const ALLOWED_NODES = new Set([
  'doc',
  'paragraph',
  'heading',
  'bulletList',
  'orderedList',
  'listItem',
  'text',
  'hardBreak',
])

const ALLOWED_MARKS = new Set(['bold', 'italic', 'underline', 'link'])

export function emptyDocument() {
  return { type: 'doc', content: [{ type: 'paragraph' }] }
}

export function sanitizeTipTapDocument(input) {
  if (!input || typeof input !== 'object') return null
  const sanitized = sanitizeNode(input)
  if (!sanitized || sanitized.type !== 'doc') return null
  if (!Array.isArray(sanitized.content) || sanitized.content.length === 0) {
    return emptyDocument()
  }
  return sanitized
}

export function documentHasText(document) {
  const sanitized = sanitizeTipTapDocument(document)
  if (!sanitized) return false
  return collectText(sanitized).trim().length > 0
}

function sanitizeNode(node) {
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') return null
  if (!ALLOWED_NODES.has(node.type)) return null

  const next = { type: node.type }

  if (node.type === 'heading') {
    const level = Number(node.attrs?.level)
    next.attrs = { level: level >= 1 && level <= 3 ? level : 2 }
  }

  if (node.type === 'paragraph' || node.type === 'heading') {
    const align = node.attrs?.textAlign
    if (align === 'left' || align === 'center' || align === 'right' || align === 'justify') {
      next.attrs = { ...(next.attrs || {}), textAlign: align }
    }
  }

  if (node.type === 'text') {
    if (typeof node.text !== 'string' || !node.text) return null
    next.text = node.text.slice(0, 20000)
    const marks = sanitizeMarks(node.marks)
    if (marks.length) next.marks = marks
    return next
  }

  if (Array.isArray(node.content)) {
    const content = node.content.map(sanitizeNode).filter(Boolean)
    if (content.length) next.content = content
  }

  return next
}

function sanitizeMarks(marks) {
  if (!Array.isArray(marks)) return []
  const cleaned = []

  for (const mark of marks) {
    if (!mark || typeof mark !== 'object' || !ALLOWED_MARKS.has(mark.type)) continue
    if (mark.type === 'link') {
      const href = sanitizeHref(mark.attrs?.href)
      if (!href) continue
      cleaned.push({ type: 'link', attrs: { href, target: '_blank', rel: 'noopener noreferrer nofollow' } })
      continue
    }
    cleaned.push({ type: mark.type })
  }

  return cleaned
}

function sanitizeHref(value) {
  if (typeof value !== 'string') return null
  const href = value.trim().slice(0, 500)
  try {
    const url = new URL(href)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

function collectText(node) {
  if (node.type === 'text') return node.text || ''
  if (!Array.isArray(node.content)) return ''
  return node.content.map(collectText).join(' ')
}
