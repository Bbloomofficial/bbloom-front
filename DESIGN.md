# BBloom design system

How the BBloom shells look and why: the marketing site (`src/pages`), the
client dashboard (`src/dashboard`), the staff admin (`src/admin`) and the
anonymous editor (`src/try`). `AGENTS.md` says how to build this project; this
file says how it should look.

**Client websites are not covered here.** `src/site` renders each client's own
site from its template's theme, through the `--site-*` properties in
`src/site/site.css`. Never use BBloom's colours, fonts or components on a
client's site, and never use `--site-*` tokens in the shells.

## 0. This is a new design, being rolled out

This file describes the design approved in November 2026: a refresh guided
by the principles of Airbnb's design system (one sparing accent, neutral greys,
modest type, soft but not pill-shaped controls, one shadow). BBloom keeps its own
pink, logo and fonts; nothing is copied from Airbnb's look. The approved mock-ups
are the "BBloom design refresh: now vs proposed" canvas.

The code catches up in steps. Until a surface is marked done, it still looks
the old way, and the old values are in that surface's code and `src/index.css`.

| Step | What changes | Status |
| --- | --- | --- |
| 1 | The tokens and shared classes in `src/index.css`. This alone restyles every shell at once | Done |
| 2 | Staff admin: labels, tables, chips, tabs, stat tiles | Done |
| 3 | Client dashboard | Done |
| 4 | Marketing site | Not started |
| 5 | Anonymous editor | Not started |

**New work follows this file, not the old look.** When a value here and
`src/index.css` disagree, step 1 hasn't landed yet: build with the token names
here, and add any that don't exist yet in the same change.

## 1. Character

BBloom sells Georgian small businesses a website and advertising, monthly. The
shells should feel warm, calm and trustworthy, never corporate or technical: a
café owner should feel at home in the dashboard.

- **Pink is rare, so it means something.** `bloom` is the main action on a
  screen, the logo and the brand's own moments. Everything else is built from
  neutral greys. Most screens are white, grey and black with one pink button.
- **Neutral, not blue.** The greys have no tint.
- **Calm type.** Bold but not heavy headings, comfortable 16px body text.
- **Soft shapes.** Controls have gently rounded corners; panels are rounder;
  only small things (chips, badges, pills) are fully round.
- **Flat by default.** Borders separate things. One shadow, for things that
  lift.
- **Big numbers carry the story.** A figure that matters (impressions, spend,
  a price) is the largest text on its panel.
- **Light and dark are equal.** Every screen works in both.
- **Georgian first.** Georgian is the default language and its words run
  longer. Layouts are designed for the Georgian text.

## 2. Colour

Use the tokens, never hex values or Tailwind's own palette (`gray-*`, `pink-*`,
`red-*`). The one exception is amber for warnings, below.

### Brand: `bloom` (unchanged)

| Step | Hex | Use |
| --- | --- | --- |
| 50 | `#fdf2f8` | |
| 100 | `#fce7f3` | |
| 200 | `#fbcfe8` | Text selection (light) |
| 500 | `#ec4899` | Logo gradient start |
| 600 | `#db2777` | **The brand colour.** The primary button, and nothing else on a working screen |
| 700 | `#be185d` | Primary button hover and press; logo gradient end; text selection (dark) |
| 900 | `#831843` | Selected text (light) |

`bloom` is the same in both themes. White on `bloom-600` is 4.60:1.

**Where pink is not used any more:** selected chips, active tabs, focus rings,
checkboxes, hover borders and shadows. Those are now `ink`.

### Neutrals: `ink`

Pure greys, re-pointed in the dark theme, so `text-ink-900` is near black in
light and near white in dark.

| Step | Light | Dark | Use |
| --- | --- | --- | --- |
| 50 | `#f7f7f7` | `#242424` | Quiet fill: table header row, selected row, neutral pill |
| 100 | `#ebebeb` | `#2e2e2e` | **Hairline:** panel borders, dividers |
| 200 | `#dddddd` | `#3a3a3a` | Chip and pill borders |
| 300 | `#c4c4c4` | `#4a4a4a` | Disabled borders |
| 400 | `#949494` | `#7a7a7a` | **Field borders,** placeholders, icons. Not for text you need to read (3.03:1) |
| 500 | `#6b6b6b` | `#a1a1a1` | Secondary text: hints, meta, inactive tabs (5.33:1 / 6.60:1) |
| 600 | `#5c5c5c` | `#b0b0b0` | Subtitles, table column headings (6.69:1 / 7.86:1) |
| 700 | `#4a4a4a` | `#c4c4c4` | |
| 800 | `#3d3d3d` | `#d4d4d4` | **Body text** (10.86:1 / 11.50:1) |
| 900 | `#222222` | `#f5f5f5` | Headings, strong text, values, ink buttons, selected chips, focus rings |

