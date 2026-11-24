# Architecture

This document describes the approved target and the modules that are running now, including the admin CMS, Phase 11 public website integration, and Phase 12 production-readiness hardening. The homepage remains the Next.js Figma layout recorded in `docs/PROJECT_MEMORY.md`. Public contact submission and bilingual content pages are implemented. Deployment runbooks live in `docs/PRODUCTION_DEPLOYMENT.md` and `docs/BACKUP_AND_RECOVERY.md`. There is no general media library.

## App Router structure

```text
src/
  app/
    layout.js
    (website)/
      layout.js
      page.js
      not-found.js
      about/
      services/[slug]/
      blogs/
      blogs/[slug]/
      contact/
      privacy/
      privacy-policy/   # redirects to /privacy
    admin/
      login/
      page.js
      admins/
      website/
      partners/
      blog-categories/
      blogs/
      services/
      contact-enquiries/
      account/
    api/
  proxy.js
  components/
    ui/
    layout/
    website/
    admin/
  features/
    auth/
    admins/
    website-settings/
    partners/
    blog-categories/
    blogs/
    services/
    contact-enquiries/
  lib/
    auth/
    permissions/
    prisma/
    validations/
    storage/
    utils/
  styles/
    globals.css
  assets/
    images/
    icons/
    fonts/
```

Public routes other than the homepage and not-found page are created only when their phase implements real content. Admin routes are created with their features, not as empty shells in Phase 1.

`src/styles/globals.css` contains the Tailwind import, `@theme` tokens, resets, and base HTML styles. `next/font` loads the font files. Component stylesheets do not remain after a migrated section has been checked.

## Component organization

Homepage sections live in `src/components/website/home`. Header and Footer are client components because they hold menu, language, and form state. The remaining homepage sections are server components. Public service detail sections live in `src/components/website/services` and assemble through `ServicePageView.jsx`. Hero capability headings are presentation-only (`src/lib/services/service-presentation.js`); practice points and images come from Prisma. Public contact sections live in `src/components/website/contact` and assemble through `ContactPageView.jsx`; phones, email, addresses, and business hours come from website settings via `getPublicWebsiteContact`. Public privacy sections live in `src/components/website/privacy` and assemble through `PrivacyPageView.jsx`; approved Figma copy is in `src/lib/privacy/content.js`. Public blogs listing sections live in `src/components/website/blogs` and assemble through `BlogsPageView.jsx`; listing data comes from `src/lib/blog/public.js` (`listPublishedBlogs`, `serializePublicBlogListItem` with TipTap excerpt and reading-time estimates). Public blog article pages assemble through `src/components/website/blog/BlogArticleView.jsx` with TipTap rendering via `RichTextContent` (`variant="article"`), heading TOC helpers in `src/lib/blog/headings.js`, and related posts from `listRelatedPublishedBlogs`.

The admin shell is `src/components/admin/AdminShell.jsx`. Page headings use `src/components/admin/PageHeader.jsx`. Shared admin button and field classes live in `src/components/admin/adminStyles.js`. Image and attachment uploads use `ImageUploadField` and `FileUploadField`. Navigation visibility is decided in `src/lib/admin/navigation.js` and dashboard counts are read in `src/lib/admin/dashboard.js`. Admin account management lives in `src/app/admin/(workspace)/admins`. Website settings live in `src/app/admin/(workspace)/website` with `src/lib/website/settings.js`. Partners live in `src/app/admin/(workspace)/partners` with `src/lib/website/partners.js`. Blog categories and blogs live in `src/app/admin/(workspace)/blog-categories` and `src/app/admin/(workspace)/blogs`, with domain logic in `src/lib/blog/`. TipTap editing uses `src/components/admin/blog/RichTextEditor.jsx`. Services live in `src/app/admin/(workspace)/services` with domain logic in `src/lib/service/`. Practice areas and benefits keep order through `sortOrder`. Contact enquiries live in `src/app/admin/(workspace)/contact-enquiries` with domain logic in `src/lib/enquiry/`. Self-service account editing lives in `src/app/admin/(workspace)/account` with domain logic in `src/lib/auth/self-account.js`. The shell does not open Prisma. Login stays in `src/app/admin/login`. The workspace route group does not change the public URLs.

## Server and client boundaries

