# Backup and recovery

Database and media backups are separate. Off-server copies are required. Do not claim production backups are operational until a restore test succeeds on the target environment.

## What to back up

| Asset | Path / source | Notes |
| --- | --- | --- |
| PostgreSQL | database `alzboon` | Schema + CMS + sessions + enquiries |
| Public media | `$STORAGE_ROOT/public/` | Logos, featured images, service images |
| Private media | `$STORAGE_ROOT/private/` | Profile photos, blog PDFs |
| Env secrets | `/var/www/alzboon/shared/env/` | Store encrypted off-server; never in git |

Releases and `node_modules` are rebuildable; do not treat them as the recovery source of truth.

## PostgreSQL backup (`pg_dump`)

Custom format (recommended for `pg_restore`):

```bash
stamp=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p /var/backups/alzboon
pg_dump --format=custom --file="/var/backups/alzboon/db-$stamp.dump" \
  --dbname="$DATABASE_URL"
```

Plain SQL alternative:

```bash
pg_dump --format=plain --file="/var/backups/alzboon/db-$stamp.sql" \
  --dbname="$DATABASE_URL"
```

Copy the dump off the VPS (object storage, another region, or encrypted USB process).

## PostgreSQL restore (`pg_restore`)

**Destructive.** Stop the app first. Prefer restore into a staging database before production.

```bash
sudo systemctl stop alzboon
# Example: restore into an empty database
dropdb --if-exists alzboon_restore && createdb alzboon_restore
pg_restore --clean --if-exists --no-owner --dbname=alzboon_restore /path/to/db-YYYYMMDD.dump
```

Verification:

```bash
psql alzboon_restore -c "SELECT COUNT(*) FROM admin_users;"
psql alzboon_restore -c "SELECT COUNT(*) FROM blogs;"
psql alzboon_restore -c "SELECT COUNT(*) FROM media_assets;"
```

Only after verification, cut over connection strings / rename databases under a maintenance window.

## Media backup

```bash
stamp=$(date -u +%Y%m%dT%H%M%SZ)
tar -C /var/www/alzboon/shared -czf "/var/backups/alzboon/uploads-$stamp.tgz" uploads
# copy uploads-*.tgz off-server
```

Restore:

```bash
sudo systemctl stop alzboon
# extract to a temp path first, then replace
mkdir -p /var/tmp/alzboon-restore
tar -C /var/tmp/alzboon-restore -xzf /path/to/uploads-YYYYMMDD.tgz
# verify file counts, then:
rsync -a --delete /var/tmp/alzboon-restore/uploads/ /var/www/alzboon/shared/uploads/
sudo systemctl start alzboon
```

Never run restore `rsync --delete` without confirming the archive is complete.

## Local restore rehearsal (development)

A full production restore was **not** executed against a live VPS in Phase 12. Operators should:

1. Take a `pg_dump` of a non-production database.
2. Restore into a throwaway database.
3. Tar and extract a copy of a test `STORAGE_ROOT`.
4. Confirm media IDs in PostgreSQL still resolve to files under `public/` / `private/`.

Until that rehearsal succeeds on the production host (or a clone of it), backups are **documented but not operationally verified**.

## Retention recommendations

| Set | Retention |
| --- | --- |
| Daily DB dump | 14 days |
| Weekly DB dump | 8 weeks |
| Monthly DB dump | 12 months |
| Media archive | Match DB schedule; keep at least one monthly |
| Off-server copies | Same retention in a second location |

Encrypt archives at rest when they leave the VPS.

## Recovery order

1. Restore PostgreSQL.
2. Restore media directories to `STORAGE_ROOT`.
3. Confirm `STORAGE_ROOT` and `DATABASE_URL` in the env file.
4. Start the app; verify login, one public image, one private attachment (authorized), sitemap.
