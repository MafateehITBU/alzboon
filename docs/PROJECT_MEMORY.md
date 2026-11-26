# Project memory

## Identity

Awwad AlZboon is a legal consultancy website with a private administrative workspace. The public homepage is the approved Figma frame “Home - option2” (`2426:1649`) from file `VCUkYtwQkCPVKo1vkey9wI`.

The product name appears in the design as Awad, Awaad, Alzoboon, and Alzboon. Visible homepage copy stays as designed.

## Technology stack

Confirmed for the platform:

- Next.js App Router and React, JavaScript only.
- Tailwind CSS 4, configured with `@theme`.
- PostgreSQL and Prisma.
- Self-managed Linux VPS.
- Local media storage outside each application release.
- Argon2id passwords and server-side sessions when authentication is built.
- Zod, TipTap, and Lucide React. React Hook Form remains available for later forms.

Running application today:

- Next.js 16.4.6, React 19.3.1, Tailwind CSS 4.3.5, Prisma 6.19.3, and Lucide React.
- Node.js 22 is the project requirement and the intended production runtime.
- The homepage may read website settings and available services from PostgreSQL, with Figma fallbacks.

## Current architecture

The running application is a Next.js App Router site.

- `src/app/layout.js` registers the local fonts and global stylesheet.
- `src/app/(website)/page.js` assembles the homepage.
- `src/app/not-found.js` renders the themed public 404 (SiteShell + Return home). Unmatched `/admin/*` paths use `admin/(workspace)/not-found.js` (Back to dashboard).
- Homepage sections live in `src/components/website/home`.
- Header and Footer are client components. The other homepage sections are server components.
- Styling is Tailwind CSS 4, with tokens in `src/styles/globals.css`.
- Assets live in `src/assets/images`, `src/assets/icons`, and `src/assets/fonts`.
- Prisma schema and server-only Prisma and storage modules are present.
- Migration `20261121160100_initial_schema` is applied to the local PostgreSQL database `alzboon`. The migration file remains in the repository.
- Admin account management, website settings, partners, blog categories, blogs, services, contact enquiries, and self-service account editing are implemented. Profile photos and blog attachments use private storage. Website logos, partner logos, blog featured images, and service images use public storage.
- Authentication tests run with `npm test`.
- `.env.example` has placeholders. A real `.env` is not committed.

## Implemented functionality

The homepage matches the desktop Figma frame and adapts at laptop, tablet, and mobile widths.

Working behavior:

- Home links to `/`.
- Header, hero, and footer Contact Us scroll to `#consultation`.
- Services opens a full-width mega menu under the header listing available CMS services in three columns with icons.
- Public service detail pages (`/services/[slug]`, `/ar/services/[slug]`) use one shared template: hero (CMS image/title/body + presentation capability panels), practice-area accordion (CMS points + image), shared methodology, and shared lead-precedent/judicial-trust sections. There is no general `/services` listing page; visitors open individual services from the header mega menu.
- The language control changes emphasis only. Page copy stays English.
- WhatsApp uses `https://wa.me/971562511154`.
- Phone and email in the footer use website settings when a settings row exists; otherwise they keep `tel:+971562511154` and `mailto:info@alzboon.com`.
- Footer Judicial Briefs subscribe saves emails to `newsletter_subscribers`. Newly published public blogs notify active subscribers by SMTP with the English title and an absolute `APP_URL` link to `/blogs/[slug]`.
- `/admin/login` requires password then a 6-digit email OTP. Progressive password lockout: 5 failures → 1h → 5h → 12h → 24h, then auto-deactivate until a Super Admin reactivates. Three wrong OTPs email `info@aipmcae.com`. `/admin` shows permission-filtered database counts and logout. `/admin/account` lets any active admin update their own profile and password; role and permissions stay read-only. `/admin/profile` redirects to `/admin/account`. `/admin/admins` manages accounts when `MANAGE_ADMINS` is granted. `/admin/website` and `/admin/partners` require `MANAGE_WEBSITE_SETTINGS`. `/admin/blog-categories` and `/admin/blogs` require `MANAGE_BLOGS`. `/admin/services` requires `MANAGE_SERVICES`. `/admin/contact-enquiries` requires `MANAGE_CONTACT_ENQUIRIES`.
- Admin Services, Partners, Blog Categories, and Blogs lists support CSV export/import (upsert by id/slug/EN name; media restored by media id, storage key, or embedded base64; missing media does not block import—placeholder or keep existing, upload manually later).
- Admin list pages share one live-search toolbar (no Filter button) and search across the list’s text columns.

Visible items without destinations:

- View Our Profile.
- Practice-area detail pages.

Public About Us is implemented at `/about` and `/ar/about` from the approved Figma About Us frame (`2120:5882`): cinematic hero background (`about-hero-presence.jpg`), overlapping white statistics card, two-column founder profile with quote and 2×2 accreditations, and homepage-style cream consultation card. Shared header/footer are reused. The founder portrait is `src/assets/images/about-founder.png` (Figma-exported studio portrait).

Public Contact Us is implemented at `/contact` and `/ar/contact`: same About hero image/overlay with breadcrumb and heading, then a cream two-column enquiries section (CMS contact details + WhatsApp; inquiry form). Copy avoids the word “Chambers”. Successful public submissions notify active Super Admins and Admins with `MANAGE_CONTACT_ENQUIRIES` via SMTP (`src/lib/mail/smtp.js`, `src/lib/mail/enquiry-notification.js`) when `SMTP_HOST` / `SMTP_PORT` / `SMTP_FROM` (and optional auth) are set.

