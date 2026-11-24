'use server'

import { headers } from 'next/headers'
import { getMessages } from '@/lib/i18n/messages'
import { normalizeLocale } from '@/lib/i18n/locale'
import { submitPublicEnquiry } from '@/lib/enquiry/public-submit'
import { resolveClientIp } from '@/lib/http/client-ip'
import { getPrisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'

const emptyValues = {
  name: '',
  email: '',
  phone: '',
  serviceId: '',
  message: '',
}

function readValues(formData) {
  return {
    name: String(formData.get('name') || ''),
    email: String(formData.get('email') || ''),
    phone: String(formData.get('phone') || ''),
    serviceId: String(formData.get('serviceId') || ''),
    message: String(formData.get('message') || ''),
  }
}

export async function submitContactAction(_prev, formData) {
  const locale = normalizeLocale(formData.get('locale'))
  const copy = getMessages(locale).contact
  const values = readValues(formData)

  try {
    const headerStore = await headers()
    const ip = resolveClientIp(headerStore)

    const result = await submitPublicEnquiry(
      getPrisma(),
      {
        website: formData.get('website'),
        name: values.name,
        email: values.email,
        phone: values.phone,
        serviceId: values.serviceId,
        message: values.message,
      },
      { ip },
    )

    if (!result.ok) {
      const message =
        result.code === 'RATE_LIMITED'
          ? copy.rateLimited
          : result.code === 'INVALID_SERVICE'
            ? copy.invalidService
            : result.code === 'INVALID_PHONE'
              ? copy.invalidPhone
              : copy.invalid
      return { ok: false, code: result.code, message, values }
    }

    revalidatePath('/admin/contact-enquiries')
    revalidatePath('/admin')
    return { ok: true, code: 'OK', message: copy.success, values: emptyValues }
  } catch (error) {
    console.error(error)
    return { ok: false, code: 'ERROR', message: copy.error, values }
  }
}
