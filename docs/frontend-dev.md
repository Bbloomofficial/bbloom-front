# Frontend developer reference

**Who this is for:** developers working in this repository.
**What it answers:** how the project is laid out, how routing and the API layer
work, how translations and theming are organised, and what to run before
opening a pull request.

Setup, scripts, theme tokens and deployment are in the repository
[`README.md`](../README.md) and are not repeated here. Read
[surfaces.md](surfaces.md) first if you have not.

## Stack

Vite 6, React 19, TypeScript, Tailwind CSS 4, React Router 7, Vitest with
Testing Library. No state-management library, no data-fetching library, no
component library. Three runtime dependencies in total.

## Project layout

```
src/
  main.tsx          Entry point; mounts providers
  App.tsx           Picks which of the five surfaces answers this request
  routes.ts         Host detection and every internal link helper

  pages/            Marketing site screens
  components/       Marketing site shared components
  try/              Anonymous trial editor
  dashboard/        Customer dashboard
    api/            Dashboard API client and response types
    components/     Shared dashboard components
    editor/         The content editor and its preview
    pages/          One file per screen
    gate.ts         Paid-feature and publish predicates
    strings.ts      Dashboard dictionary (EN + KA)
  admin/            Staff console, same internal shape
  site/             Client site renderer
    sections/       One file per family of section types + registry.tsx
    components/     Forms, images, lightbox, checkout
    theme/          Theme tokens and font loading
    editing/        In-place editing hotspots
  api/              Shared API layer: http, plans, templates, problems
  i18n/             Marketing dictionaries and the locale provider
  theme.tsx         Light/dark provider
  test/setup.ts     Vitest setup
```

Each signed-in surface keeps its own API client, types and dictionary. That
duplication is intentional: the surfaces are lazily loaded as separate chunks,
and a visitor reading the pricing page should not download the admin console.

## Routing and host resolution

`App.tsx` decides which surface answers, in this order:

1. `resolveAppHost()` — exact subdomain match for `admin` or `panel`.
2. `panel.bbloom.ge` is redirected before React mounts (in `main.tsx`), so no
   frame of the old panel is ever rendered.
3. `resolveSiteHost()` — any hostname that is not recognisably ours is a
   candidate client site, and the backend decides whether it exists.
4. Path-based dispatch for the dashboard, the try editor and the marketing
   site.

Two rules that are easy to break:

- **Match hostname labels exactly, never by substring.** A customer called
  `admin-supplies` must not be handed the staff console. `routes.ts` and
  `site/host.ts` both do exact matching for this reason.
- **Build every internal link through `adminPath()` or `dashPath()`.** The same
  link has to render `/admin/sites` on the marketing domain and `/sites` on
  `admin.bbloom.ge`. Hardcoding a path works on one host and silently breaks on
  the other.

Dashboard screens sit at the root (`/s/{id}/inbox`, `/account`, `/new`) rather
than under `/dashboard/`, because the backend composes enquiry notification
emails against those exact paths. Moving them breaks mail already sent.

## The API layer

`src/api/http.ts` is the shared HTTP layer for all three signed-in surfaces.
Four things to know.

**An unset value is absent, never `null`.** The backend serialises with
`non_null` inclusion, so an unset field drops its key. A `=== null` check
against a response field is dead code. Use `??`, optional chaining, or
truthiness. Some types still declare `?: T | null` as tolerance, not as a shape
seen on the wire.

**Errors are RFC 9457 problem details.** `ApiError` carries `status`, `code`,
per-field messages, per-field constraint names and per-field numeric limits.
**Branch on `code`, never on `detail`** — `detail` is customer-facing copy that
may be reworded at any time; `code` is the contract.

**A 401 means two different things.** "The password you just typed is wrong"
and "you are not signed in any more" share a status code. `authFailure()`
distinguishes them from the problem `code`, and returns `unknown` rather than
guessing, so each caller picks its own safe default: a background read should
assume the session is gone, a password form should assume the password is.

**`assetUrl()` resolves against the API origin, not the page.** Media paths
arrive root-relative and already include `/api/v1`. In development the Vite
proxy makes an unprefixed path work by accident; in production the API is a
different origin, always. Three separate bugs have had this cause. Use
`assetUrl()` rather than writing another one.

Binary endpoints go through `requestBlob()`, which reuses the same error
parsing so a refusal is as readable as on a JSON endpoint. Do not rely on the
filename it returns — `Content-Disposition` is only visible cross-origin if the
server exposes it, so every caller needs its own fallback name.

## Internationalisation

Georgian is the default, and `detectLocale()` falls back to `ka` rather than to
the browser's language. There is no key-based translation framework: each
surface ships a typed dictionary object per language, and TypeScript is what
prevents a half-translated screen.

