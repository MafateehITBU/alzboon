import RichTextContent from '@/components/website/RichTextContent'

export default function BlogArticleContent({ locale = 'en', document }) {
  return (
    <article className="min-w-0">
      <RichTextContent
        document={document}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
        variant="article"
        withHeadingIds
        className="max-w-[720px]"
      />
    </article>
  )
}
