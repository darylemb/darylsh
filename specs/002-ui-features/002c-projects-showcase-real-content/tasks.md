# Tasks: Projects Showcase with Real Content

**Input**: [`./plan.md`](./plan.md)
**Branch**: `002c-projects-showcase-real-content`

## Phase 1: Setup

- [ ] T001 Create branch `002c-projects-showcase-real-content` from main (after 002b merged)
- [ ] T002 [P] **BLOCKER**: Daryl provides project content or accepts agent drafts (T035 blocker)
- [ ] T003 [P] Add new i18n keys to `src/i18n/ui.ts`:
  - `projects.problem` = "Problema" / "Problem"
  - `projects.solution` = "Solución" / "Solution"
  - `projects.outcomes` = "Resultados" / "Outcomes"
  - `projects.stack` = "Stack Técnico" / "Tech Stack"
  - `projects.links` = "Enlaces" / "Links"
  - `projects.view_repo` = "Ver repositorio" / "View repository"
  - `projects.view_demo` = "Ver demo" / "View demo"
  - `projects.view_docs` = "Ver documentación" / "View documentation"
  - `projects.next` = "Siguiente proyecto" / "Next project"
  - `projects.all` = "Ver todos los proyectos" / "View all projects"

## Phase 2: Schema & Helpers

- [ ] T004 Update `src/content/config.ts` to add `projects` collection with full Zod schema
- [ ] T005 Create `src/lib/projects.ts` with:
  - `getProjects({ lang, featured })` — filter by lang and featured
  - `getProject({ lang, slug })` — get single project
- [ ] T006 [P] Write unit tests in `tests/unit/projects.test.ts`:
  - Returns empty for unknown lang
  - Filters by `featured: true` correctly
  - Sorts by `order` ascending
  - Zod validation catches: missing title, invalid URL in links, duplicate slugs

## Phase 3: Components

- [ ] T007 Create `src/components/ProjectCard.astro` (extracted from Projects.astro):
  - Receives project, displays: tech tags, title, description, "View project" link
  - Link to `/[lang]/projects/[slug]`
- [ ] T008 Create `src/components/ProjectDetail.astro`:
  - Hero: title, description, pubDate
  - Sections: problem, solution (via `<slot />`), outcomes (bullet list), stack (icon grid)
  - Links section: repo, demo, docs (each shown if present)
  - "Next project" link at bottom
- [ ] T009 Refactor `src/components/Projects.astro` to:
  - Import `getProjects` from lib
  - Render `<ProjectCard>` for each featured project
  - Remove hardcoded `projects` array

## Phase 4: Routes

- [ ] T010 Create `src/pages/[lang]/projects/[slug].astro` with `getStaticPaths`
- [ ] T011 Implement project detail page (Layout + Navbar + ProjectDetail + Content)
- [ ] T012 Add `noindex` meta to `src/pages/[lang]/construction.astro` (no longer indexed)

## Phase 5: Seed Content

- [ ] T013 Create `src/content/projects/en/cloud-infrastructure.md`
- [ ] T014 Create `src/content/projects/en/k8s-management.md`
- [ ] T015 Create `src/content/projects/en/cicd-pipelines.md`
- [ ] T016 Create `src/content/projects/es/cloud-infrastructure.md`
- [ ] T017 Create `src/content/projects/es/k8s-management.md`
- [ ] T018 Create `src/content/projects/es/cicd-pipelines.md`
- [ ] T019 Verify all projects pass Zod validation: `pnpm build` succeeds

## Phase 6: Tests

- [ ] T020 [P] Write E2E test in `tests/e2e/projects.spec.ts`:
  - Homepage shows 3 project cards
  - Click each card → navigates to correct detail page
  - Detail page shows: title, problem, solution, outcomes, stack, links
  - "Next project" link works and wraps to first
  - "All projects" link returns to homepage
  - ES and EN versions of each project work

## Phase 7: Verification & PR

- [ ] T021 Run `pnpm lint` — zero errors
- [ ] T022 Run `pnpm typecheck` — zero errors
- [ ] T023 Run `pnpm test:unit` — all pass
- [ ] T024 Run `pnpm test:e2e` — all pass
- [ ] T025 Run `pnpm build` — successful
- [ ] T026 Manual: click each card, verify all 3 lead to real pages with full content
- [ ] T027 Take screenshots of each project page
- [ ] T028 Create PR `002c-projects-showcase-real-content` → main

## Total: 28 tasks
