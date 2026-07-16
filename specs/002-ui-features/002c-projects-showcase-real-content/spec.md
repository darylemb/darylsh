# Feature Specification: Projects Showcase with Real Content

**Feature Branch**: `002c-projects-showcase-real-content`

**Created**: 2026-07-15

**Status**: Draft

**Parent spec**: [../spec.md](../spec.md)

**Input**: User description: "2 de 3 cards son placeholders. Necesita proyectos reales con descripción, stack, links a repo o demo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor explores a real project (Priority: P1)

As a recruiter or technical evaluator, I want to click on a project card and see real details about Daryl's work so I can evaluate his actual skills.

**Independent Test**: Click each project card, verify the destination is a real project page with: description, tech stack, problem, solution, outcomes/links.

**Acceptance Scenarios**:
1. **Given** I am on the homepage, **When** I click "Cloud Infrastructure Automation", **Then** I see a real project detail page (not "Under Construction")
2. **Given** I am on a project detail page, **When** I read the content, **Then** I see: title, problem statement, solution overview, tech stack, outcomes/results, and links to repo/demo
3. **Given** I am on a project detail page, **When** I click a tech tag, **Then** I can filter or search for related projects (out of scope for this spec — link can be `#` for now)
4. **Given** I am on a project detail page, **When** I view the URL, **Then** it follows the pattern `/[lang]/projects/[slug]`
5. **Given** I am on the homepage, **When** I view the project cards, **Then** each card shows a brief description, 3+ tech tags, and a "View project" CTA

### User Story 2 - Visitor navigates between projects (Priority: P2)

As a visitor, I want to navigate from one project to the next without going back to the homepage.

**Independent Test**: View project A, click "Next project", land on project B.

**Acceptance Scenarios**:
1. **Given** I am on project A, **When** I click "Next project", **Then** I navigate to the next project in the list (alphabetical or curated order)
2. **Given** I am on the last project, **When** I click "Next project", **Then** I navigate to the first project (or the button is hidden)
3. **Given** I am on any project, **When** I click "All projects", **Then** I return to the homepage projects section

### User Story 3 - Visitor sees projects in their language (Priority: P2)

As a Spanish-speaking visitor, I want to read project descriptions in Spanish.

**Acceptance Scenarios**:
1. **Given** I am on `/es/projects/cloud-infrastructure`, **When** the page loads, **Then** the title, description, and body are in Spanish
2. **Given** I am on `/en/projects/cloud-infrastructure`, **When** the page loads, **Then** the content is in English
3. **Given** a project only has content in one language, **When** I view it in the other language, **Then** I see a "Not available in this language" message and a link to the available version

## Edge Cases

- **Project with missing fields**: Zod validation fails the build with a clear error
- **Project slug collision**: Slugs are unique per language; build fails on collision
- **Broken external link**: Repo or demo link returns 404 → not validated at build time, but the page should show a "Last verified" date and Daryl should be alerted in the spec
- **Long project description**: Page handles long content with proper line height and reading width (max 70ch)

## Functional Requirements

### FR-1: Project data model
- Content Collection: `projects` in `src/content/config.ts`
- Schema:
  ```typescript
  {
    title: string (max 80 chars),
    slug: string (kebab-case, auto-generated from title if not provided),
    description: string (max 200 chars, for card preview),
    problem: string (markdown body, 1-3 paragraphs),
    solution: string (markdown body, 1-3 paragraphs),
    outcomes: array of strings (3-5 bullet points),
    stack: array of strings (3-6 tech names, matching icons in public/tech-logos/),
    links: {
      repo?: url,
      demo?: url,
      docs?: url,
    },
    pubDate: date (when the project was completed),
    featured: boolean (whether to show on homepage),
    lang: 'en' | 'es',
    order: number (1-100, lower = earlier in list),
  }
  ```

### FR-2: Refactor `Projects.astro` component
- Replace hardcoded `projects` array with data from Content Collection
- Use `getCollection("projects")` and filter by `lang` and `featured === true`
- Sort by `order` field
- Each card is a link to the project detail page (`/[lang]/projects/[slug]`)
- Tech tags link to tech icon or `#` (out of scope for filtering)

### FR-3: Project detail pages
- New dynamic route: `src/pages/[lang]/projects/[slug].astro`
- Uses Astro's `getStaticPaths` to pre-render all project pages
- Layout: title + hero, problem section, solution section, outcomes (bullet list), stack (icon grid), links (CTA buttons), "Next project" navigation
- Markdown body for `problem` and `solution` rendered via `Content` component
- Canonical URL includes slug

### FR-4: Seed projects
- 3 projects to replace the current placeholders:
  1. **Cloud Infrastructure Automation** — Multi-cloud IaC with Terraform (AWS/GCP)
  2. **K8s Cluster Management** — Self-hosted K8s on OCI with GitOps (Argo CD)
  3. **CI/CD Pipeline Design** — GitHub Actions + self-hosted ARC runners
- Each project has 3 language variants minimum (ES + EN)
- Real descriptions, real problems/solutions/outcomes (Daryl provides content or accepts agent-generated template)
- Real or placeholder repo/demo links (clearly marked as "demo" or "wip" if not production-grade)

### FR-5: Project navigation
- "Next project" link at the bottom of each project page
- Order: by `order` field, ascending
- Wraps around from last to first (or hides button on last project — Daryl to choose)
- "All projects" link to `/#projects` (homepage anchor)

### FR-6: Styling
- Reuse existing `.glass` card style
- Project detail page uses same color tokens and typography as homepage
- Stack icons are 24x24px, mono-color (single accent color)
- "Next project" uses a similar visual treatment as other CTAs (filled button)

## Non-Functional Requirements

### NFR-1: Performance
- Build time: < 5 minutes (3 projects × 2 languages = 6 pages, trivial)
- Each project page: < 100KB
- No new JS required for navigation

### NFR-2: SEO
- Each project has unique meta title and description
- Open Graph image: optional (could use repo screenshot or first stack icon as a composite — out of scope for MVP)
- Structured data (`schema.org/CreativeWork`) on project pages

### NFR-3: Content validation
- Zod validation at build time catches: missing required fields, invalid URLs, slugs with uppercase, duplicate slugs
- Build fails on validation error with a clear message

## Out of Scope

- Project filtering by tech stack
- Project search
- Project comments / reactions
- Project images / screenshots (just text + icons for MVP)
- Related projects algorithm
- RSS feed for projects

## Open Questions

1. **Project content source**: Daryl writes all content, or agent generates drafts for review? **Blocks**: seed content.
2. **Featured vs all projects**: Should the homepage show only `featured: true` projects, or all? Proposed: only featured.
3. **"Next project" wrap-around**: Wrap to first project, or hide button on last? Proposed: wrap.
4. **Project ordering**: By `order` field (manual) or by `pubDate` (automatic)? Proposed: by `order` (more control).

## Success Criteria

- All 3 placeholder project cards link to real project pages
- Each project has full content (problem, solution, outcomes, stack, links)
- Project pages work in both ES and EN
- Build passes Zod validation on all seed projects
- Lighthouse score ≥ 95 maintained
- Unit tests for any helper functions
- E2E test: click each card, verify the right detail page loads