Public Privacy Policy is implemented at `/privacy` and `/ar/privacy` from Figma frame `2191:2362`: dark statutory hero with ledger card, sticky Codex TOC + non-waivable shield + protected intake CTA, and eight editorial legal sections (privilege callout, dossier cards, grounds grid, security panel, disclosures table, transfers, retention, rights). Copy lives in `src/lib/privacy/content.js`. Legacy `/privacy-policy` redirects here.

Public Blogs listing is implemented at `/blogs` and `/ar/blogs` from Figma frame `2191:1818`: About-style cinematic hero, Recent Legal Briefs grid driven by `listPublishedBlogs` / `serializePublicBlogListItem`, category filter chips, and pagination (6 per page). Card excerpts prefer `BlogTranslation.description` (fallback: TipTap plain-text excerpt). Listing components live in `src/components/website/blogs`.

Public blog article pages (`/blogs/[slug]`, `/ar/blogs/[slug]`) use shared `BlogArticleView` under `src/components/website/blog`: editorial hero, TipTap article rendering with heading TOC anchors, sticky sidebar, related published blogs (`listRelatedPublishedBlogs`), and a consultation CTA. SEO includes Open Graph, Twitter, hreflang, and BlogPosting JSON-LD. Private PDF attachments stay admin-only.

The hero video is a still image and the exported control bar. It does not play.

## Development state

Phase 12 is implemented. Phase 11 public CMS integration remains in place. Phase 12 added Super Admin concurrency locking, trusted-proxy IP rate limits, private profile-photo authz correction, document `lang`/`dir` sync, filled button height alignment to 48px, and production docs (`SECURITY_AUDIT`, `QA_REPORT`, `PRODUCTION_DEPLOYMENT`, `BACKUP_AND_RECOVERY`). Deployment to the VPS has not been performed.

## Confirmed decisions

- PostgreSQL, Prisma, Next.js App Router, JavaScript, and Tailwind CSS 4 are the platform.
- Hosting is a self-managed Linux VPS. Node.js 22 runs the production server behind Nginx, under systemd.
- Uploads live in `/var/www/alzboon/shared/uploads/`, split into `public/` and `private/`. Releases must not delete that directory.
- Public media covers approved website images, logos, partner logos, blog featured images, and service hero/practice-area images. Private media covers protected blog attachments and admin profile photos and is served only after a server-side session and permission check.
- File metadata is stored in PostgreSQL. File bytes are stored by one storage service.
- English display type is Playfair Display (400/700) via `next/font`; the Tailwind token remains `font-abu`.
- Plus Jakarta Sans, Roboto, and DM Sans are self-hosted from licensed files. Fonts are not requested from Google at runtime.
- The homepage remains the Figma layout. Footer contact email, phones, and addresses come from website settings when saved. The homepage has no social icon row or partners strip yet, so those records are stored for later public pages.
- The homepage newsletter is not a contact enquiry.
- Public pages that do not exist today remain not-found until their own phase builds them.
- `src/proxy.js` is only an early redirect. Authorization is repeated on every protected server entry point.
- Database and media backups require an off-server copy and a tested restore path.

## Known issues

- Local `DATABASE_URL` and `STORAGE_ROOT` are configured. Their values are not recorded here.
- Admin profile photos, public logos, blog featured images, and service hero/practice-area images accept JPEG, PNG, and WebP up to 2 MB. SVG is rejected. Blog attachments accept PDF up to 10 MB.
- No map provider is configured. Manual latitude and longitude editing is available. Search and draggable markers wait for provider approval.
- OneDrive hosts the working copy and can interfere with file watching and generated database engines.
- Homepage filled and outline buttons use a fixed 48px height.
- Raster images use native `img` elements. `next/image` inserts inline dimensions that conflict with these fixed crops.
- Prisma CLI transitive advisories (`npm audit`) require a Prisma 7 major upgrade; not applied. Runtime `@prisma/client` path is separate.
- Arabic homepage Hero / Approach / Expertise / Testimonials remain English hardcode.
- Contact enquiry email notifications are not implemented.
- Production backup/restore has been documented but not verified on a live VPS.

## Pending tasks

Await explicit approval before VPS cutover. Auto-deploy on push to `main` is wired via `.github/workflows/deploy.yml` (requires GitHub secrets + `shared/bin/deploy-release.sh` on the VPS). SMTP is required for admin login OTP in production. Map provider, Arabic homepage copy completion, and Prisma 7 upgrade remain deferred. See `docs/IMPLEMENTATION_PLAN.md` and `docs/QA_REPORT.md`.

## First Super Admin

Deploy runs `npm run admin:bootstrap` after migrate. It creates configured Super Admins when missing (idempotent; does not reset existing passwords).

Required environment variables:

- `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` (8–200 characters, with uppercase, lowercase, and a number)
- Optional second account: `SUPER_ADMIN_EMAIL_2` / `SUPER_ADMIN_PASSWORD_2`
- Optional display names: `SUPER_ADMIN_NAME` / `SUPER_ADMIN_NAME_2`

Do not commit real passwords. Keep the pairs in `production.env` on the VPS so auto-deploy can seed missing accounts.
