# Feature Specification: UI Features Bundle for Daryl.sh Portfolio

**Feature Branch**: `002-ui-features`

**Created**: 2026-07-15

**Status**: Draft

**Input**: User description: "Mejora la UI del portafolio. Necesita: blog con posts reales, projects showcase con proyectos reales (no placeholders), contact form con backend real (no simulado), y dark mode toggle (no forzado a dark)."

## Umbrella Scope

This feature bundles four related UI improvements that share a common visual language (glassmorphism + mono + dark-first) but are independently shippable. Each sub-spec is a separate PR with its own tests, but they are designed to compose without conflict.

## Sub-features

| ID | Title | Priority | Independent of others? |
|---|---|---|---|
| `002a-dark-mode-toggle` | Light/dark mode toggle with system preference fallback and persistence | P1 | ✅ Yes |
| `002b-blog-pagination-tags` | Blog index with tag filtering and pagination | P2 | ✅ Yes |
| `002c-projects-showcase-real-content` | Replace project placeholders with real projects (real descriptions, real links, no construction fallbacks) | P1 | ✅ Yes |
| `002d-contact-form-backend` | Wire contact form to a real backend (Cloudflare Worker or Formspree) | P2 | ⚠️ Requires user to choose provider |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor customizes theme (P1)

As a visitor browsing daryl.sh on a bright screen, I want to switch from the forced dark theme to a light theme so I can read the content comfortably.

**Why this priority**: Forced dark mode is an accessibility regression. Visitors with light sensitivity cannot use the site in its current state. This is a low-effort, high-impact fix.

**Independent Test**: Can be validated by loading the homepage, clicking the theme toggle, and observing the CSS variables swap. Refreshing the page should persist the choice.

**Acceptance Scenarios**:
1. **Given** I am on any page, **When** I click the theme toggle, **Then** the page switches between light and dark themes within 200ms
2. **Given** I have selected a theme, **When** I refresh the page or navigate to another page, **Then** my selection persists
3. **Given** I have never visited the site, **When** I load any page, **Then** the theme matches my OS preference (`prefers-color-scheme`)
4. **Given** I am on a light theme, **When** I view any image, link, or card, **Then** contrast ratios meet WCAG AA (4.5:1 for text)

### User Story 2 - Visitor explores blog (P2)

As a visitor interested in Daryl's technical writing, I want to filter posts by tag and paginate through long lists so I can find relevant content quickly.

**Why this priority**: The blog index currently shows one placeholder post. With more posts, the index becomes unusable without pagination and tag filtering.

**Independent Test**: Seed at least 5 blog posts, navigate to `/es/blog`, verify tag filter pills work and pagination shows the correct posts per page.

**Acceptance Scenarios**:
1. **Given** I am on the blog index, **When** I click a tag pill, **Then** only posts tagged with that tag are shown
2. **Given** there are more than 6 posts, **When** I scroll to the bottom, **Then** pagination controls appear with next/prev and page numbers
3. **Given** I click "Next", **When** the page reloads, **Then** posts 7-12 are shown and the URL has `?page=2`
4. **Given** I navigate to `/es/blog/k8s-argocd-basics`, **When** the post loads, **Then** the tag pills at the bottom link back to filtered index views

### User Story 3 - Visitor explores real projects (P1)

As a recruiter or technical evaluator, I want to click on a project card and see real details (not a "Under Construction" page) so I can evaluate Daryl's actual work.

**Why this priority**: 2 of 3 project cards currently link to `/construction`. This undermines the portfolio's purpose. The Cloud Infrastructure Automation card also points to construction, the K8s Management card points to a non-existent route, and only the CI/CD card has a real anchor.

**Independent Test**: Click each of the 3 project cards and verify the destination is a real page with: detailed description, tech stack used, problem statement, solution, outcomes/links to repo or live demo.

**Acceptance Scenarios**:
1. **Given** I am on the homepage, **When** I click "Cloud Infrastructure Automation", **Then** I see a real project page (not construction) with description, stack, and links
2. **Given** I am on the homepage, **When** I click "K8s Cluster Management", **Then** I see a real project page
3. **Given** I am on the homepage, **When** I click "CI/CD Pipeline Design", **Then** I see a real project page
4. **Given** I am on any project detail page, **When** I view the URL, **Then** it follows the pattern `/[lang]/projects/[slug]` and is a valid Astro route
5. **Given** I am on a project detail page, **When** I view the page, **Then** the project data (title, description, stack, links) is sourced from a Content Collection or structured data file (not hardcoded in the component)

