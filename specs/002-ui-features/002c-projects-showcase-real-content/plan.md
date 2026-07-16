# Implementation Plan: Projects Showcase with Real Content

**Branch**: `002c-projects-showcase-real-content` | **Date**: 2026-07-15 | **Spec**: [./spec.md](./spec.md)

## Summary

Replace 2/3 project placeholders with real project pages. Use Content Collection for project data. Each project has detail page with problem, solution, outcomes, stack, links.

## Technical Context

**Primary Dependencies**: None (uses Astro Content Collections)

**Files**:
- `src/content/config.ts` (MODIFIED — add `projects` collection)
- `src/content/projects/{lang}/*.md` (NEW — 6 files)
- `src/components/Projects.astro` (MODIFIED — read from collection)
- `src/components/ProjectCard.astro` (NEW — extracted from Projects.astro)
- `src/components/ProjectDetail.astro` (NEW — used in [slug].astro)
- `src/lib/projects.ts` (NEW — helpers)
- `src/pages/[lang]/projects/[slug].astro` (NEW)
- `src/i18n/ui.ts` (MODIFIED)

## Constitution Check

✅ PASS

## Design Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | Use Content Collection with markdown | Type-safe, validated, rich content, easy to add |
| 2 | Path: `/[lang]/projects/[slug]` | Consistent with blog, RESTful, SEO-friendly |
| 3 | `featured: boolean` field | Only show selected projects on homepage |
| 4 | `order: number` for sorting | Manual control over display order |
| 5 | Separate "Next project" link (wraps) | Better navigation, retains visitor |
| 6 | Mark construction page `noindex` | Avoid SEO penalty during migration |

## Project Structure

```text
src/
├── components/
│   ├── Projects.astro        # MODIFIED: read from collection
│   ├── ProjectCard.astro    # NEW
│   └── ProjectDetail.astro  # NEW
├── content/
│   ├── config.ts             # MODIFIED
│   └── projects/             # NEW
│       ├── en/
│       │   ├── cloud-infrastructure.md
│       │   ├── k8s-management.md
│       │   └── cicd-pipelines.md
│       └── es/
│           ├── cloud-infrastructure.md
│           ├── k8s-management.md
│           └── cicd-pipelines.md
├── lib/
│   └── projects.ts           # NEW
├── pages/
│   └── [lang]/
│       ├── projects/         # NEW directory
│       │   └── [slug].astro  # NEW
│       └── construction.astro # MODIFIED: add noindex
└── i18n/
    └── ui.ts                 # MODIFIED
```

## Implementation Details

### 1. Project Schema (`src/content/config.ts`)

```typescript
import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string().max(80),
        description: z.string().max(200),
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

export const collections = { projects };
```

### 2. Project Detail Page (`src/pages/[lang]/projects/[slug].astro`)

```astro
---
import Layout from '../../../layouts/Layout.astro';
import Navbar from '../../../components/Navbar.astro';
import ProjectDetail from '../../../components/ProjectDetail.astro';
import { getProjects } from '../../../lib/projects';

export async function getStaticPaths() {
    const langs = ['en', 'es'] as const;
    const paths = [];
    for (const lang of langs) {
        const projects = await getProjects({ lang, featured: false });
        for (const project of projects) {
            paths.push({
                params: { lang, slug: project.slug },
                props: { project, allProjects: projects },
            });
        }
    }
    return paths;
}

const { project, allProjects } = Astro.props;
const currentIndex = allProjects.findIndex((p) => p.slug === project.slug);
const nextProject = allProjects[(currentIndex + 1) % allProjects.length];
const { Content } = await project.render();
---

<Layout title={project.data.title} description={project.data.description}>
    <Navbar />
    <main style="padding-top: 100px;">
        <ProjectDetail 
            project={project} 
            nextProject={nextProject}
        >
            <Content />
        </ProjectDetail>
    </main>
</Layout>
```

### 3. Seed Project Frontmatter Example

```markdown
---
title: "Cloud Infrastructure Automation"
description: "Multi-cloud infrastructure automation using Terraform, deployed via GitHub Actions and Cloudflare Pages."
outcomes:
  - "Reduced infrastructure provisioning time from days to hours"
  - "100% reproducible environments across AWS, GCP, and OCI"
  - "Zero-downtime deployments via GitOps"
stack: ["Terraform", "AWS", "GCP", "OCI", "GitHub Actions", "Cloudflare"]
links:
  docs: "https://github.com/darylemb/cloudflare"
pubDate: 2026-07-15
featured: true
lang: "en"
order: 1
---

## Problem

Managing infrastructure across multiple cloud providers with manual processes
leads to inconsistencies, drift, and slow provisioning...

## Solution

A GitOps-based approach with Terraform modules per cloud provider,
orchestrated by GitHub Actions, with state stored in OCI buckets...
```

## Verification

| Check | Pass criteria |
|---|---|
| Lint/typecheck/test:unit/test:e2e/build | All pass |
| All 3 project cards on homepage link to real pages | No `/construction` links remain |
| Each project page shows: title, problem, solution, outcomes, stack, links | All sections present |
| Both ES and EN versions work | Switch lang, see translated content |
| Build fails on invalid project data | Zod validation enforced |

## Risks

| Risk | Mitigation |
|---|---|
| Project content is "marketing copy", not technical | Daryl to review and edit before merge |
| Repo/demo links 404 | Mark as "demo" or "wip" in description; Daryl to verify |
| Zod schema too strict, blocks future flexibility | Use `.optional()` for non-essential fields |

## Open Questions

1. **Project content source**: Daryl writes or agent generates drafts (BLOCKER)
2. **Featured vs all on homepage**: only `featured: true` (proposed)
3. **"Next project" wrap**: wrap to first (proposed)
4. **Project ordering**: by `order` field (proposed)
