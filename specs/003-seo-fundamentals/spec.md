# Feature Specification: SEO Fundamentals for Daryl.sh Portfolio

**Feature Branch**: `003-seo-fundamentals`
**Created**: 2026-09-04
**Status**: Draft
**Input**: Hermes SEO audit of daryl.sh (2026-09-04)

## Context

Audit of production deployment at `https://daryl.sh` revealed missing critical SEO
fundamentals across all pages:

1. **No OG/Twitter tags** — link previews on Slack/Discord/LinkedIn/Twitter show nothing
2. **No hreflang tags** — Google treats `/es/` and `/en/` as duplicate content, canibalizing rankings
3. **Missing H1 on 4 main pages** (`/es/`, `/blog`, `/projects`, `/contact`) — Google cannot determine page topic
4. **Identical meta description (74 chars) across all 9 pages** — every SERP snippet is identical, killing CTR
5. **No JSON-LD structured data** — zero rich-snippet eligibility (photo, social links, breadcrumbs, software authorship)
6. **Viewport missing `initial-scale=1`** — minor mobile rendering glitches
7. **1 external link without `rel="noopener noreferrer"`** — minor tab-nabbing / referrer leak risk

The site is statically generated, content is in `src/content/`, and the Layout component
(`src/layouts/Layout.astro`) already controls `<head>` for every page. Fix is to enhance
Layout + add a small SEO helper module, no schema changes needed.

## User Scenarios & Testing

### User Story 1 - Rich Link Previews (Priority: P1)

When Daryl or a recruiter shares a daryl.sh link on Slack, Discord, LinkedIn, Twitter, or
iMessage, the recipient sees a preview card with title, description, and a relevant image
— not just a bare URL.

**Why this priority**: Direct professional impact. Every DM/email/referral that includes
the link currently looks broken. This is the single highest-leverage fix for Daryl's
professional brand.

**Independent Test**: Paste `https://daryl.sh/es/` into `https://www.opengraph.xyz/`.
Should show og:title, og:description, og:image. Without image, validates title + desc.

**Acceptance Scenarios**:
1. **Given** daryl.sh/es/, **When** pasted into any link preview tool, **Then** title is "Daryl Mendoza | Portfolio DevOps/SRE", description is a unique Spanish tagline, og:image is a 1200×630 PNG in `/og/home-es.png`
2. **Given** daryl.sh/en/projects/k8s-management, **When** pasted into Twitter card validator, **Then** `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image` all present
3. **Given** any page on daryl.sh, **When** HTML inspected, **Then** `<meta property="og:title">` is unique to that page (not hardcoded)

---

### User Story 2 - Bilingual SEO Without Duplicate Content Penalty (Priority: P1)

When Google indexes daryl.sh, it correctly understands which page targets Spanish-speaking
users and which targets English-speaking users — without marking either as a duplicate of
the other.

**Why this priority**: Without `hreflang`, Google chooses one canonical and the other
suffers. For a personal site targeting both markets, this directly halves organic search
potential.

**Independent Test**: Inspect `<head>` of `/es/` and `/en/`. Each must declare:
- `<link rel="alternate" hreflang="es" href="https://daryl.sh/es/...">`
- `<link rel="alternate" hreflang="en" href="https://daryl.sh/en/...">`
- `<link rel="alternate" hreflang="x-default" href="https://daryl.sh/es/...">`

**Acceptance Scenarios**:
1. **Given** a logged-in Google Search Console, **When** inspecting `/es/blog`, **Then** "International Targeting" report shows no duplicate-content warnings
2. **Given** any page, **When** HTML inspected, **Then** exactly 3 hreflang alternate tags exist (es, en, x-default) and they point to the correct localized URLs
3. **Given** the root `/`, **When** an English browser requests it, **Then** it redirects to `/en/` with proper hreflang header

---

### User Story 3 - Page Topic Clarity for Crawlers & Screen Readers (Priority: P1)

When Googlebot and screen reader users visit daryl.sh, they can determine the page topic
from a single H1 — instead of inferring it from H2s/H3s alone.

**Why this priority**: SEO best practice says exactly one H1 per page. Missing H1 is
flagged by Lighthouse and Core Web Vitals tools. Screen reader users rely on H1 as the
first landmark.

**Independent Test**: Lighthouse SEO audit on `/es/` reports "Document doesn't have a
heading that is an h1" → fixed. View-source of `/es/` shows exactly 1 `<h1>` element.

**Acceptance Scenarios**:
1. **Given** `/es/` home, **When** HTML parsed, **Then** exactly one `<h1>` exists, semantically describing the page
2. **Given** `/es/blog`, **When** HTML parsed, **Then** exactly one `<h1>` exists (currently 0)
3. **Given** `/es/projects`, **When** HTML parsed, **Then** exactly one `<h1>` exists (currently 0)
4. **Given** `/es/contact`, **When** HTML parsed, **Then** exactly one `<h1>` exists (currently 0)
5. **Given** `/en/*`, **When** HTML parsed, **Then** EN page also has 1 H1 in English text
6. **Given** any page, **When** HTML parsed, **Then** heading hierarchy is H1 → H2 → H3 with no skipped levels

---

### User Story 4 - Unique Meta Descriptions Per Page (Priority: P2)

When Google displays daryl.sh in search results, each page shows a different, compelling
snippet describing its unique content — improving click-through rate.

