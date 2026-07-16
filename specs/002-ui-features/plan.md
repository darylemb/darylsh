# Implementation Plan: UI Features Bundle

**Branch**: `002-ui-features` | **Date**: 2026-07-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-ui-features/spec.md`

## Summary

Implement four independent UI improvements to daryl.sh portfolio:
1. **002a**: Dark/light mode toggle with system preference fallback and persistence
2. **002b**: Blog pagination and tag filtering
3. **002c**: Projects showcase with real content (Content Collection + dynamic routes)
4. **002d**: Contact form with real backend (Resend or alternative)

Each sub-feature ships in its own PR with its own tests. The umbrella `002-ui-features` branch aggregates them; recommended merge order is `002a → 002b → 002c → 002d`.

## Technical Context

**Language/Version**: TypeScript 5.7+, Node.js 20+

**Primary Dependencies** (new):
- None for 002a (uses CSS variables + localStorage only)
- None for 002b (uses Astro's `getStaticPaths` + URL params)
- None for 002c (uses Astro Content Collections)
- `resend` npm package for 002d (4.0.0+)

**Primary Dependencies** (existing, unchanged): Astro 5.16.15+, Vitest 4.1.7, Playwright 1.60.0, ESLint 10.4.0

**Storage**: N/A (static site); Cloudflare KV may be added for 002d rate limiting

**Testing**: Vitest (unit/integration), Playwright (E2E)

**Target Platform**: Cloudflare Pages (Node.js 20 build environment)

**Project Type**: Static website / Astro portfolio with API routes for 002d

**Performance Goals**: Build < 5 minutes, total page weight < 300KB, Lighthouse ≥ 95

**Constraints**:
- 20-minute build timeout on Cloudflare Pages
- `CI=true` environment variable injected in Cloudflare Pages
- Astro API routes (for 002d) require Pages Functions runtime
- No new env vars at build time (env vars are runtime for 002d)

**Scale/Scope**: 8 pages (ES/EN for 4 routes) + 6 new project pages + 1 API route + 4 new spec docs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution is a template with no defined principles yet (per spec 001). All work proceeds with best practices for Astro + Cloudflare Pages. The first PR (`002a`) can include a PR to ratify a real constitution (out of scope here, but noted).

**Status**: ✅ PASS - No violations

## Project Structure

### Documentation (this feature)

```text
specs/002-ui-features/
├── spec.md                                # Umbrella spec (created)
├── plan.md                                # This file
├── research.md                            # Phase 0 output
├── contracts/                             # Phase 1 output
│   └── ...
├── 002a-dark-mode-toggle/
│   ├── spec.md                            # ✅ Created
│   ├── plan.md
│   ├── research.md
│   └── tasks.md
├── 002b-blog-pagination-tags/
│   ├── spec.md                            # ✅ Created
│   ├── plan.md
│   ├── research.md
│   └── tasks.md
├── 002c-projects-showcase-real-content/
│   ├── spec.md                            # ✅ Created
│   ├── plan.md
│   ├── research.md
│   └── tasks.md
└── 002d-contact-form-backend/
    ├── spec.md                            # ✅ Created
    ├── plan.md
    ├── research.md
    └── tasks.md