Server components are the default. A file uses the client boundary only for browser state, editors, maps, or other required interaction.

Database queries, password hashing, session lookup, permission checks, and storage writes run in server-only modules. Client components receive plain data prepared by the server.

## Authentication flow

1. `/admin/login` accepts email and password.
2. The server compares the password with the Argon2id hash.
3. Failure returns one generic message and records a login attempt.
4. Success creates a random 32-byte token, stores only its SHA-256 hash, and sets an HTTP-only, `SameSite=Lax` cookie. The cookie is `Secure` in production.
5. Logout sets `revokedAt` on the session row and clears the cookie. A missing, expired, or revoked session is rejected.
6. `src/proxy.js` sends an anonymous `/admin` request to `/admin/login`, and a request that merely has the session cookie from `/admin/login` to `/admin`. The proxy does not read the database. The workspace layout, `/admin`, `/admin/profile`, and `/admin/forbidden` call `requireAdmin()` again. An invalid cookie is cleared by `GET /admin/session` before the login page is shown.

A session lasts 12 hours from creation. Login revokes that admin’s older sessions and writes a new one. The cookie is HTTP-only, `SameSite=Lax`, and `Secure` when `NODE_ENV` is `production`. Only the SHA-256 hash of the 32-byte token is stored.

Five failed attempts for the same normalized email inside 15 minutes return a temporary throttle. The counter starts again after a successful attempt or after the failures age out of that window. Attempts older than 24 hours are deleted during a later sign-in. The lockout is not permanent.

The initial Super Admin is created by `npm run admin:bootstrap`. The command reads `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD`, refuses to run when either value is missing, requires a 12-character password with uppercase, lowercase, and a number, and refuses when any Super Admin already exists. Remove both variables after the command succeeds. The password is never written into source or documentation.

## Authorization flow

`requireAdmin()` and `requirePermission()` in `src/lib/auth/current-admin.js` run on the server for every protected page, server action, route handler, and mutation. Super Admin passes every permission. A normal Admin passes only assigned rows. Account changes go through `updateAdminAccess()` and `deleteAdminAccount()`, which reload the actor inside a transaction. An admin cannot change their own role or permissions, cannot manage a Super Admin, and cannot delete their own account. The last active Super Admin cannot be disabled, demoted, or deleted.

The five permissions are `MANAGE_ADMINS`, `MANAGE_BLOGS`, `MANAGE_SERVICES`, `MANAGE_CONTACT_ENQUIRIES`, and `MANAGE_WEBSITE_SETTINGS`. Dashboard and Profile are available to every authenticated admin. Navigation visibility uses the same server decision. Profile cannot change role or permissions.

Admin responses send `noindex`. That metadata is not an access control.

## Database access

Prisma 6.19.3 is the only application data access layer. The database is PostgreSQL. The schema and migration `20261121160100_initial_schema` are described in `docs/DATABASE_SCHEMA.md`. That migration file was prepared in the repository and is now applied to the local database `alzboon`.

`getPrisma()` in `src/lib/prisma/client.js` is the only client entry. It is server-only. If `DATABASE_URL` is missing, it throws and does not substitute memory or a file database. The homepage may read website contact settings when `DATABASE_URL` is present and otherwise keeps the Figma fallbacks.

## Media storage

One storage service is the only writer and reader of upload bytes.

Production root:

```text
/var/www/alzboon/shared/uploads/
  public/
  private/
```

`public/` holds approved website images, logos, partner logos, blog featured images, and service hero/practice-area images. `private/` holds protected blog attachments and admin profile photos.

`src/lib/storage/paths.js` and `src/lib/storage/objects.js` read `STORAGE_ROOT`, create a UUID storage key, write and read files, and resolve paths only inside `public/` or `private/`. A missing root, a client-supplied path, or a key that is not a UUID is rejected. Metadata remains a `MediaAsset` row in PostgreSQL. File bytes are not database columns.

Admin profile photos are validated in `src/lib/media/profile-photo.js`: JPEG, PNG, or WebP; extension must match detected magic bytes; maximum size 2 MB. They are stored as `PRIVATE` and served only by `GET /admin/media/[mediaId]` after a session check. Self-service account editing reuses the same private photo path. Password changes verify the current password, hash the new one with Argon2id, revoke every open session for that admin, and clear the cookie.

