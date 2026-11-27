# BBloom design system

How the BBloom shells look and why: the marketing site (`src/pages`), the
client dashboard (`src/dashboard`), the staff admin (`src/admin`) and the
anonymous editor (`src/try`). `AGENTS.md` says how to build this project; this
file says how it should look.

**Client websites are not covered here.** `src/site` renders each client's own
site from its template's theme, through the `--site-*` properties in
`src/site/site.css`. Never use BBloom's colours, fonts or components on a
client's site, and never use `--site-*` tokens in the shells.

The source of truth is `src/index.css`. Every value below is copied from it. If
the two disagree, the CSS wins and this file is out of date.

## 1. Character

BBloom sells Georgian small businesses a website and advertising, monthly. The
shells should feel friendly, confident and uncluttered, never corporate or
technical: a café owner should feel at home in the dashboard.

- **One brand colour, pink (`bloom`),** on top of cool blue-grey neutrals
  (`ink`). Pink marks what matters: the primary action, the active place, the
  selection. It is never used as a background for large areas of text.
- **Soft, round shapes:** pill buttons, very rounded panels.
- **Bold, tight headings, quiet body text.**
- **Light and dark themes are equal.** Every screen must work in both.
- **Georgian first.** Georgian is the default language, and its words run
  longer than English. Layouts are designed for the Georgian text, not
  stretched to fit it afterwards.

## 2. Colour

Use the tokens, never hex values or Tailwind's own palette (`gray-*`, `pink-*`,
`red-*`). The one exception is amber for warnings, below.

### Brand: `bloom`

| Step | Hex | Use |
| --- | --- | --- |
| 50 | `#fdf2f8` | |
| 100 | `#fce7f3` | |
| 200 | `#fbcfe8` | Hover border on light controls and cards; text selection |
| 300 | `#f9a8d4` | |
| 400 | `#f472b6` | Focused field border |
| 500 | `#ec4899` | Focus outline; logo gradient start |
| 600 | `#db2777` | **The brand colour.** Primary button, active tab, checkbox accent, selected chip |
| 700 | `#be185d` | Primary button hover; logo gradient end; dark-theme hover border |
| 800 | `#9d174d` | |
| 900 | `#831843` | |

`bloom` is the same in both themes. White text on `bloom-600` measures 4.60:1.

### Neutrals: `ink`

The `ink` scale is **re-pointed in the dark theme**, so `text-ink-900` is near
black in light and near white in dark. That is what lets most of the code carry
no `dark:` classes at all.

| Step | Light | Dark | Use |
| --- | --- | --- | --- |
| 50 | `#f6f7f9` | `#1c2130` | Quiet fill: table row highlight, neutral pill |
| 100 | `#eceef2` | `#2d3447` | **The border colour** for panels, fields and buttons |
| 200 | `#dfe3ec` | `#343b50` | Stronger border: unselected chip, neutral pill |
| 300 | `#c3c9d8` | `#5c6379` | |
| 400 | `#8b93a7` | `#79809a` | Placeholders, disabled text, icons |
| 500 | `#666e83` | `#8e95ab` | Secondary text: hints, notes, timestamps |
| 600 | `#4b5468` | `#a3aabd` | Subtitles, table text |
| 700 | `#343b4f` | `#c1c7d5` | |
| 800 | `#232838` | `#dfe3ec` | **Body text** (set on `<body>`) |
| 900 | `#12151f` | `#f6f7fb` | Headings, strong text, values |

**`ink-400` is too faint for text you need to read** in the light theme: 3.07:1
on white, below the 4.5:1 WCAG AA asks for. Use it for placeholders, disabled
states and icons. For readable secondary text use `ink-500` (5.09:1) or darker.
The admin's small uppercase column headings still use `ink-400`; that is known
debt, not a pattern to copy.

### Semantic tokens

