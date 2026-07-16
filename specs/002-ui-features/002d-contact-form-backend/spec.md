# Feature Specification: Contact Form with Real Backend

**Feature Branch**: `002d-contact-form-backend`

**Created**: 2026-07-15

**Status**: Draft

**Parent spec**: [../spec.md](../spec.md)

**Input**: User description: "El form está simulado. Necesita backend real para que Daryl reciba los mensajes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor sends a real message (Priority: P2)

As a recruiter or potential client, I want to send a message through the contact form and receive confirmation that it was delivered so I know Daryl will receive it.

**Independent Test**: Fill out the form, submit, check Daryl's email inbox receives a message with the submitted content within 30 seconds.

**Acceptance Scenarios**:
1. **Given** I have filled in all required fields, **When** I click "Enviar mensaje", **Then** the form submits to a real backend (not simulated)
2. **Given** the submission succeeds, **When** the response arrives, **Then** I see a success message without the "(Simulated)" text
3. **Given** the submission is in progress, **When** the request is pending, **Then** the submit button is disabled and shows a loading state
4. **Given** the submission fails (network error), **When** the error response arrives, **Then** I see a clear error message in the same language as the page and the form remains filled
5. **Given** Daryl receives a message, **When** he replies, **Then** the reply goes to the email address the visitor submitted (Reply-To header)

### User Story 2 - Bot is silently rejected (Priority: P2)

As a site owner, I want spam bots to be silently rejected so my inbox is not flooded.

**Independent Test**: Submit the form with the honeypot field filled, verify the response is 200 OK but no email is sent.

**Acceptance Scenarios**:
1. **Given** I am a bot, **When** I fill the hidden `website` honeypot field and submit, **Then** the backend returns 200 OK but no email is sent
2. **Given** I am a bot, **When** I submit without JavaScript enabled, **Then** the honeypot field is visible in the DOM (not display:none, which bots can detect)
3. **Given** I submit too quickly (< 3 seconds after page load), **When** the form submits, **Then** the backend rejects the submission as likely-bot

### User Story 3 - Visitor sees error states (Priority: P2)

As a visitor, I want clear error messages so I know what to fix.

**Acceptance Scenarios**:
1. **Given** I submit an empty form, **When** the browser validates, **Then** required fields show the native HTML5 validation error
2. **Given** I submit an invalid email, **When** the browser validates, **Then** the email field shows an error
3. **Given** the backend is down, **When** I submit, **Then** I see "Lo sentimos, el servicio no está disponible. Envíame un email a daryl@example.com" with a `mailto:` link
4. **Given** the rate limit is exceeded, **When** I submit, **Then** I see "Has enviado demasiados mensajes. Intenta de nuevo en 1 hora."

## Edge Cases

