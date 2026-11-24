import { revalidatePath } from 'next/cache'

export function revalidatePublicContent({ home = false, services = false, blogs = false, contact = false } = {}) {
  if (home) {
    revalidatePath('/')
    revalidatePath('/ar')
  }
  if (services) {
    revalidatePath('/services', 'layout')
    revalidatePath('/ar/services', 'layout')
  }
  if (blogs) {
    revalidatePath('/blogs')
    revalidatePath('/ar/blogs')
    revalidatePath('/blogs', 'layout')
    revalidatePath('/ar/blogs', 'layout')
  }
  if (contact) {
    revalidatePath('/contact')
    revalidatePath('/ar/contact')
  }
  revalidatePath('/sitemap.xml')
}
