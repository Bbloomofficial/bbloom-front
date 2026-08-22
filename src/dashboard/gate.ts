import { ApiError } from "../api/http";
import type { AccountSite, SiteSubscriptionSummary } from "./api/types";

/**
 * The hosting gate. A client may edit their website from the moment they create
 * it, but it only goes public once it is paid for — so every "publish" affordance
 * has to be able to say *why* it will not work, before it is pressed.
 */

/** Why publishing is refused. `null` means it should go through. */
export type PublishBlock =
  | "TRIAL"
  | "EXPIRED"
  | "CANCELLED"
  | "NO_SUBSCRIPTION"
  | "EMAIL_UNVERIFIED";

/**
 * The subscription reason, derived from `allowsHosting` rather than from the
 * status name — the backend owns that rule and only it is authoritative.
 * `TRIALING` not allowing hosting is the whole point of the feature, not a bug.
 */
function subscriptionBlock(
  subscription: SiteSubscriptionSummary | undefined,
): PublishBlock | null {
  if (!subscription) return "NO_SUBSCRIPTION";
  if (subscription.allowsHosting) return null;
  switch (subscription.status) {
    case "TRIALING":
      return "TRIAL";
    case "EXPIRED":
      return "EXPIRED";
    case "CANCELLED":
      return "CANCELLED";
    default:
      return "NO_SUBSCRIPTION";
  }
}

/**
 * Every reason publishing would be refused, most substantive first. Both a
 * lapsed subscription and an unconfirmed email can be true at once, and a
 * client who fixes only the one we happened to mention would be back where
 * they started.
 */
export function publishBlocks(
  site: Pick<AccountSite, "subscription">,
  emailVerified: boolean,
): PublishBlock[] {
  const blocks: PublishBlock[] = [];
  const subscription = subscriptionBlock(site.subscription);
  if (subscription) blocks.push(subscription);
  if (!emailVerified) blocks.push("EMAIL_UNVERIFIED");
  return blocks;
}

export function canPublish(
  site: Pick<AccountSite, "subscription">,
  emailVerified: boolean,
): boolean {
  return publishBlocks(site, emailVerified).length === 0;
}

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
): string {
  if (error instanceof ApiError && error.status === 409) {
    const [block] = publishBlocks(site, emailVerified);
    if (block) return copy[block];
  }
  return error instanceof Error ? error.message : String(error);
}
