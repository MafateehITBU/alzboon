#!/usr/bin/env bash
# Deploy a new Alzboon release on the VPS without touching other sites.
# Expects: git remote origin, Node 22, /var/www/alzboon layout, systemd unit `alzboon`.
set -euo pipefail

APP_ROOT="${APP_ROOT:-/var/www/alzboon}"
BRANCH="${DEPLOY_BRANCH:-main}"
REPO_URL="${DEPLOY_REPO_URL:-}"
PORT="${APP_PORT:-3001}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
RELEASE="${APP_ROOT}/releases/${STAMP}"
ENV_FILE="${APP_ROOT}/shared/env/production.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

mkdir -p "${APP_ROOT}/releases" "${APP_ROOT}/shared/uploads/public" "${APP_ROOT}/shared/uploads/private"

if [[ -n "$REPO_URL" ]]; then
  git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$RELEASE"
else
  # When the script runs from a checked-out deploy key workspace, clone from origin URL.
  ORIGIN_URL="$(git -C "${APP_ROOT}/current" remote get-url origin 2>/dev/null || true)"
  if [[ -z "$ORIGIN_URL" ]]; then
    echo "Set DEPLOY_REPO_URL or keep a previous release with origin remote." >&2
    exit 1
  fi
  git clone --depth 1 --branch "$BRANCH" "$ORIGIN_URL" "$RELEASE"
fi

cd "$RELEASE"
ln -sfn "$ENV_FILE" .env

npm ci
npx prisma generate
npx prisma migrate deploy
# Idempotent: creates configured Super Admins from production.env when missing.
npm run admin:bootstrap
npm run build

ln -sfn "$RELEASE" "${APP_ROOT}/current"
sudo systemctl restart alzboon

# Keep the newest 5 releases only.
cd "${APP_ROOT}/releases"
ls -1dt */ 2>/dev/null | tail -n +6 | xargs -r rm -rf

echo "Deployed $STAMP on port ${PORT}"
curl -fsS "http://127.0.0.1:${PORT}/" >/dev/null || echo "Warning: local health check failed"
