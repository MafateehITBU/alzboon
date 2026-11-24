import ContactForm from '@/components/website/contact/ContactForm'
import ContactInfo from '@/components/website/contact/ContactInfo'

function ContactSection({ locale = 'en', messages, contact = null, services = [] }) {
  const copy = messages?.contact || {}

  return (
    <section className="bg-white px-[80px] py-20 max-[1439px]:px-10 max-[1023px]:px-8 max-[1023px]:py-14 max-[767px]:px-5 max-[767px]:py-10">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-start gap-16 max-[1023px]:grid-cols-1 max-[1023px]:gap-10">
        <ContactInfo locale={locale} copy={copy} contact={contact} />
        <div className="rounded-2xl border border-line/70 bg-white p-8 shadow-[0_18px_40px_-20px_rgba(15,28,38,0.18)] max-[767px]:p-5">
          <ContactForm locale={locale} messages={messages} services={services} />
        </div>
      </div>
    </section>
  )
}

export default ContactSection