| Surface | Dictionary |
| --- | --- |
| Marketing | `src/i18n/en.ts`, `src/i18n/ka.ts` (shape in `types.ts`) |
| Dashboard | `src/dashboard/strings.ts` |
| Content editor | `src/dashboard/editor/strings.ts` |
| Staff admin | `src/admin/strings.ts` |
| Try editor | `src/try/strings.ts` |
| API problem messages | `src/api/problemStrings.ts` |

Two rules:

1. **A new string needs both languages in the same change.** There is no
   fallback to English — a missing key is a type error, not a runtime one.
2. **The Georgian must read like Georgian someone would actually write.** A
   word-order-preserving rendering of the English is not acceptable. The
   dictionaries already carry comments explaining where the obvious English
   phrasing produces Georgian nobody would say.

Client **site content** is localised by the backend, not here. Only the shells
carry dictionaries.

## Theming

Two independent systems, easily confused:

- **`src/theme.tsx` and `src/index.css`** — light/dark for bbloom's own
  surfaces, class-based on `<html>`, stored in `localStorage`. Prefer the
  semantic tokens documented in the [`README.md`](../README.md) over
  `bg-white`-style literals.
- **`src/site/theme/`** — each customer's own site theme, supplied by the
  backend and applied as scoped CSS custom properties on the site root.

They do not interact. A customer's site is not affected by the bbloom dark-mode
toggle.

## The section registry

`src/site/sections/registry.tsx` maps a published section's type to a
component, with a `variants` map and a **per-type `fallback`**.

- unknown **variant** → the type's fallback renders, with a development warning;
- unknown **type** → nothing renders, with a development warning.

This is deliberate, and it is the single most important invariant in
`src/site/`. These are live customer websites reading a payload from a backend
that can add types and variants without a frontend release. A missing renderer
must cost one section, never a blank page.

**Every new section type needs a fallback.**

## Template tiers

`src/api/templates.ts` holds the ladder `SIMPLE < CLASSIC < MODERN` and the
unlock helpers. They **fail open**: an absent, empty or unrecognised ceiling
unlocks everything, as does a template whose tier this build does not know.

That is not laziness. Showing an unavailable design costs one refused request,
which becomes an upgrade prompt. Locking a design a paying customer owns costs
a customer. The server refuses for real; the frontend never has to be the gate.

Do not add a second copy of the tier ladder anywhere. Two copies would be two
opinions about what a plan entitles someone to.

## Plans and prices

Everything that renders a plan's name, price, cadence or feature bullets reads
it from `/plans/website` through `src/api/plans.ts`. The backend owns that copy
and returns it already localised.

- **Never hardcode a plan name** — not in a component, not in a dictionary, not
  in a comment someone will later treat as fact. Hardcoded names existed here,
  went stale, and were removed deliberately. (Literal names inside a test
  fixture are fine: a fixture describes a payload.)
- **`priceMinor` is the only billable number.** Never parse a price out of
  display copy and never compute a discount locally — the server rounds, and
  local arithmetic will disagree with the invoice.
- The endpoint localises on a `lang` **query parameter**; an `Accept-Language`
  header is ignored.

## Testing

Vitest in a `jsdom` environment, with jest-dom matchers and a `cleanup()` after
each case (every test renders into the same document). Test files are
`src/**/*.test.{ts,tsx}`, conventionally in a `__tests__` folder beside the code
they cover.

The suite is small and fast by design. It covers the places where a silent
wrong answer would be expensive — template tier gating, the section registry's
fallback behaviour, the anonymous editor's draft schema, text encoding — rather
than aiming at a coverage number. Keep new tests in that spirit.

## Before opening a pull request

```bash
npm run typecheck
npm test
```

`npm run build` runs the type-check itself, so it subsumes the first.

Two notes:

- **There is no lint script.** Do not add one as part of routine work.
- **`npx tsc --noEmit` does not work in this repository** — npx resolves the
  name elsewhere. Use `npm run typecheck`.

## Things that have bitten people before

| | |
| --- | --- |
| `=== null` on a response field | Dead code; unset fields are absent |
| Branching on `detail` instead of `code` | Breaks the moment copy is reworded |
| An image path used without `assetUrl()` | Works in dev, breaks on every customer domain |
| A hardcoded `/admin/...` or `/dashboard/...` path | Breaks on one of the two hosts |
| Substring-matching a hostname | Hands a customer called `admin-…` the staff console |
| A new section type with no fallback | Risks a blank page on live customer sites |
| A new string in one language only | Type error — but only if you run the type-check |
| A hardcoded plan name or price | Goes stale; the backend owns both |
| A business rule written into the frontend | Belongs in [business-rules.md](https://github.com/Bbloomofficial/bbloom-back/blob/main/docs/business-rules.md) |

## Deployment, briefly

Any push to `main` rebuilds and redeploys production — the workflow trigger is
**not** path-filtered, so even a docs-only commit ships a new bundle to every
customer site. `VITE_API_BASE_URL` is compiled in at build time, and the
workflow fails the build if the bundle does not point at production. Details
are in the [`README.md`](../README.md).
