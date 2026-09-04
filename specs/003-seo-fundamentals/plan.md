# Implementation Plan: SEO Fundamentals

**Branch**: `003-seo-fundamentals` | **Date**: 2026-09-04 | **Spec**: [spec.md](./spec.md)

## Summary

Fix critical SEO gaps in daryl.sh portfolio: add Open Graph + Twitter Card meta tags,
hreflang bilingual tags, single H1 per page, per-page unique meta descriptions, JSON-LD
structured data (Person + WebSite + BreadcrumbList), viewport meta fix, and external link
safety. All changes centralized in `Layout.astro` via a new `src/lib/seo.ts` helper
module. No schema changes, no new routes.

## Technical Context

**Language/Version**: TypeScript 5.7+, Astro 5.16.15
**Node.js**: 20+
**Primary Dependencies**: Astro (existing), Vitest 4.1.7 (existing)
**Storage**: N/A (static site)
**Test Tools**: Vitest (unit), Playwright (E2E)
**OG Image Tool**: Python `pillow` + Roboto Mono TTF (one-off generation script)

## Constitution Check (per repo's testing-constitution)

- [x] Code Quality: ESLint must pass (existing config)
- [x] Testing: Unit tests for new module, E2E for meta tags
- [x] UX Consistency: taglines match site voice, OG image matches visual style
- [x] Performance: Static output, no runtime cost from meta tags
- [x] Security: external links get `rel="noopener noreferrer"`
- [x] All pages must be statically rendered (no SSR needed)

## Project Structure

```
src/
  lib/
    seo.ts                 # NEW: seo helper module
    seo.test.ts            # NEW: vitest unit tests
  layouts/
    Layout.astro           # UPDATE: inject OG/Twitter/hreflang/JSON-LD via {seo}
  components/
    Hero.astro             # UPDATE: add H1 to hero
    Navbar.astro           # UPDATE: external link rel="noopener noreferrer"
  pages/
    [lang]/
      blog.astro           # UPDATE: add H1
      projects.astro       # UPDATE: add H1
      contact.astro        # UPDATE: add H1

public/
  og/
    home-es.png            # NEW: 1200×630 OG image, ES
    home-en.png            # NEW: 1200×630 OG image, EN
    default.png            # NEW: 1200×630 OG image, generic fallback
    avatar.jpg             # NEW: 400×400 JSON-LD photo

scripts/
  gen-og-images.py         # NEW: one-off OG image generator

tests/
  e2e/
    seo.spec.ts            # NEW: Playwright E2E for SEO meta tags

specs/003-seo-fundamentals/
  spec.md                  # ✅ created
  research.md              # ✅ created
  plan.md                  # ✅ this file
  tasks.md                 # Phase-by-phase task list (next)
  checklists/requirements.md  # Quality checklist
```

## Phase Overview

| Phase | Goal | Tasks |
|---|---|---|
| 1 | Setup & helpers | T001-T005 |
| 2 | SEO helper module + unit tests | T006-T012 |
| 3 | Layout integration | T013-T017 |
| 4 | H1 fixes (Hero, blog, projects, contact) | T018-T022 |
| 5 | OG image generation | T023-T026 |
| 6 | External link + viewport | T027-T028 |
| 7 | E2E + manual verification | T029-T031 |
| 8 | Commit, PR, chromadb | T032-T033 |

## Success Criteria

- ✅ All 9 pages have `<meta property="og:title">`, `og:description`, `og:image`
- ✅ All 9 pages have `twitter:card`
- ✅ All pages have `<link rel="alternate" hreflang="es|en|x-default">` (except 404)
- ✅ All pages have exactly 1 `<h1>`
- ✅ All meta descriptions are unique, 120-160 chars
- ✅ JSON-LD validates at schema.org validator
- ✅ External links have `rel="noopener noreferrer"`
- ✅ Viewport has `initial-scale=1`
- ✅ Lighthouse SEO = 100 on `/es/`, `/en/`, `/es/projects/k8s-management`
- ✅ All existing tests still pass
