# Changelog

## 2026-11-25 — Playfair Display replaces Abu Dhabi Pro

- English display face is Playfair Display (400/700) via `next/font/google`, self-hosted at build; `font-abu` token kept for existing utilities.
- Removed `abu-dhabi-pro-regular.otf` and `FontsFree-Net-Abu-Dhabi-Pro-Bold.ttf`. Arabic pages still use GE Dinar Two.

## 2026-11-24 — Judicial Briefs newsletter + larger footer badges

- Additive migration `20261124130000_newsletter_subscribers` creates `newsletter_subscribers` only (no drops).
- Footer Subscribe to Briefs saves emails to the database; newly published public blogs email active subscribers with title + `APP_URL` absolute link.
- Footer credential badges enlarged slightly.

## 2026-11-24 — Contact enquiry SMTP notifications

- Public contact form submissions email active Super Admins and Admins with `MANAGE_CONTACT_ENQUIRIES` when `SMTP_*` env vars are configured.
- Branded HTML email uses site teal/gold/navy styling and embeds `logo-header.png`. Mail failures are logged and do not fail enquiry creation.

## 2026-11-24 — Public blog article detail redesign

- Redesigned `/blogs/[slug]` and `/ar/blogs/[slug]` as a shared editorial article experience (`BlogArticleView`): hero with breadcrumb/meta/featured image, TipTap article prose with heading anchors, sticky sidebar (TOC + meta + consult CTA), related published blogs, and consultation band.
- Related posts prefer the same category via `listRelatedPublishedBlogs`. Private attachments remain admin-only. No schema or CMS data changes.

## 2026-11-24 — Blog translation description for public cards

- Additive migration `20261124120000_blog_translation_description` adds `description` to `blog_translations` with default `''` (no data wipe).
- Admin create/edit, list table, CSV import/export, and public blog cards use the bilingual description.

## 2026-11-24 — Public Blogs listing redesign

- Redesigned `/blogs` and `/ar/blogs` from Figma node `2191:1818`: dark navy hero with static Active Repository card (`148+`), Recent Legal Briefs grid, category filters, and pagination.
- Cards use published CMS blogs only (featured image, category translations, TipTap-derived excerpt and reading time, detail links by slug).
- Shared Header/Footer/SiteShell unchanged. No schema, migration, seed, or Admin Blog changes.

## 2026-11-24 — Privacy Policy & Statutory Legal Privilege page

- Implemented `/privacy` and `/ar/privacy` from Figma node `2191:2362` (hero ledger, sticky Codex TOC, eight sectional layouts).
- Legacy `/privacy-policy` and `/ar/privacy-policy` redirect to the new routes; footer and sitemap updated.
- Content sourced from the approved Figma frame. Shared Header/Footer/SiteShell unchanged. No database or schema changes.

## 2026-11-24 — Contact enquiries without company/country + form toast

- Dropped `company` and `country` from `contact_enquiries` (schema + admin table/detail + public submit).
- Contact form shows a success/failure toaster with the result message after submit.

## 2026-11-24 — Admin list search + soft CSV media import

- Shared AdminListToolbar on Services, Partners, Categories, Blogs, Enquiries, and Admins: live search, no Filter button.
- List search matches the visible/related text columns (names, titles, slugs, authors, practice areas, enquiry fields, etc.).
- CSV import no longer fails when images are missing: text rows are created/updated; missing images use a placeholder (or keep existing on update) so admins can upload files manually. Warnings are reported in the import message.

## 2026-11-24 — Admin CSV export/import restore + list toolbar

- CSV export embeds image bytes (base64) so import can recreate media after records and files were deleted.
- Import upserts by id, slug, or English name/title (no duplicate rows on re-import).
- Admin list toolbars: removed Filter buttons; search filters as you type; Export/Import sit in a segmented control beside New/Add.

## 2026-11-24 — Admin CSV export/import

- Added Export CSV / Import CSV on admin Services, Partners, Blog Categories, and Blogs list pages.
- Import upserts by id/slug and restores linked media via media id, on-disk storage key, or embedded base64.
- Nested service practice areas/benefits and blog TipTap documents are carried in JSON CSV cells.

## 2026-11-23 — Remove all test database cleanup wipes

