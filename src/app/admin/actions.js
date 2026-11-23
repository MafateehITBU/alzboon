'use server'

import { redirect } from 'next/navigation'
import { logoutCurrentSession } from '@/lib/auth/current-admin'

export async function logoutAction() {
  await logoutCurrentSession()
  redirect('/admin/login')
}
