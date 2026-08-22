import type { PublicSection, SitePayload } from "../site/api/types";

/**
 * Contact details and social links are *site* settings, not section content —
 * the contact block, the header phone and the footer icons all read the same
 * one. The section editor therefore had no field for them, which read as "this
 * template's phone number cannot be changed".
 *
 * They are exposed as a synthetic section so the whole editor — tabs, derived
 * fields, hotspots, per-field undo — keeps working unchanged, and the draft
 * stores them under the reserved section key below.
 */

export const SITE_SCOPE = "site";

/**
 * Only what the API can actually store, verified against production:
 * `contactPhone`, `contactEmail`, `contactAddressKa|En`, `mapUrl` and `social`.
 */
export const SOCIAL_KEYS = [
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
  "telegram",
] as const;

const LABEL: Record<"ka" | "en", string> = {
  ka: "კონტაქტი და ბმულები",
  en: "Contact & links",
};

export function siteSectionLabel(lang: "ka" | "en"): string {
  return LABEL[lang];
}

/** Built from the *previewed* payload, so it reflects edits already made. */
export function siteSection(payload: SitePayload): PublicSection {
  const contact = payload.site.contact ?? null;
  const social = (payload.site.social ?? {}) as Record<string, string>;

  return {
    key: SITE_SCOPE,
    type: "contact",
    variant: null,
    sortOrder: -1,
    content: {
      contact: {
        phone: contact?.phone ?? "",
        email: contact?.email ?? "",
        address: contact?.address ?? "",
        mapUrl: contact?.mapUrl ?? "",
      },
      social: Object.fromEntries(
        SOCIAL_KEYS.map((key) => [key, social[key] ?? ""]),
      ),
    },
  } as PublicSection;
}
