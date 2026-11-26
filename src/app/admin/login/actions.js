'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import { getPrisma } from '@/lib/prisma/client'
import {
  ACCOUNT_DEACTIVATED_MESSAGE,
  ACCOUNT_LOCKED_MESSAGE,
  INVALID_LOGIN_MESSAGE,
  OTP_ALERT_MESSAGE,
  OTP_INVALID_MESSAGE,
  OTP_REQUIRED_MESSAGE,
  OTP_UNAVAILABLE_MESSAGE,
  RATE_LIMIT_MESSAGE,
} from '@/lib/auth/constants'
import { setSessionCookie } from '@/lib/auth/current-admin'
import { authenticate, verifyLoginOtp } from '@/lib/auth/login'
import { resolveClientIp } from '@/lib/http/client-ip'

const loginSchema = z.object({
  email: z.string().max(254),
  password: z.string().max(200),
})

const otpSchema = z.object({
  challengeToken: z.string().min(20).max(200),
  code: z.string().regex(/^\d{6}$/),
  email: z.string().max(254).optional(),
})

function messageForStatus(status) {
  switch (status) {
    case 'RATE_LIMITED':
      return RATE_LIMIT_MESSAGE
    case 'ACCOUNT_LOCKED':
      return ACCOUNT_LOCKED_MESSAGE
    case 'ACCOUNT_DEACTIVATED':
      return ACCOUNT_DEACTIVATED_MESSAGE
    case 'OTP_UNAVAILABLE':
      return OTP_UNAVAILABLE_MESSAGE
    case 'OTP_INVALID':
      return OTP_INVALID_MESSAGE
    case 'OTP_ALERT_SENT':
      return OTP_ALERT_MESSAGE
    default:
      return INVALID_LOGIN_MESSAGE
  }
}

export async function loginAction(_state, formData) {
  const step = String(formData.get('step') || 'password')

  if (step === 'otp') {
    const parsed = otpSchema.safeParse({
      challengeToken: formData.get('challengeToken'),
      code: formData.get('code'),
      email: formData.get('email') || undefined,
    })

    if (!parsed.success) {
      return {
        step: 'otp',
        challengeToken: String(formData.get('challengeToken') || ''),
        email: String(formData.get('email') || ''),
        message: OTP_INVALID_MESSAGE,
      }
    }

    const headerStore = await headers()
    const result = await verifyLoginOtp(getPrisma(), parsed.data, {
      ip: resolveClientIp(headerStore),
    })

    if (result.status === 'OK') {
      await setSessionCookie(result.token)
      redirect('/admin')
    }

    if (result.status === 'OTP_ALERT_SENT' || result.status === 'OTP_INVALID') {
      return {
        step: result.status === 'OTP_ALERT_SENT' ? 'password' : 'otp',
        challengeToken: result.status === 'OTP_ALERT_SENT' ? '' : parsed.data.challengeToken,
        email: parsed.data.email || '',
        message: messageForStatus(result.status),
      }
    }

    return {
      step: 'password',
      challengeToken: '',
      email: parsed.data.email || '',
      message: messageForStatus(result.status),
    }
  }

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { step: 'password', message: INVALID_LOGIN_MESSAGE }
  }

  const headerStore = await headers()
  const result = await authenticate(getPrisma(), parsed.data, {
    ip: resolveClientIp(headerStore),
  })

  if (result.status === 'OTP_REQUIRED') {
    return {
      step: 'otp',
      challengeToken: result.challengeToken,
      email: parsed.data.email,
      message: OTP_REQUIRED_MESSAGE,
      ok: true,
    }
  }

  return {
    step: 'password',
    email: parsed.data.email,
    message: messageForStatus(result.status),
  }
}
