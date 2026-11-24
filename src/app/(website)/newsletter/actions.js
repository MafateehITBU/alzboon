'use server'

import { getMessages } from '@/lib/i18n/messages'
import { normalizeLocale } from '@/lib/i18n/locale'
import { subscribeToBriefs } from '@/lib/newsletter/subscribe'
import { getPrisma } from '@/lib/prisma/client'

export async function subscribeBriefsAction(_previous, formData) {
  const locale = normalizeLocale(formData.get('locale'))
  const copy = getMessages(locale).home?.footer || {}
  const email = String(formData.get('email') || '')

  try {
    const result = await subscribeToBriefs(getPrisma(), email)
    if (!result.ok) {
      return {
        ok: false,
        code: result.code,
        message: copy.invalidEmail || 'Enter a valid email address.',
      }
    }

    if (result.code === 'ALREADY_SUBSCRIBED') {
      return {
        ok: true,
        code: result.code,
        message: copy.subscribeExists || 'This email is already subscribed to Judicial Briefs.',
      }
    }

    return {
      ok: true,
      code: result.code,
      message: copy.subscribeSuccess || 'You are subscribed to Judicial Briefs.',
    }
  } catch (error) {
    console.error(error)
    return {
      ok: false,
      code: 'ERROR',
      message: copy.subscribeError || 'Subscription could not be completed. Please try again.',
    }
  }
}
