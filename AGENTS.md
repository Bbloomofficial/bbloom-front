# bbloom-front

The BBloom frontend: one React + TypeScript + Vite codebase that ships three
different surfaces from the same bundle.

- **The marketing site** — `bbloom.ge`, the public pages under `src/pages`.
- **The client dashboard** — `src/dashboard`, where a client edits their site,
  reads enquiries and orders, and manages billing.
- **The staff admin** — `src/admin`, used by the BBloom team.
- **The client site renderer** — `src/site`, which renders a client's own
  published website on `*.bbloom.ge` or their own domain.

BBloom is a Georgian small-business product: a website plus advertising, sold as
a monthly subscription. The backend is a separate repository,
`Bbloomofficial/bbloom-back` (Java 21, Spring Boot, Postgres, Flyway). Anything
commercial — what a plan costs, what it includes, who is allowed to do what — is
decided there. This repository renders those decisions and must not invent its
own.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

The dev server proxies `/api` to `http://localhost:8080` by default. Point it at
a deployed backend with `VITE_API_PROXY`; the proxy rewrites `Origin` as well as
`Host`, because a deployed backend rejects a `localhost` origin outright.

## Scripts

These are the only scripts that exist. **There is no lint script** — do not run
or add one as part of routine work.

| Script              | What it does                                          |
| ------------------- | ----------------------------------------------------- |
| `npm run dev`       | Dev server                                            |
| `npm run build`     | `tsc --noEmit` and then `vite build` into `dist/`      |
| `npm run typecheck` | Type-check only                                       |
| `npm test`          | `vitest run`                                          |
| `npm run preview`   | Serve the production build locally                    |

Before proposing a change, `npm run typecheck` and `npm test` are the two checks
worth running. `npm run build` runs the type-check itself, so it subsumes the
first.

## Tests

Vitest with `@testing-library/react` in a `jsdom` environment. Setup lives in
`src/test/setup.ts` (jest-dom matchers, plus a `cleanup()` after each case, since
every test renders into the same document). Test files are `src/**/*.test.{ts,tsx}`,
conventionally under a `__tests__` folder beside the code they cover.

As of this writing the suite is small and fast: **6 files, 80 tests, under three
seconds**. It covers the parts where a silent wrong answer would be expensive —
template tier gating, the section registry's fallback behaviour, the anonymous
editor's draft schema — rather than aiming at coverage. Keep new tests in that
spirit.

## Conventions a newcomer gets wrong

### Every user-facing string is bilingual, EN and KA

