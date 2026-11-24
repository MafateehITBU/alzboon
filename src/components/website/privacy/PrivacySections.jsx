import { FolderOpen, Lock, Scale, Shield } from 'lucide-react'

const sectionHeading =
  'font-abu text-[36px] leading-[1.15] tracking-[-0.5px] text-ink max-[1023px]:text-[30px] max-[767px]:text-[26px]'

const bodyText = 'font-jakarta text-[16px] leading-7 text-body max-[767px]:text-[15px] max-[767px]:leading-6'

function SectionShell({ id, number, title, children }) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-line/80 pb-14 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-4 max-[767px]:gap-3">
        <span className="font-abu text-[42px] leading-none text-[#BBA97A] max-[767px]:text-[32px]">{number}.</span>
        <h2 className={sectionHeading}>{title}</h2>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function PrivilegeSection({ section, number }) {
  return (
    <SectionShell id="privilege" number={number} title={section.title}>
      <p className={bodyText}>{section.intro}</p>
      <div className="mt-6 rounded-[8px] border border-transparent border-s-4 border-s-[#8F6E15] bg-[#f2f4f6] px-6 py-5 shadow-[0_1px_1px_rgba(0,0,0,0.05)] max-[767px]:px-4">
        <p className="font-jakarta text-[12px] font-bold tracking-[0.12em] text-[#8F6E15] uppercase">
          {section.calloutTitle}
        </p>
        <p className="mt-3 font-abu text-[17px] leading-7 text-ink max-[767px]:text-[15px]">{section.calloutQuote}</p>
        <p className="mt-3 font-jakarta text-[14px] leading-6 text-body">{section.calloutNote}</p>
      </div>
      <div className="mt-5 grid gap-4 min-[768px]:grid-cols-2">
        {section.cards.map((card) => (
          <article key={card.title} className="rounded-[10px] border border-line bg-white p-5 shadow-[0_8px_24px_-20px_rgba(1,19,32,0.35)]">
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-[rgba(187,169,122,0.12)] text-[#8F6E15]">
              <Shield size={18} aria-hidden="true" />
            </div>
            <h3 className="mt-3 font-abu text-[20px] leading-7 text-ink">{card.title}</h3>
            <p className="mt-2 font-jakarta text-[14px] leading-6 text-body">{card.body}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}

function DossiersSection({ section, number }) {
  return (
    <SectionShell id="dossiers" number={number} title={section.title}>
      <p className={bodyText}>{section.intro}</p>
      <ul className="mt-6 grid gap-3">
        {section.items.map((item) => (
          <li
            key={item.title}
            className="flex flex-wrap items-start justify-between gap-3 rounded-[10px] border border-line bg-white px-5 py-4 shadow-[0_8px_24px_-22px_rgba(1,19,32,0.3)]"
          >
            <div className="min-w-0 flex-1">
              <h3 className="font-abu text-[18px] leading-6 text-ink">{item.title}</h3>
              <p className="mt-2 font-jakarta text-[14px] leading-6 text-body">{item.body}</p>
            </div>
            <span className="shrink-0 rounded-[4px] border border-[#BBA97A]/40 bg-[rgba(187,169,122,0.08)] px-2.5 py-1 font-jakarta text-[11px] font-semibold tracking-[0.08em] text-[#8F6E15] uppercase">
              {item.tag}
            </span>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

function GroundsSection({ section, number }) {
  return (
    <SectionShell id="grounds" number={number} title={section.title}>
      <p className={bodyText}>{section.intro}</p>
      <div className="mt-6 grid gap-4 min-[900px]:grid-cols-3">
        {section.cards.map((card) => (
          <article key={card.title} className="rounded-[10px] border border-line bg-white p-5 shadow-[0_8px_24px_-20px_rgba(1,19,32,0.3)]">
            <p className="font-jakarta text-[11px] font-bold tracking-[0.14em] text-[#8F6E15] uppercase">{card.eyebrow}</p>
            <h3 className="mt-2 font-abu text-[20px] leading-7 text-ink">{card.title}</h3>
            <p className="mt-3 font-jakarta text-[14px] leading-6 text-body">{card.body}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}

function SecuritySection({ section, number }) {
  return (
    <SectionShell id="security" number={number} title={section.title}>
      <p className={bodyText}>{section.intro}</p>
      <div className="mt-6 rounded-[12px] bg-[#0f1c26] px-6 py-7 text-white shadow-[0_22px_50px_-30px_rgba(1,19,32,0.65)] max-[767px]:px-4 max-[767px]:py-6">
        <p className="font-jakarta text-[11px] font-semibold tracking-[0.14em] text-[#BBA97A] uppercase">
          {section.panelEyebrow}
        </p>
        <h3 className="mt-2 font-abu text-[28px] leading-8 max-[767px]:text-[22px]">{section.panelTitle}</h3>
        <div className="mt-6 grid gap-5 min-[900px]:grid-cols-3">
          {section.pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-[10px] border border-white/10 bg-white/5 p-4">
              <div className="inline-flex size-10 items-center justify-center rounded-full bg-[rgba(187,169,122,0.15)] text-[#BBA97A]">
                <Lock size={18} aria-hidden="true" />
              </div>
              <p className="mt-3 font-jakarta text-[11px] font-semibold tracking-[0.12em] text-[#6c8793] uppercase">
                {pillar.eyebrow}
              </p>
              <h4 className="mt-1 font-abu text-[18px] leading-6">{pillar.title}</h4>
              <p className="mt-2 font-jakarta text-[14px] leading-6 text-white/70">{pillar.body}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  )
}

function DisclosuresSection({ section, number }) {
  return (
    <SectionShell id="disclosures" number={number} title={section.title}>
      <p className="font-jakarta text-[16px] leading-7 text-ink">
        <span className="font-semibold">{section.absolutePolicy}</span> {section.absoluteBody}
      </p>
      <p className={`mt-4 ${bodyText}`}>{section.limitedIntro}</p>
      <div className="mt-6 overflow-x-auto rounded-[10px] border border-line bg-white shadow-[0_8px_24px_-20px_rgba(1,19,32,0.3)]">
        <table className="min-w-[640px] w-full border-collapse text-left">
          <thead className="bg-[#f2f4f6]">
            <tr>
              {section.tableHeaders.map((header) => (
                <th key={header} className="px-4 py-3 font-jakarta text-[12px] font-bold tracking-[0.08em] text-muted uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row) => (
              <tr key={row.recipient} className="border-t border-line">
                <td className="px-4 py-3.5 font-jakarta text-[14px] font-semibold text-ink">{row.recipient}</td>
                <td className="px-4 py-3.5 font-jakarta text-[14px] leading-6 text-body">{row.purpose}</td>
                <td className="px-4 py-3.5 font-jakarta text-[14px] leading-6 text-body">{row.framework}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionShell>
  )
}

function TransfersSection({ section, number }) {
  return (
    <SectionShell id="transfers" number={number} title={section.title}>
      <p className={bodyText}>{section.intro}</p>
      <ul className="mt-6 grid gap-3">
        {section.items.map((item) => (
          <li key={item.title} className="rounded-[10px] border border-[#dbe7f0] bg-[#f4f8fb] px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#3f8377]/15 text-[#3f8377]">
                <Scale size={12} aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-abu text-[18px] leading-6 text-ink">{item.title}</h3>
                <p className="mt-1.5 font-jakarta text-[14px] leading-6 text-body">{item.body}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

function RetentionSection({ section, number }) {
  return (
    <SectionShell id="retention" number={number} title={section.title}>
      <p className={bodyText}>{section.intro}</p>
      <div className="mt-6 grid gap-4 min-[768px]:grid-cols-2">
        {section.cards.map((card) => (
          <article key={card.title} className="rounded-[10px] border border-line bg-white p-5 shadow-[0_8px_24px_-20px_rgba(1,19,32,0.3)]">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-abu text-[18px] leading-6 text-ink">{card.title}</h3>
              <span className="shrink-0 rounded-[4px] bg-[rgba(187,169,122,0.12)] px-2 py-1 font-jakarta text-[11px] font-bold tracking-[0.08em] text-[#8F6E15] uppercase">
                {card.period}
              </span>
            </div>
            <p className="mt-3 font-jakarta text-[14px] leading-6 text-body">{card.body}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}

function RightsSection({ section, number }) {
  return (
    <SectionShell id="rights" number={number} title={section.title}>
      <p className={bodyText}>{section.intro}</p>
      <div className="mt-6 grid gap-4 min-[768px]:grid-cols-2">
        {section.cards.map((card) => (
          <article key={card.title} className="rounded-[10px] border border-line bg-white p-5 shadow-[0_8px_24px_-20px_rgba(1,19,32,0.3)]">
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-[rgba(187,169,122,0.12)] text-[#8F6E15]">
              <FolderOpen size={18} aria-hidden="true" />
            </div>
            <h3 className="mt-3 font-abu text-[18px] leading-6 text-ink">{card.title}</h3>
            <p className="mt-2 font-jakarta text-[14px] leading-6 text-body">{card.body}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}

export default function PrivacySections({ copy }) {
  const { sections } = copy
  return (
    <div className="grid gap-14">
      <PrivilegeSection section={sections.privilege} number="01" />
      <DossiersSection section={sections.dossiers} number="02" />
      <GroundsSection section={sections.grounds} number="03" />
      <SecuritySection section={sections.security} number="04" />
      <DisclosuresSection section={sections.disclosures} number="05" />
      <TransfersSection section={sections.transfers} number="06" />
      <RetentionSection section={sections.retention} number="07" />
      <RightsSection section={sections.rights} number="08" />
    </div>
  )
}
