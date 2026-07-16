# Research: UI Features Bundle

**Date**: 2026-07-15

**Feature**: 002-ui-features

## Research Topics

### 1. Astro theme switching patterns (002a)

**Question**: What is the recommended pattern for dark/light mode in Astro 5 with static site generation?

**Decision**: Use `data-theme` attribute on `<html>` element, toggled by inline script in `<head>`. CSS variables for both themes defined in `:root` (dark default) and `:root[data-theme="light"]` (light variant).

**Sources reviewed**:
- Astro docs: Themes & Dark Mode
- CSS-Tricks: `prefers-color-scheme` best practices
- Josh Comeau's blog post on theme switching

**Rationale**: The `data-theme` attribute pattern is the standard 2026 approach. Avoids class name conflicts, is semantic, and works with Astro View Transitions. The inline anti-FOUC script is essential to prevent the flash of the wrong theme.

**Anti-patterns avoided**:
- Using `class="dark"` and `class="light"` — verbose, conflicts with utility CSS
- Relying solely on `prefers-color-scheme` — doesn't allow user override
- Storing theme in cookie — requires server roundtrip

### 2. Blog pagination in Astro static sites (002b)

**Question**: How to paginate a static blog in Astro 5 without client-side JS?

**Decision**: Use query string `?page=N`, parse with `Astro.url.searchParams`, render appropriate slice of posts in `getStaticPaths` or at build time. Pagination controls are real `<a>` links to the same route with different `?page=N`.

**Sources reviewed**:
- Astro docs: Pagination
- Vercel blog: Static site pagination strategies
- Lee Robinson: Next.js pagination patterns (for inspiration)

**Rationale**: Query string pagination is the simplest approach for static sites. All pages are pre-rendered at build time, so there's no server-side state to manage. Real links work without JS.

**Trade-off**: SEO is slightly worse for `?page=2+` (we'll add `noindex`), but the implementation is much simpler than path-based pagination.

### 3. Astro Content Collections best practices (002c)

**Question**: How to structure a Content Collection for projects that need: i18n, ordering, featured flag, multiple links, markdown body?

**Decision**: Use Astro Content Collections with Zod schema. Each project is a markdown file in `src/content/projects/{lang}/{slug}.md` (or flat with `lang` in frontmatter). Use `getCollection("projects")` and filter by lang in pages.

**Sources reviewed**:
- Astro docs: Content Collections
- Astro docs: Defining a collection
- Zod schema patterns

**Rationale**: Type-safe, validated at build time, markdown body for rich content, easy to add new projects (just add a file). The `lang` field in frontmatter allows per-language content.

**Schema design**:
```typescript
const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(80),
    description: z.string().max(200),
    problem: z.string().optional(),
    solution: z.string().optional(),
    outcomes: z.array(z.string()).min(1).max(5),
    stack: z.array(z.string()).min(3).max(6),
    links: z.object({
      repo: z.string().url().optional(),
      demo: z.string().url().optional(),
      docs: z.string().url().optional(),
    }),
    pubDate: z.date(),
    featured: z.boolean().default(false),
    lang: z.enum(['en', 'es']),
    order: z.number().int().min(1).max(100),
  }),
});
```

### 4. Contact form provider comparison (002d)

**Question**: Resend vs Cloudflare Email Workers vs Formspree for a portfolio contact form?

| Criteria | Resend | Cloudflare Email Workers | Formspree |
|---|---|---|---|
| **Free tier** | 3K/mo, 100/day | 100K emails/day via routing | 50/mo |
| **Setup complexity** | Low (npm install + API key) | High (DNS, routing, worker) | Very low (just form action URL) |
| **Customization** | Full HTML email | Full HTML email | Limited to template fields |
| **Cloudflare Pages integration** | Native (API route) | Native (Worker) | External (form action) |
| **Deliverability** | Excellent | Excellent (Cloudflare IP) | Good (their IPs) |
| **TypeScript SDK** | Yes (`resend` package) | Manual | No |
| **Privacy/data** | Resend sees email content | Cloudflare only | Formspree sees content |
| **Cost at scale** | $20/mo for 50K emails | Free up to 100K/day | $8/mo for 1K/mo |

**Decision**: **Resend** is the recommended primary choice. Best DX, generous free tier, TypeScript SDK, easy integration with Astro API routes. Cloudflare Email Workers is the alternative if Daryl wants zero third-party dependency. Formspree is the "just ship it" option with the smallest setup.

**Recommendation pending**: Daryl to choose.

### 5. Anti-spam strategies without ReCaptcha (002d)

**Question**: How to prevent spam without ReCaptcha (which adds friction and tracking)?

**Strategies**:
1. **Honeypot field**: Hidden `website` field. Bots fill it, humans don't. Reject silently.
2. **Timing check**: Form must be on page for at least 3 seconds before submission. Bots submit instantly.
3. **Rate limiting**: 5 submissions per IP per hour. Implemented via Cloudflare KV.
4. **Content validation**: Message must be 10+ chars, email must be valid format, name must be 2+ chars.

**Decision**: Combine all 4 strategies. No ReCaptcha needed for a portfolio's expected traffic (~10-20 messages/mo).

**Trade-off**: Sophisticated bots can defeat these. For a portfolio, this is acceptable; for a high-traffic site, add ReCaptcha or hCaptcha.

### 6. Anti-FOUC theme script (002a)

**Question**: How to prevent flash of incorrect theme on page load?

**Decision**: Inline `<script is:inline>` in `<head>` of Layout.astro. Runs synchronously before CSS is parsed. Reads `localStorage` or `prefers-color-scheme`, sets `document.documentElement.dataset.theme`.

**Script (~300 bytes)**:
```html
<script is:inline>
  (function() {
    const stored = localStorage.getItem('darylsh:theme');
    const theme = stored || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.dataset.theme = theme;
  })();
</script>
```

**Rationale**: The `is:inline` directive in Astro tells the bundler NOT to process this script — it stays inline in the HTML, runs immediately, and is small enough to not impact page weight. The IIFE avoids polluting the global scope.

## Decision Summary

| # | Topic | Decision |
|---|---|---|
| 1 | Theme switching | `data-theme` attribute + CSS variables + inline anti-FOUC script |
| 2 | Blog pagination | `?page=N` query string + real `<a>` links |
| 3 | Project data | Content Collection with Zod schema, markdown body |
| 4 | Contact provider | **Resend** (pending Daryl's confirmation) |
| 5 | Anti-spam | Honeypot + timing + rate limit + content validation |
| 6 | Anti-FOUC | Inline `is:inline` script in `<head>` |
