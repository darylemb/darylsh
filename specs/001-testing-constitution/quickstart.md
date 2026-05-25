# Quickstart: Testing & Quality Assurance for Daryl.sh Portfolio

**Date**: 2026-05-24
**Feature**: 001-testing-constitution

---

## Prerequisites

- Node.js 20+
- pnpm 9+

---

## Installation

```bash
# Install dev dependencies
pnpm add -D vitest @vitest/coverage-v8 playwright @playwright/test
pnpm add -D eslint eslint-plugin-astro @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier eslint-plugin-security
```

---

## Configuration Files

### 1. Vitest Config (`vitest.config.ts`)

```typescript
/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist']
  }
});
```

### 2. Playwright Config (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
});
```

### 3. ESLint Config (`eslint.config.mjs`)

```javascript
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';
import eslintPluginSecurity from 'eslint-plugin-security';
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  { ignores: ['dist/**', 'node_modules/**', '.git/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  eslintPluginSecurity.configs.recommended,
  eslintPluginAstro.configs['jsx-a11y-recommended'],
  eslintConfigPrettier,
  {
    files: ['**/*.astro'],
    rules: {
      'astro/no-set-html-directive': 'error',
      'astro/no-unsafe-inline-scripts': 'warn'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  }
]);
```

### 4. Update package.json scripts

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "lint": "eslint \"src/**/*.{js,ts,astro}\"",
    "lint:fix": "eslint \"src/**/*.{js,ts,astro}\" --fix",
    "typecheck": "tsc --noEmit",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "audit": "npm audit --audit-level=high"
  }
}
```

---

## Directory Structure

```
project-root/
├── src/
│   ├── i18n/
│   │   ├── utils.ts
│   │   └── ui.ts
│   ├── components/
│   │   └── TechStack.astro
│   └── assets/
│       └── tech-logos/          # New: SVG icons
│           ├── aws.svg
│           ├── gcp.svg
│           └── ...
├── tests/
│   ├── unit/
│   │   └── i18n.test.ts         # New
│   └── e2e/
│       └── basic.spec.ts        # New
├── .github/
│   └── workflows/
│       └── ci-cd.yml            # New
├── vitest.config.ts              # New
├── playwright.config.ts         # New
└── eslint.config.mjs            # New
```

---

## Running Tests

```bash
# Run all unit tests
pnpm test:unit

# Run unit tests in watch mode
pnpm test:unit:watch

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run linting
pnpm lint

# Run TypeScript type check
pnpm typecheck

# Run security audit
pnpm audit
```

---

## GitHub Actions Workflow

Create `.github/workflows/ci-cd.yml` with these jobs:

1. `lint-and-types` - ESLint + TypeScript
2. `unit-tests` - Vitest
3. `e2e-tests` - Playwright (after build)
4. `security-scan` - npm audit
5. `deploy` - Cloudflare Pages (main only)

---

## Icon Download Strategy

```bash
# Create icons directory (served statically via /tech-logos/... URLs)
mkdir -p public/tech-logos

# Download from Simple Icons CDN (example)
# AWS, Azure require manual download from brand sites

# Simple Icons can be used via CDN or npm package
```

For production, consider using `simple-icons` npm package to get consistent versions.

---

## Verification

```bash
# After setup, verify:
pnpm lint       # Should pass with zero errors
pnpm typecheck # Should pass with zero errors
pnpm test:unit # Should pass all tests
pnpm build     # Should build successfully
```