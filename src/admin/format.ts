import type { Locale } from "../i18n";

/** Formatting helpers shared by the admin screens. */

export function formatDate(value: string | undefined, locale: Locale): string {
  if (!value) return "—";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return "—";
  return new Date(parsed).toLocaleDateString(locale === "ka" ? "ka-GE" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Mirrors the backend's slug derivation closely enough to preview it: lowercase
 * ASCII, dashes for gaps. Georgian names transliterate to nothing, which is why
 * staff can always type the slug themselves.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const SLUG_PATTERN = /^[a-z0-9-]*$/;

/** Bilingual values arrive as a `*Ka`/`*En` pair; pick the reader's language. */
export function localised(
  ka: string | undefined,
  en: string | undefined,
  locale: Locale,
): string {
  const preferred = locale === "ka" ? ka : en;
  return preferred ?? ka ?? en ?? "";
}
