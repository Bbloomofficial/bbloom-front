import { assetUrl, request } from "./http";

/**
 * The website templates a client can be built on. The marketing site shows
 * these so a prospect can browse the real thing before asking for a quote.
 */
export type SiteTemplate = {
  code: string;
  category: "SHOP" | "RESTAURANT" | string;
  tier: "SIMPLE" | "CLASSIC" | "MODERN" | string;
  name: string;
  tagline: string;
  description: string;
  /** Wireframe thumbnail rendered by the backend. */
  previewUrl: string;
  /** Slug of a live demo site, or null when none is published. */
  demoSlug: string | null;
  flagship: boolean;
};

/**
 * The order categories are shown in, everywhere they are shown.
 *
 * Businesses first, then the three personal categories — someone advertising
 * themselves rather than a business selling stock. `LAWYER` is professional
 * services generally (consultants, accountants, therapists) and `CREATIVE` the
 * portfolio-led trades, which is why neither reads as a job title in the copy.
 *
 * Listed rather than sorted alphabetically because the order is editorial: it
 * is the order a prospect is walked through them, and in Georgian an
 * alphabetical sort would produce a different sequence again.
 */
export const TEMPLATE_CATEGORY_ORDER = [
  "SHOP",
  "RESTAURANT",
  "TEACHER",
  "LAWYER",
  "CREATIVE",
] as const;

/**
 * Sorts the categories present in a payload into that order, keeping any the
 * backend has added since this build at the end rather than dropping them.
 *
 * The list comes from the templates themselves, so a new category appears in
 * every picker without a frontend release — it just appears last, and labelled
 * with its raw code until copy is written for it.
 */
export function orderCategories(categories: Iterable<string>): string[] {
  const rank = new Map<string, number>(
    TEMPLATE_CATEGORY_ORDER.map((category, index) => [category, index]),
  );
  return [...new Set(categories)].sort(
    (a, b) =>
      (rank.get(a) ?? Number.MAX_SAFE_INTEGER) -
      (rank.get(b) ?? Number.MAX_SAFE_INTEGER),
  );
}

/**
 * Templates grouped under their category, in display order. Empty groups are
 * never produced, so a caller can render a heading per group unconditionally.
 */
export function groupByCategory<T extends { category: string }>(
  templates: T[],
): { category: string; templates: T[] }[] {
  return orderCategories(templates.map((template) => template.category)).map(
    (category) => ({
      category,
      templates: templates.filter(
        (template) => template.category === category,
      ),
    }),
  );
}

/**
 * The design tiers, ordered from plainest to richest.
 *
 * The order is the whole point: a plan declares the *highest* tier it unlocks,
 * and everything below that is unlocked with it. So this list is read as a
 * ladder rather than as a set, in the same way `TEMPLATE_CATEGORY_ORDER` above
 * is read as a running order rather than as an alphabet.
 *
 * Kept here, beside the categories, because the admin panel, both client
 * pickers and the design switcher all have to agree about it. A second copy
 * anywhere would be a second opinion about what a plan entitles somebody to.
 */
export const TEMPLATE_TIER_ORDER = ["SIMPLE", "CLASSIC", "MODERN"] as const;

export type TemplateTier = (typeof TEMPLATE_TIER_ORDER)[number];

/**
 * The highest tier an account may use, as the API reports it.
 *
 * Three states, and they are not the same thing:
 *   - a tier name — the ceiling, inclusive;
 *   - `null` — deliberately unrestricted, every design is available;
 *   - `undefined` — we do not know, because nothing has told us yet.
 *
 * The last two behave identically on purpose, for the reason given on
 * `isTierUnlocked`.
 */
export type TemplateCeiling = string | null | undefined;

const TIER_RANK = new Map<string, number>(
  TEMPLATE_TIER_ORDER.map((tier, index) => [tier, index]),
);

/**
 * Where a tier sits on the ladder, or `null` for a tier this build has never
 * heard of. Never guesses a position: a tier added after this build shipped
 * could belong anywhere, and placing it at either end would be an invention.
 */
export function tierRank(tier: string): number | null {
  return TIER_RANK.get(tier) ?? null;
}

/**
 * Whether a template is available to an account with this ceiling.
 *
 * **Fails open, deliberately and in every direction.** An absent ceiling, a
 * `null` one, a ceiling naming a tier we do not recognise, and a template whose
 * tier we do not recognise all answer `true`.
 *
 * The two errors are not equally bad. Showing a design as available when it is
 * not costs one refused request, which the API answers with
 * `TEMPLATE_TIER_REQUIRES_PLAN` and the screen turns into an upgrade prompt —
 * the client is told what to do and we are told there is an upsell. Locking a
 * design the client has already paid for costs us a paying customer staring at
 * a padlock over the thing they bought, with no way to prove us wrong. So when
 * this cannot tell, it lets them through and lets the server refuse.
 */
export function isTierUnlocked(tier: string, ceiling: TemplateCeiling): boolean {
  if (ceiling === null || ceiling === undefined || ceiling === "") return true;
  const limit = tierRank(ceiling);
  if (limit === null) return true;
  const rank = tierRank(tier);
  if (rank === null) return true;
  return rank <= limit;
}

/**
 * Every tier a ceiling unlocks, plainest first — the ceiling itself and
 * everything under it.
 *
 * Exists for the admin panel, where "highest tier included" is the single most
 * misreadable setting in the plan editor: staff read "Modern" and picture a
 * plan that offers one design. Spelling the list out under the field answers
 * that without anybody having to know how the comparison works.
 */
export function includedTiers(ceiling: TemplateCeiling): TemplateTier[] {
  if (ceiling === null || ceiling === undefined || ceiling === "") {
    return [...TEMPLATE_TIER_ORDER];
  }
  const limit = tierRank(ceiling);
  if (limit === null) return [...TEMPLATE_TIER_ORDER];
  return TEMPLATE_TIER_ORDER.slice(0, limit + 1);
}

export function fetchTemplates(): Promise<SiteTemplate[]> {
  return request<SiteTemplate[]>("/templates");
}


/** Absolute URL for a template's thumbnail, which the API returns as a path. */
export function templateThumbnail(template: SiteTemplate): string {
  return assetUrl(template.previewUrl);
}
