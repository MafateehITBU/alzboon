import DocumentLocale from '@/components/website/DocumentLocale'
import Footer from '@/components/website/home/Footer'
import Header from '@/components/website/home/Header'

export default function SiteShell({ locale, messages, contact, services = [], children }) {
  return (
    <div className="min-h-svh w-full overflow-x-clip bg-white" lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <DocumentLocale locale={locale} />
      {/* Header is full-bleed so its shadow cannot form a centered “card” edge on the sides */}
      <Header locale={locale} messages={messages} services={services} />
      <main className="w-full">{children}</main>
      <Footer locale={locale} messages={messages} contact={contact} />
    </div>
  )
}
