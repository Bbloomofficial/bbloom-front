import type { Locale } from "../i18n";
import type { TemplateSummary } from "./api/types";

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

/** Date and clock time. The status screen needs the minute, not just the day. */
/** Renders a backend instant for staff.
 *
 *  The backend's instants carry nanoseconds (`…:47.901800409Z`). `Date.parse`
 *  handles that, truncating to milliseconds, which is finer than this screen
 *  displays anyway.
 *
 *  Deliberately string-only, and it should stay that way. The backend's
 *  timestamp *format* is not pinned by any test that exercises Spring's own
 *  mapper, so a `write-dates-as-timestamps` flip would start sending epoch
 *  numbers with nothing failing on either side. Measured what that does here:
 *  every epoch shape — seconds, seconds-with-nanos, milliseconds, and their
 *  string forms — yields `NaN` and renders as "—". That is the good failure.
 *  An absent timestamp is visibly absent; a wrong one is not.
 *
 *  So do not "fix" the dash by accepting numbers. Seconds and milliseconds are
 *  indistinguishable at this magnitude, and guessing wrong renders a confident,
 *  well-formatted 1970 next to a real recipient's address on the one screen
 *  whose job is deciding who to apologise to. */
export function formatDateTime(
  value: string | undefined,
  locale: Locale,
): string {
  if (!value) return "—";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return "—";
  return new Date(parsed).toLocaleString(locale === "ka" ? "ka-GE" : "en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
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

/**
 * The template catalog's copy, in the reader's language. It arrives both
 * resolved and as `*Ka`/`*En` pairs; we read the pair so a language toggle
 * costs nothing, and fall back to the resolved value.
 */
export function templateText(
  template: TemplateSummary,
  locale: Locale,
): { name: string; tagline: string; description: string } {
  return {
    name: localised(template.nameKa, template.nameEn, locale) || template.name,
    tagline:
      localised(template.taglineKa, template.taglineEn, locale) ||
      template.tagline ||
      "",
    description:
      localised(template.descriptionKa, template.descriptionEn, locale) ||
      template.description ||
      "",
  };
}
