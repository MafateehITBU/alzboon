'use server'

import { headers } from 'next/headers'
import { getMessages } from '@/lib/i18n/messages'
import { normalizeLocale } from '@/lib/i18n/locale'
import { submitPublicEnquiry } from '@/lib/enquiry/public-submit'
import { resolveClientIp } from '@/lib/http/client-ip'
import { getPrisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'

export async function submitContactAction(_prev, formData) {
  const locale = normalizeLocale(formData.get('locale'))
  const copy = getMessages(locale).contact

  try {
    const headerStore = await headers()
    const ip = resolveClientIp(headerStore)

    const result = await submitPublicEnquiry(
      getPrisma(),
      {
        website: formData.get('website'),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        company: formData.get('company'),
        country: formData.get('country'),
        serviceId: formData.get('serviceId'),
        message: formData.get('message'),
      },
      { ip },
    )

    if (!result.ok) {
      const message =
        result.code === 'RATE_LIMITED'
          ? copy.rateLimited
          : result.code === 'INVALID_SERVICE'
            ? copy.invalidService
            : copy.invalid
      return { ok: false, code: result.code, message }
    }

    revalidatePath('/admin/contact-enquiries')
    revalidatePath('/admin')
    return { ok: true, code: 'OK', message: copy.success }
  } catch (error) {
    console.error(error)
    return { ok: false, code: 'ERROR', message: copy.error }
  }
}
