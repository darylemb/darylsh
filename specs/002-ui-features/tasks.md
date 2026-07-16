# Tasks: UI Features Bundle

**Input**: Design documents from `/specs/002-ui-features/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, per-subfeature plan.md and tasks.md (to be created during Phase 2)

**Tests**: Test tasks are INCLUDED for each sub-feature

**Organization**: Tasks are grouped by sub-feature. Each sub-feature is independently shippable as its own PR.

## Format: `[ID] [P?] [Sub] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Sub]**: Which sub-feature (002a, 002b, 002c, 002d)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Branch creation and umbrella coordination

- [ ] T001 Create umbrella branch `002-ui-features` from main
- [ ] T002 Create 4 sub-feature branches: `002a-dark-mode-toggle`, `002b-blog-pagination-tags`, `002c-projects-showcase-real-content`, `002d-contact-form-backend`

**Checkpoint**: All 4 branches exist, ready for parallel work

---

## Phase 2: Sub-feature 002a — Dark Mode Toggle (P1) 🎯 MVP

**Branch**: `002a-dark-mode-toggle`
**Goal**: Add light/dark theme toggle with persistence and system preference fallback
**Independent Test**: Click toggle, refresh, verify state persists; verify OS preference detected on first visit

**Detailed tasks**: See [`002a-dark-mode-toggle/tasks.md`](./002a-dark-mode-toggle/tasks.md)

- [ ] T003 [P] [002a] Define light theme CSS variables in `src/styles/theme.css`
- [ ] T004 [002a] Add anti-FOUC inline script in `src/layouts/Layout.astro`
- [ ] T005 [002a] Create `src/components/ThemeToggle.astro` component
- [ ] T006 [002a] Integrate ThemeToggle in `src/components/Navbar.astro`
- [ ] T007 [P] [002a] Create `src/lib/theme.ts` with `getTheme()`, `setTheme()`, `toggleTheme()`
- [ ] T008 [002a] Write unit tests in `tests/unit/theme.test.ts`
- [ ] T009 [002a] Write E2E tests in `tests/e2e/dark-mode.spec.ts`
- [ ] T010 [002a] Update `tests/e2e/navigation.spec.ts` (if exists) to test theme persistence across pages
- [ ] T011 [002a] Manual verification: click toggle, refresh, navigate, verify in 3+ pages
- [ ] T012 [002a] PR: branch → main with full description and screenshots

---

## Phase 3: Sub-feature 002b — Blog Pagination & Tags (P2)

**Branch**: `002b-blog-pagination-tags`
**Goal**: Add tag filtering and pagination to blog index
**Independent Test**: Seed 5+ posts, filter by tag, paginate

**Detailed tasks**: See [`002b-blog-pagination-tags/tasks.md`](./002b-blog-pagination-tags/tasks.md)

- [ ] T013 [002b] Update `src/content/config.ts` to add tags validation (`z.array(z.string().regex(/^[a-z0-9-]+$/))`)
- [ ] T014 [002b] Validate existing blog posts (if any) pass new schema; fix or migrate
- [ ] T015 [002b] Create `src/lib/blog.ts` with `getFilteredPosts({ tag, page, perPage, lang })`
- [ ] T016 [002b] Write unit tests in `tests/unit/blog.test.ts` covering all filter/page combinations
- [ ] T017 [002b] Update `src/components/PageBlog.astro` to use `getFilteredPosts` and support `?tag=` and `?page=`
- [ ] T018 [002b] Create `src/components/TagPills.astro` component
- [ ] T019 [002b] Create `src/components/BlogPagination.astro` component
- [ ] T020 [002b] Update `src/pages/[lang]/blog.astro` to read query params
- [ ] T021 [002b] Write E2E test in `tests/e2e/blog-pagination.spec.ts`
- [ ] T022 [002b] Seed 5+ blog posts in `src/content/blog/` (3 EN, 3 ES, 3+ unique tags)
- [ ] T023 [002b] Add `noindex,follow` meta on page 2+ of pagination
- [ ] T024 [002b] Manual verification: filter, paginate, navigate, verify back button
- [ ] T025 [002b] PR: branch → main

---

## Phase 4: Sub-feature 002c — Projects Showcase Real Content (P1) 🎯 MVP

**Branch**: `002c-projects-showcase-real-content`
**Goal**: Replace 2/3 project placeholders with real project pages
**Independent Test**: Click each project card, verify real content (not construction page)

**Detailed tasks**: See [`002c-projects-showcase-real-content/tasks.md`](./002c-projects-showcase-real-content/tasks.md)

