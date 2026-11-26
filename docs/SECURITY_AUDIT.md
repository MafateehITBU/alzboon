# Security audit — Phase 12

Date: 2026-11-22. Scope: authentication, authorization, sessions, media, public forms, and dependency advisories. Findings are verified against the running codebase unless marked otherwise.

## Executive verdict

Application-layer controls are suitable for a self-managed VPS deployment **after** operational blockers (font license, production `APP_URL` / HTTPS / Nginx hardening, and `TRUST_PROXY`) are completed. No critical in-app exploit path was confirmed. Deployment must never expose `STORAGE_ROOT` as static files.

## Super Admin protection

| Check | Result |
| --- | --- |
| Last active Super Admin cannot deactivate self | Pass (`assertKeepsActiveSuperAdmin`) |
| Last active Super Admin cannot demote self | Pass (self role change forbidden + last-SA guard) |
| Last active Super Admin cannot be deleted | Pass (self-delete forbidden; last-SA guard for others) |
| Concurrent mutual demotion | Pass — row `FOR UPDATE` lock; regression test added |
| Ordinary Admins cannot manage Super Admins | Pass |
| Self-service cannot escalate role/permissions | Pass |

Root cause of the two prior test failures: local DB already had an active non-fixture Super Admin, so “last SA” assertions did not isolate. Tests now temporarily deactivate other Super Admins for those assertions and restore them afterward. Implementation also locks all active Super Admin rows before counting.

## Authentication and sessions

| Control | Status | Notes |
| --- | --- | --- |
| Argon2id passwords | Verified | `@node-rs/argon2` |
| Session token hashing | Verified | SHA-256 stored; raw token only in cookie |
| Cookie flags | Verified | `httpOnly`, `SameSite=lax`, `Secure` in production |
| Session TTL / revoke | Verified | 12h; revoke on logout, deactivate, role/permission/password change |
| Login progressive lockout | Verified | 5 wrong passwords → 1h → 5h → 12h → 24h; then deactivate until Super Admin |
| Login email OTP (2FA) | Verified | 6-digit code after correct password; 3 wrong OTPs → alert `info@aipmcae.com` |
| Login rate limit (IP) | Added | 30 failures / 15 minutes when IP is known |
| Proxy is not authz | Verified | `src/proxy.js` cookie redirect only |
| Bootstrap | Verified | One Super Admin; refuses second |

## Authorization

Protected pages, server actions, and private media re-check session and permissions. Public serializers omit private attachments. IDOR on media IDs returns 404/403 without leaking bytes.

### Fixed in Phase 12

1. **Private profile photos for `MANAGE_ADMINS`** — second guard incorrectly required ownership; admins with `MANAGE_ADMINS` can now read linked profile photos. Unlinked private objects remain 404.
2. **Contact / login IP spoofing** — `X-Forwarded-For` / `X-Real-Ip` trusted only when `TRUST_PROXY=true`. Production Nginx must set the real client IP and strip untrusted forwarded headers.
3. **Last Super Admin race** — `SELECT … FOR UPDATE` before counting active Super Admins.

## Media and uploads

| Asset | Visibility | Types | Max | Serve |
| --- | --- | --- | --- | --- |
| Profile photo | PRIVATE | JPEG/PNG/WebP | 2 MB | `/admin/media/[id]` |
| Website / partner logo | PUBLIC | JPEG/PNG/WebP | 2 MB | `/media/[id]` |
| Blog featured / service images | PUBLIC | JPEG/PNG/WebP | 2 MB | `/media/[id]` |
| Blog PDF attachment | PRIVATE | PDF | 10 MB | `/admin/media/[id]` + `MANAGE_BLOGS` |

Shared rules: magic-byte + extension match, UUID storage keys, path confinement under `STORAGE_ROOT/{public\|private}`, SVG/executables rejected, orphan DB cleanup via `deleteMediaIfOrphan`. No disk orphan sweeper cron yet (Low).

Smoke: fake public media ID → 404; unauthenticated private media → redirect to login (307).

## Public contact form

- Server validation, honeypot (`website`), email limit 3/hour, IP limit 8/hour (when trusted IP available).
- Creates status `NEW` only; client status ignored.
- Verified with isolated record then deleted.

## Open findings (not blocking deploy if ops controls applied)

| ID | Severity | Finding | Mitigation |
| --- | --- | --- | --- |
| M4 | Medium | Server Actions `bodySizeLimit` 12 MB | Keep type validators; optional lower limit later |
| L1 | Low | No disk orphan sweeper | Periodic reconcile recommended |
| L2 | Low | Session create not fully transactional | Acceptable; harden later |
| L3 | Low | PDF header-only validation | Private + attachment disposition |
| I1 | Info | Security headers at Nginx | Documented in deployment guide |
| Dep | High (CLI) | Prisma CLI advisories via `@prisma/config` | See dependency section — runtime client not the CLI path |

## Dependency advisories (`npm audit`)

4 high findings, all under `prisma` → `@prisma/config` → `deepmerge-ts` / `effect`. Fix available only via **Prisma 7 major** (`npm audit fix --force`). Project stays on Prisma **6.19.3** intentionally.

**Exposure:** advisories affect Prisma CLI config tooling, not the production Next.js request path that uses `@prisma/client`. Do not force-upgrade during Phase 12. Plan a controlled Prisma 7 migration later.

## CSRF / XSS / SQLi

- Mutations via Server Actions + SameSite cookies.
- TipTap sanitized on write; React tree render (no `dangerouslySetInnerHTML`).
- Prisma parameterized queries; Super Admin lock uses static `$queryRaw`.
