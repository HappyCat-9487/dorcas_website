# Dorcas Website — Development, Testing & Compliance Guide

This document is written in English for reference and onboarding. It covers practical testing workflow, optional tooling (Vitest, Sentry), and a **personal data (個資) compliance checklist** you still need to complete outside the codebase.

---

## 1. Pre-launch manual checklist

Run through this list before each meaningful release (or weekly if you ship often).

### Visitor-facing

- [ ] Homepage loads (featured tours, latest news if any, social icons, search).
- [ ] Homepage search (dates, keywords, destination) returns sensible results.
- [ ] Destination flow works (e.g. Europe → sub-region → tour list → tour detail).
- [ ] Tour detail: tabs, registration button states (available vs full).
- [ ] Registration form: validation, honeypot, successful submit.
- [ ] LINE notification received after inquiry / registration (if configured).
- [ ] AI chat: basic FAQ answer; IME (注音) Enter does not accidentally send mid-composition.

### Admin

- [ ] Login / logout.
- [ ] Create or edit tour: cover upload + crop, save, publish.
- [ ] Registrations: confirm / cancel / delete; CSV export — open in Excel and confirm phone numbers keep leading `0`.
- [ ] AI FAQ: create or edit entry; optional “publish to homepage news”; verify homepage and AI behavior.
- [ ] Site settings / hero images upload if you use them.

### Devices

- [ ] Mobile Safari (iOS) — key pages.
- [ ] Desktop Chrome (or your primary browser).

---

## 2. What is Vitest? Do I write unit tests myself?

**Vitest** is a **test runner for JavaScript/TypeScript**. It discovers files like `*.test.ts`, runs them, and reports pass/fail. It is similar to Jest but fits modern Vite/Next projects well.

- **“Unit test”** means: you write small functions that call your code with fixed inputs and `expect(...)` certain outputs. **You (or your team) write those tests** — the tool does not invent tests for you.
- **You do not have to use Vitest** to ship. For an early-stage site, a **manual checklist** (above) often delivers more value per hour than 100% automated coverage.
- **When Vitest is worth it:** pure logic with no database — e.g. date helpers, CSV escaping, snippet truncation, capacity calculations. Start with **5–20 tests** for the most bug-prone helpers, not for every React component.

Example shape (conceptual):

```ts
import { describe, it, expect } from "vitest";
import { somePureFunction } from "@/lib/somewhere";

describe("somePureFunction", () => {
  it("returns expected value for edge case", () => {
    expect(somePureFunction("input")).toBe("output");
  });
});
```

