/** Collect plain text from a TipTap node tree (inline-safe). */
function collectText(node) {
  if (!node || typeof node !== 'object') return ''
  if (node.type === 'text') return node.text || ''
  if (!Array.isArray(node.content)) return ''
  return node.content.map(collectText).join('')
}

function slugifyHeading(text, index) {
  const base = String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
  return `section-${index + 1}${base ? `-${base}` : ''}`.slice(0, 96)
}

/**
 * Extract top-level headings from a TipTap document for table-of-contents links.
 * IDs match those assigned by RichTextContent when `withHeadingIds` is enabled.
 */
export function extractDocumentHeadings(document) {
  const content = Array.isArray(document?.content) ? document.content : []
  const headings = []

  for (const node of content) {
    if (node?.type !== 'heading') continue
    const text = collectText(node).replace(/\s+/g, ' ').trim()
    if (!text) continue
    const level = Math.min(3, Math.max(1, Number(node.attrs?.level) || 2))
    const id = slugifyHeading(text, headings.length)
    headings.push({ id, level, text })
  }

  return headings
}

export function headingIdForIndex(text, index) {
  return slugifyHeading(text, index)
}
