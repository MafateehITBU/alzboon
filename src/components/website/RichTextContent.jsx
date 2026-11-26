import { headingIdForIndex } from '@/lib/blog/headings'

function safeHref(href) {
  if (typeof href !== 'string') return null
  const value = href.trim()
  if (/^(https?:|mailto:)/i.test(value)) return value
  return null
}

function collectText(node) {
  if (!node || typeof node !== 'object') return ''
  if (node.type === 'text') return node.text || ''
  if (!Array.isArray(node.content)) return ''
  return node.content.map(collectText).join('')
}

function renderMarks(text, marks = [], article) {
  let node = text
  for (const mark of marks) {
    if (mark.type === 'bold') node = <strong key={`${text}-b`}>{node}</strong>
    if (mark.type === 'italic') node = <em key={`${text}-i`}>{node}</em>
    if (mark.type === 'underline') node = <u key={`${text}-u`}>{node}</u>
    if (mark.type === 'link') {
      const href = safeHref(mark.attrs?.href)
      if (href) {
        node = (
          <a
            key={`${text}-a`}
            href={href}
            className={
              article
                ? 'font-medium text-teal underline decoration-[#BBA97A]/60 underline-offset-4 transition-colors hover:text-[#2f6b62]'
                : 'text-teal underline'
            }
            rel="noreferrer"
            target={href.startsWith('http') ? '_blank' : undefined}
          >
            {node}
          </a>
        )
      }
    }
  }
  return node
}

function renderInline(nodes = [], keyPrefix = 'i', article = false) {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`
    if (node.type === 'text') return <span key={key}>{renderMarks(node.text || '', node.marks, article)}</span>
    if (node.type === 'hardBreak') return <br key={key} />
    return null
  })
}

function renderNode(node, index, keyPrefix = 'n', options = {}) {
  const key = `${keyPrefix}-${index}`
  const article = Boolean(options.article)
  const withHeadingIds = Boolean(options.withHeadingIds)
  const headingCounter = options.headingCounter

  switch (node.type) {
    case 'paragraph':
      return (
        <p
          key={key}
          className={
            article
              ? 'mb-6 font-jakarta text-[17px] leading-8 text-body max-[767px]:text-[16px] max-[767px]:leading-7'
              : 'mb-4 font-jakarta text-base leading-7 text-body'
          }
        >
          {renderInline(node.content, key, article)}
        </p>
      )
    case 'heading': {
      const level = Math.min(3, Math.max(1, Number(node.attrs?.level) || 2))
      const text = collectText(node).replace(/\s+/g, ' ').trim()
      let id
      if (withHeadingIds && text) {
        id = headingIdForIndex(text, headingCounter.current)
        headingCounter.current += 1
      }

      const className = article
        ? level === 1
          ? 'mt-12 mb-5 scroll-mt-28 border-s-[3px] border-[#BBA97A] ps-4 font-abu text-[34px] leading-[1.2] tracking-[-0.02em] text-ink max-[767px]:mt-10 max-[767px]:text-[28px]'
          : level === 2
            ? 'mt-10 mb-4 scroll-mt-28 border-s-[3px] border-teal/50 ps-4 font-abu text-[28px] leading-[1.25] tracking-[-0.02em] text-ink max-[767px]:mt-8 max-[767px]:text-[24px]'
            : 'mt-8 mb-3 scroll-mt-28 font-abu text-[22px] leading-snug text-ink max-[767px]:text-[20px]'
        : level === 1
          ? 'mb-4 font-abu text-3xl text-ink'
          : level === 2
            ? 'mb-3 font-abu text-2xl text-ink'
            : 'mb-3 font-abu text-xl text-ink'

      const Tag = `h${level}`
      return (
        <Tag key={key} id={id} className={className}>
          {renderInline(node.content, key, article)}
        </Tag>
      )
    }
    case 'bulletList':
      return (
        <ul
          key={key}
          className={
            article
              ? 'mb-6 list-disc space-y-2.5 ps-6 font-jakarta text-[17px] leading-8 text-body marker:text-[#BBA97A] max-[767px]:text-[16px]'
              : 'mb-4 list-disc space-y-2 ps-6 font-jakarta text-base leading-7 text-body'
          }
        >
          {(node.content || []).map((item, itemIndex) => renderNode(item, itemIndex, `${key}-li`, options))}
        </ul>
      )
    case 'orderedList':
      return (
        <ol
          key={key}
          className={
            article
              ? 'mb-6 list-decimal space-y-2.5 ps-6 font-jakarta text-[17px] leading-8 text-body marker:text-teal max-[767px]:text-[16px]'
              : 'mb-4 list-decimal space-y-2 ps-6 font-jakarta text-base leading-7 text-body'
          }
        >
          {(node.content || []).map((item, itemIndex) => renderNode(item, itemIndex, `${key}-li`, options))}
        </ol>
      )
    case 'listItem':
      return (
        <li key={key}>
          {(node.content || []).map((child, childIndex) => renderNode(child, childIndex, `${key}-c`, options))}
        </li>
      )
    case 'blockquote':
      return (
        <blockquote
          key={key}
          className={
            article
              ? 'my-8 border-s-[3px] border-[#BBA97A] bg-[rgba(187,169,122,0.08)] px-5 py-4 font-abu text-[18px] leading-8 text-ink max-[767px]:text-[16px]'
              : 'mb-4 border-s-4 border-gold ps-4 font-jakarta text-base leading-7 text-body'
          }
        >
          {(node.content || []).map((child, childIndex) => renderNode(child, childIndex, `${key}-q`, options))}
        </blockquote>
      )
    default:
      return null
  }
}

export default function RichTextContent({
  document,
  dir = 'ltr',
  className = '',
  variant = 'default',
  withHeadingIds = false,
}) {
  const content = Array.isArray(document?.content) ? document.content : []
  const article = variant === 'article'
  const options = {
    article,
    withHeadingIds: withHeadingIds || article,
    headingCounter: { current: 0 },
  }

  return (
    <div dir={dir} className={className}>
      {content.map((node, index) => renderNode(node, index, 'n', options))}
    </div>
  )
}
