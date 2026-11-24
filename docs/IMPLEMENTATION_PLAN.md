# Implementation plan

Phase 12 is complete. Do not deploy to production or begin a new development phase without explicit approval in the current request.

## Completed

### Phase 0 — Repository audit and approved plan

- Inspected the Vite application, homepage, assets, fonts, tokens, and behavior.
- Confirmed PostgreSQL, Prisma, the Linux VPS, and local media storage.
- Confirmed Next.js App Router, JavaScript, and Tailwind CSS 4.
- Confirmed self-hosted fonts and the existing Abu Dhabi Pro weight mappings.
- Confirmed that the proxy is not the authorization boundary.
- Recorded the schema, storage layout, backup method, and deployment method.
- Wrote `AGENTS.md` and the Phase 0 documents.

## In progress

None.

## Completed in Phase 1

- Added Next.js 16.4.6 and Tailwind CSS 4.3.5.
- Moved the homepage and not-found page to the App Router.
- Moved homepage components to `src/components/website/home` and converted them to Tailwind utilities.
- Registered Abu Dhabi Pro at weights 400 and 700, and self-hosted Plus Jakarta Sans, Roboto, and DM Sans.
- Removed the component stylesheets, Vite, `index.html`, `src/main.jsx`, and React Router after the rendered checks.
- Ignored `.env`.
- ESLint and `npm run build` passed.
- Added `docs/DESIGN_SYSTEM.md` and `docs/ROUTES_AND_PERMISSIONS.md`.

Phase 1 did not add the dashboard, Prisma, or empty public pages.

## Completed in Phase 2

- Added Prisma 6.19.3 and `@prisma/client`, with `getPrisma()` in `src/lib/prisma/client.js`.
- Implemented the approved models in `prisma/schema.prisma`.
- Wrote migration `20261121160100_initial_schema`, then applied it to the local database `alzboon`.
- `prisma validate`, `prisma generate`, and `prisma migrate status` passed. The live schema has no drift.
- Added `src/lib/storage/storage.js` for the public and private directories, generated keys, and path checks.
- Missing `DATABASE_URL` or `STORAGE_ROOT` throws. There is no memory fallback.
- Documented the VPS directory commands and the `pg_dump`, `pg_restore`, and upload-archive commands.

Phase 2 did not add login, sessions, password hashing, the admin dashboard, CRUD screens, APIs, or upload endpoints. Extension, MIME, and size limits are still undefined.

## Completed in Phase 3

- Added Argon2id password hashing, hashed database sessions, login, logout, and login throttling.
- Added `requireAdmin()`, `requirePermission()`, and transactional admin-account guards, including the last active Super Admin rule.
- Added `npm run admin:bootstrap` for one initial Super Admin. It does not create an account unless both environment values are present, and it refuses a second run.
- Added `src/proxy.js` as a redirect only. Admin pages send `noindex`.
- `npm test` passed: 12 tests, 0 failures. No schema change and no migration was added.

Phase 3 did not add the dashboard, admin management screens, content editors, or upload endpoints.

## Completed in Phase 4

- Added the protected workspace at `src/app/admin/(workspace)` with a 264px sidebar, collapsed desktop mode, mobile drawer, sticky top bar, and page heading.
- `/admin` reads live Prisma counts for admins, blog categories, blogs, services, and contact enquiries. A card appears only when the current admin has that permission. A new enquiry count uses the amber warning color.
- Quick actions for unfinished modules are labeled unavailable. They are not links or forms.
- `/admin/profile` shows the signed-in account as read-only. `/admin/forbidden` explains the denial and links back to `/admin`.
- Login and `GET /admin/session` stay outside the workspace shell. Logout still revokes the server session.
- `npm test` covers navigation visibility and the live count query.

Phase 4 did not add tables, search, filters, dialogs, toasts, uploads, admin account management, or content editors.

## Completed in Phase 5

- Added `/admin/admins` for accounts with `MANAGE_ADMINS`.
- Listing supports search, role and status filters, pagination, and loading, empty, and error states.
- Create, edit, and delete use the existing transactional account guards. Passwords use Argon2id. Sessions revoke on deactivation, role change, permission change, and password change.
- Profile photos are private JPEG, PNG, or WebP files up to 2 MB, served only through `GET /admin/media/[mediaId]`.
- `npm test` covers listing permission, create, duplicate email, role limits, session revocation, deletion, and last Super Admin protection.

Phase 5 did not add blog, service, settings, partners, or enquiry editors.

## Completed in Phase 6

- Added `/admin/website` for logo, contact email, bilingual business hours, phones, addresses, manual map coordinates, and social URLs, with unsaved-change protection.
- Added `/admin/partners` for partner name and logo CRUD with search and pagination.
- Public logos use JPEG, PNG, or WebP up to 2 MB in `public/` storage. SVG is rejected. Files are served from `/media/[mediaId]`.
- Map search and draggable markers are not implemented. Manual latitude and longitude are supported until a map provider is approved.
- The homepage footer reads contact email, phones, and addresses from settings when present, otherwise it keeps the Figma fallbacks. No new social or partners sections were added to the homepage.

Phase 6 did not add blog, service, or enquiry editors.

## Completed in Phase 7

