const buttonChrome =
  'inline-flex items-center justify-center gap-2 border-2 px-6 text-center font-abu text-[18px] font-bold whitespace-nowrap transition-[color,background-color,box-shadow,transform] duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-teal'

const filledButton = `${buttonChrome} h-[48px] rounded-[4px] border-transparent py-0 leading-5 tracking-[0.35px]`

/** Teal CTA: hover grows the under-glow; pair with `group-hover:translate-x-1` on inner arrows. */
export const tealButton = `${filledButton} group bg-teal text-white shadow-teal hover:shadow-[0_18px_28px_rgba(63,131,119,0.55)]`

export const goldButton = `${filledButton} bg-gold text-offwhite shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] hover:bg-[#a89564]`

export const outlineButton = `${buttonChrome} h-[48px] rounded-[5px] border-gold-deep bg-transparent py-0 leading-[26px] tracking-normal text-gold-deep shadow-none hover:bg-[rgba(186,168,122,0.14)]`

/** Same hover language as tealButton: grow under-glow; pair with `group-hover:translate-x-1.5` on icons. */
export const whatsappButton = `${filledButton} group bg-teal text-white shadow-teal hover:shadow-[0_18px_28px_rgba(63,131,119,0.55)]`