- **Very long message (>10KB)**: Backend rejects with 413 Payload Too Large
- **HTML in message body**: Backend escapes HTML (or treats as plain text)
- **Multiple submissions in quick succession**: Rate limited to 5 per IP per hour
- **Submission from Tor exit node**: Flagged for manual review, not blocked (Daryl's call)
- **Email deliverability failure** (e.g., Daryl's mailbox full): Backend logs the error but returns 200 to the user (Daryl checks logs)

## Functional Requirements

### FR-1: Provider choice
- **Primary recommendation**: **Resend** (transactional email API, free tier 3K/mo, great DX, TypeScript SDK)
- **Alternative**: Cloudflare Workers + Email Workers (more setup, but free, no third-party)
- **Alternative**: Formspree (easiest, free tier 50/mo, but limited customization)
- **Daryl to choose**. Spec is written assuming Resend, with notes for switching to alternatives.

### FR-2: Frontend changes
- Remove the simulated `setTimeout` and `(Simulated)` text in `src/components/ContactForm.astro`
- Add fetch to backend endpoint
- Handle 3 states: idle, submitting, success/error
- Show loading spinner during submit
- Disable submit button during submit
- Reset form on success
- Keep form values on error (allow retry)
- Error message in same language as page (ES or EN)

### FR-3: Backend endpoint
- New file: `src/pages/api/contact.ts` (Astro API route)
- Accepts POST with JSON body: `{ name, email, message, website? }`
- Validates: name (1-100 chars), email (valid format), message (1-5000 chars), website (must be empty for human)
- Time check: rejects if `Date.now() - formLoadTime < 3000` (bot detection)
- Rate limit: 5 submissions per IP per hour (use Cloudflare KV or in-memory map)
- Honeypot check: if `website` is non-empty, return 200 but skip email
- If all checks pass: send email via Resend API
- Returns: `{ success: true }` on 200, `{ error: "message" }` on 4xx/5xx

### FR-4: Email content
- From: `noreply@daryl.sh` (or similar)
- To: Daryl's email (configurable via env var `CONTACT_TO`)
- Reply-To: visitor's email
- Subject: `[daryl.sh] New message from {name}`
- Body: HTML template with name, email, message, submission timestamp, IP, user agent
- Plain text alternative included

### FR-5: Environment configuration
- New env var: `RESEND_API_KEY` (required, build/runtime)
- New env var: `CONTACT_TO` (Daryl's email, e.g. `daryl@example.com`)
- Document in `README.md` and `.env.example`
- **DO NOT commit secrets** to git

### FR-6: Security
- CORS: only same-origin allowed
- CSRF: not needed (same-origin POST)
- Input sanitization: HTML escape all strings before email body
- Rate limit: per IP, 5/hour (configurable)
- Honeypot: silent rejection
- Bot timing check: minimum 3 seconds on page

### FR-7: Deployment
- Cloudflare Pages supports Astro API routes (since Astro 3.0)
- Env vars set in Cloudflare Pages dashboard
- Build command: `pnpm build` (no changes)
- Output: `_astro/`, `api/`, `_redirects` etc.

## Non-Functional Requirements

### NFR-1: Performance
- API response time: < 1.5s (p95)
- Resend API call: < 500ms (typical)
- Total user-perceived latency: < 2s
- No cold starts (Cloudflare Pages workers stay warm)

### NFR-2: Reliability
- API route handles errors gracefully (no 500 to user on transient failures)
- Email send failures are logged but not surfaced to user (Daryl checks logs)
- Rate limit errors return 429 with retry-after header

### NFR-3: Cost
- Cloudflare Pages: free (within limits)
- Resend free tier: 3,000 emails/month, 100/day — more than enough for a portfolio
- No ongoing cost

### NFR-4: Privacy
- Visitor email is used only to deliver the message and is not stored
- IP address is logged for rate limiting and abuse prevention, retained for 24h
- Compliance: add a note in the privacy page (`/es/aviso-privacidad`) about the contact form and data retention

## Out of Scope

- File attachments in messages
- ReCaptcha (relying on honeypot + timing for now)
- Auto-responder ("Thanks for your message, I'll reply within 24h")
- Dashboard to view messages (Daryl reads them in his inbox)
- Slack/Discord notification on new message

## Open Questions

1. **Provider choice**: Resend (recommended), Cloudflare Email Workers, or Formspree? **Owner**: Daryl. **Blocks**: implementation.
2. **Daryl's email address**: What goes in `CONTACT_TO`? **Owner**: Daryl. **Blocks**: env config.
3. **Rate limit values**: 5/hour per IP — too strict or too lenient? **Owner**: Daryl.
4. **Auto-responder**: Add a "Thanks, I'll reply within X" auto-reply to the visitor? **Owner**: Daryl.

## Success Criteria

- Form submits to real backend (no simulation text)
- Daryl receives the message in his inbox within 30 seconds
- Bot submissions are silently rejected
- Rate limit enforced
- E2E test: submit form, verify backend receives correct payload
- Manual verification: send a real message, confirm delivery
- Lighthouse score maintained
- Secrets not in git history
