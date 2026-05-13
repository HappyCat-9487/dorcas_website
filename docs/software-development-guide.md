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

## 5. Suggested workflow (short)

1. Work on a **feature branch**, not directly on `main`.
2. Before merge: run **manual checklist** (section 1).
3. After deploy: **smoke test** production in 5 minutes.
4. Later: add **Vitest** for a few pure functions; add **Sentry** when you go live or have real traffic.

---

*Last updated: internal engineering guide for Dorcas website.*
