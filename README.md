# Awwad AlZboon

Public website for Awwad AlZboon Legal Consultancy. The homepage is the Next.js version of the approved Figma frame.

## Requirements

- Node.js 22 or later
- npm 10 or later
- PostgreSQL for database commands that apply migrations

## Setup

```bash
npm install
```

`npm install` generates the Prisma client. Copy `.env.example` to `.env` and replace the placeholders before connecting to a database. Do not commit `.env`.

## Database

Create an empty local database, then apply the committed migration:

```bash
createdb alzboon
npx prisma migrate deploy
npx prisma migrate status
npx prisma validate
```

`prisma migrate deploy` applies `prisma/migrations/20261121160100_initial_schema`. It does not reset an existing database. Do not run `prisma migrate reset` against a database that already contains data.

The local database `alzboon` already has that migration applied. `prisma migrate status` reports the schema is up to date. A new environment still needs its own empty database and the same deploy command. Do not put the connection string in documentation or source.

The homepage keeps Figma fallbacks without `DATABASE_URL`. With PostgreSQL configured, public pages read available services, published blogs, and website settings. Server code that opens Prisma or storage throws a clear error when the matching variable is missing.

## First Super Admin

Add `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` to `.env`, then run:

```bash
npm run admin:bootstrap
```

The password must be 8 to 200 characters and include an uppercase letter, a lowercase letter, and a number. The command does nothing when either value is missing, and it refuses to create a second Super Admin. Remove both variables after it succeeds. Do not put the password in source or documentation.

Sign in at `/admin/login`. An active admin can open `/admin` and `/admin/account` to update their own profile and password. Accounts with `MANAGE_ADMINS` can open `/admin/admins`. Accounts with `MANAGE_WEBSITE_SETTINGS` can open `/admin/website` and `/admin/partners`. Accounts with `MANAGE_BLOGS` can open `/admin/blog-categories` and `/admin/blogs`. Accounts with `MANAGE_SERVICES` can open `/admin/services`. Accounts with `MANAGE_CONTACT_ENQUIRIES` can open `/admin/contact-enquiries`. Modules that are not built yet stay disabled in the sidebar.

## Development

```bash
npm run dev
```

Next.js prints a local URL. Open that URL in a browser.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create the production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run authentication, admin, CMS, and public-site tests |
| `npm run admin:bootstrap` | Create the first Super Admin from environment variables |
| `npm run db:validate` | Validate `prisma/schema.prisma` |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Apply committed migrations with `prisma migrate deploy` |

## Production

Phase 12 prepared VPS deployment docs. Do not deploy without explicit approval.

- `docs/PRODUCTION_DEPLOYMENT.md` — Node 22, Nginx, systemd, releases, `STORAGE_ROOT`, HTTPS
- `docs/BACKUP_AND_RECOVERY.md` — `pg_dump` / `pg_restore` and media archives
- `docs/SECURITY_AUDIT.md` — authz, media, rate limits, dependency advisories
- `docs/QA_REPORT.md` — test and functional QA results

Set `APP_URL` to the public HTTPS origin and `TRUST_PROXY=true` only behind a correctly configured Nginx. Never expose `shared/uploads` as static files.

## Project notes

Application structure, design tokens, routes, and the implementation plan are in `AGENTS.md` and `docs/`.
