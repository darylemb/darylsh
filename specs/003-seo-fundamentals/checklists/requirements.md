# Requirements Quality Checklist: SEO Fundamentals

**Date**: 2026-09-04
**Spec**: [spec.md](./spec.md)

## Coverage

- [x] **6 user stories** defined with priority (P1×3, P2×2, P3×1)
- [x] **All user stories** have "Why this priority" + "Independent Test"
- [x] **All user stories** have ≥2 acceptance scenarios in Given/When/Then
- [x] **Out of scope** explicitly defined
- [x] **Edge cases** enumerated
- [x] **Success metrics** measurable

## Clarity

- [x] OG/Twitter tags — exact name (og:title, og:description, og:image, twitter:card)
- [x] hreflang — exact 3 values (es, en, x-default)
- [x] H1 — "exactly 1 per page"
- [x] JSON-LD — exact 3 schemas (@graph: Person, WebSite, BreadcrumbList)
- [x] Link safety — exact `rel="noopener noreferrer"`
- [x] Viewport — exact content "width=device-width, initial-scale=1"

## Testability

- [x] Each user story has automated test path (Vitest or Playwright)
- [x] Lighthouse SEO = 100 is a measurable target
- [x] Schema validator (schema.org) is a free external tool

## Dependencies

- [x] No new dependencies required
- [x] Python `pillow` for OG image generation is one-off dev dep
- [x] Excludes production infrastructure changes

## Feasibility

- [x] All edits in Astro codebase (no infra)
- [x] Open Graph image size (1200×630) widely supported
- [x] JSON-LD @graph pattern is standard schema.org

## Risks Identified

- [x] Large OG images → mitigated by size validation in T032
- [x] JSON-LD parsing → mitigated by unit test (T011)
- [x] H1 styling collision → mitigated by visual review (T040)
- [x] Hreflang URL swap → mitigated by unit test (T010)

## Open Questions

- [x] LinkedIn URL — flagged in research §9
- [x] Final OG taglines — proposed in research §9
- [x] OG image color palette — proposed in research §9

## Sign-off

Spec is complete, unambiguous, and independently testable. Approved to enter implementation phase.
