# Tasks: Dark Mode Toggle

**Input**: Design from [`./plan.md`](./plan.md)
**Branch**: `002a-dark-mode-toggle`
**Spec**: [`./spec.md`](./spec.md)

## Phase 1: Setup

- [ ] T001 [P] Create branch `002a-dark-mode-toggle` from main
- [ ] T002 [P] Add new i18n keys to `src/i18n/ui.ts`:
  - `nav.theme.toggle` = "Cambiar tema" / "Toggle theme"
  - `nav.theme.toggle_to_light` = "Cambiar a modo claro" / "Switch to light mode"
  - `nav.theme.toggle_to_dark` = "Cambiar a modo oscuro" / "Switch to dark mode"

## Phase 2: Implementation

- [ ] T003 [P] Create `src/styles/theme.css` with `:root` and `:root[data-theme="light"]` blocks
- [ ] T004 Create `src/lib/theme.ts` with `getTheme()`, `setTheme()`, `toggleTheme()`, `getStoredTheme()`, `getSystemTheme()`
- [ ] T005 Add anti-FOUC inline `<script is:inline>` in `src/layouts/Layout.astro` `<head>`
- [ ] T006 [P] Create `src/components/ThemeToggle.astro` component with sun/moon icons
- [ ] T007 Integrate `<ThemeToggle />` in `src/components/Navbar.astro` (between lang-toggle and contact button)
- [ ] T008 Import `theme.css` in `src/layouts/Layout.astro`
- [ ] T009 [P] Update `src/styles/global.css` (or Layout.astro global style) to import theme.css

## Phase 3: Tests

- [ ] T010 [P] Write unit tests in `tests/unit/theme.test.ts`:
  - `getStoredTheme()` returns null if not set
  - `getStoredTheme()` returns valid value if set
  - `getStoredTheme()` returns null for invalid value
  - `getTheme()` returns system theme if no stored
  - `getTheme()` returns stored theme if set
  - `setTheme()` updates DOM and localStorage
  - `toggleTheme()` flips between light and dark
- [ ] T011 [P] Write E2E test in `tests/e2e/dark-mode.spec.ts`:
  - Default theme matches `prefers-color-scheme`
  - Click toggle switches theme
  - Refresh persists theme
  - Navigate to other page preserves theme
  - Light mode has light background
  - No FOUC (check first paint color)
- [ ] T012 Update existing E2E tests (if any) to account for theme variable

## Phase 4: Verification

- [ ] T013 Run `pnpm lint` — zero errors
- [ ] T014 Run `pnpm typecheck` — zero errors
- [ ] T015 Run `pnpm test:unit` — all pass
- [ ] T016 Run `pnpm test:e2e` — all pass
- [ ] T017 Run `pnpm build` — successful build
- [ ] T018 Manual smoke test: click toggle, refresh, navigate, test in 3+ pages
- [ ] T019 Visual check: light theme looks good, contrast meets WCAG AA
- [ ] T020 Verify `prefers-reduced-motion` disables transitions

## Phase 5: Documentation & PR

- [ ] T021 Take screenshots of both themes (light + dark) in light and dark browser settings
- [ ] T022 Update `README.md` with theme toggle feature
- [ ] T023 Create PR `002a-dark-mode-toggle` → main with:
  - Description
  - Screenshots
  - Link to spec
  - Test results

## Total: 23 tasks
