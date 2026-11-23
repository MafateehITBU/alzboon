import localFont from 'next/font/local'

export const abuDhabi = localFont({
  src: [
    {
      path: '../assets/fonts/abu-dhabi-pro-regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/FontsFree-Net-Abu-Dhabi-Pro-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-abu-family',
  display: 'swap',
})

export const plusJakarta = localFont({
  src: '../assets/fonts/plus-jakarta-sans-wght.ttf',
  weight: '400 700',
  variable: '--font-jakarta-family',
  display: 'swap',
})

export const roboto = localFont({
  src: '../assets/fonts/roboto-400.woff2',
  weight: '400',
  style: 'normal',
  variable: '--font-roboto-family',
  display: 'swap',
})

export const dmSans = localFont({
  src: '../assets/fonts/dm-sans-400.woff2',
  weight: '400',
  style: 'normal',
  variable: '--font-dm-family',
  display: 'swap',
})

export const geDinar = localFont({
  src: '../assets/fonts/GE-Dinar-Two-Medium_1E.otf',
  weight: '500',
  style: 'normal',
  variable: '--font-dinar-family',
  display: 'swap',
})

export const fontVariables = [
  abuDhabi.variable,
  plusJakarta.variable,
  roboto.variable,
  dmSans.variable,
  geDinar.variable,
].join(' ')
