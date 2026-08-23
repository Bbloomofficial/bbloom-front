import { ApiError } from "../api/http";
import type { AccountSite, SiteSubscriptionSummary } from "./api/types";

/**
 * What a client is and is not allowed to do with a website they have not paid
 * for.
 *
 * This used to be the hosting gate: a website stayed private until it was paid
 * for. That is no longer the deal. Publishing at a `bbloom.ge` address is free
 * and permanent, and a lapsed subscription never takes a website off the
 * internet. So the only thing standing between a new client and a public
 * website is confirming they own the email address they signed up with, which
 * is an anti-abuse check rather than a commercial one.
 *
 * Money now buys three things instead: our badge comes off the page, a custom
 * domain resolves, and enquiries are emailed out rather than only appearing in
 * the dashboard. Those are gated on `allowsPaidFeatures`.
 *
 * The distinction matters for what we say to a client whose subscription
 * lapses. Nothing goes dark. Their website is still up, still theirs, still
 * taking enquiries — the badge is back and their own domain has gone quiet.
 * "Your website is offline" is no longer a state that exists, and telling
 * someone it is would send them into a panic about a shop that is serving fine.
 */

/**
 * Why publishing is refused. `null` means it should go through.
 *
 * One member, and that is the point: every commercial reason is gone.
 */
export type PublishBlock = "EMAIL_UNVERIFIED";

/**
 * Every reason publishing would be refused, most substantive first.
 */
export function publishBlocks(
  _site: Pick<AccountSite, "subscription">,
  emailVerified: boolean,
): PublishBlock[] {
  return emailVerified ? [] : ["EMAIL_UNVERIFIED"];
}

export function canPublish(
  site: Pick<AccountSite, "subscription">,
  emailVerified: boolean,
): boolean {
  return publishBlocks(site, emailVerified).length === 0;
}

/**
 * Whether the paid extras are live for this website.
 *
 * Absent means no, deliberately. The flag is new, and a client on a build that
 * predates it should see the free experience — which is accurate, since a badge
 * we fail to render is consideration we fail to collect, whereas a plan we
 * wrongly treat as free only shows an upgrade prompt to someone who has already
 * upgraded. One of those errors costs us money and the other costs a click.
 */
export function hasPaidFeatures(
  site: Pick<AccountSite, "subscription">,
): boolean {
  return site.subscription?.allowsPaidFeatures === true;
}

/**
 * Why a paid-only action was refused. `null` means it should go through.
 */
export type PaidBlock = "FREE_PLAN" | "LAPSED";

/**
 * Which sentence a client needs when they reach for something they have not
 * paid for.
 *
 * Someone who has never subscribed needs to be sold to; someone whose
 * subscription lapsed needs to be reassured before they are sold to, because
 * "expired" reads as "my shop is down" and it is not.
 */
export function paidBlock(
  site: Pick<AccountSite, "subscription">,
): PaidBlock | null {
  if (hasPaidFeatures(site)) return null;
  return lapsedStatuses.has(site.subscription?.status ?? "")
    ? "LAPSED"
    : "FREE_PLAN";
}

const lapsedStatuses = new Set<SiteSubscriptionSummary["status"]>([
  "EXPIRED",
  "CANCELLED",
]);

/**
 * Turns a refused publish into something a Georgian-speaking client can act on.
 *
 * The backend's 409 `detail` is deliberately actionable, but it is written in
 * English, so a known reason is rendered from our own dictionaries instead. A
 * reason we do not recognise falls through to the server's own words, so a
 * message added on the backend tomorrow is never silently swallowed.
 */
export function publishErrorMessage(
  error: unknown,
  site: Pick<AccountSite, "subscription">,
  emailVerified: boolean,
  copy: Record<PublishBlock, string>,
  otherwise?: () => string,
): string {
  if (error instanceof ApiError && error.status === 409) {
    const [block] = publishBlocks(site, emailVerified);
    if (block) return copy[block];
  }
  if (otherwise) return otherwise();
  return error instanceof Error ? error.message : String(error);
}

/**
 * The same, for a paid-only action — today, connecting a custom domain.
 *
 * Derived from state rather than from the server's prose for the same reason
 * publishing is: these two 409s carry no `code` to branch on, and the sentences
 * are English.
 */
export function paidErrorMessage(
  error: unknown,
  site: Pick<AccountSite, "subscription">,
  copy: Record<PaidBlock, string>,
  otherwise?: () => string,
): string {
  if (error instanceof ApiError && error.status === 409) {
    const block = paidBlock(site);
    if (block) return copy[block];
  }
  if (otherwise) return otherwise();
  return error instanceof Error ? error.message : String(error);
}

