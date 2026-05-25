# Data Model: Testing & Quality Assurance for Daryl.sh Portfolio

**Date**: 2026-05-24
**Feature**: 001-testing-constitution

## Entity Overview

This feature introduces configuration and asset entities for testing, linting, and iconography. These are not traditional data entities but rather configuration-driven artifacts.

---

## Entity 1: Test Suite Configuration

**Purpose**: Configure and run unit and integration tests

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `testDir` | `string` | Root directory for test files |
| `include` | `string[]` | Glob patterns for test files |
| `exclude` | `string[]` | Patterns to exclude from tests |
| `environment` | `string` | Test environment (e.g., `node`, `jsdom`) |
| `coverage` | `boolean` | Enable coverage reporting |
| `coverageProvider` | `string` | Coverage tool (`v8` or ` Istanbul`) |

### Relationships

- References `src/i18n/utils.ts` for unit tests
- References Astro pages/components for E2E tests

---

## Entity 2: E2E Test Configuration (Playwright)

**Purpose**: Configure and run Playwright E2E tests

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `testDir` | `string` | Root directory for E2E tests |
| `projects` | `DeviceConfig[]` | Browser/device configurations |
| `baseURL` | `string` | Base URL for tests |
| `webServer` | `WebServerConfig` | Preview server configuration |
| `retries` | `number` | Retry count for CI |
| `reporter` | `string[]` | Test reporter configurations |

### Critical Pages Tested

| Page | Language | Path |
|------|----------|------|
| Home | Spanish | `/es/` |
| Home | English | `/en/` |
| Projects | Spanish | `/es/projects` |
| Projects | English | `/en/projects` |
| About | Spanish | `/es/about` |
| About | English | `/en/about` |
| Resume | Spanish | `/es/resume` |
| Resume | English | `/en/resume` |

---

## Entity 3: ESLint Configuration

**Purpose**: Configure code linting rules

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `configType` | `string` | Config format (flat vs legacy) |
| `files` | `string[]` | File patterns to lint |
| `ignores` | `string[]` | Patterns to exclude |
| `rules` | `RuleConfig[]` | Enabled lint rules |
| `plugins` | `Plugin[]` | ESLint plugins |

### Key Rules Enabled

**Error Prevention**:
- `no-unused-vars`
- `no-console`
- `prefer-const`
- `@typescript-eslint/no-explicit-any`

**Security**:
- `astro/no-set-html-directive` (XSS prevention)
- `astro/no-unsafe-inline-scripts`
- `security/detect-non-literal-require`

---

## Entity 4: Tech Icon Asset

**Purpose**: SVG/PNG icons for technology badges in TechStack component

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Technology name (display) |
| `slug` | `string` | Simple Icons slug or identifier |
| `source` | `string` | CDN URL or local file path |
| `license` | `string` | License type |
| `format` | `svg \| png` | File format |
| `fallback` | `boolean` | Whether PNG fallback needed |

### Icon Catalog

| Technology | Source | Format | License |
|------------|--------|--------|---------|
| AWS | Official Brand | svg | AWS Trademark |
| GCP | simpleicons.org (googlecloud) | svg | CC0-1.0 |
| Azure | simpleicons.org (azure) | svg | CC0-1.0 |
| Terraform | simpleicons.org (terraform) | svg | CC0-1.0 |
| Kubernetes | simpleicons.org (kubernetes) | svg | CC0-1.0 |
| Jenkins | simpleicons.org (jenkins) | svg | CC0-1.0 |
| GH Actions | simpleicons.org (githubactions) | svg | CC0-1.0 |
| ArgoCD | simpleicons.org (argo) | svg | CC0-1.0 |
| Ansible | simpleicons.org (ansible) | svg | CC0-1.0 |
| Python | simpleicons.org (python) | svg | CC0-1.0 |
| Java | simpleicons.org (openjdk) | svg | CC0-1.0 |
| Bash | simpleicons.org (gnubash) | svg | CC0-1.0 |
| Go | simpleicons.org (go) | svg | CC0-1.0 |

---

## Entity 5: CI/CD Pipeline Configuration

**Purpose**: Automated testing and deployment workflow

### Jobs

| Job | Trigger | Purpose |
|-----|---------|---------|
| `lint-and-types` | every push | ESLint + TypeScript check |
| `unit-tests` | every push | Vitest unit tests |
| `e2e-tests` | every push | Playwright E2E tests |
| `security-scan` | every push | npm audit |
| `deploy` | main push only | Cloudflare Pages deploy |

### Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_VERSION` | `20` | Node.js runtime |
| `PNPM_VERSION` | `9` | Package manager |
| `CI` | `true` | CI mode indicator |

---

## Validation Rules

1. **Test Files**: Must be in `*.test.ts` or `*.spec.ts` format
2. **E2E Tests**: Must verify `networkidle` state before assertions
3. **Icons**: Must be SVG (PNG only if SVG unavailable from source)
4. **Lint**: Zero errors required, warnings optional
5. **Security**: Critical/High CVEs must be resolved before deploy