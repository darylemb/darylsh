# Tasks: Contact Form Backend

**Input**: [`./plan.md`](./plan.md)
**Branch**: `002d-contact-form-backend`

## Phase 1: Setup

- [ ] T001 [P] **BLOCKER**: Daryl chooses provider (Resend, Cloudflare Email Workers, or Formspree) — see T040 in umbrella tasks.md
- [ ] T002 [P] Create branch `002d-contact-form-backend` from main (after 002c merged)
- [ ] T003 [P] **Email address confirmed**: `darylemb@pm.me` (Proton Mail) — set as `CONTACT_TO` env var
- [ ] T004 [P] Add new i18n keys to `src/i18n/ui.ts`:
  - `contact.sending` = "Enviando..." / "Sending..."
  - `contact.success` = "¡Mensaje enviado con éxito! Te responderé pronto." / "Message sent successfully! I'll reply soon."
  - `contact.error_generic` = "Lo sentimos, hubo un error." / "Sorry, there was an error."
  - `contact.error_network` = "Error de red." / "Network error."
  - `contact.error_rate_limit` = "Has enviado demasiados mensajes. Intenta de nuevo en 1 hora." / "You've sent too many messages. Try again in 1 hour."
  - `contact.fallback` = "Envíame un email a {email}." / "Email me at {email}."

## Phase 2: Dependencies

- [ ] T004 [P] Install provider SDK: `pnpm add resend` (or alternative)
- [ ] T005 [P] Add `zod` to dependencies if not already: `pnpm add zod`
- [ ] T006 [P] Create `.env.example` with `RESEND_API_KEY` and `CONTACT_TO`
- [ ] T007 Verify `.env` is in `.gitignore` (should be by default)

## Phase 3: Backend Implementation

- [ ] T008 Create `src/lib/contact.ts` with validation schema and email formatting helpers
- [ ] T009 Create `src/lib/rate-limit.ts` with Cloudflare KV + in-memory fallback
- [ ] T010 [P] Write unit tests in `tests/unit/contact.test.ts`:
  - Validation accepts valid input
  - Validation rejects empty name, email, message
  - Validation rejects invalid email format
  - Email formatter escapes HTML
  - Text formatter does not escape
- [ ] T011 [P] Write unit tests in `tests/unit/rate-limit.test.ts`:
  - Allows first request
  - Allows up to max
  - Rejects after max
  - Resets after window
  - Different IPs have separate counters
- [ ] T012 Create `src/pages/api/contact.ts` with POST handler:
  - Validate input with Zod
  - Check honeypot (silent 200)
  - Check timing (silent 200 if too fast)
  - Check rate limit (429 if exceeded)
  - Send email via provider
  - Return success/error JSON

## Phase 4: Frontend Updates

- [ ] T013 Update `src/components/ContactForm.astro`:
  - Remove simulated `setTimeout` and "(Simulated)" text
  - Add hidden honeypot field
  - Capture `formLoadTime` in dataset
  - Fetch `/api/contact` on submit
  - Show loading state (disable button, spinner)
  - Handle success, error, rate limit responses
  - Show fallback `mailto:` link on error

## Phase 5: Privacy

- [ ] T014 Update privacy page (`src/pages/[lang]/aviso-privacidad.astro` or equivalent) to mention:
  - Contact form data handling
  - Email retention
  - IP address logging (for rate limiting, 24h retention)

## Phase 6: Tests

- [ ] T015 [P] Write E2E test in `tests/e2e/contact-form.spec.ts`:
  - Submit valid form → success message
  - Submit empty form → browser validation
  - Submit with honeypot filled → silent 200, no email (mock)
  - Submit very fast → silent 200, no email
  - Submit 6 times quickly → 6th returns 429
  - Network error → fallback message
- [ ] T016 Mock the API route in tests (no real email sent)

## Phase 7: Documentation

- [ ] T017 Update `README.md` with:
  - How to get Resend API key
  - How to set env vars locally
  - How to set env vars in Cloudflare Pages
  - How to test contact form locally
- [ ] T018 Document honeypot and rate limit in README

## Phase 8: Verification

- [ ] T019 Run `pnpm lint` — zero errors
- [ ] T020 Run `pnpm typecheck` — zero errors
- [ ] T021 Run `pnpm test:unit` — all pass
- [ ] T022 Run `pnpm test:e2e` — all pass (with mocked backend)
- [ ] T023 Run `pnpm build` — successful
- [ ] T024 Set up Resend account, get API key
- [ ] T025 Configure Cloudflare Pages env vars (production)
- [ ] T026 Manual: submit real form, verify email arrives in Daryl's inbox
- [ ] T027 Verify honeypot and timing work in production
- [ ] T028 Verify rate limit works in production
- [ ] T029 Verify `git log -p | grep RESEND_API_KEY` returns nothing
- [ ] T030 Create PR `002d-contact-form-backend` → main

## Total: 30 tasks
