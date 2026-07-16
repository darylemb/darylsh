# Feature Specification: Blog Pagination and Tag Filtering

**Feature Branch**: `002b-blog-pagination-tags`

**Created**: 2026-07-15

**Status**: Draft

**Parent spec**: [../spec.md](../spec.md)

**Input**: User description: "El blog tiene solo 1 post placeholder. Necesita: tag filtering, paginación, y seed de posts reales."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor filters blog by tag (Priority: P2)

As a visitor interested in a specific topic, I want to click a tag and see only posts with that tag so I can find relevant content quickly.

**Independent Test**: Seed at least 5 blog posts across 3 different tags, click a tag pill, verify only matching posts are shown.

**Acceptance Scenarios**:
1. **Given** I am on the blog index, **When** I click a tag pill below a post, **Then** the URL updates to `?tag=kubernetes` and only posts with that tag are shown
2. **Given** I have a tag filter active, **When** I click "All" or the active tag again, **Then** the filter clears and all posts are shown
3. **Given** I am viewing filtered posts, **When** I count the posts, **Then** every visible post has the active tag in its frontmatter
4. **Given** I am on a post detail page, **When** I click a tag at the bottom, **Then** I navigate to the filtered blog index

### User Story 2 - Visitor paginates blog (Priority: P2)

As a visitor, I want to paginate through posts so the page loads quickly even with many posts.

**Independent Test**: Seed at least 7 blog posts (more than the 6-per-page default), navigate to `/es/blog`, verify pagination appears and works.

**Acceptance Scenarios**:
1. **Given** there are more than 6 posts, **When** I load the blog index, **Then** pagination controls appear at the bottom
2. **Given** I am on page 1, **When** I click "Next" or page 2, **Then** the URL updates to `/es/blog?page=2` and posts 7-12 are shown
3. **Given** I am on the last page, **When** I look at the controls, **Then** "Next" is disabled and "Previous" is enabled
4. **Given** I am on page 1, **When** I look at the controls, **Then** "Previous" is disabled and "Next" is enabled
5. **Given** I navigate directly to `?page=99`, **When** the page loads, **Then** I see an empty state with a link back to page 1 (no 404)

### User Story 3 - Visitor sees tag pills on index (Priority: P2)

As a visitor, I want to see all available tags at the top of the blog index so I can discover topics.

**Independent Test**: View the blog index, verify a tag cloud/pills appears above the post grid.

**Acceptance Scenarios**:
1. **Given** I am on the blog index, **When** I view the page, **Then** all unique tags from all posts are displayed as pills
2. **Given** I have a tag filter active, **When** I view the tag pills, **Then** the active tag is visually distinguished (filled vs outlined)
3. **Given** no posts have any tags, **When** I view the page, **Then** no tag pill section is shown (graceful empty state)

## Edge Cases

- **Tag with special characters**: Tags are URL-safe (kebab-case), enforced by Zod schema (`/^[a-z0-9-]+$/`)
- **Empty tag list**: A post with no tags appears in "All" view but not in any tag-filtered view
- **Many tags (10+)**: Tag pills wrap to multiple lines; do not horizontally scroll
- **Last page with < 6 posts**: Pagination still shows but is on the last page
- **Direct URL with `?page=0` or negative**: Treated as page 1
- **Direct URL with `?page=abc`**: Treated as page 1 (graceful fallback)

## Functional Requirements

### FR-1: Tag schema validation
- Update `src/content/config.ts` to require `tags` as `z.array(z.string().regex(/^[a-z0-9-]+$/))` (kebab-case, no spaces)
- Posts without `tags` field are still allowed (`.optional()`)
- Build fails if any existing post has invalid tags (Zod validation)

### FR-2: Tag filtering logic
- Add helper function in `src/lib/blog.ts`: `getFilteredPosts({ tag, page, perPage, lang })`
- Returns `{ posts, totalPages, currentPage, totalPosts, allTags }`
- Filtering is AND-only (post must have the tag), not OR

### FR-3: Pagination URL strategy
- Page number in query string: `?page=N` (1-indexed)
- Tag filter in query string: `?tag=NAME`
- Combined: `?tag=NAME&page=N`
- Tag pill links are full URLs (not just hashes) for shareability
- "Previous"/"Next" links use real `<a>` tags, not buttons (works without JS)

### FR-4: Tag pill UI
- Each tag is a pill (rounded button) with `href="?tag=NAME"`
- Active tag has filled background, inactive has outlined
- "All" pill is shown first to clear the filter
- Tag pills appear above the post grid, below the page header

### FR-5: Pagination controls UI
- Show: « Previous | 1 2 3 ... 10 | Next »
- Current page is highlighted
- "..." appears when there are > 5 pages (truncation logic)
- Disabled state on Previous/Next when at boundaries
- Use semantic HTML (`<nav aria-label="Pagination">`, `<a>` for each link)

### FR-6: Post count indicator
- Show "Showing posts 1-6 of 12" above the post grid (or "Showing all 5 posts" if no filter)

### FR-7: Seed content
- Add 5+ blog posts in `src/content/blog/` covering Daryl's actual topics (K8s, Terraform, GitOps, etc.)
- Each post has realistic frontmatter (title, description, pubDate, lang, tags)
- 3 posts in `en/`, 3 posts in `es/` to test the lang filter still works
- Tag distribution: 3+ unique tags

## Non-Functional Requirements

### NFR-1: Performance
- Build time: < 5 minutes (currently is ~1 minute, comfortable margin)
- Page weight: < 200KB for blog index
- No JS required for pagination to work (uses native `<a>` links)
- Tag filter is server-rendered (no client-side fetch)

### NFR-2: SEO
- Each page has a unique canonical URL (including `?page=N` and `?tag=NAME`)
- `?page=1` and base `/blog` URL should point to the same content (no duplicate)
- `noindex` on page 2+ of pagination (optional, for SEO cleanliness) — propose: yes, set `noindex,follow` on page >= 2
- Sitemap (`@astrojs/sitemap`) should include only the base `/blog` URL, not `?page=N` variants

### NFR-3: Accessibility
- Pagination is keyboard navigable
- Active page has `aria-current="page"`
- Tag pills have descriptive `aria-label` (e.g., "Filter posts by kubernetes tag")
- Empty state has clear messaging

## Out of Scope

- Search functionality
- Tag-based RSS feed
- Reading time estimates (could be added later)
- Related posts
- Comments

## Open Questions

1. **Tag pill style**: filled vs outlined for active state? Daryl to confirm visual direction.
2. **Seed content topics**: Which topics should the 5+ seed posts cover? Proposed: K8s basics, Terraform intro, GitOps with Argo, observability, Cloudflare edge. **Blocks**: seed content writing.
3. **Posts in both languages or one?**: Each post has a `lang` field, so they can be language-specific. Should we translate or write twice? Proposed: write each post in its native language, no auto-translation.

## Success Criteria

- Blog index paginates and filters correctly
- All existing posts (if any) pass the new Zod validation
- 5+ seed posts added across 3+ tags and 2 languages
- Lighthouse score ≥ 95 maintained
- Unit tests for `getFilteredPosts` cover all edge cases
- E2E tests verify tag filter and pagination interactions
