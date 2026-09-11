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

export function fetchTemplates(): Promise<SiteTemplate[]> {
  return request<SiteTemplate[]>("/templates");
}

/** Absolute URL for a template's thumbnail, which the API returns as a path. */
export function templateThumbnail(template: SiteTemplate): string {
  return assetUrl(template.previewUrl);
}
