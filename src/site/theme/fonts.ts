/**
 * Templates name their fonts in the theme tokens; we load only the families a
 * template actually asks for, once per page.
 */

const GOOGLE_FAMILIES: Record<string, string> = {
  inter: "Inter:wght@400;500;600;700;800",
  "space grotesk": "Space+Grotesk:wght@400;500;600;700",
  "playfair display": "Playfair+Display:wght@400;500;600;700;800",
  "cormorant garamond": "Cormorant+Garamond:wght@400;500;600;700",
  lato: "Lato:wght@300;400;700;900",
  "source sans 3": "Source+Sans+3:wght@400;500;600;700",
  "plus jakarta sans": "Plus+Jakarta+Sans:wght@400;500;600;700;800",
  "noto sans georgian": "Noto+Sans+Georgian:wght@400;500;600;700;800",
  "noto serif georgian": "Noto+Serif+Georgian:wght@400;500;600;700",
};

/**
 * Clash Display ships on Fontshare rather than Google Fonts. When it is not
 * reachable the template's own fallback (Space Grotesk) takes over.
 */
const EXTRA_STYLESHEETS: Record<string, string> = {
  "clash display":
    "https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap",
};

const loaded = new Set<string>();

function inject(href: string) {
  if (loaded.has(href)) return;
  loaded.add(href);
  if (document.querySelector(`link[href="${CSS.escape(href)}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function familiesIn(stack: string | undefined): string[] {
  if (!stack) return [];
  return stack
    .split(",")
    .map((part) =>
      part
        .trim()
        .replace(/^['"]|['"]$/g, "")
        .toLowerCase(),
    )
    .filter(Boolean);
}

/** Loads every known family referenced by the given font stacks. */
export function loadFonts(...stacks: (string | undefined)[]) {
  if (typeof document === "undefined") return;

  const google = new Set<string>();
  for (const family of stacks.flatMap(familiesIn)) {
    const spec = GOOGLE_FAMILIES[family];
    if (spec) google.add(spec);
    const extra = EXTRA_STYLESHEETS[family];
    if (extra) inject(extra);
  }

  // Georgian fallbacks are always needed — client copy is Georgian by default.
  google.add(GOOGLE_FAMILIES["noto sans georgian"]);

  if (google.size === 0) return;
  const query = [...google].map((spec) => `family=${spec}`).join("&");
  inject(`https://fonts.googleapis.com/css2?${query}&display=swap`);
}