- Removed every test `cleanup()` / blank `deleteMany({})` that could wipe services, blogs, media, partners, or website settings.
- Fixture helpers that deleted rows are now no-ops. Auth and admin account suites also redirect to `*_test` via `use-test-database.js`.
- Never run test files directly against the app database. Use `npm test` only.

## 2026-11-23 — Contact Us page redesign

- Rebuilt `/contact` and `/ar/contact` with the About hero image/overlay, breadcrumb, and heading.
- Added a two-column enquiries section: left contact details (phones, email, locations, consultation hours from website settings + WhatsApp); right inquiry form matching the approved layout.
- Public contact payload now includes bilingual business hours. Form fields: name, email, phone, service, message.

## 2026-11-23 — Remove general services listing

- Removed `/services` and `/ar/services` listing pages. Individual services stay at `/services/[slug]` and `/ar/services/[slug]`, reached from the header mega menu.
- Service breadcrumbs are Home / current service only. Sitemap no longer lists the general services index.

## 2026-11-23 — Public service detail pages

- Rebuilt `/services/[slug]` and `/ar/services/[slug]` with one shared template matching the approved service Figma exports.
- CMS-driven hero and practice-area accordion; presentation-only capability headings keyed by slug; shared methodology and lead-precedent sections in messages.
- No schema changes; existing service IDs, slugs, translations, and media left intact.

## 2026-11-23 — Admin sidebar organization

- Reorganized admin navigation to match the sectioned sidebar pattern: Dashboard, then Management / Content / Enquiries / Account.
- Moved Website Information and Partners under Management; Profile under Account.
- Collapse control is a centered chevron at the bottom of the sidebar.

## 2026-11-22 — Phase 12 final QA and production readiness

Stabilization phase: security hardening, QA, and deployment documentation. No VPS deploy.

- Last-active Super Admin protection: row locks, concurrent demotion regression, and fixture isolation for polluted local Super Admin rows.
- Trusted-proxy client IP helper for contact and login rate limits; private media authz allows `MANAGE_ADMINS` on linked profile photos.
- Document locale sync for Arabic `lang`/`dir`; filled homepage buttons set to 48px.
- Added `docs/SECURITY_AUDIT.md`, `docs/QA_REPORT.md`, `docs/PRODUCTION_DEPLOYMENT.md`, `docs/BACKUP_AND_RECOVERY.md`.
- `npm test` 54 pass; lint and build green. Prisma CLI `npm audit` findings documented without major upgrade.

## 2026-11-22 — Phase 11 public website integration

Connected the CMS to the public website without redesigning the Figma homepage.

- Homepage header, practice cards, consultation WhatsApp, and footer read available services and website settings with design fallbacks.
- Added bilingual public routes for About, service detail, Blogs, blog detail, Contact, and Privacy. English stays unprefixed; Arabic uses `/ar`.
- Services and blogs gained unique public slugs. Every saved service and published non-future blogs appear publicly. Private attachments stay admin-only.
- Service admin no longer has an availability checkbox; all saved services show in the public header and service pages.
- Implemented the bilingual About Us page (`/about`, `/ar/about`) with hero, institutional stats, founder profile (using `expertise-portrait.jpg`), credentials, and consultation CTA in the homepage design system. Documented Abu Dhabi Pro (EN) and GE Dinar Two (AR) as the approved global typography policy.
- Redesigned About Us into an editorial premium layout: gold-accented hero typography, divider-based stats and credentials (no repetitive card grids), art-directed founder portrait composition, and a full-bleed teal consultation band.
- Replaced that About layout with the approved **Sovereign Atlas** direction: atlas-plate hero + teal jurisdiction column, varied 2×2 statistics monument, recessed founder well with overlapping bio panel and gold quote plaque, featured Jordan Bar credential band, and double-framed engagement folio CTA.
- Rebuilt About Us to match the approved Figma reference (navy hero, overlapping stats card, founder profile with 2×2 accreditations, navy consultation CTA), discarding prior creative redesign concepts.
- Replaced the temporary About founder image with the Figma-exported studio portrait at `src/assets/images/about-founder.png`.
- About polish: homepage-matched type scale, hero gradient accent on “Border & Enterprise”, rounded-square credential icons, separated stats tiles with count-up, and homepage-style cream consultation card.
- About hero background replaced with `about-hero-presence.jpg` (International Legal Presence): subtle blur, teal overlay, and RTL-aware positioning.
- Arabic public pages use self-hosted GE Dinar Two Medium. Homepage static copy is bilingual via `messages.js`. The hero keeps its left-side layout in Arabic.
- `npm test` now forces the `*_test` database (`tests/use-test-database.js`) so test cleanup cannot wipe development content.
- Contact form creates `NEW` enquiries with honeypot and rate limiting. No email notifications were added.
- Added sitemap, robots, canonical/Open Graph metadata, TipTap-safe public rendering, and public cache revalidation after CMS mutations.
- `npm test` covers public visibility, bilingual serialization, enquiry validation/rate limits, and locale paths.

