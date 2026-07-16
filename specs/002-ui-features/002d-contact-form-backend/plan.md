# Implementation Plan: Contact Form Backend

**Branch**: `002d-contact-form-backend` | **Date**: 2026-07-15 | **Spec**: [./spec.md](./spec.md)

## Summary

Wire contact form to a real backend. Replace simulated `setTimeout` with actual API call. Use Resend (or alternative). Add anti-spam (honeypot + timing + rate limit).

## Technical Context

**Primary Dependencies** (new):
- `resend` npm package (4.0.0+)

**Files**:
- `src/pages/api/contact.ts` (NEW)
- `src/components/ContactForm.astro` (MODIFIED)
- `src/lib/contact.ts` (NEW — validation, sanitization)
- `src/lib/rate-limit.ts` (NEW — KV or in-memory)
- `.env.example` (NEW)
- `README.md` (MODIFIED)
- `src/pages/[lang]/aviso-privacidad.astro` or equivalent (MODIFIED — privacy note)
- `package.json` (MODIFIED — add resend)

## Constitution Check

✅ PASS

## Design Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | Use Resend as primary recommendation | Best DX, generous free tier, TypeScript SDK |
| 2 | Use Astro API route (`/api/contact.ts`) | Native Cloudflare Pages support, no extra infra |
| 3 | Honeypot field `website` | Standard, works without JS-visible bot detection |
| 4 | Timing check (min 3s on page) | Rejects instant bot submissions |
| 5 | Rate limit: 5/hour per IP via Cloudflare KV | Prevents spam, distributed, free |
| 6 | Fallback to in-memory Map for dev | No KV binding needed locally |
| 7 | CORS: same-origin only | Standard security |
| 8 | HTML escape all email content | Prevents XSS in email body |

## Project Structure

```text
src/
├── components/
│   └── ContactForm.astro   # MODIFIED
├── lib/
│   ├── contact.ts          # NEW
│   └── rate-limit.ts       # NEW
├── pages/
│   └── api/
│       └── contact.ts      # NEW
└── i18n/
    └── ui.ts               # MODIFIED

.env.example                # NEW
README.md                   # MODIFIED
package.json                # MODIFIED

tests/
├── unit/
│   ├── contact.test.ts     # NEW
│   └── rate-limit.test.ts  # NEW
└── e2e/
    └── contact-form.spec.ts # NEW
```

## Implementation Details

### 1. API Route (`src/pages/api/contact.ts`)

```typescript
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { z } from 'zod';
import { checkRateLimit } from '../../lib/rate-limit';

const ContactSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email().max(200),
    message: z.string().min(10).max(5000),
    website: z.string().optional(),
    formLoadTime: z.number().int(),
});

export const POST: APIRoute = async ({ request, clientAddress }) => {
    try {
        const body = await request.json();
        const data = ContactSchema.parse(body);

        // Honeypot: silently accept
        if (data.website) {
            return new Response(JSON.stringify({ success: true }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Timing check: min 3s on page
        if (Date.now() - data.formLoadTime < 3000) {
            return new Response(JSON.stringify({ success: true }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Rate limit: 5 per hour per IP
        const ip = clientAddress ?? 'unknown';
        const allowed = await checkRateLimit(ip, 5, 3600);
        if (!allowed) {
            return new Response(
                JSON.stringify({ error: 'rate_limited' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Send email via Resend
        const resend = new Resend(import.meta.env.RESEND_API_KEY);
        const { error } = await resend.emails.send({
            from: 'noreply@daryl.sh',
            to: import.meta.env.CONTACT_TO,
            reply_to: data.email,
            subject: `[daryl.sh] New message from ${data.name}`,
            html: formatEmail(data),
            text: formatEmailText(data),
        });

        if (error) {
            console.error('Resend error:', error);
            return new Response(
                JSON.stringify({ error: 'send_failed' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (err) {
        if (err instanceof z.ZodError) {
            return new Response(
                JSON.stringify({ error: 'invalid', issues: err.issues }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
        console.error('Contact form error:', err);
        return new Response(
            JSON.stringify({ error: 'server_error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

function formatEmail(data: { name: string; email: string; message: string }): string {
    const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ 
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' 
    }[c]!));
    return `
        <h2>New message from daryl.sh contact form</h2>
        <p><strong>Name:</strong> ${escape(data.name)}</p>
        <p><strong>Email:</strong> ${escape(data.email)}</p>
        <p><strong>Message:</strong></p>
        <pre>${escape(data.message)}</pre>
    `;
}

function formatEmailText(data: { name: string; email: string; message: string }): string {
    return `New message from daryl.sh contact form\n\nName: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`;
}
```

### 2. Rate Limiter (`src/lib/rate-limit.ts`)

