# Database schema

Status: implemented in `prisma/schema.prisma` and applied to the local PostgreSQL 18.1 database `alzboon` as migration `20261121160100_initial_schema`. Phases 3–6 did not change the schema or add a migration. Password hashes, sessions, admin permissions, website settings, partners, and media metadata use the existing columns. No credentials are stored in this document.

Prisma is 6.19.3. Prisma 7 and the 8 release candidate expect a TypeScript configuration, so they were not used. The client is generated with `prisma generate` and opened only through `getPrisma()` in `src/lib/prisma/client.js`. That function throws when `DATABASE_URL` is missing. It does not connect during the homepage build.

## Recorded structure choices

The approved document did not name a key type, column style, or every delete action. The migration uses these choices:

- Primary keys are UUIDs, except `WebsiteSettings.id`, which defaults to `default`. The application must use that one settings row and must not insert another id. PostgreSQL does not have a second constraint that forbids other ids.
- Prisma fields are camelCase. PostgreSQL columns and tables are snake_case.
- `LoginAttempt` stores an identifier and has no admin foreign key. A failed attempt may name an email that is not an admin.
- Deleting a blog category is restricted while a blog still points at it.
- Deleting a media row is restricted while any content row still points at it.
- Deleting a service sets `ContactEnquiry.serviceId` to null and keeps the enquiry text.
- Child translations, practice areas, benefits, phones, addresses, map locations, social links, permissions, and sessions are removed with their parent.
- Map coordinates are `DECIMAL(10, 7)`.
- Blog publication is a date. `published` and `available` default to false. Enquiry status defaults to `NEW`.
- The settings logo is optional so the settings row can exist before a logo upload. Partner logos, blog featured images, and both service images are required.
- TipTap content is `jsonb` in `blog_translations.document`. No file bytes are stored.
- A service’s minimum of one benefit, and the last-active-super-admin rule, are application rules. They are not database constraints in this phase.

## Commands

Copy `.env.example` to `.env` and set a real `DATABASE_URL` before these commands. Do not commit `.env`.

```bash
npx prisma validate
npx prisma generate
npx prisma migrate deploy
npx prisma migrate status
```

`npm run db:validate`, `npm run db:generate`, and `npm run db:migrate` call the same three Prisma commands. `db:migrate` applies committed migrations. It does not reset the database.

PostgreSQL is the only database. Prisma is the only ORM. Decimal is used for map coordinates. Rich text is TipTap JSON. Upload bytes are not database columns.

## Identity

### AdminUser

- `id`
- `name`
- `email`, unique
- `phone`, optional
- `passwordHash`
- `role`: `SUPER_ADMIN` or `ADMIN`
- `active`
- `profileMediaId`, optional
- timestamps

The last active Super Admin cannot be deleted, disabled, or changed to Admin. Optional `profileMediaId` points at a private `MediaAsset`. Self-service account editing updates name, email, phone, password hash, and profile media only. Role, active status, and permissions are never changed through `/admin/account`.

### AdminPermission

- `adminUserId`
- `permission`: `MANAGE_ADMINS`, `MANAGE_BLOGS`, `MANAGE_SERVICES`, `MANAGE_CONTACT_ENQUIRIES`, or `MANAGE_WEBSITE_SETTINGS`
- unique pair of user and permission

Super Admin does not need these rows. The server grants that role every permission.

### Session

- `id`
- `adminUserId`
- `tokenHash`, unique SHA-256 of the cookie token
- `expiresAt`
- `revokedAt`, optional
- timestamps

### LoginAttempt

- `id`
- `identifier`
- `successful`
- `createdAt`
- index on identifier and creation time

## Website settings

### WebsiteSettings

One row.

- logo media
- contact email
- English business hours
- Arabic business hours
- timestamps

### PhoneNumber

- settings id
- number
- `region`: `JORDAN` or `UAE`
- optional label
- sort order

### Address

- settings id
- English text
- Arabic text
- `region`: `JORDAN` or `UAE`
- sort order

### MapLocation

- settings id
- label
- `latitude` and `longitude` as Decimal
- sort order

The draggable map and location search require a configured map provider. Manual coordinates remain valid without one.

### SocialLink

- settings id
- `platform`: `LINKEDIN`, `FACEBOOK`, `INSTAGRAM`, or `X`
- URL
- unique pair of settings and platform

A blank URL is deleted rather than stored. The public site shows an icon only for a stored URL.

## Content

### Partner

- name
- logo media, required
- sort order
- timestamps

### BlogCategory

- English name
- Arabic name
- `slug`, unique, short, and generated from the English name
- timestamps

### Blog

- category
- author name
- publication date
- `published`
- featured image media, required
- attachment media, optional
- attachment display name, optional
- timestamps

Hidden blogs stay out of every public query. Public helpers also require `publishedOn` on or before the current UTC date. Blog category deletion is restricted while any blog still references the category.

### BlogTranslation

- blog id
- `locale`: `EN` or `AR`
- title
- `description` — short public card summary (up to 320 characters); additive column with empty default for existing rows
- TipTap document
- unique pair of blog and locale

Arabic content is edited and rendered right to left.

### NewsletterSubscriber

- unique email
- `active` boolean (default true)
- timestamps

Additive table for footer Judicial Briefs subscriptions. Existing tables are never dropped for this feature.

### Service

- hero image media, required
- practice-area image media, required
- `available`
- timestamps

Every saved service is public (`available` is always set true on write; the column remains for schema compatibility). Practice areas and benefits store order in `sortOrder`. Public service and blog URLs use unique `slug` columns generated from English names. Services no longer store a category label.

### ServiceTranslation

- service id
- locale
- name
- hero title
- hero description
- overview title
- overview description
- unique pair of service and locale

### PracticeArea

- service id
- sort order

### PracticeAreaTranslation

- practice area id
- locale
- title
- subtitle
- description
- unique pair of practice area and locale

### Benefit

- service id
- sort order

A service must retain at least one benefit.

### BenefitTranslation

- benefit id
- locale
- text
- unique pair of benefit and locale

## Enquiries

### ContactEnquiry

- name
- email
- phone
- optional service id (`onDelete: SetNull` keeps the enquiry when a service is deleted)
- message
- `status`: `NEW`, `READ`, or `ARCHIVED`
- timestamps
- indexes on status and creation time

Admin inbox search covers name, email, phone, message, status, and related service name. Dashboard new counts use `status = NEW`. Public `/contact` submissions write this table (company and country were removed).

## Media

### MediaAsset

- storage key, unique and generated by the storage service
- `visibility`: `PUBLIC` or `PRIVATE`
- original filename, retained for display only
- MIME type
- byte size
- width and height when the file is an image
- timestamps

Deleting a media row also deletes its storage object through the storage service. Deployment never deletes these objects as a side effect of replacing a release.

## Relations and deletion

- Admin permissions, sessions, and login context belong to an admin user.
- Phone numbers, addresses, map locations, and social links belong to the settings row.
- Translations, practice areas, and benefits belong to their parent content row and are removed with that parent.
- Contact enquiries may retain their text when a related service is removed. The service reference becomes empty.
- Media assets are referenced by settings, partners, blogs, and services. A referenced asset cannot be removed until those references are cleared.
