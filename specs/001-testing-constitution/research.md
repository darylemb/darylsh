# Research: Testing & Quality Assurance for Daryl.sh Portfolio

**Date**: 2026-05-24
**Feature**: 001-testing-constitution

## Testing Framework Decision

**Choice**: Vitest (unit/integration) + Playwright (E2E)

**Rationale**: Vitest is the officially recommended testing framework for Astro projects, built on Vite (which Astro 5.0 uses via Vite 6). Playwright is the officially documented E2E testing framework for Astro with built-in `webServer` support. Both have first-class TypeScript support.

**Alternatives considered**:
- Jest: Works but requires additional configuration; Vitest is Vite-native
- Cypress: Supported but Playwright offers better cross-browser support
- NightwatchJS: Less commonly used in Astro ecosystem

---

## Linting Framework Decision

**Choice**: ESLint v9 with Flat Config + `eslint-plugin-astro` + `typescript-eslint`

**Rationale**: ESLint v9 is the current standard with flat config. `eslint-plugin-astro` provides first-class Astro support. `typescript-eslint` provides TypeScript support. `eslint-plugin-security` adds Node.js security rules.

**Alternatives considered**:
- Biome: Faster but less mature Astro support
- oxlint: TypeScript-native but newer, less ecosystem support

---

## Icon Sources Decision

**Choice**: Simple Icons CDN for most technologies, official brand assets for AWS/Azure

**Rationale**: Simple Icons provides CC0-licensed SVG icons for most requested technologies. AWS and Azure require official brand assets due to trademark considerations.

**Simple Icons Coverage**:
| Technology | Simple Icons Slug | License |
|------------|-------------------|---------|
| Ansible | `ansible` | CC0-1.0 |
| ArgoCD | `argo` | CC0-1.0 |
| GitHub Actions | `githubactions` | CC0-1.0 |
| GNU Bash | `gnubash` | CC0-1.0 |
| Go | `go` | CC0-1.0 |
| Google Cloud | `googlecloud` | CC0-1.0 |
| Jenkins | `jenkins` | CC0-1.0 |
| Kubernetes | `kubernetes` | CC0-1.0 |
| Python | `python` | CC0-1.0 |
| Terraform | `terraform` | CC0-1.0 |

**Requires Official Brand Assets**:
| Technology | Source | License |
|------------|--------|---------|
| AWS | AWS Brand | AWS Trademark Guidelines |
| Azure | Microsoft Brand | Microsoft Guidelines |
| Java | OpenJDK/Simple Icons (`openjdk`) | CC0-1.0 |

---

## CI/CD Decision

**Choice**: GitHub Actions

**Rationale**: Native integration with Cloudflare Pages via official `@cloudflare/github-action` action, excellent community support, free tier for open source.

**Alternatives considered**:
- Travis CI: Weaker Cloudflare Pages integration
- GitLab CI: Project is on GitHub
- Netlify CI: Vendor lock-in
- Jenkins: Overkill for static site

---

## Package Recommendations (Dev Dependencies)

| Package | Version | Purpose |
|---------|---------|---------|
| `vitest` | ^2.0.0 | Unit/integration testing |
| `@vitest/coverage-v8` | ^2.0.0 | Coverage reporting |
| `playwright` | ^1.50.0 | E2E testing framework |
| `@playwright/test` | ^1.50.0 | Playwright test runner |
| `eslint` | ^9.0.0 | Linting |
| `eslint-plugin-astro` | ^1.7.0 | Astro linting |
| `@typescript-eslint/parser` | ^8.0.0 | TypeScript ESLint parser |
| `@typescript-eslint/eslint-plugin` | ^8.0.0 | TypeScript ESLint plugin |
| `eslint-config-prettier` | ^10.0.0 | Prettier conflict resolution |
| `eslint-plugin-security` | ^4.0.0 | Security linting |

---

## Cloudflare Pages Compatibility

**Key considerations**:
1. Cloudflare Pages injects `CI=true` environment variable - tests should use this to adjust behavior
2. Cloudflare Pages has a 20-minute build timeout
3. Playwright browsers can be installed at build time with `npx playwright install --with-deps chromium`
4. Standard npm tooling works in Cloudflare Pages build environment

---

## Implementation Notes

### Directory Structure for Icons

```
src/assets/tech-logos/
├── aws.svg
├── gcp.svg (googlecloud)
├── azure.svg
├── terraform.svg
├── kubernetes.svg
├── jenkins.svg
├── github-actions.svg
├── argocd.svg
├── ansible.svg
├── python.svg
├── java.svg (openjdk)
├── bash.svg (gnubash)
└── go.svg
```

### Test File Locations

```
tests/
├── unit/
│   └── i18n.test.ts
└── e2e/
    └── basic.spec.ts
```

### GitHub Actions Workflow Jobs

1. `lint-and-types` - ESLint + TypeScript
2. `unit-tests` - Vitest
3. `e2e-tests` - Playwright (runs after build)
4. `security-scan` - npm audit
5. `deploy` - Cloudflare Pages (only on main push)