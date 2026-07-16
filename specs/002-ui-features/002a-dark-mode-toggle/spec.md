# Feature Specification: Dark Mode Toggle

**Feature Branch**: `002a-dark-mode-toggle`

**Created**: 2026-07-15

**Status**: Draft

**Parent spec**: [../spec.md](../spec.md)

**Input**: User description: "El sitio está forzado a dark mode, quiero un toggle para alternar entre light y dark, con persistencia."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor toggles theme (Priority: P1)

As a visitor on a bright screen, I want to click a toggle and switch the site from dark to light mode so I can read content comfortably.

**Independent Test**: Load the homepage, click the theme toggle in the navbar, observe the background switches from `#0a0a0a` to the light equivalent. Refresh, verify choice persists.

**Acceptance Scenarios**:
1. **Given** I am on any page, **When** I click the theme toggle in the navbar, **Then** the page switches between light and dark themes within 200ms
2. **Given** I have selected a theme, **When** I refresh the page, **Then** my selection persists via `localStorage`
3. **Given** I navigate to a different page, **When** the new page loads, **Then** my theme selection is preserved (no flash of the wrong theme)
4. **Given** I have never visited the site, **When** I load any page, **Then** the theme matches my OS preference (`prefers-color-scheme`)
5. **Given** I am on light mode, **When** I view any text, **Then** the contrast ratio meets WCAG AA (4.5:1 for normal text, 3:1 for large text)

## Edge Cases

- **`localStorage` unavailable** (private browsing in Safari): Falls back to OS preference, no persistence, no error shown
- **Stale theme key** in localStorage (e.g., "invalid"): Invalid values are ignored, OS preference is used
- **First paint flash**: An inline `<script>` in `<head>` applies the theme class before CSS loads (anti-FOUC)
- **Hydration mismatch** in SSR/SSG: The theme is applied client-side; server always renders with `class=""` (light or system-default) and the client script adjusts before paint
- **Astro View Transitions** (if enabled in future): Theme class must be on `<html>` element, not `<body>`, to survive transitions

## Functional Requirements

### FR-1: Theme toggle UI
- A button in the Navbar component (`src/components/Navbar.astro`) showing the icon for the *opposite* of the current theme (sun icon when in dark, moon icon when in light)
- Button has `aria-label` that updates dynamically: "Switch to light mode" / "Switch to dark mode"
- Button has `aria-pressed` attribute reflecting current state
- Keyboard accessible: focusable with Tab, activatable with Enter/Space
- Visible focus ring (already part of `:focus-visible` global style)

### FR-2: Theme CSS variables
- Define a `:root` block with dark mode variables (current values)
- Define a `:root.light` block (or `:root[data-theme="light"]`) with light mode equivalents
- Light mode palette (proposed):
  - `--bg-primary: #f8fafc` (slate-50)
  - `--bg-secondary: #f1f5f9` (slate-100)
  - `--text-primary: #0f172a` (slate-900)
  - `--text-secondary: #475569` (slate-600)
  - `--accent-primary: #2563eb` (blue-600, slightly darker for AA on light)
  - `--accent-secondary: #7c3aed` (violet-600)
  - `--glass-bg: rgba(0, 0, 0, 0.03)`
  - `--glass-border: rgba(0, 0, 0, 0.1)`
- Smooth transition on color/background-color/border-color (0.2s ease) — already exists in some places, ensure consistent

### FR-3: Theme persistence
- Use `localStorage` key: `darylsh:theme`
- Values: `"light"` or `"dark"`
- Read on every page load via inline script in `<head>`
- Write on toggle click
- No cookie usage

### FR-4: System preference detection
- Use `window.matchMedia('(prefers-color-scheme: dark)')`
- Only checked when no `localStorage` value exists
- Listen for `change` events to update theme if user hasn't explicitly chosen (no override = follow system)

### FR-5: Anti-FOUC
- Inline `<script is:inline>` in `<Layout.astro` `<head>` runs before stylesheet load
- Script reads `localStorage` or `prefers-color-scheme` and sets `<html data-theme="...">` immediately
- No flash of incorrect theme on page load or refresh

### FR-6: Astro integration
- Theme is a client-side concern; SSR/SSG always emits `<html lang="es" data-theme="">` (no default; client fills it)
- No new dependencies required
- No new build configuration required

## Non-Functional Requirements

### NFR-1: Performance
- Theme toggle response: < 50ms (perceived, measured by Core Web Vitals)
- Inline script size: < 500 bytes
- No additional HTTP requests
- No CLS (Cumulative Layout Shift) when theme changes

### NFR-2: Accessibility
- WCAG 2.1 AA contrast in both themes
- Keyboard navigable
- Screen reader announces theme state
- `prefers-reduced-motion` respected (no animation when transitioning themes for users who prefer reduced motion)

### NFR-3: Browser support
- Modern browsers (Chrome/Edge 90+, Firefox 88+, Safari 14+)
- Graceful degradation: in browsers without `matchMedia`, default to dark mode (current behavior)

## Out of Scope

- Multiple themes (sepia, high-contrast, etc.) — only light/dark
- Theme scheduling (auto-switch by time of day)
- Per-page theme overrides
- Theme color picker UI

## Open Questions

1. **Light palette specific values**: Daryl to confirm or accept proposed slate-50/blue-600 palette. **Blocks**: implementation.
2. **Toggle position in Navbar**: Currently the navbar has `lang-toggle` and `contact` button. Where should theme toggle go? Proposed: between `lang-toggle` and `contact` button. **Blocks**: visual mockup.

## Success Criteria

- Toggle works in all major browsers
- Theme persists across refreshes
- No FOUC on any page
- Lighthouse Accessibility score remains ≥ 95
- Unit tests cover the theme detection logic
- E2E tests cover the toggle interaction
