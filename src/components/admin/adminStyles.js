const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/35 focus-visible:ring-offset-2 focus-visible:ring-offset-cream'

const buttonBase = `inline-flex items-center justify-center gap-2 rounded-xl px-5 font-jakarta text-sm font-semibold whitespace-nowrap transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 ${focusRing}`

export const adminTealButton = `${buttonBase} min-h-11 bg-teal text-white shadow-[0_10px_24px_-12px_rgba(63,131,119,0.55)] hover:-translate-y-px hover:bg-[#356e64] active:translate-y-0`

export const adminGoldButton = `${buttonBase} min-h-11 bg-gold text-ink shadow-[0_10px_24px_-12px_rgba(187,169,122,0.55)] hover:-translate-y-px hover:bg-[#a89564] active:translate-y-0`

export const adminOutlineButton = `${buttonBase} min-h-11 border border-line bg-white/80 text-ink shadow-none hover:border-teal/30 hover:bg-white hover:text-teal`

export const adminDangerButton = `${buttonBase} min-h-11 bg-danger text-white shadow-[0_10px_24px_-12px_rgba(220,38,38,0.45)] hover:bg-[#b91c1c]`

export const adminGhostButton = `${buttonBase} min-h-10 px-3 text-body hover:bg-teal/8 hover:text-teal`

export const adminFieldClass = `min-h-11 w-full rounded-xl border border-line/90 bg-white px-3.5 font-jakarta text-sm text-ink shadow-[inset_0_1px_2px_rgba(1,19,32,0.03)] placeholder:text-muted transition-[border-color,box-shadow] duration-200 hover:border-teal/25 focus:border-teal/50 focus:shadow-[0_0_0_4px_rgba(63,131,119,0.12)] focus-visible:outline-none`

export const adminTextareaClass = `${adminFieldClass} min-h-28 py-3`

export const adminPanelClass =
  'rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm'

export const adminSoftPanelClass = 'rounded-2xl border border-line/70 bg-cream/70 p-5'

export const adminTableClass =
  'overflow-x-auto rounded-2xl border border-white/70 bg-white/90 shadow-[0_18px_40px_-28px_rgba(1,19,32,0.28)] backdrop-blur-sm'

export const adminDialogClass =
  'relative z-10 w-full rounded-2xl border border-white/80 bg-white/95 p-5 shadow-[0_30px_80px_-36px_rgba(1,19,32,0.5)] backdrop-blur-xl'

export const adminStickyBarClass =
  'sticky bottom-4 z-10 flex flex-wrap gap-3 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-[0_18px_40px_-24px_rgba(1,19,32,0.35)] backdrop-blur-xl'

export const adminLabelClass = 'font-jakarta text-sm font-medium text-body'