- Added `/admin/blog-categories` for English and Arabic names, server-generated unique SEO slugs, search, edit, and delete. Deletion is blocked while blogs still reference the category.
- Added `/admin/blogs` with search, category and status filters, pagination, and delete confirmation.
- Added full-page `/admin/blogs/new` and `/admin/blogs/[blogId]/edit` with bilingual TipTap content, author, publish date, published checkbox, category, required featured image, and optional private PDF attachment.
- TipTap JSON is sanitized on the server. Featured images are public JPEG/PNG/WebP up to 2 MB. Attachments are private PDFs up to 10 MB, served only through `/admin/media/[mediaId]` with `MANAGE_BLOGS`.
- `publishedBlogWhere()`, `listPublishedBlogs()`, and `getPublishedBlogById()` keep hidden and future-dated blogs out of public queries. No new public blog UI was added.
- `npm test` covers categories, slugs, deletion rules, blogs, sanitization, media, publishing, and permissions.

Phase 7 did not add services, enquiries, a media library, or a public blog design.

## Completed in Phase 8

- Added `/admin/services` with search, category filter, pagination, and delete confirmation.
- Added full-page `/admin/services/new` and `/admin/services/[serviceId]/edit` with bilingual basic and hero fields, required hero and practice-area images, a practice-area section title/description, and ordered practice points (title, subtitle, description).
- Benefits are no longer edited in admin; empty values keep the existing schema valid. Practice-area section copy uses overview columns. Practice points persist `sortOrder`. Service category labels were removed later; services are not categorized.
- Service images are public JPEG/PNG/WebP up to 2 MB. Every saved service is public. Homepage appearance was not changed.
- `npm test` covers listing permissions, create/edit, ordering, practice-area validation, images, orphan cleanup, availability, and unauthorized access.

Phase 8 did not add contact enquiry management, a media library, or new public website sections.

## Completed in Phase 9

- Added `/admin/contact-enquiries` inbox with search, status and service filters, pagination, detail dialog, status updates (`NEW`, `READ`, `ARCHIVED`), and delete confirmation.
- Status and delete actions revalidate the dashboard. New-enquiry counts continue to come from PostgreSQL for accounts with `MANAGE_CONTACT_ENQUIRIES`.
- No public contact form, email notifications, or homepage changes were added in this phase. Enquiry rows for tests are created directly in PostgreSQL.
- `npm test` covers listing permissions, search/filters, details, status changes, dashboard counts, deletion, and unauthorized access.

Phase 9 did not add public contact submission, account self-service editing, or a media library.

## Completed in Phase 10

- Added `/admin/account` for every active authenticated admin to update profile photo, name, email, and phone.
- Password changes use a separate action, verify the current password, enforce the Argon2id policy, revoke all sessions, clear the cookie, and require sign-in again.
- Role, status, and permissions remain read-only. `/admin/profile` redirects to `/admin/account`. Sidebar and account menu point to Profile under the Account section.
- `npm test` covers profile updates, email rules, photo upload/removal, password policy, session revocation, and role/permission protection.

Phase 10 did not add public website content pages or a media library.

## Completed in Phase 11

- Connected homepage header/practice areas/consultation/footer to available services and website settings with Figma fallbacks.
- Added bilingual public routes for About, service detail, Blogs, blog detail, Contact, and Privacy (`/` English, `/ar` Arabic). No general services listing page.
- Public services and blogs use unique slugs; every saved service and published non-future blogs are exposed.
- Contact form writes `ContactEnquiry` rows as `NEW` with honeypot and rate limiting. Email notifications were not added.
- Added sitemap, robots, canonical/Open Graph metadata, public revalidation after CMS mutations, and TipTap-safe public rendering.
- Private blog attachments stay on `/admin/media` only.

## Completed in Phase 12

- Fixed last-active Super Admin test failures; added `FOR UPDATE` locking and a concurrent demotion regression test.
- Hardened contact/login IP rate limiting behind `TRUST_PROXY`; fixed private profile-photo authz for `MANAGE_ADMINS`.
- Synced document `lang`/`dir` for Arabic public pages; aligned filled homepage buttons to 48px Figma height.
- Wrote `docs/SECURITY_AUDIT.md`, `docs/QA_REPORT.md`, `docs/PRODUCTION_DEPLOYMENT.md`, and `docs/BACKUP_AND_RECOVERY.md`.
- `npm test` 54/54; lint and production build passed. `npm audit` Prisma CLI advisories documented without force-upgrade.
- Did not deploy to the VPS. Live Figma MCP screenshot was rate-limited; visual deltas were recorded from code and known issues.

## Known blockers

- Abu Dhabi Pro Regular and Bold are not production-cleared (Tanween webfont license missing).
- Production VPS deploy, HTTPS, and verified off-server backup/restore are not done.
- Admin profile photos, public logos, blog featured images, and service hero/practice-area images are JPEG, PNG, or WebP up to 2 MB. Blog attachments are PDF up to 10 MB.
- The local database is PostgreSQL 18.1, database `alzboon`. Production hosting remains a separate VPS setup.
- Plus Jakarta Sans, Roboto, and DM Sans are self-hosted under the SIL Open Font License.
- No map provider is configured. Candidate options for later approval: Google Maps Platform, Mapbox, or Leaflet with OpenStreetMap/Nominatim.
- The working copy is stored in OneDrive, which can disturb file watching and generated engines.
- Contact email notifications and full Arabic homepage localization remain open improvements.
