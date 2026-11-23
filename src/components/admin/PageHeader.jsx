export default function PageHeader({ title, description }) {
  return (
    <header className="mb-8">
      <p className="font-jakarta text-[11px] font-semibold tracking-[0.18em] text-teal/80 uppercase">Admin</p>
      <h1 className="mt-2 font-abu text-[34px] leading-[1.08] tracking-[-0.03em] text-ink max-[767px]:text-[28px]">{title}</h1>
      {description ? <p className="mt-3 max-w-2xl font-jakarta text-sm leading-6 text-body">{description}</p> : null}
    </header>
  )
}
