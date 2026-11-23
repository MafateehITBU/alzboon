import { fontVariables } from '@/lib/fonts'
import '@/styles/globals.css'

const appUrl = process.env.APP_URL ?? 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'Awwad Alzboon Legal Consultancy',
    template: '%s | Awwad Alzboon Legal Consultancy',
  },
  description:
    'Awwad Alzboon provides intellectual property, corporate, and dispute consultancy for businesses.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="font-abu">{children}</body>
    </html>
  )
}