### User Story 4 - Visitor sends a real message (P2)

As a recruiter or potential client, I want to send a message through the contact form and receive confirmation that my message was delivered so I know Daryl will receive it.

**Why this priority**: The current form simulates a 1.5s delay and shows "(Simulated)" in the success message. This is unprofessional and Daryl never receives the messages.

**Independent Test**: Fill out the form, submit, check that Daryl's email inbox receives a message with the submitted content within 30 seconds.

**Acceptance Scenarios**:
1. **Given** I have filled in all required fields, **When** I click "Enviar mensaje", **Then** the form submits to a real backend (not simulated)
2. **Given** the submission succeeds, **When** the response arrives, **Then** I see a success message without the "(Simulated)" text
3. **Given** the submission fails, **When** the error response arrives, **Then** I see a clear error message in the same language as the page (ES or EN)
4. **Given** Daryl receives a message, **When** he replies, **Then** the reply goes to the email address the visitor submitted (Reply-To header)
5. **Given** I am a bot filling the honeypot field, **When** I submit, **Then** the submission is silently accepted (200) but no email is sent

## Edge Cases

- **Theme toggle**: What happens if `localStorage` is disabled (e.g., private browsing)? → Falls back to OS preference, does not persist
- **Blog**: What if a post has no tags? → Posts without tags appear in "All" view but not in any specific tag view
- **Projects**: What if a project is added without all required fields? → Build fails with a clear Zod error
- **Contact form**: What if the backend is down? → User sees an error message and a `mailto:` fallback link
- **Contact form**: What about rate limiting? → Backend enforces 5 submissions per IP per hour

## Visual Design Direction (shared across all 4 sub-features)

Following the `frontend-design` skill principle: this is a DevOps portfolio. The aesthetic should feel like a **terminal/ops dashboard** — not the warm-cream / acid-green / broadsheet AI defaults.

**Palette** (already established, will be extended with light variants):
- Dark: `--bg-primary: #0a0a0a`, `--accent-primary: #3b82f6` (electric blue), `--accent-secondary: #8b5cf6` (purple)
- Light: TBD (sub-feature 002a will define)

**Typography** (already established): `Roboto Mono Variable` for everything, including body. Do NOT add a body face — the mono-only aesthetic is the signature.

**Signature element** (already established): Glassmorphism cards (`backdrop-filter: blur(12px)`) with subtle border glow on hover. This is what makes the site distinctive; do not dilute it.

**Layout principle**: All content cards use the same `.glass` class. New sub-features should reuse this pattern, not invent new card styles.

## Out of Scope

- **Comments / blog reactions** (would require a backend or third-party service)
- **Search** (blog and projects)
- **RSS feed** (could be added later via `@astrojs/rss`)
- **Analytics** (deferred to a separate feature)
- **CMS integration** (content stays in markdown files in repo)

## Open Questions

1. **Contact form provider**: Cloudflare Worker (free, requires `workers-dev` setup) vs Formspree (free tier 50/mo, no setup) vs Resend (transactional email API, free tier 3K/mo)? **Owner**: Daryl. **Blocks**: `002d-contact-form-backend`.
2. **Project content**: Where do the real project descriptions come from? Daryl will write them or accept a PR from the agent that fills in templates with real GitHub repo data? **Owner**: Daryl. **Blocks**: `002c-projects-showcase-real-content`.
3. **Light theme palette**: Specific hex values? **Owner**: Daryl (or accept agent's default). **Blocks**: `002a-dark-mode-toggle`.

## Dependencies between sub-features

```
002a (dark mode) ──────────────────────────────────▶ standalone
002b (blog)       ──────────────────────────────────▶ standalone
002c (projects)   ──────────────────────────────────▶ standalone (just needs project content)
002d (contact)    ──── requires Daryl's provider choice ─▶ blocks 002d start
```

**Recommended merge order**: `002a` → `002b` → `002c` → `002d` (each as a separate PR).

## Success Criteria

- All 4 sub-features shipped behind their own PRs with their own tests
- Lighthouse score ≥ 95 on Performance, Accessibility, Best Practices, SEO
- `prefers-color-scheme` respected on first visit
- Contact form successfully delivers real messages
- All project cards link to real pages
- Blog index is paginated and tag-filterable
- CI pipeline (Vitest + Playwright) passes on all PRs
