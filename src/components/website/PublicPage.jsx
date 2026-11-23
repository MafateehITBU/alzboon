import SiteShell from '@/components/website/SiteShell'

export default function PublicPage({ locale, messages, contact, services, children, narrow = false }) {
  return (
    <SiteShell locale={locale} messages={messages} contact={contact} services={services}>
      <div className={`mx-auto px-5 py-12 min-[768px]:px-8 min-[1024px]:px-10 min-[1440px]:px-20 ${narrow ? 'max-w-3xl' : 'max-w-[1280px]'}`}>
        {children}
      </div>
    </SiteShell>
  )
}
