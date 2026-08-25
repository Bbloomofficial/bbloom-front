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
 * domain resolves, and visitors can write to the client through a message form
 * on the website. Those are gated on `allowsPaidFeatures`.
 *
 * The distinction matters for what we say to a client whose subscription
 * lapses. Nothing goes dark. Their website is still up, still theirs, still
 * showing their phone number and address — the badge is back, their own domain
 * has gone quiet, and the message form has stopped taking messages.
 * "Your website is offline" is no longer a state that exists, and telling
 * someone it is would send them into a panic about a shop that is serving fine.
 *
 * The message form is the only one of the three that the client also has to
 * switch on, so it has two independent reasons to be absent and they must not
 * be conflated: `features.enquiryForm` is their choice, `effectiveFeatures
 * .enquiryForm` is that choice with the plan applied.
 */

/**
 * Why publishing is refused, of the reasons we can work out *before* asking.
 *
 * One member, and that is the point: every commercial reason for a *first*
 * website is gone.
 */
export type PublishBlock = "EMAIL_UNVERIFIED";

/**
 * Every reason the server refuses a publish, including the ones we cannot see
 * coming. A superset of `PublishBlock`.
 *
 * Free hosting covers one website per client, so an additional site has to be
 * paid for before it goes online. We deliberately do not predict that one. The
 * rule turns on which site holds the allowance, and the only way to work that
 * out here is to re-derive it from `createdAt` — a rule that lives on the
 * server and is not stated in any payload. Guessing it wrong means telling
 * someone their website needs paying for when it does not, so this reason is
 * only ever *reported*, never *predicted*.
 */
export type PublishRefusal = PublishBlock | "ADDITIONAL_SITE_REQUIRES_PLAN";

/**
 * The server's names for these, which are not our names for them.
 *
 * `EMAIL_NOT_VERIFIED` and `EMAIL_UNVERIFIED` are the same refusal spelled two
 * ways, so the mapping is written out rather than assumed to be an identity.
 */
const refusalCodes: Record<string, PublishRefusal> = {
  EMAIL_NOT_VERIFIED: "EMAIL_UNVERIFIED",
  EMAIL_UNVERIFIED: "EMAIL_UNVERIFIED",
  ADDITIONAL_SITE_REQUIRES_PLAN: "ADDITIONAL_SITE_REQUIRES_PLAN",
};

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
 * Whether the server says putting this website online would be refused for
 * want of a paid plan.
 *
 * Deliberately *not* folded into `publishBlocks`, which decides whether the
 * publish button is worth showing at all. This one warns without disarming.
 *
 * The difference is what a stale answer costs. `emailVerified` is a fact about
 * the account and stays true once true. This flag is a fact about the account's
 * *other* websites — taking one offline hands the slot over — so it can go
 * stale in a tab that has been open a while. If a stale `true` hid the button,
 * a client who had just freed the slot would be left looking at a screen with
 * no way to act and no way to find out why. Left visible, a stale `true` costs
 * one refused request, which now explains itself in their own language.
 *
 * Absent means no, for the reason given on the field itself.
 */
export function publishNeedsPlan(
  site: Pick<AccountSite, "publishRequiresPlan">,
): boolean {
  return site.publishRequiresPlan === true;
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
 *
 * The reason is taken from the server's `code` first and only derived from
 * local state as a fallback. That order matters now that more than one thing
 * can refuse a publish: derivation answers with whatever *would* block, which
 * is not necessarily what *did*. A client with an unconfirmed email who is
 * refused for needing a plan would be sent off to confirm their address —
 * truthfully, about the wrong subject — and would come back no better off. The
 * fallback is kept only for an API old enough not to send the codes.
 */
export function publishErrorMessage(
  error: unknown,
  site: Pick<AccountSite, "subscription">,
  emailVerified: boolean,
  copy: Record<PublishRefusal, string>,
  otherwise?: () => string,
): string {
  if (error instanceof ApiError && error.status === 409) {
    const named = error.code ? refusalCodes[error.code] : undefined;
    if (named) return copy[named];
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

