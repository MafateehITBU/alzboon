# QA report — Phase 12

Date: 2026-11-22.

## Automated verification

| Command | Result |
| --- | --- |
| `npm test` | **54 pass / 0 fail** (includes Super Admin concurrency + client-IP tests) |
| `npm run lint` | Pass |
| `npm run build` | Pass |
| `npx prisma validate` | Pass |
| `npm audit` | 4 high (Prisma CLI transitive); no force fix applied |

## Super Admin failures — resolution

| Test | Prior failure | Resolution |
| --- | --- | --- |
| `account changes recheck the actor and protect the last active Super Admin` | Missing expected rejection when another real Super Admin existed | Isolate with `withOnlyActiveSuperAdmins`; keep FORBIDDEN behavior |
| `permission changes revoke sessions and last Super Admin stays protected` | Same | Same + demote self assertion |
| New: `concurrent demotions cannot remove the last active Super Admin` | — | Added; requires `FOR UPDATE` |

## Functional QA — admin modules

Exercised via automated tests plus code-path review. Browser login UI was not fully walked with a live operator session in this pass; module CRUD/permission coverage remains in `tests/*.test.js`.

| Module | CRUD / validation / permissions | Notes |
| --- | --- | --- |
| Dashboard | Covered (nav + counts) | Permission-filtered cards |
| Admins | Covered | Last-SA, sessions, photos |
| Website settings | Covered | Unsaved-change UX in UI |
| Partners | Covered | Public logos |
| Blog categories | Covered | Slug + delete guard |
| Blogs | Covered | Sanitization, publish rules |
| Services | Covered | Availability, images |
| Contact enquiries | Covered | Status transitions |
| Account | Covered | Self-service; no privilege change |

## Functional QA — public routes

Production server smoke on `http://127.0.0.1:3460` (build served with `next start`):

| Route | HTTP |
| --- | --- |
| `/`, `/ar` | 200 |
| `/about`, `/services`, `/blogs`, `/contact`, `/privacy-policy` | 200 |
| `/ar/contact` | 200 |
| `/sitemap.xml`, `/robots.txt` | 200 |
| `/admin/login` | 200 |
| `/media/{invalid-uuid}` | 404 |
| `/admin/media/{uuid}` unauthenticated | 307 → login |

| Rule | Result |
| --- | --- |
| Hidden / future blogs public | Excluded by `publishedBlogWhere` (tests) |
| Unavailable services public | Excluded (tests) |
| Contact → `NEW` | Verified; isolated row deleted |
| Private attachments public | Not in public serializers; admin-only route |

## SEO / localization smoke

- `robots.txt` disallows `/admin`, `/admin/`, `/api/`; points to sitemap.
- Sitemap lists EN/AR static paths; services/blogs only when available/published.
- Canonical base uses `APP_URL` (must be set to the real production origin before go-live; local `.env` still used `http://localhost:3000` during smoke).
- `DocumentLocale` syncs `html` `lang`/`dir` for Arabic routes after hydration.

## Accessibility (code review)

| Severity | Finding |
| --- | --- |
| High | Arabic homepage still keeps English hardcode in Hero / Approach / Expertise / Testimonials |
| High | CMS images often use empty `alt` |
| Medium | No skip link; “View Our Profile” is non-functional |
| Medium | Footer newsletter label English on AR |
| Low | Contrast of muted footer text on navy may be borderline |

Keyboard: header links expose `focus-visible` outlines; contact fields use labels.

## Performance (code / build review)

- Server Components for most public pages; client limited to Header, Footer, ContactForm, DocumentLocale.
- On-demand `revalidatePublicContent` after CMS mutations.
- Native `<img>` (intentional vs `next/image` crop conflict); no lazy-loading on below-fold CMS images.
- Self-hosted fonts with `display: swap`.
- No structured data / default OG image yet (recommended improvement).

## Figma visual regression

See `docs/QA_REPORT.md` section below and classification in the Phase 12 completion report. Live Figma MCP screenshot was **rate-limited** on the Starter plan during this pass; comparison used the approved frame metadata (1440×4529, node `2426:1649`), prior documented deltas, and current component code.

### Breakpoint review (code + known deltas)

| Width | Assessment |
| --- | --- |
| 1440px | Layout matches approved frame structure; filled buttons corrected to 48px |
| 1280px | Uses `max-[1439px]` grid adaptations — intentional |
| 820px | Tablet/mobile breakpoints at 1023/767 |
| 390px | Mobile stacks hero image + navy copy block |

### Differences

| Item | Severity | Action |
| --- | --- | --- |
| Filled buttons were 52px vs Figma 48px | Medium | **Fixed** — `h-[48px]` |
| Hero “video” is still + controls | Low / known | No change (approved behavior) |
| Dead “View Our Profile” / Book Consultation destinations | Medium / known | Not invented; leave until content pages exist |
| CMS-driven practice cards may replace Figma trio | Info | Intentional when services exist |
| Pixel-perfect Figma PNG compare this pass | — | Deferred — MCP rate limit |

## Remaining production blockers

See completion report: Abu Dhabi Pro webfont license; production env/HTTPS/Nginx; map provider undecided (non-blocker if coords-only).
