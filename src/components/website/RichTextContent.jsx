function safeHref(href) {
  if (typeof href !== 'string') return null
  const value = href.trim()
  if (/^(https?:|mailto:)/i.test(value)) return value
  return null
}

function renderMarks(text, marks = []) {
  let node = text
  for (const mark of marks) {
    if (mark.type === 'bold') node = <strong key={`${text}-b`}>{node}</strong>
    if (mark.type === 'italic') node = <em key={`${text}-i`}>{node}</em>
    if (mark.type === 'underline') node = <u key={`${text}-u`}>{node}</u>
    if (mark.type === 'link') {
      const href = safeHref(mark.attrs?.href)
      if (href) {
        node = (
          <a key={`${text}-a`} href={href} className="text-teal underline" rel="noreferrer" target={href.startsWith('http') ? '_blank' : undefined}>
            {node}
          </a>
        )
      }
    }
  }
  return node
}

function renderInline(nodes = [], keyPrefix = 'i') {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`
    if (node.type === 'text') return <span key={key}>{renderMarks(node.text || '', node.marks)}</span>
    if (node.type === 'hardBreak') return <br key={key} />
    return null
  })
}

function renderNode(node, index, keyPrefix = 'n') {
  const key = `${keyPrefix}-${index}`
  switch (node.type) {
    case 'paragraph':
      return (
        <p key={key} className="mb-4 font-jakarta text-base leading-7 text-body">
          {renderInline(node.content, key)}
        </p>
      )
    case 'heading': {
      const level = Math.min(3, Math.max(1, Number(node.attrs?.level) || 2))
      const className =
        level === 1
          ? 'mb-4 font-abu text-3xl text-ink'
          : level === 2
            ? 'mb-3 font-abu text-2xl text-ink'
            : 'mb-3 font-abu text-xl text-ink'
      const Tag = `h${level}`
      return (
        <Tag key={key} className={className}>
          {renderInline(node.content, key)}
        </Tag>
      )
    }
    case 'bulletList':
      return (
        <ul key={key} className="mb-4 list-disc space-y-2 ps-6 font-jakarta text-base leading-7 text-body">
          {(node.content || []).map((item, itemIndex) => renderNode(item, itemIndex, `${key}-li`))}
        </ul>
      )
    case 'orderedList':
      return (
        <ol key={key} className="mb-4 list-decimal space-y-2 ps-6 font-jakarta text-base leading-7 text-body">
          {(node.content || []).map((item, itemIndex) => renderNode(item, itemIndex, `${key}-li`))}
        </ol>
      )
    case 'listItem':
      return <li key={key}>{(node.content || []).map((child, childIndex) => renderNode(child, childIndex, `${key}-c`))}</li>
    case 'blockquote':
      return (
        <blockquote key={key} className="mb-4 border-s-4 border-gold ps-4 font-jakarta text-base leading-7 text-body">
          {(node.content || []).map((child, childIndex) => renderNode(child, childIndex, `${key}-q`))}
        </blockquote>
      )
    default:
      return null
  }
}

export default function RichTextContent({ document, dir = 'ltr', className = '' }) {
  const content = Array.isArray(document?.content) ? document.content : []
  return (
    <div dir={dir} className={className}>
      {content.map((node, index) => renderNode(node, index))}
    </div>
  )
}
