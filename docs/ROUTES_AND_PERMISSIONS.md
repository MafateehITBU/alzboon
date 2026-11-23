# Routes and permissions

Authentication, the admin workspace, and public website integration are implemented.

## Public routes

| Route | Page | Notes |
| --- | --- | --- |
| `/` | Homepage (EN) | Figma homepage. Canonical URL is `/`. Contact and services may come from PostgreSQL with design fallbacks. |
| `/ar` | Homepage (AR) | Arabic homepage shell with RTL direction on page content. |
| `/about`, `/ar/about` | About | Localized static about copy. |
| `/services`, `/ar/services` | Services list | Available services only. |
| `/services/[slug]`, `/ar/services/[slug]` | Service detail | Saved services. Uses bilingual translations. Not-found for missing slugs. |
| `/blogs`, `/ar/blogs` | Blog list | Published blogs with `publishedOn <= today`. Optional `?category=` by category slug. Pagination supported. |
| `/blogs/[slug]`, `/ar/blogs/[slug]` | Blog detail | Published blogs only. TipTap JSON rendered safely. Attachments are never public. |
| `/contact`, `/ar/contact` | Contact form | Creates `ContactEnquiry` with status `NEW`. Honeypot + rate limiting. IP limits require `TRUST_PROXY=true` behind Nginx. |
| `/privacy-policy`, `/ar/privacy-policy` | Privacy | Localized privacy copy. |
| `/media/[mediaId]` | Public media | Serves `PUBLIC` media assets only. Private media returns 404. |
| `/sitemap.xml` | Sitemap | Public routes plus available services and published blogs. Excludes `/admin`. |
| `/robots.txt` | Robots | Allows `/`, disallows `/admin`. |
| Any other path | Not found | The not-found page links back to `/`. |

Header Services links CMS services when present. Contact Us opens `/contact` (or `/ar/contact`). WhatsApp uses the first website-settings phone when present.

## Admin routes

| Route | Access | Notes |
| --- | --- | --- |
| `/admin/login` | Public | Email and password form. `noindex`. |
| `/admin` | Active signed-in admin | Dashboard. `noindex`. |
| `/admin/admins` | `MANAGE_ADMINS` | Admin account CRUD. `noindex`. |
| `/admin/website` | `MANAGE_WEBSITE_SETTINGS` | Website settings. Revalidates public home/contact. `noindex`. |
| `/admin/partners` | `MANAGE_WEBSITE_SETTINGS` | Partners. `noindex`. |
| `/admin/blog-categories` | `MANAGE_BLOGS` | Categories. `noindex`. |
| `/admin/blogs` | `MANAGE_BLOGS` | Blog list. `noindex`. |
| `/admin/blogs/new` | `MANAGE_BLOGS` | Blog create. Revalidates public blogs. `noindex`. |
| `/admin/blogs/[blogId]/edit` | `MANAGE_BLOGS` | Blog edit. Revalidates public blogs. `noindex`. |
| `/admin/services` | `MANAGE_SERVICES` | Services list. `noindex`. |
| `/admin/services/new` | `MANAGE_SERVICES` | Service create. Revalidates public services/home. `noindex`. |
| `/admin/services/[serviceId]/edit` | `MANAGE_SERVICES` | Service edit. Revalidates public services/home. `noindex`. |
| `/admin/contact-enquiries` | `MANAGE_CONTACT_ENQUIRIES` | Enquiry inbox. `noindex`. |
| `/admin/account` | Active signed-in admin | Self-service profile/password. `noindex`. |
| `/admin/profile` | Active signed-in admin | Redirects to `/admin/account`. `noindex`. |
| `/admin/forbidden` | Active signed-in admin | Permission denial. `noindex`. |
| `/admin/media/[mediaId]` | Authorized admin | Private profile photos and blog attachments only. |
| `/admin/session` | Cookie cleanup | Clears invalid cookies / redirects. |

`src/proxy.js` redirects only. Authorization is repeated on protected server entry points. There is no public registration route.
