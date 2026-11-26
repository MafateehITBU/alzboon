'use client'

import { useActionState, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { loginAction } from './actions'
import { adminFieldClass, adminOutlineButton, adminTealButton } from '@/components/admin/adminStyles'

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {
    step: 'password',
    message: '',
    challengeToken: '',
    email: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const otpStep = state.step === 'otp' && state.challengeToken

  if (otpStep) {
    return (
      <form action={action} className="grid gap-5" noValidate>
        <input type="hidden" name="step" value="otp" />
        <input type="hidden" name="challengeToken" value={state.challengeToken} />
        <input type="hidden" name="email" value={state.email || ''} />

        <p className="rounded-2xl border border-teal/20 bg-teal/5 px-4 py-3 font-jakarta text-sm text-body">
          We sent a 6-digit verification code to <span className="font-semibold text-ink">{state.email}</span>.
        </p>

        <label className="grid gap-2 font-jakarta text-sm font-medium text-body">
          Verification code
          <input
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            pattern="\d{6}"
            placeholder="000000"
            className={`${adminFieldClass} tracking-[0.35em]`}
          />
        </label>

        {state.message ? (
          <p
            role={state.ok ? 'status' : 'alert'}
            className={`rounded-2xl border px-4 py-3 font-jakarta text-sm ${
              state.ok ? 'border-teal/20 bg-teal/5 text-teal' : 'border-danger/20 bg-danger/5 text-danger'
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <button type="submit" disabled={pending} className={`${adminTealButton} w-full`}>
          {pending ? 'Verifying…' : 'Verify and sign in'}
        </button>

        <button
          type="button"
          className={`${adminOutlineButton} w-full`}
          onClick={() => {
            window.location.assign('/admin/login')
          }}
        >
          Use a different account
        </button>
      </form>
    )
  }

  return (
    <form action={action} className="grid gap-5" noValidate>
      <input type="hidden" name="step" value="password" />

      <label className="grid gap-2 font-jakarta text-sm font-medium text-body">
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email || ''}
          placeholder="you@example.com"
          className={adminFieldClass}
        />
      </label>

      <label className="grid gap-2 font-jakarta text-sm font-medium text-body">
        Password
        <span className="relative block">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            className={`${adminFieldClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute top-1/2 right-1.5 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:bg-teal/8 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/35"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </span>
      </label>

      {state.message ? (
        <p role="alert" className="rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 font-jakarta text-sm text-danger">
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={`${adminTealButton} w-full`}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