- [ ] T026 [002c] Update `src/content/config.ts` to add `projects` collection schema
- [ ] T027 [002c] Refactor `src/components/Projects.astro` to read from Content Collection (filter by `featured === true` and `lang`)
- [ ] T028 [002c] Create `src/lib/projects.ts` with `getProjects({ lang, featured })` helper
- [ ] T029 [002c] Create `src/pages/[lang]/projects/[slug].astro` with `getStaticPaths`
- [ ] T030 [002c] Implement project detail page layout (hero, problem, solution, outcomes, stack, links, next project nav)
- [ ] T031 [002c] Add "Next project" navigation (wraps to first)
- [ ] T032 [002c] Write unit tests in `tests/unit/projects.test.ts`
- [ ] T033 [002c] Write E2E test in `tests/e2e/projects.spec.ts` (click each card, verify detail page loads)
- [ ] T034 [002c] Seed 3 projects × 2 langs = 6 markdown files in `src/content/projects/`
- [ ] T035 [002c] **BLOCKER**: Daryl to provide project content (or accept agent-generated drafts) — see `002c/spec.md` Open Questions
- [ ] T036 [002c] Update i18n translations for new project page strings (e.g., `projects.problem`, `projects.solution`, `projects.outcomes`)
- [ ] T037 [002c] Add `noindex` to `/[lang]/construction` page (until all cards are real)
- [ ] T038 [002c] Manual verification: click each card, verify all 3 lead to real pages
- [ ] T039 [002c] PR: branch → main

---

## Phase 5: Sub-feature 002d — Contact Form Backend (P2)

**Branch**: `002d-contact-form-backend`
**Goal**: Replace simulated contact form with real backend
**Independent Test**: Submit form, verify Daryl's email arrives

**Detailed tasks**: See [`002d-contact-form-backend/tasks.md`](./002d-contact-form-backend/tasks.md)

- [ ] T040 [P] [002d] **BLOCKER**: Daryl to choose provider (Resend, Cloudflare Email Workers, or Formspree) — see `002d/spec.md` Open Questions
- [ ] T041 [002d] Add provider SDK to `package.json` (e.g., `resend`)
- [ ] T042 [002d] Create `src/pages/api/contact.ts` API route
- [ ] T043 [002d] Implement input validation (Zod or manual): name, email, message, honeypot, timing
- [ ] T044 [002d] Implement rate limiting (Cloudflare KV or in-memory)
- [ ] T045 [002d] Implement email sending via chosen provider
- [ ] T046 [002d] Add error handling and logging
- [ ] T047 [002d] Update `src/components/ContactForm.astro` to use real API endpoint
- [ ] T048 [002d] Remove simulated `setTimeout` and "(Simulated)" text
- [ ] T049 [002d] Add loading state and disable button during submit
- [ ] T050 [002d] Add error message i18n (ES + EN)
- [ ] T051 [002d] Create `.env.example` documenting `RESEND_API_KEY` and `CONTACT_TO`
- [ ] T052 [002d] Update `README.md` with setup instructions
- [ ] T053 [002d] Write E2E test for form submission (with mocked backend)
- [ ] T054 [002d] Write E2E test for honeypot rejection
- [ ] T055 [002d] Write E2E test for rate limit (optional, complex)
- [ ] T056 [002d] Manual end-to-end verification: submit real form, check Daryl's email
- [ ] T057 [002d] Verify secrets not in git history (`git log -p | grep RESEND_API_KEY` should return nothing)
- [ ] T058 [002d] Update privacy page to mention contact form data handling
- [ ] T059 [002d] PR: branch → main (with deployment verification on Cloudflare Pages preview)

---

## Phase 6: Final Verification (all sub-features merged)

- [ ] T060 Verify all 4 PRs are merged
- [ ] T061 Delete umbrella branch `002-ui-features` and sub-feature branches
- [ ] T062 Update README with new features
- [ ] T063 Update `.specify/memory/constitution.md` with principles learned (TDD, code review, etc.)
- [ ] T064 Final Lighthouse audit on production URL
- [ ] T065 Update chromadb with darylsh feature summary (for agent memory)

---

## Dependencies

```
T001 (umbrella branch) ─┬─▶ T002 (sub branches) ─┬─▶ T003-T012 (002a)
                        │                       ├─▶ T013-T025 (002b)
                        │                       ├─▶ T026-T039 (002c)
                        │                       └─▶ T040-T059 (002d) [T040 blocks]
                        └─▶ T060-T065 (final)

Within sub-features:
- 002a can start immediately
- 002b can start immediately (independent of 002a)
- 002c can start immediately but T035 (content) is a blocker
- 002d blocked by T040 (provider choice)

Cross-sub-feature:
- None — each is independent and can be merged in any order
```

## Parallel Execution

Recommended parallel work:
- 002a: one agent
- 002b: one agent (after T013-T014 schema validation)
- 002c: one agent (after T026 schema and T035 content)
- 002d: one agent (after T040 provider choice)

All 4 can theoretically run in parallel; recommended merge order: 002a → 002b → 002c → 002d to minimize risk and keep each PR small.

## Total Task Count

- Phase 1 (Setup): 2 tasks
- Phase 2 (002a): 10 tasks
- Phase 3 (002b): 13 tasks
- Phase 4 (002c): 14 tasks
- Phase 5 (002d): 20 tasks
- Phase 6 (Final): 6 tasks
- **Total**: 65 tasks across 4 sub-features + finalization
