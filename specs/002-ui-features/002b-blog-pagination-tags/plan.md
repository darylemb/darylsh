# Implementation Plan: Blog Pagination and Tag Filtering

**Branch**: `002b-blog-pagination-tags` | **Date**: 2026-07-15 | **Spec**: [./spec.md](./spec.md)

## Summary

Add tag filtering and pagination to the blog index. Validate post tags via Zod. Seed 5+ posts.

## Technical Context

**Primary Dependencies**: None (uses Astro's built-in features)

**Files to modify**:
- `src/content/config.ts` (MODIFIED — stricter tag validation)
- `src/lib/blog.ts` (NEW — `getFilteredPosts` helper)
- `src/components/PageBlog.astro` (MODIFIED)
- `src/components/TagPills.astro` (NEW)
- `src/components/BlogPagination.astro` (NEW)
- `src/pages/[lang]/blog.astro` (MODIFIED)
- `src/i18n/ui.ts` (MODIFIED — add new keys)
- `src/content/blog/*.md` (NEW — 6 seed posts)

## Constitution Check

✅ PASS

## Design Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | Tag validation regex `^[a-z0-9-]+$` | URL-safe, kebab-case, no spaces |
| 2 | Query params `?tag=` and `?page=` | Simple, no new routes, works without JS |
| 3 | Per-page default: 6 posts | Reasonable for portfolio blog |
| 4 | `getFilteredPosts` returns `allTags` always | Tag pills show all tags even when filtered |
| 5 | `noindex,follow` on page 2+ | SEO cleanliness for paginated content |
| 6 | Helper function in `src/lib/blog.ts` (not inline) | Unit testable, reusable |

## Project Structure

```text
src/
├── components/
│   ├── PageBlog.astro         # MODIFIED
│   ├── TagPills.astro         # NEW
│   └── BlogPagination.astro   # NEW
├── content/
│   ├── config.ts              # MODIFIED: add tags validation
│   └── blog/                  # NEW: 6 seed posts
│       ├── en/
│       │   ├── k8s-argocd-basics.md
│       │   ├── terraform-intro.md
│       │   └── cloudflare-edge.md
│       └── es/
│           ├── k8s-argocd-basicos.md
│           ├── terraform-intro.md
│           └── cloudflare-edge.md
├── lib/
│   └── blog.ts                # NEW
├── pages/
│   └── [lang]/
│       └── blog.astro         # MODIFIED
└── i18n/
    └── ui.ts                  # MODIFIED

tests/
├── unit/
│   └── blog.test.ts           # NEW
└── e2e/
    └── blog-pagination.spec.ts # NEW
```

## Implementation Details

### 1. Updated Schema (`src/content/config.ts`)

```typescript
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.date(),
        lang: z.enum(['en', 'es']),
        tags: z.array(z.string().regex(/^[a-z0-9-]+$/, 'Tags must be kebab-case')).optional(),
    }),
});

export const collections = { blog };
```

### 2. Blog Helper (`src/lib/blog.ts`)

```typescript
import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export interface GetFilteredPostsOptions {
    lang: 'en' | 'es';
    tag?: string;
    page?: number;
    perPage?: number;
}

export interface GetFilteredPostsResult {
    posts: BlogPost[];
    totalPosts: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
    allTags: string[];
    activeTag: string | null;
}

export async function getFilteredPosts({
    lang,
    tag,
    page = 1,
    perPage = 6,
}: GetFilteredPostsOptions): Promise<GetFilteredPostsResult> {
    const all = (await getCollection('blog'))
        .filter((p) => p.data.lang === lang)
        .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

    const allTags = Array.from(
        new Set(all.flatMap((p) => p.data.tags ?? []))
    ).sort();

    const filtered = tag ? all.filter((p) => p.data.tags?.includes(tag)) : all;

    const totalPosts = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalPosts / perPage));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * perPage;
    const posts = filtered.slice(start, start + perPage);

    return {
        posts,
        totalPosts,
        totalPages,
        currentPage,
        perPage,
        allTags,
        activeTag: tag ?? null,
    };
}
```

### 3. PageBlog Component Update

```astro
---
import { getFilteredPosts } from '../lib/blog';
import { getLangFromUrl, useTranslations } from '../i18n/utils';
import TagPills from './TagPills.astro';
import BlogPagination from './BlogPagination.astro';

const lang = getLangFromUrl(Astro.url) as 'en' | 'es';
const tag = Astro.url.searchParams.get('tag') ?? undefined;
const page = parseInt(Astro.url.searchParams.get('page') ?? '1', 10);
const { posts, totalPosts, totalPages, currentPage, allTags, activeTag } = 
    await getFilteredPosts({ lang, tag, page });
const t = useTranslations(lang);
---

<section class="blog container">
    <div class="header">
        <h2>{t('blog.title')}</h2>
        <p>{t('blog.description')}</p>
    </div>
    {allTags.length > 0 && <TagPills tags={allTags} activeTag={activeTag} lang={lang} />}
    <p class="post-count">
        {activeTag 
            ? `Showing ${posts.length} of ${totalPosts} posts tagged #${activeTag}`
            : `Showing ${posts.length} of ${totalPosts} posts`
        }
    </p>
    <div class="post-grid">
        {posts.map((post) => (
            <article class="post-card glass hover-lift">
                <span class="date">{post.data.pubDate.toLocaleDateString(lang)}</span>
                <h3>{post.data.title}</h3>
                <p>{post.data.description}</p>
                {post.data.tags && (
                    <div class="tags">
                        {post.data.tags.map((tag) => <a href={`?tag=${tag}`} class="tag">#{tag}</a>)}
                    </div>
                )}
                <a href={`/${lang}/construction`} class="read-more">Leer más <span>→</span></a>
            </article>
        ))}
    </div>
    <BlogPagination currentPage={currentPage} totalPages={totalPages} activeTag={activeTag} />
</section>
```

## Verification

| Check | Pass criteria |
|---|---|
| `pnpm lint` | Zero errors |
| `pnpm typecheck` | Zero errors |
| `pnpm test:unit` | All blog tests pass (filter, paginate, edge cases) |
| `pnpm test:e2e` | All pagination E2E tests pass |
| `pnpm build` | Successful build, all posts validated |
| Manual | Click tag → filter, paginate, navigate back |

## Risks

| Risk | Mitigation |
|---|---|
| Existing blog posts fail new Zod validation | Migrate before merging |
| Tag regex too strict (rejects valid tags) | Start lenient, tighten later if needed |
| Sitemap includes `?page=2+` URLs | Configure sitemap to exclude query params |

## Open Questions

1. **Tag pill style**: filled vs outlined for active state
2. **Seed content topics**: K8s/Terraform/GitOps/etc.
3. **Posts in both languages**: write twice or auto-translate (proposal: write in native language)
