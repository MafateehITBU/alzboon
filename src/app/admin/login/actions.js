'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import { getPrisma } from '@/lib/prisma/client'
import { INVALID_LOGIN_MESSAGE, RATE_LIMIT_MESSAGE } from '@/lib/auth/constants'
import { setSessionCookie } from '@/lib/auth/current-admin'
import { authenticate } from '@/lib/auth/login'
import { resolveClientIp } from '@/lib/http/client-ip'

const loginSchema = z.object({
  email: z.string().max(254),
  password: z.string().max(200),
})

export async function loginAction(_state, formData) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) return { message: INVALID_LOGIN_MESSAGE }

  const headerStore = await headers()
  const result = await authenticate(getPrisma(), parsed.data, { ip: resolveClientIp(headerStore) })

  if (result.status === 'OK') {
    await setSessionCookie(result.token)
    redirect('/admin')
  }

  return {
    message: result.status === 'RATE_LIMITED' ? RATE_LIMIT_MESSAGE : INVALID_LOGIN_MESSAGE,
  }
}
