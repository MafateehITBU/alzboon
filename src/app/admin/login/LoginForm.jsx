'use client'

import { useActionState, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { loginAction } from './actions'
import { adminFieldClass, adminTealButton } from '@/components/admin/adminStyles'

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { message: '' })
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={action} className="grid gap-5" noValidate>
      <label className="grid gap-2 font-jakarta text-sm font-medium text-body">
        Email
        <input name="email" type="email" autoComplete="username" required placeholder="you@example.com" className={adminFieldClass} />
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
