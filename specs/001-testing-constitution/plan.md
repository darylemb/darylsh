# Implementation Plan: Testing & Quality Assurance for Daryl.sh Portfolio

**Branch**: `001-testing-constitution` | **Date**: 2026-05-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-testing-constitution/spec.md`

## Summary

Implement comprehensive testing infrastructure (unit, integration, E2E), code linting, security vulnerability scanning, and replace emoji icons in TechStack component with high-quality SVG logos. All quality gates must pass in CI/CD on Cloudflare Pages.

---

## Technical Context

**Language/Version**: TypeScript 5.7+, Node.js 20+

**Primary Dependencies**: Astro 5.16.15+, Vitest 2.0.0, Playwright 1.50.0, ESLint 9.0.0

**Storage**: N/A (static site)

**Testing**: Vitest (unit/integration), Playwright (E2E)

**Target Platform**: Cloudflare Pages (Node.js 20 build environment)

**Project Type**: Static website / Astro portfolio

**Performance Goals**: Build < 5 minutes, tests < 10 minutes total

**Constraints**:
- 20-minute build timeout on Cloudflare Pages
- CI=true environment variable injected in Cloudflare Pages
- Zero errors required for linting and type checking

**Scale/Scope**: 8 pages (ES/EN for 4 routes), 13 tech icons to replace

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution is a template with no defined principles yet. All testing, linting, and security practices are applicable. Implementation proceeds with best practices for Astro + Cloudflare Pages.

**Status**: ✅ PASS - No violations

---

## Project Structure

### Documentation (this feature)

```text
specs/001-testing-constitution/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── testing-contracts.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
/
├── src/
│   ├── assets/
│   │   └── tech-logos/           # NEW: SVG icons for TechStack
│   ├── i18n/
│   │   ├── utils.ts
│   │   └── ui.ts
│   ├── components/
│   │   ├── TechStack.astro       # MODIFIED: Replace emoji with SVG icons
│   │   └── ...
│   └── ...
├── tests/                         # NEW: Test directory
│   ├── unit/
│   │   └── i18n.test.ts          # NEW: Unit tests for i18n utils
│   └── e2e/
│       └── basic.spec.ts         # NEW: Playwright E2E tests
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # NEW: GitHub Actions workflow
├── vitest.config.ts              # NEW: Vitest configuration
├── playwright.config.ts          # NEW: Playwright configuration
├── eslint.config.mjs             # NEW: ESLint configuration
└── package.json                  # MODIFIED: Add scripts and devDeps
```

**Structure Decision**: Single project structure (Astro static site). Testing directories added at project root. Icon assets in src/assets/tech-logos for Astro integration.

---

## Phase 0: Research (Completed)

Research conducted on:
1. **Testing Framework**: Vitest (recommended for Astro, Vite-native) + Playwright (officially documented E2E)
2. **Linting**: ESLint v9 with flat config + `eslint-plugin-astro` + `typescript-eslint` + `eslint-plugin-security`
3. **Icons**: Simple Icons CDN for most tech, official brand assets for AWS/Azure
4. **CI/CD**: GitHub Actions with jobs for lint, unit tests, E2E, security scan, and Cloudflare Pages deploy

Full research available in `research.md`.

---

## Phase 1: Design (Completed)

### Data Model

Defined entities for:
- Test Suite Configuration (Vitest)
- E2E Test Configuration (Playwright)
- ESLint Configuration
- Tech Icon Asset
- CI/CD Pipeline Configuration

Full data model available in `data-model.md`.

### Contracts

Defined contracts for:
- E2E Test Contract (8 critical pages)
- Unit Test Contract (i18n utilities)
- ESLint Contract (rules by file type)
- Security Audit Contract (vulnerability thresholds)
- Tech Icon Contract (rendering requirements)

Full contracts available in `contracts/testing-contracts.md`.

### Quickstart

Configuration examples and directory structure in `quickstart.md`.

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All decisions follow best practices for Astro + Cloudflare Pages.

---

## Implementation Tasks

### Task Group 1: Testing Infrastructure

1. **Install dev dependencies**: vitest, @vitest/coverage-v8, playwright, @playwright/test
2. **Create vitest.config.ts**: Configure for Astro with Vite
3. **Create playwright.config.ts**: Configure for E2E with webServer
4. **Create tests/unit/i18n.test.ts**: Unit tests for getLangFromUrl, useTranslations
5. **Create tests/e2e/basic.spec.ts**: E2E tests for 8 critical pages
6. **Update package.json scripts**: Add test, test:unit, test:e2e, test:e2e:ui commands

### Task Group 2: Linting Infrastructure

7. **Install dev dependencies**: eslint, eslint-plugin-astro, @typescript-eslint/*, eslint-config-prettier, eslint-plugin-security
8. **Create eslint.config.mjs**: Flat config with recommended rules
9. **Update package.json scripts**: Add lint, lint:fix, typecheck commands

### Task Group 3: Security Scanning

10. **Update package.json scripts**: Add audit script with --audit-level=high
11. **Verify CI security job configuration** in GitHub Actions workflow

### Task Group 4: Icon Replacement

12. **Create src/assets/tech-logos/ directory**
13. **Download SVG icons** for all 13 technologies
14. **Update TechStack.astro**: Replace emoji with img tags pointing to local SVGs

### Task Group 5: CI/CD Pipeline

15. **Create .github/workflows/ci-cd.yml** with 5 jobs
16. **Configure Cloudflare Pages deployment** via cloudflare/pages-action

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `vitest.config.ts` | Create | Vitest test configuration |
| `playwright.config.ts` | Create | Playwright E2E configuration |
| `eslint.config.mjs` | Create | ESLint flat config |
| `tests/unit/i18n.test.ts` | Create | Unit tests for i18n |
| `tests/e2e/basic.spec.ts` | Create | E2E page tests |
| `.github/workflows/ci-cd.yml` | Create | CI/CD pipeline |
| `src/assets/tech-logos/*.svg` | Create | Tech icon SVGs (13 files) |
| `src/components/TechStack.astro` | Modify | Use SVG icons instead of emoji |
| `package.json` | Modify | Add scripts and devDependencies |

---

## Verification Plan

After implementation, verify:

1. `pnpm lint` → Zero errors
2. `pnpm typecheck` → Zero errors
3. `pnpm test:unit` → All tests pass
4. `pnpm build` → Successful build
5. `pnpm test:e2e` → All E2E tests pass
6. `pnpm audit` → No critical/high vulnerabilities
7. Visual verification of TechStack icons (crisp at 2x)

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| vitest | ^2.0.0 | Unit/integration testing |
| @vitest/coverage-v8 | ^2.0.0 | Coverage reporting |
| playwright | ^1.50.0 | E2E testing framework |
| @playwright/test | ^1.50.0 | Playwright test runner |
| eslint | ^9.0.0 | Linting |
| eslint-plugin-astro | ^1.7.0 | Astro linting support |
| @typescript-eslint/parser | ^8.0.0 | TypeScript ESLint parser |
| @typescript-eslint/eslint-plugin | ^8.0.0 | TypeScript ESLint plugin |
| eslint-config-prettier | ^10.0.0 | Prettier conflict resolution |
| eslint-plugin-security | ^4.0.0 | Security linting |
| simple-icons | ^12.0.0 | Icon source package |