## 2026-11-22 — Admin visual redesign and service editor trim

Aligned the admin login and workspace with the public website palette, then refined it into a smoother modern CMS chrome, and simplified the service editor.

- Shared admin chrome uses cream/teal/gold/ink with soft glass panels, rounded controls, light sidebar, and Jakarta-led buttons.
- Image and file fields use dashed upload boxes with preview instead of bare file inputs.
- Service create/edit no longer exposes benefits. Practice areas use a bilingual section title/description plus ordered points with title, subtitle, and description. Benefit values stay empty.
- `npm test` covers the updated service validation and ordering rules.

## 2026-11-22 — Phase 10 self-service account

Added self-service account editing for the signed-in administrator.

- `/admin/account` updates profile photo, name, email, and phone for any active authenticated admin.
- Password changes verify the current password, enforce the existing policy, hash with Argon2id, revoke all sessions, and require a new sign-in.
- Role, status, and permissions stay read-only. `/admin/profile` redirects to `/admin/account`.
- Profile photos remain private JPEG/PNG/WebP up to 2 MB with orphan-safe cleanup.
- `npm test` covers profile updates, email uniqueness, photo changes, password rules, and session revocation.

## 2026-11-22 — Phase 9 contact enquiries

Added the contact enquiries inbox without a public contact form or email notifications.

- `/admin/contact-enquiries` lists enquiries with search, status and service filters, pagination, detail view, status updates, and delete confirmation.
- Statuses are `NEW` (amber), `READ` (blue), and `ARCHIVED` (gray). Invalid statuses are rejected server-side.
- Dashboard new-enquiry counts refresh after status changes and deletions for accounts with `MANAGE_CONTACT_ENQUIRIES`.
- Homepage and newsletter behavior were left unchanged. No public enquiry endpoint was added.
- `npm test` covers permissions, search/filters, status changes, dashboard counts, deletion, and unauthorized access.

## 2026-11-22 — Phase 8 services management

Added services management without contact enquiry editors or public website redesigns.

- `/admin/services` lists services with English/Arabic name search, category filter, pagination, and delete confirmation.
- Full-page create and edit routes store bilingual basic, hero, and overview fields, required hero and practice-area images, ordered practice areas, and ordered benefits.
- At least one bilingual benefit is required. Practice areas and benefits use existing `sortOrder` columns. Category filtering uses `categoryLabel`.
- Service images are public JPEG, PNG, or WebP up to 2 MB. Unavailable services stay out of public query helpers. Homepage design was preserved.
- `npm test` covers services permissions, CRUD, ordering, validation, media cleanup, and availability.

## 2026-11-22 — Phase 7 blog categories and blogs

Added blog category and blog management without services, enquiries, or a public blog redesign.

- `/admin/blog-categories` supports English and Arabic names, server-generated unique slugs, search, edit, and delete. Categories with blogs cannot be deleted.
- `/admin/blogs` lists blogs with title search, category and published/hidden filters, and pagination.
- Full-page create and edit routes store bilingual TipTap JSON, author, publish date, status, category, required featured image, and optional private PDF attachment.
- Featured images are public JPEG, PNG, or WebP up to 2 MB. Attachments are private PDFs up to 10 MB and are served only from `/admin/media/[mediaId]` to accounts with `MANAGE_BLOGS`.
- TipTap documents are sanitized on the server. Hidden and future-dated blogs stay out of `publishedBlogWhere` helpers. No public blog pages were added.
- Server Actions allow multipart bodies up to 12 MB. `npm test` covers categories, blogs, sanitization, media, publishing, and permissions.

## 2026-11-22 — Phase 6 website settings and partners

Added website information and partners management without blog or service editors.

