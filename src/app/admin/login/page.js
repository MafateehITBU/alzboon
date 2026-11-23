import Link from 'next/link'
import LoginForm from './LoginForm'

export const metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
}

export default async function LoginPage({ searchParams }) {
  const query = await searchParams
  const passwordChanged = query?.passwordChanged === '1'

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#f3f1eb] px-4 py-10 text-ink">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(63,131,119,0.18),transparent_36%),radial-gradient(circle_at_80%_10%,rgba(187,169,122,0.22),transparent_30%),radial-gradient(circle_at_70%_80%,rgba(63,131,119,0.1),transparent_34%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-white/50 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-[440px]">
        <div className="mb-8 text-center">
          <p className="font-jakarta text-[11px] font-semibold tracking-[0.2em] text-teal uppercase">Awwad AlZboon</p>
          <h1 className="mt-3 font-abu text-4xl leading-none tracking-[-0.03em] text-ink">Admin access</h1>
          <p className="mt-3 font-jakarta text-sm leading-6 text-body">Sign in to manage services, blogs, partners, and enquiries.</p>
        </div>

        <section className="rounded-[28px] border border-white/80 bg-white/85 p-7 shadow-[0_30px_80px_-40px_rgba(1,19,32,0.45)] backdrop-blur-xl min-[720px]:p-8">
          <div className="mb-6">
            <h2 className="font-jakarta text-xl font-semibold text-ink">Welcome back</h2>
            <p className="mt-1 font-jakarta text-sm text-body">Use your administrator credentials.</p>
          </div>

          {passwordChanged ? (
            <p role="status" className="mb-5 rounded-2xl border border-success/20 bg-success/5 px-4 py-3 font-jakarta text-sm text-success">
              Your password was updated. Sign in again to continue.
            </p>
          ) : null}

          <LoginForm />

          <div className="mt-6 border-t border-line/70 pt-5 text-center">
            <Link href="/" className="inline-flex min-h-10 items-center font-jakarta text-sm font-semibold text-teal transition hover:text-[#356e64]">
              ← Back to the website
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
