# Tasks: SEO Fundamentals

**Input**: Design documents from `/specs/003-seo-fundamentals/`
**Prerequisites**: plan.md, spec.md, research.md

**Tests**: Unit tests in `src/lib/seo.test.ts`, E2E in `tests/e2e/seo.spec.ts`
**Organization**: Tasks grouped by user story for independent delivery.

## Format

`[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (no dependencies)
- **[Story]**: US1..US6 — maps to spec user stories

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] **T001** [P] Verify Python 3 + `pip install pillow` available for OG image generation
- [ ] **T002** [P] Create `public/og/` and `public/og/` subdirs for ES/EN image variants
- [ ] **T003** [P] Create `scripts/` directory at repo root (or confirm exists)

## Phase 2: SEO Helper Module (User Story 5 — JSON-LD foundation)

- [ ] **T004** [US5] Create `src/lib/seo.ts` with: `SITE` constant, `SeoProps` type, `buildSeoProps({...}, {lang, path})` function
- [ ] **T005** [US5] In `seo.ts`, implement hreflang URL swapping helper: `swapLocaleUrl(pathname, targetLang)` — handles `/es/foo` ↔ `/en/foo`
- [ ] **T006** [US5] In `seo.ts`, implement `buildJsonLd(props, ctx)` returning combined `@graph` with Person + WebSite (+ optional Article / BreadcrumbList)
- [ ] **T007** [US5] Add JSDoc to all exported symbols in `seo.ts`

## Phase 3: Unit Tests for SEO Module

- [ ] **T008** [US1] Create `src/lib/seo.test.ts` — test `buildSeoProps` returns correct OG/Twitter fields for ES home
- [ ] **T009** [US1] Test EN variant returns `og:locale=es_MX` for English page (`en_US`)
- [ ] **T010** [US1] Test `swapLocaleUrl` correctly swaps `/es/blog/` ↔ `/en/blog/` and root `/` ↔ `/es/` or `/en/`
- [ ] **T011** [US5] Test `buildJsonLd` produces valid JSON with required Person fields (name, jobTitle, url, knowsAbout, sameAs)
- [ ] **T012** [US1] Test missing image param falls back to `/og/default.png`

Run: `npm run test:unit`. Expect ≥12 tests green.

## Phase 4: Layout Integration (US1, US2, US5, US6)

- [ ] **T013** [US1] Update `src/layouts/Layout.astro` Props interface — add `seo?: PrebuiltSeo` prop carrying computed OG/Twitter/hreflang/JSON-LD
- [ ] **T014** [US1] Inject `<meta property="og:*">` and `<meta name="twitter:*">` in `<head>` from `seo` prop
- [ ] **T015** [US2] Inject `<link rel="alternate" hreflang="...">` for each locale + x-default (skip if 404)
- [ ] **T016** [US5] Inject `<script type="application/ld+json">` with `@graph` from `buildJsonLd`
- [ ] **T017** [US6] Fix `<meta name="viewport" content="width=device-width, initial-scale=1">`

## Phase 5: Page Wiring (each page = `<Layout seo={buildSeoProps({...})}>`)

- [ ] **T018** [P] [US4] Update `src/pages/[lang]/index.astro` — call `buildSeoProps` with unique description per lang
- [ ] **T019** [P] [US4] Update `src/pages/[lang]/about.astro` — unique description per lang
- [ ] **T020** [P] [US4] Update `src/pages/[lang]/blog.astro` — unique description, JSON-LD `WebPage` or skip
- [ ] **T021** [P] [US4] Update `src/pages/[lang]/projects.astro` — unique description, BlogPosting type
- [ ] **T022** [P] [US4] Update `src/pages/[lang]/contact.astro` — unique description, ContactPage type
- [ ] **T023** [P] [US4] Update `src/pages/[lang]/projects/k8s-management.astro` — unique description
- [ ] **T024** [P] [US4] Update `src/pages/[lang]/resume.astro` — unique description

## Phase 6: H1 Audit & Fix (User Story 3)

- [ ] **T025** [US3] Inspect Hero component — confirm no H1 exists; add `<h1 class="hero-title">` with semantic text matching page title
- [ ] **T026** [US3] Update `src/pages/[lang]/blog.astro` — add `<h1>` "Blog" / "Blog"
- [ ] **T027** [US3] Update `src/pages/[lang]/projects.astro` — add `<h1>` "Proyectos" / "Projects"
- [ ] **T028** [US3] Update `src/pages/[lang]/contact.astro` — add `<h1>` "Contacto" / "Contact"

## Phase 7: OG Image Generation (one-off)

- [ ] **T029** [US1] Create `scripts/gen-og-images.py` — uses Pillow to render 4 PNGs (1200×630) matching site theme
- [ ] **T030** [US1] Render `home-es.png`, `home-en.png`, `default.png` into `public/og/`
- [ ] **T031** [US1] Render `avatar.jpg` (400×400) into `public/og/` for JSON-LD photo
- [ ] **T032** [US1] Verify each PNG < 500KB (Twitter limit: 5MB; smaller is faster load)

## Phase 8: External Link Safety

- [ ] **T033** [US6] In `src/components/Navbar.astro`, find external GitHub link; add `rel="noopener noreferrer"`

## Phase 9: E2E Tests & Lighthouse

- [ ] **T034** [US1] Create `tests/e2e/seo.spec.ts` — visit `/es/` and assert og:title, og:description, og:image, twitter:card exist
- [ ] **T035** [US2] Same test asserts 3 hreflang tags present (es, en, x-default)
- [ ] **T036** [US3] Same test asserts exactly 1 h1 in DOM
- [ ] **T037** [US5] Same test parses JSON-LD `<script>` and validates Person schema fields
- [ ] **T038** [US1] Add test for `/en/projects/k8s-management` to validate deep path also has full meta
- [ ] **T039** [US1] Run `npm run test:e2e` — expect all SEO tests green

## Phase 10: Manual Validation & Cleanup

- [ ] **T040** [US1] Visit `/es/` in browser DevTools → verify OG tags render correctly
- [ ] **T041** [US1] Submit `https://daryl.sh/es/` to https://www.opengraph.xyz/ — verify preview
- [ ] **T042** [US5] Submit to https://validator.schema.org/ — 0 errors
- [ ] **T043** [US3] Run Lighthouse on `/es/` mobile + desktop — SEO = 100
- [ ] **T044** [US6] Run Lighthouse "best practices" — 0 external-link warnings