- `/admin/website` edits logo, contact email, bilingual business hours, phones, addresses, manual map coordinates, and social URLs, with unsaved-change warnings.
- `/admin/partners` lists, creates, edits, and deletes partners with public logo uploads.
- Public logos are JPEG, PNG, or WebP up to 2 MB in `public/` storage and are served from `/media/[mediaId]`. SVG is rejected. Orphan media cleanup checks remaining references.
- Map search and draggable markers are deferred until a map provider is approved. Manual coordinates work now.
- The homepage footer uses settings contact details when present and otherwise keeps the Figma fallbacks. No new social or partners homepage sections were added.
- `npm test` passed with 27 tests. Lint, production build, and `prisma validate` passed.

## 2026-11-21 — Phase 5 admin account management

Added `/admin/admins` for creating, editing, and deleting CMS accounts.

- Listing supports name and email search, role and status filters, pagination, and loading, empty, and error states.
- Create and edit use Argon2id passwords, unique emails, role and permission rules, and optional private profile photos (JPEG, PNG, or WebP up to 2 MB).
- Delete confirms the target name and email. Sessions revoke on deactivation, role change, permission change, password change, and deletion.
- Ordinary Admins cannot manage Super Admins. Self role and permission changes are blocked. The last active Super Admin cannot be deleted, disabled, or demoted.
- Private photos are served only through `/admin/media/[mediaId]`.
- `npm test` passed with 23 tests. Lint, production build, and `prisma validate` passed. Bootstrap was not run.

## 2026-11-21 — Phase 4 admin workspace

Added the protected admin workspace without content editors or account management.

- `/admin` shows a welcome heading, live database counts, and disabled quick actions. Each card and action is limited to the current admin’s permissions. A new contact enquiry count is shown in amber.
- The workspace has a 264px sidebar, a collapsed desktop mode, a mobile drawer, and a sticky account menu. Logout still revokes the server session.
- `/admin/profile` is read-only. `/admin/forbidden` links back to the dashboard. Login and session cleanup stay outside the shell. Admin pages send `noindex`.
- Unfinished modules are labeled unavailable. They are not links.
- `npm test` passed with 15 tests, including authentication, navigation visibility, and the live count query. No Super Admin was created by this phase.

## 2026-11-21 — Phase 3 authentication

Added server-side admin authentication without the dashboard or content editors.

- Passwords are hashed with Argon2id. Sessions store a SHA-256 hash of a random token in an HTTP-only, `SameSite=Lax` cookie that is `Secure` in production. A session expires after 12 hours.
- Login uses one generic failure message. Five failures for the same email inside 15 minutes are throttled until that window passes. Logout revokes the session.
- Super Admin receives every permission. Admin receives only assigned permissions. Account changes reload the actor inside a transaction and block self role changes, admin management of a Super Admin, and removal of the last active Super Admin.
- `npm run admin:bootstrap` creates the first Super Admin from `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD`. It refuses a second Super Admin. No account was created by the implementation itself.
- `src/proxy.js` redirects only. Protected pages check the session again. Admin routes send `noindex`.
- `npm test` passed with 12 tests. `prisma validate`, `prisma migrate status`, lint, and the production build passed. The schema is unchanged.

## 2026-11-21 — Phase 2 live database verification

The migration file `20261121160100_initial_schema` was already in the repository. It is now applied to the local PostgreSQL 18.1 database `alzboon`.

- `prisma migrate status` reports the database schema is up to date.
- `prisma validate` passed.
- A read-only catalog check found the expected 21 application tables, 7 enums, 21 foreign keys, and the expected unique indexes. `_prisma_migrations` is the only extra table.
- `prisma migrate diff` produced an empty migration, so the live database matches `prisma/schema.prisma`.
- `adminUser.count()` returned 0. No rows were created, updated, or deleted.
- Connection credentials were not written into the documentation.

## 2026-11-21 — Phase 2 database foundation

Prisma 6.19.3 and the approved PostgreSQL schema are in the repository. Authentication, admin screens, APIs, and upload endpoints were not added. The homepage still does not query the database.

### Database

- Added `prisma/schema.prisma` and server-only `src/lib/prisma/client.js`.
- Added migration `20261121160100_initial_schema`.
- `prisma validate` passed and `prisma generate` wrote the client.
- The migration was not applied. No PostgreSQL server is available here, and no `.env` with a real `DATABASE_URL` was created.

### Storage

