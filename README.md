# bbloom — frontend

Marketing site for **bbloom**, an agency that helps small businesses get more customers through
Instagram/Facebook advertising and conversion-focused websites.

## Stack

- [Vite](https://vite.dev) 6
- React 19 + TypeScript
- Tailwind CSS 4 (via `@tailwindcss/vite`)
- React Router 7

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Script              | Description                     |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start the dev server            |
| `npm run build`     | Type-check and build to `dist/` |
| `npm run preview`   | Preview the production build    |
| `npm run typecheck` | Type-check only                 |

## Structure

```
src/
  components/   Navbar, Footer, Logo, ThemeToggle, LanguageSwitcher, Flag, SectionHeading,
                ServiceCard, FaqAccordion, CtaBand, ScrollToTop
  pages/        Home, Services, Pricing, About, Contact, NotFound
  i18n/         types.ts (Dict shape), en.ts, ka.ts, index.tsx (provider + useI18n)
  theme.tsx     Theme provider + useTheme
  index.css     Tailwind theme tokens, dark theme, component classes
```

## Theming

Light and dark themes are class-based. `<html class="dark">` is toggled by `ThemeProvider`
(`src/theme.tsx`) and the preference is stored in `localStorage` under `bbloom:theme`. With no
stored choice the site follows the OS setting and keeps following it live.

Rather than adding `dark:` to every element, `src/index.css` re-points the neutral scale and a set
of semantic tokens inside `.dark`, so existing utilities adapt automatically:

| Token                                | Use                                              |
| ------------------------------------ | ------------------------------------------------ |
| `canvas`                             | Page background                                   |
| `surface`                            | Cards, panels, inputs                             |
| `contrast`                           | Always-dark bands (dark in both themes)           |
| `tint` / `tint-strong` / `tint-fg`   | Soft brand-tinted backgrounds and text on them    |
| `success` / `success-soft` / `danger`| Status colours                                    |
| `ink-50 … ink-900`                   | Neutral scale — inverted in dark                  |

When adding UI, prefer these tokens over `bg-white` / `text-ink-900` literals and it will work in
both themes with no extra classes.

An inline script in `index.html` applies the stored theme and language before first paint, so there
is no flash of the wrong theme.

## Languages

Georgian (`ka`) is the default and English (`en`) is available from the switcher. The active locale
is stored under `bbloom:locale`; a first-time visitor always gets Georgian. The switcher lives in
the navbar and `<html lang>`, `<title>` and the meta description update with it.

Flags are drawn as inline SVG in `src/components/Flag.tsx` rather than emoji, because Windows has no
regional-indicator glyphs and flag emoji fall back to bare letters there.

All copy lives in the dictionaries — components contain no hard-coded strings:

```
src/i18n/types.ts   The `Dict` shape (the contract every locale must satisfy)
src/i18n/en.ts      English
src/i18n/ka.ts      Georgian
```

Use it in a component with:

```tsx
const { t } = useI18n()
return <h1>{t.hero.titleLine1}</h1>
```

### Adding a language

1. Copy `src/i18n/en.ts` to `src/i18n/<code>.ts` and translate the values. TypeScript will flag
   anything you miss, since the file is typed as `Dict`.
2. Register it in `src/i18n/index.tsx` — add it to `locales` and to the `dictionaries` map, and
   extend the `isLocale` guard.
3. Add a flag for it in `src/components/Flag.tsx` and widen the `code` union.
4. If the script needs different glyphs, add the font to the Google Fonts link in `index.html` and
   to `--font-sans` in `src/index.css`.

Georgian uses **Noto Sans Georgian**, which is already loaded as a fallback in the font stack.

## Notes

- The contact page lists email, phone and hours only — there is no form yet. Email and phone live in
  `src/data/contact.ts` and are shared by the contact page and the footer, so update them in one
  place. The labels and opening hours are in the dictionaries under `contactPage`.
- Social links in `Footer.tsx` point at the live bbloom Instagram and Facebook profiles.
- The site deliberately makes **no performance claims** — there are no statistics, case studies or
  testimonials, since there is nothing real to cite yet. Add them only with figures you can back up.
- The pricing tiers, their copy and their prices come from the API (`GET /plans/website`) and are
  edited by staff at `/admin/plans` — not from `src/i18n/*.ts`. Never hardcode a price in the UI.

## Deployment

The same commit is deployed twice, to two places, because it serves two different audiences:

| Host                          | Served by | What it is                                        |
| ----------------------------- | --------- | ------------------------------------------------- |
| `bbloom.ge`, `www.bbloom.ge`  | Vercel    | The marketing site                                |
| `*.bbloom.ge`, client domains | Hetzner   | Client sites, the dashboard and the staff admin   |

Hetzner is deployed by `.github/workflows/deploy-web.yml` on every push to `main`. Vercel deploys
itself from the same push.

### `VITE_API_BASE_URL`

Set it to `https://api.bbloom.ge/api/v1` in **both** places -- the workflow sets it for Hetzner, and
it must also exist in the Vercel project's environment variables.

Vite substitutes `VITE_*` into the bundle **at build time**, so adding or changing it does nothing
until something rebuilds. Setting the variable and not redeploying is the failure to expect, and it
looks like this: with nothing compiled in, the code falls back to a same-origin `/api/v1`, so the
app asks its own host for the API. On Vercel that returns the SPA's own HTML instead of JSON, and
`/admin` breaks while the marketing pages look perfectly fine.

To confirm a deployed bundle is pointing at production, `api.bbloom.ge` should appear in
`dist/assets/index-*.js`. The workflow fails the build if it does not.

### Media and asset URLs

The API returns media as root-relative paths like `/api/v1/media/{id}`. **Resolve them against the
API's origin, never the frontend's, and never by string-stripping the prefix.** `assetUrl()` in
`src/api/http.ts` is the one implementation -- use it rather than writing another.

This only misbehaves in production. In development the Vite proxy forwards `/api` to the backend,
so a path used unchanged works by accident; it breaks the moment the API is a different origin,
which it always is on a client's own domain. Three separate bugs here have had this same cause.