### Semantic tokens

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `canvas` | `#ffffff` | `#121212` | The page itself |
| `surface` | `#ffffff` | `#1c1c1c` | Panels and cards |
| `sunken` | `#f7f7f7` | `#121212` | What panels sit on where the page needs to recede |
| `control` | `#ffffff` | `#262626` | The fill of a button, field or select |
| `contrast` | `#222222` | `#0a0a0a` | **Dark in both themes.** Dark bands and scrims |
| `tint` | `#fdf2f8` | `#3a1c2e` | Soft brand fill, for brand moments only |
| `tint-strong` | `#fce7f3` | `#4a2338` | |
| `tint-fg` | `#be185d` | `#f9a8d4` | Brand-coloured text and links on brand moments (6.04:1 / 9.40:1) |
| `success` | `#059669` | `#34d399` | Success icons and dots |
| `success-strong` | `#047857` | `#34d399` | Success text (5.21:1 / 7.95:1 on `success-soft`) |
| `success-soft` | `#ecfdf5` | `#0f2a21` | Success fill |
| `success-border` | `#a7f3d0` | `#14532d` | Success border |
| `danger` | `#c2410c` | `#fb923c` | Errors and destructive actions (5.18:1 / 7.53:1) |
| `on-danger` | `#ffffff` | `#1c1c1c` | Text on a `danger` fill (5.18:1 / 7.53:1) |

**Danger is orange-red, not red.** A red next to BBloom's pink reads as the
same colour, so a delete button looked like a brand button. Orange-red can't be
mistaken for pink.

**Warnings use Tailwind's amber,** which doesn't re-point, so it always carries
its own `dark:` classes:

```html
<div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
```

### The theming rules that have already been broken once

1. **Fill and text must re-point together, or not at all.** `contrast` stays
   dark in both themes while `canvas` and `ink-*` turn, so `bg-contrast
   text-canvas` is black on black in dark. Pair `bg-contrast` with
   `text-white`, and `bg-ink-900` with `text-canvas` (both re-point).
2. **Scrims are `bg-contrast/60`,** never `ink-*`, which washes the page white
   in dark.
3. **Text on `danger` is `text-on-danger`.** `danger` lightens in dark, so
   white on it fails.
4. **Panels use `surface`; controls use `control`.** In dark a control painted
   `surface` disappears into its panel. `src/index.css` repaints `button`,
   `input`, `select` and `textarea` that say `bg-surface`; links and divs acting
   as controls must say `bg-control`.
5. **Every colour class must exist.** An undefined token compiles to nothing,
   silently. Check new names against `src/index.css`.
6. **Check every visual change in both themes.**

## 3. Typography

- **Fonts (unchanged):** `Plus Jakarta Sans` for Latin, `Noto Sans Georgian`
  for Georgian, weights 400–800 from Google Fonts.
- **Georgian line height is 1.65.**
- **No uppercase labels.** Small grey capitals were the old look; they are hard
  to read and do nothing in Georgian, which has no capitals. Labels and column
  headings are sentence case.
- **Sentence case** for every heading, button and label in English.
- **Weights:** 700 for headings, 600 for labels, buttons and emphasis, 500 for
  quiet emphasis, 400 for body. 800 only in the `bbloom` wordmark.