Website logos, partner logos, blog featured images, and service hero/practice-area images are validated in `src/lib/media/public-image.js` with the same formats and 2 MB limit. SVG is rejected because this project has no SVG sanitizer. They are stored as `PUBLIC` and served by `GET /media/[mediaId]`.

Blog attachments are validated in `src/lib/media/attachment.js`: PDF only, `%PDF-` signature check, maximum size 10 MB. They are stored as `PRIVATE` and served only by `GET /admin/media/[mediaId]` after a session check and `MANAGE_BLOGS` for attachment rows. Replaced or deleted media files are removed from disk only after `deleteMediaIfOrphan()` confirms no other row still references them.

TipTap documents are stored as JSON in `blog_translations.document` and sanitized by `sanitizeTipTapDocument()` before persistence. Public listing helpers in `src/lib/blog/public.js` require `published = true` and `publishedOn <= today`. Service hero and practice-area section descriptions remain plain text strings. Practice-area section title/description reuse the overview columns. Benefit columns remain in the schema but are cleared on admin save. Public service helpers in `src/lib/service/public.js` list every saved service. Server Actions allow a 12 MB body so multipart forms can carry images and an optional PDF. There is still no general media library.

Map locations store a label with latitude and longitude. Place search and draggable markers are not implemented until a map provider and credentials are approved. Candidate providers: Google Maps Platform, Mapbox, or Leaflet with OpenStreetMap/Nominatim.

Deployments replace the release directory and point the `current` symlink at the new release. They do not delete or replace `shared/uploads`.

Local development uses a storage root outside the repository, supplied by `STORAGE_ROOT`. The same service and checks apply.

## VPS deployment

Target layout:

```text
/var/www/alzboon/
  releases/<release-id>/
  current -> releases/<release-id>
  shared/
    uploads/public
    uploads/private
    env
```

Node.js 22 is required. The production process is `next start` under systemd, listening on a local port. Nginx is the public reverse proxy and forwards HTTP and HTTPS to that port. Nginx does not alias the private upload directory.

Environment comes from `/var/www/alzboon/shared/env`, which is not stored in Git. Required values are `DATABASE_URL`, `STORAGE_ROOT`, `APP_URL`, and `NODE_ENV`. Seed credentials stay available only to the operator running the seed.

Production build:

```bash
npm ci
npx prisma migrate deploy
npm run build
```

Deployment:

1. Upload a new release directory.
2. Install dependencies and build against the shared environment.
3. Run `prisma migrate deploy`.
4. Move the `current` symlink to the new release.
5. Restart systemd.
6. Check the public homepage and admin login.

Rollback points `current` at the previous release and restarts systemd. Rollback does not run a destructive database reset and does not touch `shared/uploads`. A migration that cannot be reversed safely is restored from the pre-deploy database backup instead.

## Backup and restoration

Create the persistent directories before the first deployment. The Node service user needs write access. The release directory must not contain these folders.

```bash
mkdir -p /var/www/alzboon/shared/uploads/public
mkdir -p /var/www/alzboon/shared/uploads/private
```

PostgreSQL:

- Take a compressed custom-format dump before every deployment and on a daily schedule.
- Copy each dump to an off-server location. A copy that stays only on the VPS is not the required backup.

```bash
mkdir -p "$BACKUP_DIR"
pg_dump --format=custom --no-owner --file="$BACKUP_DIR/alzboon-$(date +%F).dump" "$DATABASE_URL"
```

Restore into a database created for that purpose, then confirm the data before pointing production at it:

```bash
createdb alzboon_restore
pg_restore --no-owner --dbname=alzboon_restore "$BACKUP_DIR/alzboon-YYYY-MM-DD.dump"
```

Media:

- Archive `/var/www/alzboon/shared/uploads` with its `public` and `private` directories.
- Copy each archive off the VPS.

```bash
tar -C /var/www/alzboon/shared -czf "$BACKUP_DIR/uploads-$(date +%F).tar.gz" uploads
```

Restore by replacing only that shared directory from the archive, then restart the application:

```bash
tar -C /var/www/alzboon/shared -xzf "$BACKUP_DIR/uploads-YYYY-MM-DD.tar.gz"
```

A backup that exists only on the same VPS is not the required copy.