These change between themes. Prefer them over raw steps.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `canvas` | `#ffffff` | `#0b0e17` | The page itself |
| `surface` | `#ffffff` | `#141826` | Panels and cards |
| `sunken` | `#f2f4f9` | `#0b0e17` | What a panel sits on, where the page needs to recede (dashboard backgrounds, inset boxes) |
| `control` | `#ffffff` | `#202738` | The fill of an interactive control: button, field, select |
| `contrast` | `#12151f` | `#05070d` | **Dark in both themes.** Dark bands, overlays, scrims |
| `tint` | `#fdf2f8` | `#3a1c2e` | Soft brand fill: secondary button hover, eyebrow |
| `tint-strong` | `#fce7f3` | `#4a2338` | Field focus ring |
| `tint-fg` | `#be185d` | `#f9a8d4` | Brand-coloured text on `tint`, and brand links (5.53:1 / 8.36:1) |
| `success` | `#059669` | `#34d399` | Success icons and dots; success text only at large sizes |
| `success-strong` | `#047857` | `#34d399` | Success text on `success-soft` (5.21:1 / 7.95:1) |
| `success-soft` | `#ecfdf5` | `#0f2a21` | Success banner and pill fill |
| `success-border` | `#a7f3d0` | `#14532d` | Success banner and pill border |
| `danger` | `#dc2626` | `#f87171` | Errors, destructive actions (4.83:1 / 6.39:1 on `surface`) |

**Warnings use Tailwind's amber,** because there is no warning token. Amber does
not re-point, so it always needs its own `dark:` classes. The standard warning
panel:

```html
<div class="rounded-3xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/60 dark:bg-amber-950/30">
```

### The theming rules that have already been broken once

Each of these caused a real bug.

1. **Never put text in a re-pointing colour on `contrast`, or the reverse.**
   `contrast` stays dark in both themes while `canvas` and `ink-*` turn dark, so
   `bg-contrast text-canvas` is black on black in the dark theme. On `contrast`,
   use `text-white`. (A selected filter chip broke this way.)