**Why this priority**: Duplicate descriptions cause Google to ignore the tag entirely and
auto-generate from content. Lower CTR from search directly reduces professional
opportunities.

**Independent Test**: Crawl `/es/`, `/es/blog`, `/es/projects`, `/es/contact` — extract
meta description — assert all 4 are unique strings, each 120-160 chars.

**Acceptance Scenarios**:
1. **Given** 9 pages on daryl.sh, **When** descriptions extracted, **Then** all 9 are unique
2. **Given** any description, **When** measured, **Then** character length is 120-160 (Google's optimal range)
3. **Given** the meta description contains relevant keywords, **When** rendered in SERP, **Then** keywords are bolded by Google (semantic match between page topic and description)

---

### User Story 5 - Rich Snippet Eligibility via JSON-LD (Priority: P2)

When Google indexes daryl.sh, it can display rich snippets with Daryl's photo, social
links, and breadcrumb navigation in search results.

**Why this priority**: Rich snippets get 20-30% higher CTR. Schema.org Person is a 5-minute
add. Skill + Organization schemas extend the value.

**Independent Test**: Validate JSON-LD at `https://validator.schema.org/`. All 3 schemas
(Person, Website, BreadcrumbList) should validate without errors.

**Acceptance Scenarios**:
1. **Given** `/es/` (any page), **When** JSON-LD parsed, **Then** schema.org `Person` object exists with name, jobTitle, url, knowsAbout, sameAs (GitHub/LinkedIn), image
2. **Given** `/es/`, **When** JSON-LD parsed, **Then** schema.org `WebSite` object exists with name, url, inLanguage "es"
3. **Given** `/es/projects/k8s-management`, **When** JSON-LD parsed, **Then** schema.org `BreadcrumbList` exists with items pointing to `/es/`, `/es/projects`, current page
4. **Given** any JSON-LD, **When** validated at schema.org validator, **Then** 0 errors and 0 warnings

---

### User Story 6 - Viewport + External Link Safety (Priority: P3)

When mobile users visit daryl.sh, viewport rendering matches device width exactly. All
external links prevent tab-nabbing attacks and don't leak referrer headers.

**Why this priority**: Minor polish. Affects mobile UX subtly and security hygiene.

**Independent Test**: Real device or DevTools mobile emulation — text is not zoomed
incorrectly. Lighthouse "external links without noopener" audit passes.

**Acceptance Scenarios**:
1. **Given** mobile viewport 375px wide, **When** page loaded, **Then** text is readable without horizontal scroll
2. **Given** any external `<a>` tag, **When** HTML inspected, **Then** `rel` contains both `noopener` and `noreferrer` (or `rel="noopener noreferrer"`)
3. **Given** the GitHub link in Navbar, **When** clicked with `target="_blank"`, **Then** the opened tab cannot navigate the original tab (`window.opener` is null)

---

## Edge Cases

- **Build-time OG image generation**: Astro has `@vercel/og` or `satori` for runtime, but for SSG we ship pre-rendered PNGs in `public/og/`. Loss of dynamic generation is acceptable since pages are static.
- **JSON-LD parsing by Google**: Must be valid JSON (no trailing commas, properly quoted). Use Astro frontmatter to generate the JSON object, not template-string-concatenated.
- **hreflang for the 404 page**: The 404 page shouldn't have hreflang (it's content-free). Make all hreflang injection conditional on `Astro.url.pathname !== '/404'`.
- **OG image size**: Twitter cards need <5MB. 1200×630 PNG can be 100-500KB. Acceptable.
- **Spanish accents in titles**: All chars are UTF-8. Verify `meta charset="UTF-8"` is the first `<meta>` in `<head>`.
- **Existing astro.config.mjs site option**: Currently `site: 'https://daryl.sh'`. Used for canonical URLs already. Reuse for OG URL construction.

## Out of Scope

- **Sitemap improvements** (already configured via `@astrojs/sitemap`, works)
- **PWA / service worker** (later, separate spec)
- **RSS feed** (out of scope for SEO sprint, separate spec if needed)
- **Programmatic sitemap priorities** (`lastmod`, `priority`) — currently sitemap uses defaults
- **Image optimization with `<Image>` component** — separate performance sprint
- **Replacing placeholders projects with real content** — separate content sprint
- **Security headers** (Cloudflare manages them already)
- **Cloudflare cache tuning** (separate perf sprint)

## Assumptions

- Daryl's avatar URL is stable and publicly accessible (`public/favicon.svg` exists)
- The Astro version (5.16.15) supports `Astro.site` for OG URLs (confirmed)
- The `_redirects` file (`/` → `/es/` 302) does not conflict with hreflang (`x-default` = `/es/`)
- Spanish remains the default locale; English is fallback option for international visitors

## Dependencies

- None. All changes are local to `src/layouts/Layout.astro`, `src/components/Hero.astro`,
  `src/components/Navbar.astro`, and new files: `src/lib/seo.ts`, `public/og/*.png`.

## Success Metrics

| Metric | Baseline (2026-09-04) | Target |
|---|---|---|
| Lighthouse SEO score | ~85 (audit estimate) | 100 |
| Lighthouse Best Practices | ~90 | 100 |
| Missing H1 warnings (4 pages) | 4 | 0 |
| Duplicate meta descriptions | 9 | 0 |
| Open Graph tags present | 0% of pages | 100% |
| Schema.org validation errors | unknown | 0 |
| hreflang coverage | 0% | 100% |
| External links without `rel="noopener"` | 1 | 0 |
