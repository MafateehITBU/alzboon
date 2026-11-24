# Routes and permissions

Authentication, the admin workspace, and public website integration are implemented.

## Public routes

| Route | Page | Notes |
| --- | --- | --- |
| `/` | Homepage (EN) | Figma homepage. Canonical URL is `/`. Contact and services may come from PostgreSQL with design fallbacks. |
| `/ar` | Homepage (AR) | Arabic homepage shell with RTL direction on page content. |
| `/about`, `/ar/about` | About | Figma About Us bilingual page: navy hero, overlapping statistics card, founder profile with quote and 2×2 accreditations, navy consultation CTA. Static localized copy; contact/WhatsApp use website settings when present. |
| `/services/[slug]`, `/ar/services/[slug]` | Service detail | Shared Figma-matched template. Hero, practice accordion, and images from CMS; methodology and precedent shared via messages. Not-found for missing slugs. No general `/services` index — services are reached from the header mega menu. |
| `/blogs`, `/ar/blogs` | Blog list | Published blogs with `publishedOn <= today`. Optional `?category=` by category slug. Pagination supported. |
| `/blogs/[slug]`, `/ar/blogs/[slug]` | Blog detail | Published blogs only. TipTap JSON rendered safely. Attachments are never public. |
| `/contact`, `/ar/contact` | Contact | About-matched hero (same image/overlay), breadcrumb, and two-column enquiries layout: CMS phones/email/addresses/business hours + WhatsApp on the left; inquiry form on the right. Creates `ContactEnquiry` with status `NEW`. Honeypot + rate limiting. IP limits require `TRUST_PROXY=true` behind Nginx. |
| `/privacy-policy`, `/ar/privacy-policy` | Privacy | Localized privacy copy. |
| `/media/[mediaId]` | Public media | Serves `PUBLIC` media assets only. Private media returns 404. |
| `/sitemap.xml` | Sitemap | Public routes plus available services and published blogs. Excludes `/admin`. |
| `/robots.txt` | Robots | Allows `/`, disallows `/admin`. |
| Any other path | Not found | The not-found page links back to `/`. |

Header Services opens a full-width mega menu under the header with available CMS services in a three-column grid and practice-area icons. Contact Us opens `/contact` (or `/ar/contact`). WhatsApp uses the first website-settings phone when present.

## Admin routes

| Route | Access | Notes |
| --- | --- | --- |
| `/admin/login` | Public | Email and password form. `noindex`. |
| `/admin` | Active signed-in admin | Dashboard. `noindex`. |
| `/admin/admins` | `MANAGE_ADMINS` | Admin account CRUD. `noindex`. |
| `/admin/website` | `MANAGE_WEBSITE_SETTINGS` | Website settings. Revalidates public home/contact. `noindex`. |
| `/admin/partners` | `MANAGE_WEBSITE_SETTINGS` | Partners with CSV export/import. `noindex`. |
| `/admin/partners/export` | `MANAGE_WEBSITE_SETTINGS` | Download all partners as CSV. `noindex`. |
| `/admin/blog-categories` | `MANAGE_BLOGS` | Categories with CSV export/import. `noindex`. |
| `/admin/blog-categories/export` | `MANAGE_BLOGS` | Download all categories as CSV. `noindex`. |
| `/admin/blogs` | `MANAGE_BLOGS` | Blog list with CSV export/import. `noindex`. |
| `/admin/blogs/export` | `MANAGE_BLOGS` | Download all blogs as CSV. `noindex`. |
| `/admin/blogs/new` | `MANAGE_BLOGS` | Blog create. Revalidates public blogs. `noindex`. |
| `/admin/blogs/[blogId]/edit` | `MANAGE_BLOGS` | Blog edit. Revalidates public blogs. `noindex`. |
| `/admin/services` | `MANAGE_SERVICES` | Services list with CSV export/import. `noindex`. |
| `/admin/services/export` | `MANAGE_SERVICES` | Download all services as CSV. `noindex`. |
| `/admin/services/new` | `MANAGE_SERVICES` | Service create. Revalidates public services/home. `noindex`. |
| `/admin/services/[serviceId]/edit` | `MANAGE_SERVICES` | Service edit. Revalidates public services/home. `noindex`. |
| `/admin/contact-enquiries` | `MANAGE_CONTACT_ENQUIRIES` | Enquiry inbox. `noindex`. |
| `/admin/account` | Active signed-in admin | Self-service profile/password. `noindex`. |
| `/admin/profile` | Active signed-in admin | Redirects to `/admin/account`. `noindex`. |
| `/admin/forbidden` | Active signed-in admin | Permission denial. `noindex`. |
| `/admin/media/[mediaId]` | Authorized admin | Private profile photos and blog attachments only. |
| `/admin/session` | Cookie cleanup | Clears invalid cookies / redirects. |

`src/proxy.js` redirects only. Authorization is repeated on protected server entry points. There is no public registration route.
