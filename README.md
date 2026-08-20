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
- Social links in `Footer.tsx` still point at generic Instagram/Facebook URLs.
- The site deliberately makes **no performance claims** — there are no statistics, case studies or
  testimonials, since there is nothing real to cite yet. Add them only with figures you can back up.
- The pricing figures in `src/i18n/*.ts` (`plans`) are placeholders — confirm them before launch.
