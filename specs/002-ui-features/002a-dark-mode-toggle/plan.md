# Implementation Plan: Dark Mode Toggle

**Branch**: `002a-dark-mode-toggle` | **Date**: 2026-07-15 | **Spec**: [./spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-ui-features/002a-dark-mode-toggle/spec.md`

## Summary

Add light/dark mode toggle to the navbar. Theme persists via `localStorage`, defaults to OS preference, no flash on page load.

## Technical Context

**Primary Dependencies**: None (uses existing CSS variables and vanilla JS)

**Files to modify**:
- `src/styles/theme.css` (NEW)
- `src/layouts/Layout.astro` (MODIFIED)
- `src/components/Navbar.astro` (MODIFIED)
- `src/components/ThemeToggle.astro` (NEW)
- `src/lib/theme.ts` (NEW)
- `tests/unit/theme.test.ts` (NEW)
- `tests/e2e/dark-mode.spec.ts` (NEW)
- `src/i18n/ui.ts` (MODIFIED — add 2 new keys: `nav.theme.toggle` and `nav.theme.toggle_to_light`/`dark`)

## Constitution Check

✅ PASS — no violations. All work follows Spec Kit + existing testing patterns.

## Design Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | Use `data-theme` attribute on `<html>` | Semantic, works with View Transitions, no class conflicts |
| 2 | Inline `<script is:inline>` for anti-FOUC | Runs before CSS parses, no flash, ~300 bytes |
| 3 | Store theme in `localStorage` with key `darylsh:theme` | Simple, persistent, no cookies |
| 4 | Listen to `prefers-color-scheme` change events | Theme follows system if user hasn't explicitly chosen |
| 5 | Toggle button in Navbar between lang-toggle and contact | Visual balance, accessible location |

## Project Structure

### Source changes

```text
src/
├── components/
│   ├── Navbar.astro         # MODIFIED: import + render ThemeToggle
│   └── ThemeToggle.astro    # NEW
├── layouts/
│   └── Layout.astro         # MODIFIED: add anti-FOUC script
├── lib/
│   └── theme.ts             # NEW: getTheme(), setTheme(), toggleTheme()
├── styles/
│   └── theme.css            # NEW: :root and :root[data-theme="light"] variables
└── i18n/
    └── ui.ts                # MODIFIED: add 2 keys per language

tests/
├── unit/
│   └── theme.test.ts        # NEW
└── e2e/
    └── dark-mode.spec.ts    # NEW
```

## Implementation Details

### 1. CSS Variables (`src/styles/theme.css`)

```css
:root {
  /* Dark theme (default) — existing values */
  --bg-primary: #0a0a0a;
  --bg-secondary: #141414;
  --accent-primary: #3b82f6;
  --accent-secondary: #8b5cf6;
  --text-primary: #f3f4f6;
  --text-secondary: #9ca3af;
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.1);
}

:root[data-theme="light"] {
  --bg-primary: #f8fafc;
  --bg-secondary: #f1f5f9;
  --accent-primary: #2563eb;
  --accent-secondary: #7c3aed;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --glass-bg: rgba(0, 0, 0, 0.03);
  --glass-border: rgba(0, 0, 0, 0.1);
}

* {
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
}
```

### 2. Anti-FOUC Script (in `Layout.astro` `<head>`)

```html
<script is:inline>
  (function() {
    try {
      var stored = localStorage.getItem('darylsh:theme');
      var theme = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      document.documentElement.dataset.theme = theme;
    } catch (e) {
      document.documentElement.dataset.theme = 'dark';
    }
  })();
</script>
```

### 3. Theme Library (`src/lib/theme.ts`)

```typescript
export type Theme = 'light' | 'dark';

export function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem('darylsh:theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return null;
}

export function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function getTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem('darylsh:theme', theme);
  } catch {}
  document.documentElement.dataset.theme = theme;
  document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === 'light' ? 'dark' : 'light';
  setTheme(next);
  return next;
}
```

### 4. ThemeToggle Component (`src/components/ThemeToggle.astro`)

```astro
---
import { getLangFromUrl, useTranslations } from "../i18n/utils";
const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const otherTheme = 'light'; // Default label, updated client-side
---
<button id="theme-toggle" class="theme-toggle" aria-label={t('nav.theme.toggle')}>
  <svg class="sun" ...><!-- sun icon --></svg>
  <svg class="moon" ...><!-- moon icon --></svg>
</button>

<script>
  import { getTheme, toggleTheme } from '../lib/theme';
  const btn = document.getElementById('theme-toggle');
  function update() {
    const theme = getTheme();
    btn?.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    btn?.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
  }
  btn?.addEventListener('click', () => { toggleTheme(); update(); });
  update();
</script>

<style>
  .theme-toggle { /* styles */ }
  :root[data-theme="light"] .theme-toggle .moon { display: none; }
  :root[data-theme="dark"] .theme-toggle .sun { display: none; }
</style>
```

## Verification

| Check | Command | Pass criteria |
|---|---|---|
| Lint | `pnpm lint` | Zero errors |
| Type check | `pnpm typecheck` | Zero errors |
| Unit tests | `pnpm test:unit` | All theme tests pass |
| E2E tests | `pnpm test:e2e` | All dark-mode tests pass |
| Build | `pnpm build` | Successful build |
| Manual | Click toggle, refresh, navigate | Theme persists, no flash |

## Risks

| Risk | Mitigation |
|---|---|
| Theme flash on first load | Inline script in `<head>` (anti-FOUC) |
| Existing tests fail due to layout shifts | Update E2E tests, take screenshots for visual regression |
| Old browsers without `matchMedia` | Graceful fallback to dark mode (current behavior) |

## Open Questions

1. **Light palette specific values**: Daryl to confirm or accept proposed slate-50/blue-600 palette.
2. **Toggle position**: Between lang-toggle and contact button — Daryl to confirm.
