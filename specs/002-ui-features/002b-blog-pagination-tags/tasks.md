# Tasks: Blog Pagination and Tag Filtering

**Input**: [`./plan.md`](./plan.md)
**Branch**: `002b-blog-pagination-tags`

## Phase 1: Setup

- [ ] T001 Create branch `002b-blog-pagination-tags` from main (after 002a merged)
- [ ] T002 Update `src/content/config.ts` to add tag regex validation

## Phase 2: Schema Migration

- [ ] T003 Run `pnpm build` to check existing blog posts pass new schema
- [ ] T004 Fix any posts that fail (migrate to kebab-case tags)
- [ ] T005 [P] Add new i18n keys to `src/i18n/ui.ts`:
  - `blog.filter.all` = "Todos" / "All"
  - `blog.filter.tag_aria` = "Filtrar por tag {tag}" / "Filter by tag {tag}"
  - `blog.showing` = "Mostrando {count} de {total} posts" / "Showing {count} of {total} posts"
  - `blog.showing_tag` = "Mostrando {count} de {total} posts con tag #{tag}" / "Showing {count} of {total} posts tagged #{tag}"
  - `blog.empty` = "No hay posts en este tag" / "No posts in this tag"
  - `blog.pagination.prev` = "Anterior" / "Previous"
  - `blog.pagination.next` = "Siguiente" / "Next"

## Phase 3: Helper Function

- [ ] T006 Create `src/lib/blog.ts` with `getFilteredPosts` function
- [ ] T007 [P] Write unit tests in `tests/unit/blog.test.ts`:
  - Returns empty array for unknown lang
  - Filters by tag correctly
  - Paginates correctly (page 1, 2, last)
  - Returns correct totalPosts and totalPages
  - All tags are unique and sorted
  - Edge cases: page > totalPages, page < 1, no posts, no tags

## Phase 4: Components

- [ ] T008 [P] Create `src/components/TagPills.astro`:
  - Receives `tags`, `activeTag`, `lang`
  - Renders "All" pill + tag pills
  - Active tag has `aria-current="page"`
  - Each tag is a link to `?tag=NAME`
- [ ] T009 [P] Create `src/components/BlogPagination.astro`:
  - Receives `currentPage`, `totalPages`, `activeTag`
  - Renders Previous/Next + page numbers
  - Truncates with "..." when > 5 pages
  - Disables Prev on page 1, Next on last page
  - Uses real `<a>` tags, not buttons
- [ ] T010 Update `src/components/PageBlog.astro` to use new helpers and components
- [ ] T011 Update `src/pages/[lang]/blog.astro` to read query params

## Phase 5: Seed Content

- [ ] T012 Create `src/content/blog/en/k8s-argocd-basics.md`
- [ ] T013 Create `src/content/blog/en/terraform-intro.md`
- [ ] T014 Create `src/content/blog/en/cloudflare-edge.md`
- [ ] T015 Create `src/content/blog/es/k8s-argocd-basicos.md`
- [ ] T016 Create `src/content/blog/es/terraform-intro.md`
- [ ] T017 Create `src/content/blog/es/cloudflare-edge.md`
- [ ] T018 Verify all posts pass Zod validation: `pnpm build` succeeds

## Phase 6: SEO

- [ ] T019 Add `noindex,follow` meta on page 2+ (in `PageBlog.astro` or `Layout.astro`)
- [ ] T020 Verify sitemap does not include `?page=2+` URLs (check `@astrojs/sitemap` config)

## Phase 7: Tests

- [ ] T021 [P] Write E2E test in `tests/e2e/blog-pagination.spec.ts`:
  - Click tag pill → only posts with that tag shown
  - Click "All" → all posts shown
  - Click "Next" → page 2 loads with correct posts
  - Direct URL to `?page=2` works
  - Direct URL to invalid `?page=99` falls back to last page
  - Direct URL to `?tag=NAME` works
  - Pagination not shown when posts <= perPage
  - Tag pill for active tag is highlighted
  - Empty state shown when tag has no posts

## Phase 8: Verification & PR

- [ ] T022 Run `pnpm lint` — zero errors
- [ ] T023 Run `pnpm typecheck` — zero errors
- [ ] T024 Run `pnpm test:unit` — all pass
- [ ] T025 Run `pnpm test:e2e` — all pass
- [ ] T026 Run `pnpm build` — successful
- [ ] T027 Manual: filter, paginate, navigate, back button works
- [ ] T028 Create PR `002b-blog-pagination-tags` → main

## Total: 28 tasks
