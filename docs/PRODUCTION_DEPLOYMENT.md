# Production deployment — Linux VPS

**Do not deploy without explicit approval.** This document prepares the self-managed VPS. It does not run against production from this repository session.

## Target stack

- Linux VPS (Ubuntu 22.04/24.04 LTS recommended)
- Node.js **22** (project requirement)
- PostgreSQL 16+ (local/dev used 18.x; production may use distro-supported 16/17)
- Nginx reverse proxy + HTTPS (Let’s Encrypt)
- systemd unit for `next start`
- Persistent media: `/var/www/alzboon/shared/uploads/`

## Prerequisites

```bash
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib curl git
# Install Node.js 22 via NodeSource or nvm; verify:
node -v   # v22.x
npm -v    # 10+
```

Create a deploy user (example `deploy`) with ownership of `/var/www/alzboon`.

## Directory layout

```text
/var/www/alzboon/
  shared/
    uploads/
      public/
      private/
    env/                 # optional: store production .env outside releases
  releases/
    20261122T120000Z/    # immutable release checkouts
  current -> releases/...
```

**Never** delete or replace `shared/uploads` during build, deploy, or rollback.

```bash
sudo mkdir -p /var/www/alzboon/shared/uploads/{public,private} /var/www/alzboon/releases
sudo chown -R deploy:deploy /var/www/alzboon
```

## Environment

Create `/var/www/alzboon/shared/env/production.env` (mode `600`):

```bash
DATABASE_URL="postgresql://alzboon:STRONG_PASSWORD@127.0.0.1:5432/alzboon?schema=public"
STORAGE_ROOT="/var/www/alzboon/shared/uploads"
APP_URL="https://www.example.com"
NODE_ENV="production"
TRUST_PROXY="true"
```

Notes:

- Set `APP_URL` to the public HTTPS origin (used by sitemap, robots, metadata).
- `TRUST_PROXY=true` only when Nginx strips client-supplied `X-Forwarded-For` and sets the real client IP.
- Do **not** leave `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` in production env after bootstrap.
- Never commit production secrets.

## PostgreSQL

```bash
sudo -u postgres createuser -P alzboon
sudo -u postgres createdb -O alzboon alzboon
```

Apply migrations from a release directory:

```bash
cd /var/www/alzboon/current
set -a; source /var/www/alzboon/shared/env/production.env; set +a
npx prisma migrate deploy
npx prisma migrate status
npx prisma validate
```

Bootstrap the first Super Admin once:

```bash
# temporarily export SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD
npm run admin:bootstrap
# unset and remove those variables immediately
```

## Application build

```bash
RELEASE=/var/www/alzboon/releases/$(date -u +%Y%m%dT%H%M%SZ)
git clone --depth 1 <repo-url> "$RELEASE"
cd "$RELEASE"
ln -sfn /var/www/alzboon/shared/env/production.env .env
npm ci
npx prisma generate
npm run build
ln -sfn "$RELEASE" /var/www/alzboon/current
```

`STORAGE_ROOT` must point at `shared/uploads`, not inside the release tree.

## systemd

`/etc/systemd/system/alzboon.service`:

```ini
[Unit]
Description=Awwad AlZboon Next.js
After=network.target postgresql.service

[Service]
Type=simple
User=deploy
Group=deploy
WorkingDirectory=/var/www/alzboon/current
EnvironmentFile=/var/www/alzboon/shared/env/production.env
ExecStart=/usr/bin/npm run start -- --hostname 127.0.0.1 --port 3000
Restart=on-failure
RestartSec=5
TimeoutStopSec=20

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now alzboon
sudo systemctl status alzboon
```

## Nginx

Do **not** alias `/var/www/alzboon/shared/uploads`. All media goes through Next.js `/media` and `/admin/media`.

```nginx
# /etc/nginx/sites-available/alzboon
limit_req_zone $binary_remote_addr zone=alzboon_login:10m rate=10r/m;

upstream alzboon_app {
  server 127.0.0.1:3000;
  keepalive 32;
}

server {
  listen 80;
  server_name www.example.com example.com;
  return 301 https://www.example.com$request_uri;
}

server {
  listen 443 ssl http2;
  server_name www.example.com;

  # ssl_certificate / ssl_certificate_key via certbot

  client_max_body_size 12m;

  add_header X-Content-Type-Options nosniff always;
  add_header X-Frame-Options DENY always;
  add_header Referrer-Policy strict-origin-when-cross-origin always;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

  location / {
    proxy_pass http://alzboon_app;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Connection "";
  }
}
```

Obtain certificates with Certbot after DNS points at the VPS.

## Health checks

```bash
curl -fsS https://www.example.com/ | head -c 200
curl -fsS https://www.example.com/robots.txt
curl -fsS https://www.example.com/sitemap.xml | head
systemctl is-active alzboon
journalctl -u alzboon -n 100 --no-pager
```

## Deploy procedure

1. Build a new release directory (`npm ci`, `prisma generate`, `npm run build`).
2. Run `prisma migrate deploy` against production (backup first — see `BACKUP_AND_RECOVERY.md`).
3. Point `current` symlink at the new release.
4. `sudo systemctl restart alzboon`.
5. Hit health checks and spot-check `/`, `/ar`, `/admin/login`, one service, one blog, contact form.

## Rollback

1. Point `current` at the previous release symlink target.
2. Restart systemd.
3. Database migrations are forward-only unless a tested down path exists — restore from `pg_dump` if a migration must be undone.
4. Uploads remain in `shared/uploads` and are not rolled back with the release.

## Logging

- Application: `journalctl -u alzboon`
- Nginx: `/var/log/nginx/access.log`, `error.log`
- Avoid logging passwords, session tokens, or raw `DATABASE_URL` in custom scripts.
