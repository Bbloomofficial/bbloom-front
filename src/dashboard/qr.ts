import { ApiError } from "../api/http";
import type { PaidBlock } from "./gate";
import type { QrFormat } from "./api/client";
import type { SiteDomain } from "./api/types";

/**
 * The printable QR card, in the parts that are decidable without a network or
 * a screen. Kept out of the page so each one can be asserted on its own.
 */

/**
 * What to save the card as.
 *
 * Derived here rather than read off `Content-Disposition`, because in
 * production that header is invisible to us: the bundle is served from
 * `*.bbloom.ge` and the API from `api.bbloom.ge`, and a cross-origin response
 * only reveals the header when the server explicitly exposes it. The server's
 * own name is preferred where it does arrive — this is the floor, not a
 * replacement.
 *
 * The slug is already URL-safe on the server, but it is re-sanitised anyway:
 * this string goes into a download attribute and thence onto a filesystem, and
 * a slug that ever widens is not worth finding out about through a failed save.
 */
export function qrFilename(slug: string, format: QrFormat): string {
  const safe = slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${safe || "site"}-qr.${format}`;
}

/**
 * The backend's three subscription refusals, mapped onto the two sentences a
 * client can actually act on.
 *
 * They are three rather than one because "you have never paid for this" and
 * "you paid and it lapsed" ask for opposite things: the first is an upgrade,
 * the second is a renewal, and offering a lapsed client a fresh plan reads as
 * us having forgotten them. `EXPIRED` and `CANCELLED` differ in how the plan
 * ended, which is a distinction the billing screen owns and this screen does
 * not — both land a client in the same place, so both collapse to `LAPSED`.
 *
 * Kept separate from `paidErrorMessage` in `gate.ts` deliberately. That helper
 * fires on a bare 409 with no code, which is what the custom-domain refusal
 * still sends; this endpoint names its reason, and a named reason must beat a
 * reason we derived from a subscription summary that may be a few minutes old.
 */
const qrPaidCodes: Record<string, PaidBlock> = {
  PAID_PLAN_REQUIRED: "FREE_PLAN",
  SUBSCRIPTION_EXPIRED: "LAPSED",
  SUBSCRIPTION_CANCELLED: "LAPSED",
};

/**
 * Whether a failed card request was a subscription problem, and which.
 *
 * `fallback` is what local state believes, used only for a 409 carrying a code
 * we do not recognise — a backend that renames one of these should still lock
 * the screen rather than show a client a raw conflict. Anything that is not a
 * 409 is not this: a 403 here is another account's site, not a plan.
 */
export function qrPaidBlock(
  error: unknown,
  fallback: PaidBlock | null,
): PaidBlock | null {
  if (!(error instanceof ApiError)) return null;
  const named = error.code ? qrPaidCodes[error.code] : undefined;
  if (named) return named;
  return error.status === 409 ? fallback : null;
}

/**
 * The custom domain a client has asked for but not yet confirmed, if any.
 *
 * Worth saying out loud on this screen and nowhere else. The card encodes the
 * *verified* domain or, failing that, the `bbloom.ge` subdomain — an unverified
 * one is skipped on purpose, because a card printed against DNS that does not
 * resolve is broken permanently and on paper. A client mid-way through setting
 * up their own domain would otherwise print a hundred cards carrying an address
 * they are about to stop using, and only find out from a customer.
 *
 * Absent once anything is verified: at that point the card carries the domain
 * they wanted and there is nothing to warn about.
 */
export function pendingDomain(domains?: SiteDomain[]): string | undefined {
  if (!domains?.length) return undefined;
  if (domains.some((domain) => domain.verified)) return undefined;
  const preferred =
    domains.find((domain) => domain.primaryDomain) ?? domains[0];
  return preferred.hostname;
}