| Role | Size / weight | Tailwind |
| --- | --- | --- |
| Marketing hero | 40px → 56px / 700, −0.02em | `text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight leading-[1.1]` |
| Page title | 28px / 700, −0.01em, line 1.2 | `text-[28px] font-bold tracking-[-0.01em] leading-tight` |
| Section heading | 22px / 700 | `text-[22px] font-bold` |
| Panel heading | 16px / 600 | `text-base font-semibold` |
| Key number | 44px / 700, −0.02em, line 1.1 | `text-[44px] font-bold tracking-tight leading-[1.1] tabular-nums` |
| Body | 16px / 400, line 1.5 | `text-base` |
| Table text | 15px / 400 | `text-[15px]` |
| Label | 14px / 600, `ink-900` | `.label` |
| Hint, meta | 14px / 400, `ink-500` | `text-sm text-ink-500` |
| Column heading | 13px / 600, `ink-600` | `text-[13px] font-semibold text-ink-600` |
| Badge, pill | 13px / 600 | `text-[13px] font-semibold` |

- **Numbers in columns** use `tabular-nums`.
- **Codes, domains, emails and slugs** get `dir="ltr"` and `translate="no"`.
- **Ellipses are `…`, quotes are curly** (English “…”, Georgian „…“).
  Placeholders end in `…`.

## 4. Layout

- **Page width:** `.container-page`, `max-w-6xl` (72rem), `px-5 sm:px-8`. Pages
  built around a wide table opt out through `WIDE_PAGES` in
  `src/admin/components/Layout.tsx`.
- **Spacing:** Tailwind's 4px scale.
  - Page top padding 48px (`py-12`).
  - Between blocks on a page 32px (`gap-8`).
  - Inside a panel 24px (`p-6`).
  - Between related controls 8–16px.
  - Marketing sections 64px apart (`py-16`).
- **Reading width:** paragraphs stop at about 420–640px (`max-w-md` to
  `max-w-2xl`).
- **Header and tabs:** a 72px header with a hairline under it. Section tabs are
  text with a 2px `ink-900` underline under the active one.
- **Mobile first.** Every screen works at 390px. Wide tables scroll sideways
  inside their panel, never the page.

## 5. Shape and depth

| Radius | Tailwind | Use |
| --- | --- | --- |
| 8px | `rounded-lg` | Buttons, fields, selects |
| 12px | `rounded-xl` | Banners, inset boxes, menus |
| 16px | `rounded-2xl` | Panels, cards, tables |
| 24px | `rounded-3xl` | Large marketing panels only |
| Full | `rounded-full` | Chips, badges, status pills, avatars |
| 10px | `rounded-[10px]` | The logo mark |

**One shadow,** `shadow-card`, only for things that lift above the page: a
hovered clickable card, a dropdown, a menu, a dialog.

```css
--shadow-card: 0 1px 2px rgb(0 0 0 / 0.04), 0 4px 12px rgb(0 0 0 / 0.08);
/* dark */
--shadow-card: 0 1px 2px rgb(0 0 0 / 0.3), 0 4px 12px rgb(0 0 0 / 0.4);
```

Shadows are grey, never pink. Everything else is flat with a hairline border.

## 6. Motion

- **Colour changes** take 150ms.
- **Buttons don't lift on hover.** They change colour. A press may shrink them
  slightly (`motion-safe:active:scale-[0.98]`, 80ms).
- **Clickable cards** gain `shadow-card` on hover; they don't move.
- **`prefers-reduced-motion`** removes all movement; colour changes stay.
- **Never** `transition: all`, carousels, or animation that runs on its own for
  more than a few seconds.
- The marketing site keeps its one entrance animation, `animate-rise`.

## 7. Components

### Buttons

48px tall (`h-12`), `rounded-lg`, 15px / 600, `px-5`. Labels stay on one line;
the row wraps instead.

| Class | Look |
| --- | --- |
| `.btn-primary` | `bloom-600` fill, white text, `bloom-700` on hover. **One per screen or panel** |
| `.btn-secondary` | `control` fill, 1px `ink-900` border, `ink-900` text; `ink-50` fill on hover |
| `.btn-ghost` | No fill or border, `ink-900` text, underline on hover. For "Show more", "Cancel" |
| `.btn-danger` | `danger` fill, `on-danger` text |
| `.btn-sm` | 40px tall (`h-10`), 14px, `px-4`. For dense panels and table toolbars |
| `.icon-button` | 40px circle, `control` fill, 1px `ink-200` border. Needs `aria-label` |

- **Text actions in a table row** ("Pause", "Delete at Meta") are 600-weight,
  underlined links: `ink-900`, or `danger` for destructive ones.
