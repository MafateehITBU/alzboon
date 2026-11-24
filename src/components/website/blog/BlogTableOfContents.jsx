export default function BlogTableOfContents({ copy, headings = [] }) {
  if (!headings.length) return null

  return (
    <nav aria-label={copy.contents}>
      <p className="font-jakarta text-[11px] font-semibold tracking-[0.16em] text-[#BBA97A] uppercase">
        {copy.contents}
      </p>
      <ol className="mt-4 grid gap-2.5">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`block font-jakarta text-[13px] leading-5 text-body transition-colors hover:text-teal ${
                heading.level >= 3 ? 'ps-3 text-[12px] text-body/80' : ''
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