- Added server-only `src/lib/storage/storage.js`.
- The module requires `STORAGE_ROOT`, generates UUID keys, and rejects paths outside `public/` or `private/`.
- Extension, MIME, and size checks are not implemented because those limits are not defined.

### Documentation

- Recorded the schema choices, migration name, environment placeholders, and backup commands.
- Added `.env.example`. `.env` stays ignored.

## 2026-11-21 — Outline button height and font-license check

- Set the outline button border box to 48px. It had rendered at 58px because a 26px line height and 14px vertical padding exceeded the 48px minimum. Border color `#BAA87A`, 20px bold type, 5px radius, and horizontal padding stay as they were.
- Filled buttons stay at their previous 52px height.
- Checked the rendered homepage at 1440, 1280, 820, and 390 pixels. The outline button is 48px at each width, and horizontal overflow remains 0.
- Read the name tables in both Abu Dhabi Pro files. Each says website use requires a purchased webfont license from Tanween. No license file is stored with the fonts, so neither weight is production-cleared. The files remain in place for development.

## 2026-11-21 — Phase 1 homepage migration

The public homepage now runs on Next.js App Router and Tailwind CSS 4. Admin, authentication, Prisma, and APIs were not added.

### Application

- Added Next.js 16.4.6, Tailwind CSS 4.3.5, PostCSS, and `eslint-config-next`.
- Removed Vite, the Vite React plugin, React Router, and `eslint-plugin-react-refresh`.
- Moved the homepage to `src/app/(website)/page.js` and the not-found page to `src/app/not-found.js`.
- Moved homepage sections to `src/components/website/home` and styled them with Tailwind utilities.
- Deleted the Vite entry, React Router files, and the old component stylesheets after the rendered checks.
- Ignored `.env` and `.next`.

### Fonts and assets

- Registered Abu Dhabi Pro Regular at weight 400 and Bold at weight 700 through `next/font`.
- Added licensed Plus Jakarta Sans, Roboto, and DM Sans files under `src/assets/fonts`.
- The rendered homepage does not request Google Fonts.
- Existing homepage images and icons remain. Unused arrow icons were kept.

### Verification

- ESLint passed.
- `npm run build` passed. `/` and `/_not-found` are static routes.
- Rendered checks at 1440, 1280, 820, and 390 pixels showed no horizontal overflow.
- At 1440 pixels the hero is 1440 by 700 pixels and the player is 550 by 400 pixels.
- The outline button renders a 2px `#BAA87A` border.
- A real pointer click opens the mobile menu at 390 pixels.

### Documentation

- Added `docs/DESIGN_SYSTEM.md` and `docs/ROUTES_AND_PERMISSIONS.md`.
- Updated project memory, architecture, guidelines, the implementation plan, and the README to the running Next.js homepage.

## 2026-11-21 — Phase 0 decisions recorded

Application source was not changed.

### Architecture

- Approved the migration from the existing Vite homepage to Next.js App Router, JavaScript, and Tailwind CSS 4.
- Confirmed PostgreSQL and Prisma as the database platform.
- Confirmed a self-managed Linux VPS as the hosting platform.
- Confirmed Node.js 22, Nginx, and systemd for production.
- Confirmed that `src/proxy.js` may redirect anonymous admin traffic and is not the authorization boundary.

### Media

- Confirmed local filesystem storage at `/var/www/alzboon/shared/uploads/`.
- Split storage into `public/` and `private/`.
- Required one storage service, file validation, generated filenames, and path-traversal checks.
- Required private attachments to stay behind server-side authentication and authorization.
- Required file metadata in PostgreSQL and forbade storing upload bytes in ordinary records.
- Required deployments and rollbacks to preserve the shared upload directory.
- Required off-server database and media backups, with restore procedures.

### Typography

- Preserved Abu Dhabi Pro Regular at CSS weight 400 and Bold at CSS weight 700.
- Required Plus Jakarta Sans, Roboto, and DM Sans to be self-hosted from licensed files.
- Removed runtime Google Fonts as an approved production dependency. The current Vite page still loads that stylesheet until Phase 1.

### Documentation

- Added `AGENTS.md`.
- Added project memory, architecture, database schema, development guidelines, implementation plan, and this changelog.
- Left route and design-system documents for Phase 1, when the App Router structure and Tailwind tokens exist in code.

### Not started

- Next.js migration, Prisma, authentication, admin screens, and public database integration are not implemented.