```

### Source Code (repository root, changes only)

```text
/
├── src/
│   ├── components/
│   │   ├── Navbar.astro           # MODIFIED (002a): add theme toggle
│   │   ├── ContactForm.astro      # MODIFIED (002d): real submission
│   │   ├── Projects.astro         # MODIFIED (002c): read from Content Collection
│   │   ├── PageBlog.astro         # MODIFIED (002b): add tag filter + pagination
│   │   ├── ThemeToggle.astro      # NEW (002a): the toggle button
│   │   ├── BlogPagination.astro   # NEW (002b): pagination controls
│   │   └── TagPills.astro         # NEW (002b): tag filter pills
│   ├── content/
│   │   ├── config.ts              # MODIFIED (002b, 002c): add schemas
│   │   └── projects/              # NEW (002c): 3 project markdown files
│   ├── layouts/
│   │   └── Layout.astro           # MODIFIED (002a): anti-FOUC script
│   ├── lib/
│   │   ├── blog.ts                # NEW (002b): getFilteredPosts helper
│   │   ├── projects.ts            # NEW (002c): getProjects helper
│   │   └── theme.ts               # NEW (002a): theme detection logic
│   ├── pages/
│   │   ├── [lang]/
│   │   │   ├── blog.astro         # MODIFIED (002b): pagination URL param
│   │   │   └── projects/
│   │   │       ├── index.astro    # NEW (002c): projects index (if separate page)
│   │   │       └── [slug].astro   # NEW (002c): project detail
│   │   └── api/
│   │       └── contact.ts         # NEW (002d): backend endpoint
│   └── styles/
│       └── theme.css              # NEW (002a): CSS variable definitions
├── tests/
│   ├── unit/
│   │   ├── blog.test.ts           # NEW (002b)
│   │   ├── projects.test.ts       # NEW (002c)
│   │   └── theme.test.ts          # NEW (002a)
│   └── e2e/
│       ├── dark-mode.spec.ts      # NEW (002a)
│       ├── blog-pagination.spec.ts# NEW (002b)
│       └── projects.spec.ts       # NEW (002c)
├── .env.example                   # NEW (002d): document env vars
├── README.md                      # MODIFIED (002d): document setup
└── package.json                   # MODIFIED (002d): add resend
```

## Architecture Decisions

### Decision 1: CSS variables strategy (002a)

**Choice**: Define light variables in `:root[data-theme="light"]`, keep dark as the default `:root`. Apply via inline script in `<head>` for anti-FOUC.

**Rationale**: Simplest implementation, no JS library, no flash, works with Astro's static rendering. The `data-theme` attribute is on `<html>` so it persists across Astro View Transitions (if enabled later).

**Alternatives considered**:
- `prefers-color-scheme` media query only — no override, doesn't satisfy the toggle requirement
- CSS-in-JS theme provider — overkill, adds bundle size
- Class-based (`.dark` / `.light`) — equivalent to data-attribute, less semantic

### Decision 2: Blog pagination strategy (002b)

**Choice**: Static pages with `?page=N` query param. Use `Astro.url.searchParams` to read the page number. No client-side fetch, fully static.

**Rationale**: All blog pages are pre-rendered at build time. `?page=N` is a query param that doesn't create new routes, so no need for `getStaticPaths` complexity. Works without JS (real `<a>` links).

**Alternatives considered**:
- Path-based pagination (`/blog/2`) — better SEO but more complex
- Client-side fetch — requires JS, breaks without JS, slower perceived

### Decision 3: Project data source (002c)

**Choice**: Astro Content Collection with markdown files in `src/content/projects/`.

**Rationale**: Reuses existing `blog` collection pattern, type-safe via Zod, content lives in git, easy to add/edit, no CMS needed. Markdown body allows rich content (links, lists, code blocks).

**Alternatives considered**:
- JSON/YAML data file — less expressive, no markdown body
- TypeScript constants file — requires rebuild for content changes
- Headless CMS (Sanity, Contentful) — overkill, adds dependency

### Decision 4: Contact form provider (002d)

**Choice**: Resend (proposed). Final choice pending Daryl's confirmation.

**Rationale**: Best DX for TypeScript, generous free tier (3K/mo, 100/day), React Email templates available if needed later, simple API.

**Alternatives**:
- Cloudflare Email Workers: more setup, no third-party, but requires email routing config
- Formspree: zero setup, but limited customization, free tier only 50/mo

### Decision 5: Rate limiting storage (002d)

**Choice**: Cloudflare KV (if available) or in-memory Map (fallback for dev).

**Rationale**: Cloudflare KV is distributed and free (100K reads/day). Falls back to in-memory for local dev and when KV binding not configured.

**Alternatives**:
- Upstash Redis: external dependency
- Cloudflare Durable Objects: more complex than needed
- No rate limit: spam risk

## Complexity Tracking

| Sub-feature | Complexity | Justification |
|---|---|---|
| 002a Dark mode | **Low** | CSS variables + ~50 lines of JS. Already have `:root` variables, just need light variant. |
| 002b Blog | **Medium** | New helper function, query param parsing, new components. Schema validation adds robustness. |
| 002c Projects | **Medium** | New Content Collection, dynamic route, 3 seed projects × 2 langs. Reuses existing patterns. |
| 002d Contact | **Medium-High** | New API route, third-party service, secrets management, rate limiting, security. Highest risk. |

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Theme flash on first load | Bad UX | Inline anti-FOUC script in `<head>` |
| Blog Zod validation breaks existing posts | Build fails | Migrate any existing posts to new schema first |
| Project placeholder pages still indexed by Google | Bad SEO | Add `noindex` to construction page until 002c ships |
| Contact form spam | Inbox flooded | Honeypot + rate limit + timing check (no ReCaptcha for now) |
| Resend API key leaked | Email abuse | Document `RESEND_API_KEY` in `.env.example`, never commit |
| Build time increases significantly | Slow CI | Verify each sub-feature in isolation before adding to umbrella |

## Merge Strategy

Each sub-feature ships as its own PR:

1. **PR for 002a**: Branch `002a-dark-mode-toggle` → main
2. **PR for 002b**: Branch `002b-blog-pagination-tags` → main (after 002a merged)
3. **PR for 002c**: Branch `002c-projects-showcase-real-content` → main (after 002b merged)
4. **PR for 002d**: Branch `002d-contact-form-backend` → main (after 002c merged, requires Daryl's provider choice)

The umbrella `002-ui-features` branch aggregates all four for documentation purposes; do NOT merge it directly.

## Verification Plan (per sub-feature)

Each PR must pass:
- `pnpm lint` — zero errors
- `pnpm typecheck` — zero errors
- `pnpm test:unit` — all tests pass
- `pnpm test:e2e` — all E2E tests pass
- `pnpm build` — successful build
- Manual smoke test in browser

## Out of Scope (umbrella)

- Search functionality
- Analytics
- RSS feeds
- Comments / reactions
- i18n improvements beyond ES/EN