- **A destructive action always asks first** with `window.confirm`, naming the
  thing being removed.
- **Focus:** a 2px `ink-900` outline, offset 2px, on `:focus-visible`, on every
  interactive element.

### Fields

- `.field`: 48px tall, `rounded-lg`, 1px `ink-400` border, `control` fill,
  16px text (16px also stops iOS zooming in). On focus the border becomes
  `ink-900` and 2px thick (`focus:border-ink-900 focus:ring-1
  focus:ring-ink-900`). No pink glow.
- `.label` above the field, 14px / 600 `ink-900`, 8px gap.
- Error text under the field in `danger`, linked with `aria-describedby`, and
  the field gets `aria-invalid` and a `danger` border.
- Non-login fields: `autoComplete="off"`. Emails, URLs, domains, codes, tokens:
  `spellCheck={false}`. Secrets: `type="password"` with
  `autoComplete="new-password"`.
- Checkboxes and radios: `h-4 w-4 accent-ink-900`.

### Chips

Filter chips toggle with `aria-pressed`. 36px tall, `rounded-full`, 14px.

- **Off:** `border border-ink-200 bg-control text-ink-800 font-medium`
- **On:** `border border-ink-900 bg-ink-900 text-canvas font-semibold`

### Panels, cards and stat tiles

- **Panel:** `rounded-2xl border border-ink-100 bg-surface p-6`.
- **Card** (clickable): a panel that gains `shadow-card` on hover.
- **Stat tile:** a panel with a 14px / 500 `ink-500` label, the **key number**
  under it, and a 14px `ink-500` line of context ("of 5,000 in the plan").

### Tables

- Inside a `rounded-2xl border border-ink-100` box with `overflow-hidden`,
  wrapped in `overflow-x-auto` for narrow screens.
- **Header row:** `bg-ink-50`, column headings 13px / 600 `ink-600`, sentence
  case, `px-4 py-3`.
- **Rows:** 15px, `px-4 py-3.5`, `border-t border-ink-100`, no zebra stripes.
  The first column (the record's name) is 600 `ink-900`.
- Sortable headings are buttons with `aria-sort` on the `<th>`. Number columns
  are right-aligned and `tabular-nums`.

### Status pills

`inline-flex rounded-full border px-2.5 py-0.5 text-[13px] font-semibold` plus
one tone. A pill always carries a word, never colour alone.

| Tone | Classes |
| --- | --- |
| Good | `border-success-border bg-success-soft text-success-strong` |
| Neutral | `border-ink-200 bg-ink-50 text-ink-600` |
| Off, or gone | `border-ink-200 bg-ink-50 text-ink-500` |
| Bad | `border-danger/30 bg-danger/10 text-danger` |

### Banners

`rounded-xl px-4 py-3 text-sm`:

- **Success:** `border border-success-border bg-success-soft text-success-strong`.
- **Warning:** the amber panel in section 2.
- **Error:** `text-danger font-semibold` with `role="alert"`, beside the action
  that failed.

### The logo (unchanged)

A `rounded-[10px]` square with a `bloom-500` → `bloom-700` gradient holding a
white four-petal flower on a stem, then **bbloom** in lower case, 800 weight,
`tracking-tight`. It is `src/components/Logo.tsx`; the app icon is
`brand/app-icon-1024.png`. Its pink shadow goes: the logo is flat.

## 8. Words on screen

- **Every string exists in English and Georgian** (dictionaries in
  `AGENTS.md`), and the Georgian reads as a person would write it.
- **Plan names and prices are never written into the UI.** They come from
  `/plans/website`.
- **Say what happened and what to do next.** "Couldn't read from Meta. Showing
  the last reading.", not "Error".
- **Address the reader directly,** in the active voice.

## 9. Before you ship a screen

- [ ] Light and dark theme
- [ ] English and Georgian
- [ ] 390px wide and desktop width
- [ ] Pink only on the primary action and brand moments
- [ ] No uppercase labels; sentence case everywhere
- [ ] Every control reachable and visibly focused with the keyboard
- [ ] Every control labelled; errors announced with `role="alert"`
- [ ] No hex values; no Tailwind palette colours except amber; every token
      name present in `src/index.css`
- [ ] Movement only through `motion-safe:` or the shared classes
