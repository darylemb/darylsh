# Contracts: Testing & Quality Assurance for Daryl.sh Portfolio

**Date**: 2026-05-24
**Feature**: 001-testing-constitution

---

## Contract 1: E2E Test Contract

**Purpose**: Define which pages must pass Playwright E2E tests

### Critical Pages Contract

| Page | Language | Path | Load State | Assertions |
|------|----------|------|------------|------------|
| Home | ES | `/es/` | `networkidle` | No console errors |
| Home | EN | `/en/` | `networkidle` | No console errors |
| Projects | ES | `/es/projects` | `networkidle` | No console errors |
| Projects | EN | `/en/projects` | `networkidle` | No console errors |
| About | ES | `/es/about` | `networkidle` | No console errors |
| About | EN | `/en/about` | `networkidle` | No console errors |
| Resume | ES | `/es/resume` | `networkidle` | No console errors |
| Resume | EN | `/en/resume` | `networkidle` | No console errors |

### Test Interface

```typescript
interface CriticalPageTest {
  lang: 'es' | 'en';
  path: string;
  expectErrors: false;
  loadState: 'networkidle';
}
```

### Error Handling

- Console errors of type `error` FAIL the test
- Warnings are ignored
- Network failures (failed resources) are treated as errors
- 404 resources are treated as errors

---

## Contract 2: Unit Test Contract

**Purpose**: Define expected behavior for i18n utilities

### `getLangFromUrl` Contract

```typescript
interface GetLangFromUrlTest {
  input: URL;
  expected: 'es' | 'en';
}
```

**Test Cases**:

| Description | Input | Expected |
|-------------|-------|----------|
| Valid ES path | `http://localhost/es/projects` | `es` |
| Valid EN path | `http://localhost/en/about` | `en` |
| Invalid lang | `http://localhost/xyz/unknown` | `es` (default) |
| Root path | `http://localhost/es/` | `es` |
| No lang prefix | `http://localhost/projects` | `es` (default) |

### `useTranslations` Contract

```typescript
interface UseTranslationsTest {
  input: Lang;
  expected: Record<string, string>;
}
```

**Test Cases**:

| Description | Lang | Key | Expected |
|-------------|------|-----|----------|
| Valid key ES | `es` | `nav.projects` | `Proyectos` |
| Valid key EN | `en` | `nav.projects` | `Projects` |
| Missing key | `es` | `nonexistent.key` | `undefined` or fallback |
| Empty key | `es` | `` | `undefined` |

---

## Contract 3: ESLint Contract

**Purpose**: Define code quality rules that must pass

### File Coverage

| Pattern | Files | Rules |
|---------|-------|-------|
| `src/**/*.ts` | TypeScript files | typescript-eslint rules |
| `src/**/*.astro` | Astro components | astro-plugin rules |
| `src/**/*.js` | JavaScript files | eslint rules |

### Required Rules (Errors)

| Rule | File Type | Severity |
|------|-----------|----------|
| `no-unused-vars` | all | error |
| `@typescript-eslint/no-explicit-any` | .ts, .astro | error |
| `astro/no-set-html-directive` | .astro | error |
| `prefer-const` | all | error |
| `no-console` | all | warn |

### Security Rules (Errors in CI)

| Rule | File Type | Severity |
|------|-----------|----------|
| `security/detect-non-literal-require` | .js, .ts | error |
| `security/detect-eval-with-expression` | .js, .ts | error |
| `security/detect-child-process` | .js, .ts | error |

---

## Contract 4: Security Audit Contract

**Purpose**: Define vulnerability thresholds

### Severity Thresholds

| Level | Build Behavior |
|-------|----------------|
| Critical | FAIL build |
| High | FAIL build |
| Moderate | Warning only |
| Low | Warning only |

### Required Actions

- `npm audit --audit-level=high` must pass for deployment
- No critical/high vulnerabilities in direct dependencies
- Transitive dependencies with known vulnerabilities must have fixes available

---

## Contract 5: Tech Icon Contract

**Purpose**: Define icon rendering requirements

### Icon Properties

| Property | Value |
|----------|-------|
| Format | SVG (PNG fallback only if SVG unavailable) |
| Dimensions | 32x32 or scalable via viewBox |
| Color | Full color (brand colors) or monochrome |
| DPI | Crisp at 2x (retina displays) |

### TechStack Component Interface

```typescript
interface TechIcon {
  name: string;
  icon: string; // SVG string or path to local file
}

interface TechCategory {
  category: string;
  tools: TechIcon[];
}
```

### Required Icons

| Name | Source | License |
|------|--------|---------|
| AWS | AWS Brand | AWS Trademark |
| GCP | simpleicons.org (googlecloud) | CC0-1.0 |
| Azure | simpleicons.org (azure) | CC0-1.0 |
| Terraform | simpleicons.org (terraform) | CC0-1.0 |
| Kubernetes | simpleicons.org (kubernetes) | CC0-1.0 |
| Jenkins | simpleicons.org (jenkins) | CC0-1.0 |
| GH Actions | simpleicons.org (githubactions) | CC0-1.0 |
| ArgoCD | simpleicons.org (argo) | CC0-1.0 |
| Ansible | simpleicons.org (ansible) | CC0-1.0 |
| Python | simpleicons.org (python) | CC0-1.0 |
| Java | simpleicons.org (openjdk) | CC0-1.0 |
| Bash | simpleicons.org (gnubash) | CC0-1.0 |
| Go | simpleicons.org (go) | CC0-1.0 |