Install (only if you choose to adopt it): `pnpm add -D vitest` and add a `test` script in `package.json`. Official docs: [https://vitest.dev](https://vitest.dev).

---

## 3. Sentry — benefits explained

**Sentry** is an **error and performance monitoring** service for production apps. Your Next.js server and browser send **crash reports** and **context** when something fails.

### What you get

1. **Real errors from real users**  
   You see stack traces, URL, browser, and often the release version — not only “something broke on my phone.”

2. **Grouping**  
   Many users hitting the same bug appear as **one issue** with a count, so you fix the worst problems first.

3. **Alerts**  
   Email or Slack when error rate spikes or a new error type appears after a deploy.

4. **Breadcrumbs (optional)**  
   A short trail of events before the crash (e.g. navigation, button clicks) to reproduce tricky bugs.

5. **Performance (optional)**  
   Slow API routes or slow pages can be traced (depends on plan and setup).

### What Sentry is not

- It does **not** replace manual QA or automated tests.
- It does **not** fix bugs; it **surfaces** them so you can fix faster after launch.

### Privacy note

Sentry may receive URLs and limited user context. **Do not send secrets, full form bodies, or raw passport numbers** in custom context. Use their scrubbing / PII rules in the SDK configuration.

Official site: [https://sentry.io](https://sentry.io).

---

## 4. Personal data compliance (個資) — what you still need to do

The codebase can enforce **technical** measures (HTTPS, RLS, server-side validation, admin auth). **Legal and policy text** is your responsibility as the business operator.

### Typically still required (Taiwan PDPA-oriented checklist)

| Item | Status | Your action |
|------|--------|-------------|
| **Privacy policy page** (隱私權政策) | Usually missing until you add it | Publish a page (e.g. `/privacy`) stating: what data you collect (name, phone, passport, etc.), purpose (tour booking), retention, how users request access/deletion, contact email. |
| **Terms of service** (optional but common) | Optional | `/terms` if you want booking rules and liability limits (lawyer review recommended for serious use). |
| **Consent at collection** | Partially in forms | Ensure checkboxes clearly state purpose (e.g. “for this registration only”) and link to the privacy policy. |
| **Data retention & deletion** | Operational | Define how long you keep registrations after the trip; process for user asking to delete data (email + manual delete in Supabase, or a future admin tool). |
| **Subprocessors disclosure** | If you use Supabase, Vercel, LINE, OpenAI | List them in the privacy policy (“we use … for hosting / messaging / AI”). |
| **AI-specific notice** | If chat sends data to OpenAI | Short notice that AI chat may process questions; no need to send passport in chat. |
| **Security** | Ongoing | Strong admin passwords, 2FA on Supabase/GitHub, `.env` never committed, RLS reviewed periodically. |

### What “fill in” means

- **You** (or a lawyer) write the **actual policy text** and **company name, address, contact email**.
- **Developers** wire the **footer link** to `/privacy` and ensure forms reference it.

This document is **not legal advice**. For a travel agency handling passport numbers, a **short consult with a Taiwan lawyer** familiar with PDPA is often worthwhile.

---

## 5. Supabase migration standard format

Starting **October 30, 2026**, Supabase will stop automatically granting Data API access to new tables in the `public` schema. Your existing tables are **not** affected — only tables created **after** the cutoff need explicit `GRANT` statements.

Every future migration that creates a new table should follow this template:

```sql
-- ── 1. Create the table ──────────────────────────────────────────────
create table if not exists public.example (
    id         uuid primary key default gen_random_uuid(),
    name       text not null,
    created_at timestamptz not null default now()
);

-- ── 2. Grant Data API access (NEW — required after 2026-10-30) ──────
-- Choose the minimum privileges each role actually needs.

-- Public visitors (anon) — read-only in most cases:
grant select on public.example to anon;

-- Logged-in users — adjust per table:
grant select on public.example to authenticated;

-- Admin / server-side — full access:
grant all on public.example to service_role;

-- ── 3. Enable Row Level Security (same as before) ───────────────────
alter table public.example enable row level security;

-- ── 4. Create RLS policies (same as before) ─────────────────────────
create policy "anyone can read example"
    on public.example for select to anon, authenticated
    using (true);
```

### Quick-reference: common grant patterns

| Use case | Grant statement |
|----------|-----------------|
| Public read-only (FAQ, tours, news) | `grant select on public.xxx to anon, authenticated;` |
| Visitor can submit (inquiry, registration) | `grant select, insert on public.xxx to anon;` |
| Authenticated users read/write (member data) | `grant select, insert, update, delete on public.xxx to authenticated;` |
| Admin-only (no public API access) | `grant all on public.xxx to service_role;` (no anon/authenticated grant) |

### What about our existing 15 migrations?

They **do not** need to be modified. Supabase preserves grants for tables that already exist. Only add `GRANT` lines to **new** migrations going forward.

### Altering existing tables (adding columns)

`ALTER TABLE ... ADD COLUMN` does **not** need a new `GRANT` — column-level access inherits from the table-level grant that already exists.

---

## 6. Vitest basic setup (optional — when you're ready)

Below is a minimal configuration you can copy when you decide to add automated tests. There is no rush — the manual checklist (section 1) is more important at this stage.

### Install

```bash
pnpm add -D vitest @vitejs/plugin-react
```

### Create `vitest.config.ts` in the project root

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

### Add a script to `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### Write your first test

Create a file next to the code it tests, e.g. `src/lib/tour-dates.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeTripDays } from "./tour-dates";

describe("computeTripDays", () => {
  it("counts inclusive days between two dates", () => {
    expect(computeTripDays("2026-05-01", "2026-05-03")).toBe(3);
  });

  it("returns null when start is missing", () => {
    expect(computeTripDays(null, "2026-05-03")).toBeNull();
  });

  it("returns 1 for same-day trip", () => {
    expect(computeTripDays("2026-05-01", "2026-05-01")).toBe(1);
  });
});
```

### Run

```bash
pnpm test
```

### What to test first (priority order)

1. Date/duration helpers (`src/lib/tour-dates.ts`)
2. CSV escaping (`asText`, `csvCell` in the export route)
3. Markdown-to-snippet conversion (`toSnippet` in `src/lib/news.ts`)
4. Capacity/availability logic (`src/lib/registration-status.ts`)

Do **not** test React components or pages with Vitest at this stage — that requires extra setup (jsdom, mocking) and gives less value per hour.

---

## 7. Feature flag: registration gating

The registration form collects highly sensitive PII (passport, national ID). Until the privacy policy is finalized and approved by management, registration is **gated behind a feature flag** so the site can go live without legal risk.

### How it works

| Environment variable | Effect |
|----------------------|--------|
| `NEXT_PUBLIC_ENABLE_REGISTRATION=true` | Full registration — 報名 buttons link to the form |
| `NEXT_PUBLIC_ENABLE_REGISTRATION=false` | Registration hidden — buttons show "即將開放" (greyed out) |

The flag is checked in four places:

1. **StatusCell** in `/groups` table → shows "即將開放" pill
2. **DepartureTable** in tour detail → shows "即將開放" pill
3. **`/tours/[slug]/register` page** → redirects to the tour page
4. **`submitRegistration` server action** → rejects with error message

### Local demo (everything works)

In `.env.local`:
```
NEXT_PUBLIC_ENABLE_REGISTRATION=true
```

### Production V1 (registration hidden)

In Vercel environment variables:
```
NEXT_PUBLIC_ENABLE_REGISTRATION=false
```

### When privacy policy is approved

Change the Vercel env var to `true` → redeploy → registration goes live. Zero code changes needed.

### What is NOT gated

These features work normally in production V1:

- Browsing tours, destinations, search
- AI chat (no structured PII collected)
- Inquiry form (collects only name, phone, email — lower sensitivity, and the privacy link now points to `/privacy`)
- Homepage, news, groups list
- All admin features

---

## 8. Alpha testing checklist (V1 readiness)

Run this checklist once before deploying to production for the first time.

### A. Environment & configuration

- [ ] `.env` / `.env.local` has all required variables (Supabase URL/keys, LINE tokens, OpenAI key)
- [ ] `.env` is in `.gitignore` (never committed)
- [ ] Vercel project has all env vars set (copy from `.env.local`, adjust `NEXT_PUBLIC_ENABLE_REGISTRATION`)
- [ ] Supabase project: all migrations applied (`supabase db push`)
- [ ] Supabase RLS: run Security Advisor in dashboard — no critical warnings

### B. Feature flag verification

- [ ] With `NEXT_PUBLIC_ENABLE_REGISTRATION=false`: 報名 buttons show "即將開放" on `/groups` and tour detail
- [ ] With `NEXT_PUBLIC_ENABLE_REGISTRATION=false`: visiting `/tours/[slug]/register` redirects to tour page
- [ ] With `NEXT_PUBLIC_ENABLE_REGISTRATION=true`: full registration flow works end-to-end

### C. Public-facing pages (run on Vercel preview URL)

- [ ] Homepage loads: hero, search bar, featured tours, latest news (if any)
- [ ] Search works (keyword, date, destination, duration)
- [ ] Click through: destination → sub-region → tour list → tour detail
- [ ] Tour detail tabs: itinerary, departure info, inquiry form, gallery
- [ ] Inquiry form: submit works, LINE notification received
- [ ] AI chat: responds to FAQ questions, markdown renders, links work
- [ ] `/groups` page: all published tours listed, sorted by date
- [ ] `/privacy` page loads with policy text
- [ ] Footer shows on all pages with privacy + contact links

### D. Admin panel (run on Vercel preview URL)

- [ ] `/admin/login` — login with correct credentials
- [ ] `/admin/tours` — list shows, expired tours greyed out
- [ ] Create draft → edit → upload cover (crop works) → publish → visible on frontend
- [ ] Edit tour: multi-tag categories, stops editor, departure info, airline/visa
- [ ] Delete tour: confirmation dialog, tour removed
- [ ] `/admin/registrations` — list, status change, CSV export (phone numbers have leading 0)
- [ ] `/admin/ai-faq` — create/edit/toggle/delete FAQ; publish to homepage news
- [ ] Site settings: hero banners uploadable for all destination pages

### E. Cross-device spot check

- [ ] iPhone Safari: homepage + one tour detail + AI chat
- [ ] Android Chrome: homepage + one tour detail
- [ ] Desktop: full manual checklist above

### F. Performance & basics

- [ ] No console errors on homepage (open DevTools → Console)
- [ ] No console errors on tour detail page
- [ ] Images load (not broken placeholders)
- [ ] Page loads feel responsive (< 3 seconds on decent connection)

### G. Post-deploy smoke test (5 minutes on production URL)

After the first production deploy:

- [ ] Homepage loads on the real domain
- [ ] Can click into a tour
- [ ] AI chat responds
- [ ] Inquiry form submits
- [ ] Admin login works
- [ ] Registration buttons show "即將開放" (if flag is off)

---

## 9. Suggested workflow (short)

1. Work on a **feature branch**, not directly on `main`.
2. Before merge: run **manual checklist** (section 1).
3. After deploy: **smoke test** production in 5 minutes.
4. Later: add **Vitest** for a few pure functions; add **Sentry** when you go live or have real traffic.

---

## 10. V1 → V2 roadmap (after launch)

Once V1 is live and stable, tackle these in order:

1. **Privacy policy finalization** → flip registration flag to `true`
2. **Sentry** error monitoring → catch production bugs early
3. **Vitest** for pure logic → prevent regression in helpers
4. **Terms of service page** (`/terms`) if needed
5. **Analytics** (Vercel Analytics or Google Analytics) → understand traffic
6. **New features** → continue building

---

*Last updated: July 2026 — added feature flags (section 7), alpha testing checklist (section 8), and V1 roadmap (section 10).*