```typescript
const STORE = new Map<string, number[]>();
const MAX_KEYS = 10000;

export async function checkRateLimit(
    ip: string,
    max: number,
    windowSeconds: number
): Promise<boolean> {
    // Try Cloudflare KV first (production)
    if (typeof globalThis.KV_BINDING !== 'undefined') {
        // Production path: use Cloudflare KV
        const kv = (globalThis as any).CONTACT_RATE_LIMIT as KVNamespace;
        const key = `ratelimit:${ip}`;
        const now = Date.now();
        const windowMs = windowSeconds * 1000;
        const data = await kv.get(key, 'json') as { count: number; resetAt: number } | null;
        
        if (!data || now > data.resetAt) {
            await kv.put(key, JSON.stringify({ count: 1, resetAt: now + windowMs }), {
                expirationTtl: windowSeconds,
            });
            return true;
        }
        
        if (data.count >= max) {
            return false;
        }
        
        await kv.put(key, JSON.stringify({ count: data.count + 1, resetAt: data.resetAt }), {
            expirationTtl: Math.ceil((data.resetAt - now) / 1000),
        });
        return true;
    }

    // Dev fallback: in-memory Map
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const record = STORE.get(ip) ?? [];
    const recent = record.filter((t) => now - t < windowMs);
    
    if (recent.length >= max) {
        return false;
    }
    
    recent.push(now);
    STORE.set(ip, recent);
    
    // Cleanup if Map grows too large
    if (STORE.size > MAX_KEYS) {
        const oldestKey = STORE.keys().next().value;
        if (oldestKey) STORE.delete(oldestKey);
    }
    
    return true;
}
```

### 3. Frontend (`src/components/ContactForm.astro`)

```astro
---
import { getLangFromUrl, useTranslations } from "../i18n/utils";
const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const formLoadTime = Date.now();
---

<section class="contact-section container">
    <div class="header">
        <h2>{t("contact.title")}</h2>
        <p>{t("contact.description")}</p>
    </div>

    <div class="glass form-container">
        <form id="contact-form" data-load-time={formLoadTime}>
            <!-- Honeypot: hidden from humans, visible to bots -->
            <div class="honeypot" aria-hidden="true">
                <label for="website">Website (leave blank)</label>
                <input type="text" id="website" name="website" tabindex="-1" autocomplete="off" />
            </div>

            <div class="input-group">
                <label for="name">{t("contact.name")}</label>
                <input type="text" id="name" name="name" required minlength="1" maxlength="100" placeholder="John Doe" />
            </div>
            <div class="input-group">
                <label for="email">{t("contact.email")}</label>
                <input type="email" id="email" name="email" required placeholder="john@example.com" />
            </div>
            <div class="input-group">
                <label for="message">{t("contact.message")}</label>
                <textarea id="message" name="message" rows="5" required minlength="10" maxlength="5000"></textarea>
            </div>
            <button type="submit" class="btn-submit">
                {t("contact.send")}
                <span class="loader hidden"></span>
            </button>
            <p id="form-status" class="hidden" role="status" aria-live="polite"></p>
        </form>
    </div>
</section>

<script>
    const form = document.getElementById("contact-form") as HTMLFormElement;
    const status = document.getElementById("form-status");
    const button = form?.querySelector("button[type=submit]") as HTMLButtonElement;
    const loader = button?.querySelector(".loader");

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!form || !status || !button) return;

        // Disable button, show loader
        button.disabled = true;
        loader?.classList.remove("hidden");
        status.classList.remove("hidden");
        status.textContent = "Enviando...";

        const formData = new FormData(form);
        const loadTime = parseInt(form.dataset.loadTime || "0", 10);
        
        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.get("name"),
                    email: formData.get("email"),
                    message: formData.get("message"),
                    website: formData.get("website") || "",
                    formLoadTime: loadTime,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                status.textContent = "¡Mensaje enviado con éxito! Te responderé pronto.";
                form.reset();
            } else if (response.status === 429) {
                status.textContent = "Has enviado demasiados mensajes. Intenta de nuevo en 1 hora.";
            } else {
                status.innerHTML = 'Lo sentimos, hubo un error. Envíame un email a <a href="mailto:daryl@example.com">daryl@example.com</a>.';
            }
        } catch (err) {
            status.innerHTML = 'Error de red. Envíame un email a <a href="mailto:daryl@example.com">daryl@example.com</a>.';
        } finally {
            button.disabled = false;
            loader?.classList.add("hidden");
        }
    });
</script>

<style>
    .honeypot {
        position: absolute;
        left: -9999px;
        width: 1px;
        height: 1px;
        overflow: hidden;
    }
    /* existing styles */
</style>
```

### 4. Environment Configuration (`.env.example`)

```bash
# Resend API key for sending emails (https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Email address to receive contact form submissions
CONTACT_TO=daryl@example.com
```

## Verification

| Check | Pass criteria |
|---|---|
| Lint/typecheck/test:unit/test:e2e/build | All pass |
| Form submits to `/api/contact` (not simulated) | No `setTimeout`, no "(Simulated)" text |
| Daryl receives real email in inbox | Manual test with real form submission |
| Honeypot rejects bot submissions | Test: fill `website` field, verify 200 OK but no email |
| Rate limit works | Test: 6 quick submissions, 6th returns 429 |
| Validation works | Test: empty form, invalid email, all return 400 |
| Secrets not in git | `git log -p \| grep RESEND_API_KEY` returns nothing |

## Risks

| Risk | Mitigation |
|---|---|
| RESEND_API_KEY leaked | Never commit `.env`, add to `.gitignore`, document in README |
| Spam bypasses honeypot | Add ReCaptcha later if needed; rate limit reduces blast radius |
| Resend service outage | Document fallback to `mailto:` link in error message |
| Email deliverability issues | Test with multiple providers, configure SPF/DKIM if needed |

## Open Questions

1. **Provider**: Resend (recommended) vs Cloudflare Email Workers vs Formspree (BLOCKER — T040)
2. **Daryl's email address**: ✅ **RESOLVED** — `darylemb@pm.me` (Proton Mail)
3. **Rate limit values**: 5/hour — too strict or too lenient?
4. **Auto-responder**: Add auto-reply to visitor?