Georgian is the default locale (`detectLocale()` in `src/i18n/index.tsx` falls
back to `ka`, not to the browser's language). There is no key-based translation
framework: each surface ships a typed dictionary object per language, and
TypeScript is what stops you shipping a half-translated screen.

| Surface                   | Strings live in                  |
| ------------------------- | -------------------------------- |
| Marketing / public site   | `src/i18n/en.ts`, `src/i18n/ka.ts` (shape in `src/i18n/types.ts`) |
| Client dashboard          | `src/dashboard/strings.ts`       |
| Dashboard content editor  | `src/dashboard/editor/strings.ts` |
| Staff admin               | `src/admin/strings.ts`           |
| Anonymous "try it" editor | `src/try/strings.ts`             |
| API problem messages      | `src/api/problemStrings.ts`      |

Two rules. First, a new string needs **both** languages in the same change —
there is no fallback to English, and an untranslated key is a type error rather
than a runtime one. Second, the Georgian must read like Georgian a person would
write. A literal, word-order-preserving rendering of the English is not
acceptable; the dictionaries already contain comments explaining where an
obvious English phrasing produces Georgian nobody would say.

Note that **client site content is localised by the backend**, not here. Only the
shells — marketing, dashboard, admin — carry dictionaries.

### `assetUrl()` resolves against the API origin, not the page

`assetUrl()` in `src/api/http.ts` turns a path the API hands us (a template
preview, an uploaded image) into something an `<img src>` can use. Those paths
arrive root-relative and already include `/api/v1`, so they must resolve against
the **API's origin** — not against the page's origin, which is the same host only
by accident in development, and is a completely different host when a client's
site is served from their own domain.

This has already caused one wrong design decision here. If you are reasoning
about where an image comes from, read the function before assuming.

### Plan display names are never hardcoded

Anything that renders a plan's name, price, cadence or feature bullets reads it
from `/plans/website` via `src/api/plans.ts`. The backend owns that copy and
returns it already localised, so a rename on the backend flows through to every
screen with no frontend release.

Hardcoded plan names existed here once, went stale, and were removed
deliberately. Do not reintroduce them — not in a component, not in a dictionary,
not in a comment that someone will later treat as fact. (The only literal plan
names in `src/` are inside a test fixture, which is fine: a fixture is describing
a payload, not asserting what the plans are called.)

The same holds for prices. `priceMinor` is the only billable number in the
payload; never parse a price out of display copy and never compute a discount
locally.

### "Tier" means two different things, and they collide

This is the single most confusing thing in the codebase.

- **Template / design tier** — `SIMPLE`, `CLASSIC`, `MODERN`. A property of a
  *template*: how elaborate the design is. Ordered as a ladder in
  `TEMPLATE_TIER_ORDER` in `src/api/templates.ts`.
- **Subscription plan** — a separate entity with its own codes (`simple`,
  `classic`, `modern`) and its own display names, currently **Standard**,
  **Premium** and **Business**.

The plan codes happen to echo the tier names, which is exactly why the two get
conflated. They did once: the dashboard Overview page showed the site's *design
tier* under a row labelled "Plan", telling clients they were on a plan they were
not on. The fix was commit `9847a36`, "Label the Overview tier row as the design,
not the plan".

A plan now declares the highest design tier it unlocks (`maxTemplateTier` on the
backend), which is a real relationship between the two — but it is a mapping, not
an identity. When you write copy or a variable name, say which one you mean.

### The section registry degrades instead of crashing

`src/site/sections/registry.tsx` maps a published section's `type` to a React
component, with a `variants` map and a **per-type `fallback`**. An unknown
variant renders the type's fallback; an unknown type renders nothing at all and
warns once in development.

That is deliberate: these are live client websites reading a payload from a
backend that can add section types and variants without a frontend release. A
missing renderer must cost one missing section, never a blank page. Preserve this
when you add sections — every new type needs a fallback.

### Other things worth knowing

- **An unset value is absent, never `null`.** The backend serialises with
  `non_null` inclusion, so a comparison against `null` on a response field is
  dead code. Use `??`, optional chaining or a truthiness check. The header
  comment in `src/api/http.ts` explains this at length.
- **Branch on `code`, not on prose.** Errors are RFC 9457 problem details.
  `detail` is client-facing copy that may be reworded at any time; `code` is the
  contract.
- **Deployment.** `.github/workflows/deploy-web.yml` builds and ships the bundle
  that Caddy serves on `*.bbloom.ge` on **any push to `main`** — the trigger is
  not path-filtered, so even a documentation-only commit triggers a production
  rebuild and redeploy. The marketing site is Vercel's separate deploy of the
  same commit. `VITE_API_BASE_URL` is baked in at build time and the workflow
  fails the build if the bundle does not point at production.

---

# `bloomcheck`

`bloomcheck` is a keyword the owner (Luka, GitHub `LukaTsk`) uses to ask for one
specific piece of work. When he types it — on its own or in a sentence — it means:

> **Regenerate the BBloom plan-vs-implementation gap table: which features that
> we advertise on the paid plans are actually enforced in code, and which are
> only sold in marketing copy.**

## The one rule

**Always regenerate it against the current state of the code and production.**

A table stored in this file — including the baseline below — is a *baseline for
comparison only*. Never reprint it, or any part of it, as though it were a fresh
answer. The whole value of the exercise is catching the drift between what is
sold and what is built, and a reprinted table catches nothing by construction.

## Method

### 1. Fetch what is actually advertised

The advertised bullets are the source of truth for what is **sold**:

```
https://api.bbloom.ge/api/v1/plans/website
```

The copy is Georgian. On Windows PowerShell, fetch it like this:

```powershell
$client = New-Object System.Net.WebClient
$client.Encoding = [System.Text.Encoding]::UTF8
$client.DownloadString("https://api.bbloom.ge/api/v1/plans/website")
```

`Invoke-RestMethod` decodes the response as Latin-1 and mangles the Georgian, so
do not use it here. Append `?lang=en` for the English copy — the endpoint
localises on that query parameter.

### 2. Check what is actually enforced

In this repository **and** in `Bbloomofficial/bbloom-back`. Local checkouts go
stale, so fetch and read `origin/main` rather than trusting the working copy in
front of you.

### 3. The enforcement points worth re-checking every time

**Backend (`bbloom-back`):**

| Where | What it gates |
| ----- | ------------- |
| `AdPlanGate` | Ad impression allowances and ad channels. Historically the only genuinely *per-plan* entitlement in the system. |
| `Plan.maxTemplateTier` and `TemplateTierAllowance` | Design-tier gating. Added 2026-09-12. |
| `SiteService.requirePaidFeature(..., "your own domain name")` | Custom domains. |
| `SiteOrderingGate`, with `SiteCategoryType.sellsOnline()` | Order management. |

**Frontend (this repository):**

| Where | What it gates |
| ----- | ------------- |
| `src/dashboard/gate.ts` | `allowsPaidFeatures` — the blunt paid-versus-free boolean that most entitlements still hang off. It knows nothing about *which* plan. |
| `src/api/templates.ts` | The design-tier unlock helpers (`isTierUnlocked`, `includedTiers`). These deliberately **fail open**: an absent, empty or unrecognised ceiling unlocks everything, so a paying client is never locked out by a ceiling we failed to understand. The server refuses for real. |

### 4. Classify every advertised bullet

Mark each one **enforced**, **partial**, or **not implemented**.

For anything partial, always name **which rule actually gates it**. "Gated by
design tier, not by plan" is the finding; the status icon is not. A status
without the rule behind it cannot be acted on.

### 5. Close the report with three things

1. **What changed since the baseline below.**
2. **The biggest revenue leak** — the gap through which the most money is
   currently escaping.
3. **Anything sold but not built** — advertised bullets with no implementation
   anywhere in either repository.

## Baseline — 2026-09-13

**This is a baseline, not an answer.** It records the state at the end of 13
September 2026 so a future run has something to diff against. It is certainly out
of date by the time you are reading it.

Plans at that date, monthly, with 50% off the first purchase:

| Code | Display name | Price |
| ---- | ------------ | ----- |
| `simple` | Standard | 198 GEL |
| `classic` | Premium | 398 GEL |
| `modern` | Business | 798 GEL |

| Advertised feature | Status | What actually gates it |
| ------------------ | ------ | ---------------------- |
| Web design tier | **Enforced** | Plan-gated as of 2026-09-12, admin-configurable, with a design switcher for the client. |
| Ad impressions (5k / 10k / 20k) | **Enforced** | `AdPlanGate`, per plan. |
| Ad channels (Facebook only vs. Facebook + Instagram) | **Enforced** | `AdPlanGate`, per plan. |
| Ad analytics | **Enforced** | — |
| Website dashboard | **Enforced** | — |
| Subdomain `example.bbloom.ge` | **Enforced** | — |
| Own domain `example.ge` | **Partial** | Gated paid-versus-free only, **not per plan**. A Standard client can attach a custom domain that is advertised as a Premium feature. **The biggest revenue leak at this date.** |
| Order management (sold on Business) | **Partial** | Gated by the site's **design tier**, not by the plan. Indirectly correct now that design tier is itself plan-gated, but it is still the wrong rule and will break the moment the two diverge. |
| Printable QR code (advertised on all three plans) | **Enforced** | Paid-versus-free, not per plan. `GET /manage/sites/{siteId}/qr?format=png\|pdf&lang=ka\|en` (`bbloom-back` `f049119`), dashboard page `/s/{siteId}/qr` (`3276e66`). Shipped late on the day of this baseline, so anything written earlier calls it missing. |
| Business email on Gmail (advertised on Premium and Business) | **Not implemented** | No code anywhere in either repository. |
| Card payments | **Not live** | Gateway credentials are empty. |

### Open items to re-check

- **Plan copy may ignore `Accept-Language`.** `/plans/website` returned Georgian
  even when requested with `Accept-Language: en`. The frontend works around this
  by passing a `lang` query parameter (see `fetchWebsitePlans` in
  `src/api/plans.ts`). Worth confirming whether the header is now honoured.
- **The `custom` plan is never returned by `/plans/website`.** This frontend
  still carries a negotiable "Contact us" path for a non-purchasable plan
  (`isNegotiable()`, `purchasable: false`). If the endpoint never returns such a
  plan, that path is dead code that never runs — either the plan should be
  published or the code should go.
