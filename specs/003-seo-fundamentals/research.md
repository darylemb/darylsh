# Research: SEO Fundamentals Implementation

**Date**: 2026-09-04
**Spec**: [spec.md](./spec.md)

## 1. Where to inject meta tags

**Decision**: All meta tags (OG, Twitter, JSON-LD, hreflang) go into `src/layouts/Layout.astro`
through a new `src/lib/seo.ts` helper that builds the head string.

**Rationale**: The Layout component is the single `<head>` owner of all pages (pages use
`<Layout title="..." description="...">`). Centralizing SEO logic in one helper avoids
duplication and makes future maintenance trivial.

**Alternatives considered**:
- **Per-page meta in each .astro file** — ❌ duplicates 9x. Rejected.
- **Astro `<head>` slot** — ❌ Astro doesn't have `<head>` slot, only `<head>` is rendered in Layout. Rejected.
- **`@astrojs/seo` plugin** — ❌ abandoned package, only Astro 2 era. Rejected.

## 2. Helper module design

**Decision**: `src/lib/seo.ts` exports `buildSeoProps({ title, description, image, lang, path })`
that returns an object with all meta tag fragments. Layout consumes it via spread.

```ts
// src/lib/seo.ts
export interface SeoProps {
    title: string;
    description: string;
    image?: string; // path relative to /, defaults to /og/{lang}-{slug}.png
    type?: 'website' | 'article';
    publishedTime?: string; // ISO for articles
    modifiedTime?: string;
    author?: string;
}

export const SITE = {
    name: 'Daryl Mendoza',
    author: 'Daryl Mendoza',
    twitter: '@darylemb', // optional, only if user has
    github: 'https://github.com/darylemb',
    linkedin: 'https://www.linkedin.com/in/darylemb/',
    siteUrl: 'https://daryl.sh',
    locale: { es: 'es_MX', en: 'en_US' },
};

export function buildSeoProps(props: SeoProps, ctx: { lang: 'es' | 'en'; path: string }) {
    const url = new URL(ctx.path, SITE.siteUrl).toString();
    const ogImage = new URL(props.image ?? `/og/${ctx.lang}/default.png`, SITE.siteUrl).toString();
    // ... build all props
    return { url, ogImage, /* ... */ };
}
```

**Page usage**:
```astro
---
import { buildSeoProps, SITE } from '../lib/seo';
const seo = buildSeoProps({...}, { lang, path: Astro.url.pathname });
---
<Layout title="..." description="..." seo={seo}>
```

## 3. Hreflang implementation

**Decision**: Build alternate links by mapping each locale to its URL.

**Pattern**:
```astro
{locales.map(loc => (
    <link rel="alternate" hreflang={loc} href={siteUrl + localizedPath} />
))}
<link rel="alternate" hreflang="x-default" href={siteUrl + `/${defaultLocale}/...`} />
```

**Where `localizedPath` comes from**: simple swap of `/es/` ↔ `/en/` in current pathname. 
Covered cases:
- `/es/blog/` → `/en/blog/` ✅
- `/en/projects/k8s-management/` → `/es/projects/k8s-management/` ✅
- `/` (root) → maps to `/es/` or `/en/` based on locale ✅

**Edge**: `/404` and `/404.html` — exclude hreflang from 404 page.

## 4. OG image strategy

**Decision**: Pre-render 4 OG images as PNG, ship in `public/og/`:

| Image | Purpose | Size |
|---|---|---|
| `public/og/es/home.png` | Spanish homepage preview | 1200×630 |
| `public/og/en/home.png` | English homepage preview | 1200×630 |
| `public/og/default.png` | Fallback for any other page | 1200×630 |
| `public/og/avatar.jpg` | JSON-LD Person photo (square 400×400) | 400×400 |

**Design notes**:
- Background: gradient matching site glassmorphism
- Title: "Daryl Mendoza — DevOps/SRE" + tagline
- Avatar: stylized monogram (D or DΛ) in glass circle
- Font: pre-existing Roboto Mono (already in deps)
- Footer URL: `daryl.sh`