2. **Never use `ink-*` as an overlay or scrim.** `bg-ink-900/40` dims the page
   in light and washes it white in dark. Scrims are `bg-contrast/60`. (The
   admin's phone-menu backdrop broke this way.)
3. **Text on `danger` must change colour in dark.** `danger` gets lighter in
   dark, and white on `#f87171` is 2.8:1. Write `text-white dark:text-contrast`
   (7.28:1).
4. **Panels use `surface`; controls use `control`.** They are both white in
   light, but in dark a control painted `surface` disappears into the panel
   around it. `src/index.css` repaints any `button`, `input`, `select` or
   `textarea` that says `bg-surface`, but links and divs that act as controls
   must say `bg-control` themselves.
5. **Every colour class must exist.** An undefined token such as
   `text-success-strong` before it was added compiles to nothing, with no
   error, and the text silently inherits whatever is around it. Check a new
   token name against `src/index.css`.
6. **Check every visual change in both themes.**

## 3. Typography

- **Font:** `Plus Jakarta Sans` for Latin, `Noto Sans Georgian` for Georgian,
  both from Google Fonts at weights 400–800. The browser picks per character,
  so mixed text needs no extra work.
- **Georgian line height is 1.65** (set on `html[lang='ka'] body`), looser than
  the default, because Georgian letters need the room.
- **Georgian has no capital letters.** Never rely on case for meaning or
  hierarchy. `uppercase` is fine on short labels because it only affects Latin
  text, but the hierarchy must still read without it.
- **Sentence case** for headings, buttons and labels in English: "Campaign
  manager", not "Campaign Manager".

| Role | Classes |
| --- | --- |
| Marketing hero | `text-[2rem] sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-ink-900` |
| Page title | `text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900` |
| Page subtitle | `mt-1 max-w-2xl text-sm text-ink-600` |
| Section heading | `text-lg font-bold text-ink-900` |
| Panel heading | `text-sm font-bold text-ink-900` |
| Body | `text-sm` (the most used size by far), `ink-800` |
| Field label | `.label` |
| Column heading or small label | `text-xs font-semibold uppercase tracking-wide` |
| Hint or note | `text-xs text-ink-500` |

- **Numbers in columns** use `tabular-nums`.
- **Codes, domains, emails and slugs** get `dir="ltr"` and `translate="no"`.
- **Ellipses are `…`, quotes are curly.** English uses “…”; Georgian uses „…“.
  Loading labels end in `…`: "Saving…".

## 4. Layout

- **Page width:** `.container-page` is `max-w-6xl` (72rem) with `px-5 sm:px-8`.
  Pages built around a wide table can opt out: the admin lists them in
  `WIDE_PAGES` in `src/admin/components/Layout.tsx`.
- **Reading width:** paragraphs stop at `max-w-2xl`; forms and dialogs at
  `max-w-md` to `max-w-xl`.
- **Spacing:** Tailwind's 4px scale. Between sections `mt-6`; inside a panel
  `p-5` or `p-6` (`sm:p-7` on marketing cards); between fields `gap-3` or `gap-4`.
- **The admin** has a fixed 16rem sidebar on wide screens and a drawer below
  `lg` (1024px). Sections with several screens get a row of tabs under the
  header.
- **Mobile first.** Every screen must work at 390px wide. Wide tables scroll
  sideways inside their panel (`overflow-x-auto` around a table with a
  `min-w-*`), never the whole page.

## 5. Shape and depth

| Radius | Use |
| --- | --- |
| `rounded-full` | Buttons, pills, chips, the eyebrow |
| `rounded-3xl` | Panels and cards |
| `rounded-2xl` | Fields, banners, inset boxes |
| `rounded-xl` | Icon buttons, the logo mark, small action buttons |
| `rounded-lg`, `rounded-md` | Rare; avoid in new work |

- **Borders do most of the separating.** A panel is `border border-ink-100
  bg-surface` with no shadow.
- **Shadows are for things that lift:** the primary button (`shadow-lg
  shadow-bloom-600/20`), a hovered card (`shadow-xl shadow-bloom-600/5`),
  overlays and drawers (`shadow-xl`). Shadows on brand elements are tinted
  pink, never grey.

## 6. Motion

Movement is small and always optional.

- **Buttons** rise 1px on hover and shrink to 0.97 on press (80ms, faster than
  the hover so the press is felt as it happens). The pricing page's plan
  buttons rise 3px. A disabled button doesn't move.
- **Icon buttons** shrink to 0.94 on press.
- **Colour transitions** take 150ms on controls (Tailwind's default) and 0.2s
  for the page's own background and text when the theme changes.
- **`prefers-reduced-motion`** removes every movement but keeps colour and
  shadow changes. A hand-written press effect must say `motion-safe:`, for
  example `motion-safe:active:scale-95`.
- **Never** `transition: all`, carousels, or animation that plays on its own
  for more than a few seconds.
- The marketing site has two decorative animations: `animate-rise` (a 0.6s
  entrance) and `animate-float-slow`.

## 7. Components

Use the shared classes in `src/index.css` before writing your own.

### Buttons

| Class | Look |
| --- | --- |
| `.btn-primary` | Pink pill, white text, pink shadow. **One per screen or panel**: the action the screen exists for |
| `.btn-secondary` | `control` pill with an `ink-100` border; pink border and `tint` fill on hover |
| `.btn-sm` | Smaller padding and text, for dense editing panels |
| `.btn-plan` | Added to the pricing page's plan buttons only: bigger lift, nudging arrow |
| `.icon-button` | 40px rounded square for icon-only actions. Needs an `aria-label` |

- **Button labels stay on one line** (`white-space: nowrap`). Georgian labels
  are long; let the row of buttons wrap, never the label.
- **Destructive buttons** are `bg-danger text-white dark:text-contrast`, or a
  `text-danger` text button inside a table. A destructive action always asks
  first with `window.confirm`, and the question names the thing being removed.
- **Focus** is a 2px `bloom-500` outline, offset 2px, on `:focus-visible`.

### Fields

- `.field` for every input, select and textarea, and `.label` for its label.
  The focus state is a `bloom-400` border plus a 4px `tint-strong` ring.
  Don't hand-style inputs; doing so loses the focus ring and the dark-theme fill.
- **Every control has a label:** a visible `<label>`, or `aria-label` when the
  layout can't fit one.
- Non-login fields get `autoComplete="off"`. Emails, URLs, domains, codes and
  tokens get `spellCheck={false}`. Secret fields are `type="password"` with
  `autoComplete="new-password"`, so a password manager never fills them.
- Checkboxes and switches use `h-4 w-4 accent-bloom-600`.

### Panels and cards

- **Panel:** `rounded-3xl border border-ink-100 bg-surface p-5` (or `p-6`).
  The building block of the dashboard and admin.
- **Card:** `.card`, a panel that answers the pointer: pink border and a soft
  pink shadow on hover. Use it for things you click.
- **Eyebrow:** `.eyebrow`, a small uppercase `tint` pill above a marketing
  heading.

### Pills and status

A status pill is `inline-flex items-center rounded-full border px-2.5 py-0.5
text-xs font-semibold` plus one tone:

| Tone | Classes |
| --- | --- |
| Good | `border-success-border bg-success-soft text-success-strong` |
| Neutral | `border-ink-200 bg-ink-50 text-ink-600` |
| Off, or gone | `border-ink-200 bg-ink-50 text-ink-400` |
| Bad | `border-danger/30 bg-danger/10 text-danger` |

Status never relies on colour alone: the pill always carries a word.

**Filter chips** are pills that toggle: unselected `border-ink-200 bg-surface
text-ink-600`, selected `border-bloom-600 bg-bloom-600 text-white`, with
`aria-pressed`.

### Banners

- **Success:** `rounded-2xl border border-success-border bg-success-soft px-4
  py-3 text-sm font-semibold text-success-strong`. The existing banners still
  say `text-success`, which is 3.58:1 in light; move them over when you touch
  them.
- **Warning:** the amber panel in section 2.
- **Error:** `text-sm font-semibold text-danger` with `role="alert"`, next to
  the action that failed.

### Tables

- Inside a panel, in an `overflow-x-auto` wrapper.
- Column headings: `text-left text-xs font-semibold uppercase tracking-wide`.
  Rows are separated by `divide-y divide-ink-100`, with no zebra stripes.
- Sortable headings are buttons with `aria-sort` on the `<th>`.
- Number columns are right-aligned and `tabular-nums`.

### The logo

A pink rounded square (`bg-gradient-to-br from-bloom-500 to-bloom-700`,
`rounded-xl`, a pink shadow) holding a white four-petal flower on a stem,
followed by the word **bbloom** in lower case, `font-extrabold tracking-tight`.
The component is `src/components/Logo.tsx`; the app icon is
`brand/app-icon-1024.png`. The name is always written in lower case.

## 8. Words on screen

- **Every string exists in English and Georgian,** in the dictionaries listed in
  `AGENTS.md`. The Georgian must read as a person would write it, not as a
  word-by-word translation.
- **Plan names and prices are never written into the UI.** They come from
  `/plans/website` (see `AGENTS.md`).
- **Say what happened and what to do next.** "Couldn't read from Meta. Showing
  the last reading." rather than "Error".
- **Address the reader directly,** in the active voice.

## 9. Before you ship a screen

- [ ] Light theme and dark theme
- [ ] English and Georgian
- [ ] 390px wide and desktop width
- [ ] Every control reachable and visibly focused with the keyboard
- [ ] Every control labelled; errors announced with `role="alert"`
- [ ] No hex values, no Tailwind palette colours except amber, every token name
      present in `src/index.css`
- [ ] Movement only through the shared classes or `motion-safe:`
