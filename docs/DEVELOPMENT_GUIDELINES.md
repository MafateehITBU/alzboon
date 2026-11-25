# Development guidelines

## Coding conventions

- JavaScript only. Do not add TypeScript source.
- Use the Next.js App Router. The public homepage already does.
- Server components are the default. Mark a client component only when the file needs browser interactivity.
- Import shared helpers through the `src` alias established in Phase 1.
- Keep feature queries and mutations inside `src/features/<feature>`.
- Keep Prisma inside `src/lib/prisma` and server-only feature modules. Open it with `getPrisma()`.
- Run `prisma migrate deploy` for committed migrations. Do not use `prisma db push` or `prisma migrate reset` on a database that already has data.
- `npm test` rewrites `DATABASE_URL` to the matching `*_test` database via `tests/use-test-database.js`. Create and migrate that database separately. Do not point tests at the development database, and do not use `deleteMany({})` cleanup against shared content tables without that guard.
- Prefer named server functions with Zod input over client-side permission checks.

## Naming conventions

- Routes use lowercase words separated by hyphens.
- React components use PascalCase filenames.
- Feature directories use the names in `docs/ARCHITECTURE.md`.
- Permission names use the documented uppercase values.
- Database fields use Prisma camelCase in client code and map to PostgreSQL through Prisma.
- Stored media names are generated identifiers. The original filename is metadata only.

## Styling

- Tailwind CSS 4 utilities style components and pages.
- Tokens live in `@theme` inside `src/styles/globals.css`.
- That global file may also hold the Tailwind import, required font faces, resets, and base element styles.
- Remove a component stylesheet after the migrated section has been compared at desktop, laptop, tablet, and mobile.
- Keep the homepage’s existing type sizes, weights, line heights, colors, and spacing. Use arbitrary utilities where a Tailwind step would change the design.
- Dashboard color, type, and spacing use the same tokens. Keep admin styling in Tailwind utilities. Do not add an admin component stylesheet.
- Leave an unfinished admin destination disabled. Do not link it until that module exists.
- Dashboard counts are Prisma queries filtered with `hasPermission()`. Do not hardcode them.
- Admin account changes go through `createAdminAccount()`, `updateAdminAccess()`, and `deleteAdminAccount()`. Do not write admin rows from a page without those guards.

## Fonts

- English display type is Playfair Display (400/700) via `next/font` (`font-abu` token), self-hosted at build with `font-display: swap`.
- Self-host Plus Jakarta Sans, Roboto, DM Sans, and GE Dinar Two Medium from licensed font files.
- Arabic public UI uses GE Dinar Two (`--font-dinar`) whenever `lang="ar"`.
- Do not add a runtime request to Google Fonts.
- Preserve Georgia and FreeSerif as the system stacks already used by the homepage.
- The homepage hero keeps LTR layout so the copy column stays on the photo side in Arabic; only the hero text block uses `dir="rtl"`.

## Server and client rules

- Read session and permission data on the server for every protected operation.
- `src/proxy.js` may redirect. It is not sufficient authorization.
- Do not store sessions or permissions in `localStorage`.
- Do not accept a role or permission value from the browser as the decision.
- Return generic login errors.
- Sanitize stored TipTap JSON before it is rendered as HTML.

## Security rules

- Hash passwords with Argon2id.
- Store only the SHA-256 hash of a session token.
- Use an HTTP-only, `SameSite=Lax` cookie, with `Secure` in production.
- Expire and revoke sessions on logout.
- Rate-limit login attempts in PostgreSQL.
- Validate upload extension, detected MIME type, and size. Admin profile photos, public logos, blog featured images, and service hero/practice-area images are JPEG, PNG, or WebP up to 2 MB. Reject SVG until a sanitizer exists. Blog attachments are PDF only, up to 10 MB.
- Serve private admin photos and private blog attachments only through `/admin/media/[mediaId]` after a session and permission check.
- Serve public logos and blog featured images only through `/media/[mediaId]` after confirming `visibility` is `PUBLIC`.
- Delete media files only after confirming no other database row still references them.
- Reject path traversal. Resolve every path inside `STORAGE_ROOT` and reject results outside `public` or `private`.
- Never use a client-provided path as a storage key.
- Serve private media only after session and permission checks.
- Add `.env` to `.gitignore` before creating environment files.
- Do not commit `DATABASE_URL`, admin passwords, or the production env file.
- Admin pages send `noindex` and are still protected on the server.
- Do not remove or demote the last active Super Admin.

## Validation rules

- Validate form and action input with Zod on the server.
- React Hook Form may mirror those rules in the browser.
- Blog publication, service availability, and enquiry status use the schema enums.
- A service save requires hero and practice-area images, a bilingual practice-area section title/description, and at least one practice-area point with bilingual title, subtitle, and description.
- Category slugs are generated from the English name on the server, short, and unique. Arabic-only English names are rejected with a validation message.
- Blog categories cannot be deleted while blogs still reference them.
- Hidden blogs and blogs with a future `publishedOn` stay out of every public blog query.
- Services require both images. Benefits are not edited in admin and are stored empty. Practice-area section copy uses the overview columns. Practice points persist `sortOrder` with bilingual title, subtitle, and description. Every saved service is public; there is no availability toggle.
- Contact enquiry statuses are only `NEW`, `READ`, and `ARCHIVED`. Reject any other value on the server. Do not expose enquiry records through public endpoints.
- Self-service account updates never accept role, permission, or active-status changes from the client. Password changes use a separate action, verify the current password, and revoke all sessions.
- A blank social URL removes that link.

## Storage and deployment rules

- `STORAGE_ROOT` in production is `/var/www/alzboon/shared/uploads`.
- Public and private files stay in the `public` and `private` children of that root.
- Set `TRUST_PROXY=true` only behind Nginx that overwrites `X-Forwarded-For` / `X-Real-IP` with the real client address. Otherwise IP rate limits stay on `unknown`.
- Build output and release replacement must not delete the shared upload root.
- Run `prisma migrate deploy` as part of deployment. Do not use `prisma db push` on production.
- Back up PostgreSQL and the upload root before a production deploy, and keep an off-server copy of both.
- Restore the database with `pg_restore`. Restore media by returning the shared archive to the upload root.
- Rollback switches the release symlink and restarts systemd. It does not delete uploads.

## Testing requirements

`npm test` runs `tests/auth.test.js` with Node’s test runner against the local database. The tests create rows addressed to `phase3-test-` and delete those rows afterward. Later phases add tests for validation, storage path checks, and public visibility filters.

Every phase runs ESLint and the production build. A phase is complete only when that validation passes and the documentation matches the code.

## Documentation

Before substantial work, read `AGENTS.md`, `docs/PROJECT_MEMORY.md`, and `docs/IMPLEMENTATION_PLAN.md`. Update the affected document when a feature, schema, route, permission, architecture, or deployment decision changes. Do not mark work complete before it is implemented and verified.