**Tool**: Use Python `pillow` + Roboto Mono TTF to render programmatic PNG.

**Alternative**: Hand-craft with Figma/Canva export. Rejected because programmatic ensures
consistent updates and matches site theme colors exactly.

## 5. JSON-LD schemas

**Decision**: Inject 3 schemas as a single `<script type="application/ld+json">` containing a `@graph`:

```json
{
    "@context": "https://schema.org",
    "@graph": [
        { "@type": "Person", "@id": "https://daryl.sh/#person", "name": "Daryl Mendoza", ... },
        { "@type": "WebSite", "@id": "https://daryl.sh/#website", ... },
        { "@type": "BreadcrumbList", "@id": "https://daryl.sh#breadcrumb", ... }
    ]
}
```

**Per-page enrichment**:
- Every page: Person + WebSite
- Article/blog post: + Article (with datePublished, author)
- Deep path (`/projects/k8s-management`): + BreadcrumbList
- Others: only Person + WebSite

**Author sameAs**: GitHub (`darylemb`), LinkedIn (`darylemb`).
**Note**: Daryl didn't provide LinkedIn handle in profile; check `src/content/` or ask.
For now, GitHub + site URL. Daryl can add LinkedIn later.

## 6. Test strategy

**Unit tests** (Vitest):
- `src/lib/seo.test.ts` — verify `buildSeoProps` returns correct shape for various inputs
- Test: ES home → og:title contains "Daryl Mendoza", og:locale = es_MX
- Test: EN project detail → hreflang includes both locales + x-default
- Test: missing image → falls back to default OG path

**E2E tests** (Playwright):
- `tests/e2e/seo.spec.ts` — visit `/es/`, assert presence of:
  - `<meta property="og:title">`
  - `<meta property="og:description">`
  - `<meta property="og:image">`
  - `<meta name="twitter:card">`
  - `<link rel="alternate" hreflang="es">`, `hreflang="en"`, `hreflang="x-default"`
  - Exactly 1 `<h1>`
  - `<script type="application/ld+json">` with valid Person schema
- Same checks for `/en/`, `/es/projects/k8s-management/`

**Manual verification**:
- [opengraph.xyz](https://www.opengraph.xyz/) for visual preview
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- Lighthouse SEO audit on 4 representative pages

## 7. Risk register

| Risk | Likelihood | Mitigation |
|---|---|---|
| OG images too large (>5MB Twitter limit) | Low | Render PNG ~150KB target, validate file size in tests |
| JSON-LD breaks parsing if invalid | Medium | Vitest unit test parses JSON; E2E asserts presence |
| Hreflang wrong URL swaps | Medium | Unit test covers `/es/blog/`, `/en/projects/k8s-management/`, edge cases |
| H1 visible vs hidden (a11y conflict) | Low | Use semantic HTML, not visually-hidden CSS hacks |
| `<h1>` collides with existing hero styling | Medium | Apply existing CSS class to new H1, ensure visual hierarchy preserved |

## 8. Implementation order

1. Create `src/lib/seo.ts` + unit tests (no UI changes yet)
2. Update `src/layouts/Layout.astro` to consume `seo` prop + inject meta
3. Add H1 to 4 pages (Hero for home, headings to blog/projects/contact)
4. Generate OG images via Python script (one-off manual step)
5. Add `<link rel="alternate" hreflang>` in Layout
6. Wire JSON-LD in Layout (single script with `@graph`)
7. Fix `rel="noopener noreferrer"` on external link
8. Fix viewport
9. E2E tests + Lighthouse verification

## 9. Open Questions

- Daryl should confirm his LinkedIn URL or skip it (currently not in profile)
- Final tagline for OG home in both languages — propose:
  - ES: "Ingeniero DevOps / SRE en CDMX · Kubernetes, Terraform, Cloudflare"
  - EN: "DevOps / SRE Engineer based in Mexico City · Kubernetes, Terraform, Cloudflare"
- OG image color palette: use site theme colors (`slate-50` light, `slate-900` dark) for background gradient
