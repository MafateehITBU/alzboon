# Agent instructions

Read this file, then `docs/PROJECT_MEMORY.md` and `docs/IMPLEMENTATION_PLAN.md`, before any implementation. Read the other documents in `docs/` when the task touches architecture, data, routes, permissions, design, deployment, or security.

## Current state

Phase 12 is implemented. The platform has completed final QA, security hardening for Super Admin concurrency and rate-limit trust, production deployment documentation, and backup guidance. Do not deploy to the production VPS or start a new development phase unless the user explicitly approves it in the current request.

## Confirmed platform

- Next.js App Router, JavaScript, React, Tailwind CSS 4.
- PostgreSQL and Prisma.
- Self-managed Linux VPS.
- Media on the VPS filesystem, outside the release directory.
- English display type uses Playfair Display via `next/font` (self-hosted at build; `font-abu` utility). Arabic public UI uses GE Dinar Two.
- Plus Jakarta Sans, Roboto, and DM Sans are self-hosted. Do not load them from Google Fonts at runtime.

## Implementation rules

- Preserve the existing homepage appearance, content, assets, and behavior while migrating it.
- Use Tailwind utilities for component and page styling. A component stylesheet is deleted only after that section has been migrated and checked.
- Keep a minimal global stylesheet for the Tailwind import, font faces, resets, and base HTML styles.
- Use server components by default. Add a client component only for required interactivity.
- Keep database access, sessions, permissions, and storage operations on the server.
- The Next.js proxy may redirect unauthenticated admin visitors. Every protected page, server action, route handler, and database mutation must check the session and permission again.
- Do not expose private uploads through public URLs.
- Do not store upload bytes in ordinary database columns.
- Do not trust a client-supplied storage path, role, or permission.
- Do not hardcode passwords, tokens, or connection strings.
- Do not present mock authentication or temporary in-memory storage as a working backend.
- Do not delete `shared/uploads` during build, deploy, or rollback.
- Update the relevant document in `docs/` when a feature, schema, route, permission, architecture, or deployment decision changes.
- Record a feature as complete only after it is implemented and its required validation has passed.