## Phase 11: Commit, PR, ChromaDB Index

- [ ] **T045** Stage + commit (single commit: `feat(seo): add og, twitter, hreflang, json-ld, h1, unique descriptions, viewport, noopener`)
- [ ] **T046** Push branch to origin
- [ ] **T047** Open PR via `gh pr create`
- [ ] **T048** Add spec summary doc to chromadb collection `003-seo-fundamentals`

## Dependency Graph

```
Phase 1 ─┬─> Phase 4 ─┬─> Phase 5
         │            ├─> Phase 6
         │            └─> Phase 8
         ├─> Phase 2 ──> Phase 3 ─┐
         ├─> Phase 7 (independent)  ├─> Phase 9 ─> Phase 10 ─> Phase 11
         └─> ...                   ┘
```

Independent: Phase 7 (OG image generation). Can run in parallel with code work.

## Acceptance Criteria (full spec coverage)

- [ ] All 9 pages: og:title, og:description, og:image, og:url, og:locale, og:type — present
- [ ] All 9 pages: twitter:card, twitter:title, twitter:description, twitter:image — present
- [ ] All 9 non-404 pages: 3 hreflang alternate links
- [ ] All 9 pages: exactly 1 h1
- [ ] All 9 pages: unique meta description, 120-160 chars
- [ ] All 9 pages: JSON-LD valid (Person + WebSite minimum; Article + Breadcrumb on deep paths)
- [ ] All external links: rel="noopener noreferrer"
- [ ] Viewport: `width=device-width, initial-scale=1`
- [ ] Lighthouse SEO = 100 on `/es/`, `/en/`, `/es/projects/k8s-management`
- [ ] Existing tests still pass (40 unit + 51 E2E)
- [ ] No new ESLint warnings beyond existing baseline
