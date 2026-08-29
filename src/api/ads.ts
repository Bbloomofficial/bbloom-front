import { ApiError } from "./http";

/*
  Types and refusals shared by the staff and client sides of advertising.

  Both shells otherwise keep their own DTOs, and should — the client's view of a
  campaign is deliberately a reduced one. These few live here because they are
  the same object on both sides and drift between two copies would be silent:
  the channel names are a wire contract, and the allowance is the single thing
  both audiences read the same way.
*/

/** Where an ad is shown. The plan a site is on caps how many may be combined. */
export const AD_CHANNELS = ["FACEBOOK", "INSTAGRAM"] as const;
export type AdChannel = (typeof AD_CHANNELS)[number];

/**
 * `ACTIVE` and `PAUSED` are self-explanatory. The two that need care:
 *
 * `FAILED` does **not** mean nothing happened. A campaign can fail part-way
 * through creation at Meta, after the campaign object exists — so a `FAILED`
 * row carrying a `metaCampaignId` with no `deletedAt` may still be spending,
 * and is the one state on these screens that needs a human immediately.
 *
 * `DELETED` is ours, not Meta's: the row stays for the audit trail.
 */
export type AdCampaignStatus = "ACTIVE" | "PAUSED" | "FAILED" | "DELETED";

/**
 * Meta's numbers, exactly as Meta sent them.
 *
 * Every one of these is a **string on purpose** and must stay one. The Insights
 * API returns them as JSON strings — including the plain counts — and we pass
 * them through unparsed. `spend` and `cpc` are decimals in the ad account's
 * currency and `ctr` is a percentage, all of which get reconciled against
 * Meta's billing; rounding them on the way to a screen breaks the only thing
 * they are for.
 *
 * So: display them, never compute with them. `Number()` on any of these is a
 * bug, not a tidy-up.
 *
 * `null` means Meta has no data yet — normal in the first hours of a campaign —
 * and must render as "not yet" rather than as zero. A confident 0 next to a
 * campaign that is quietly spending is the worst reading this screen can give.
 */
export type AdInsightsFigures = {
  impressions?: string | null;
  reach?: string | null;
  clicks?: string | null;
  ctr?: string | null;
  cpc?: string | null;
  spend?: string | null;
};

export type AdInsights = AdInsightsFigures & {
  campaignId: string;
  metaCampaignId?: string | null;
  currency?: string | null;
  /**
   * Whether Meta returned a data row at all. This is the only honest way to
   * tell "Meta has said nothing yet" from "Meta answered and we could not read
   * the answer", and it exists because `readAt` cannot carry that meaning:
   * on this endpoint the server stamps `readAt` when it *asks*, so it is never
   * null and a diagnostic keyed on it would fire on every healthy new campaign.
   */
  reported?: boolean;
  /**
   * When we asked Meta — not when Meta reported. Good for "read at 14:20",
   * useless as a signal about whether there is anything to read. Use
   * `reported` for that.
   */
  readAt?: string | null;
};

/**
 * What a site is allowed to advertise, this month.
 *
 * Advertising comes with the website plan rather than being bought separately,
 * so this is read from the subscription and there is nothing to grant here —
 * moving a client between allowances means moving them between plans.
 *
 * Two shapes to be careful with. `impressionLimit` and `impressionsRemaining`
 * are **null when unmetered** (Custom), and any arithmetic on that null reads as
 * zero, rendering the least restricted plan as the most restricted one — so read
 * them through `isUnlimited`. And `channels` is *which* channels the plan sells,
 * not how many: Simple is Facebook-only, so a Simple client asking for Instagram
 * alone is refused even though that is a single channel.
 */
export type AdAllowance = {
  allowed: boolean;
  planCode?: string | null;
  /** Which channels the plan sells — not a count. Offer exactly these. */
  channels: AdChannel[];
  /** Null when unmetered. */
  impressionLimit?: number | null;
  impressionsUsed: number;
  /** Null when unmetered, and clamped at zero — see `isOverAllowance`. */
  impressionsRemaining?: number | null;
  /** Why not, when `allowed` is false. One of the 409 codes below. */
  reason?: string | null;
};

/**
 * Why an advertising request was refused.
 *
 * These arrive as a stable `code` on a 409, which is the same contract the
 * publish gate reads — see `dashboard/gate.ts` for the argument in full. The
 * short version: the server's `detail` is deliberately actionable but it is
 * written in English, so a reason we recognise is rendered from our own
 * dictionaries and only an unrecognised one falls through to the server's
 * words. Nothing is ever silently swallowed.
 *
 * Kept here rather than in either shell because both audiences meet the same
 * refusals and must be told different things about them. Staff who hit
 * `ADS_PLAN_REQUIRED` need to move the client onto a plan that includes ads;
 * the client who hit it needs to be offered one. So this module owns the
 * *codes* and each shell supplies its own copy, exactly as
 * `publishErrorMessage` does.
 */
export const AD_REFUSALS = [
  /** The site's plan does not include advertising. */
  "ADS_PLAN_REQUIRED",
  /** It did, and the subscription has lapsed. */
  "ADS_PLAN_INACTIVE",
  /** The subscription is live, but advertising is not part of that plan. */
  "PLAN_WITHOUT_ADS",
  "ADS_NOT_IN_PLAN",
  /**
   * The plan does not sell that channel. About *which*, not how many: Simple
   * is Facebook-only, so asking for Instagram alone is refused too.
   */
  "ADS_CHANNEL_NOT_IN_PLAN",
  /** The plan's impressions for the period are used up. */
  "ADS_IMPRESSION_LIMIT",
  /** Meta credentials are not set up. Staff-facing: no client caused this. */
  "ADS_NOT_CONFIGURED",
  /** No Instagram account is connected, so only Facebook can be offered. */
  "INSTAGRAM_NOT_CONFIGURED",
  /** Pause or resume on a campaign that is not running. */
  "CAMPAIGN_NOT_LIVE",
  /** Insights or controls on a campaign that never reached Meta. */
  "CAMPAIGN_NOT_LAUNCHED",
] as const;

export type AdRefusal = (typeof AD_REFUSALS)[number];

const codes = new Set<string>(AD_REFUSALS);

function isRefusal(code: string | undefined): code is AdRefusal {
  return code !== undefined && codes.has(code);
}

/**
 * The named reason a request was refused, or `null` when it failed for some
 * other reason entirely.
 *
 * Read from the server's `code` only — never derived from local state. Which
 * limit a site is against is a fact the server holds and we mirror at best a
 * few seconds late, so guessing would mean telling somebody their month is
 * used up when what actually stopped them was the channel count.
 */
export function adRefusal(error: unknown): AdRefusal | null {
  if (!(error instanceof ApiError) || error.status !== 409) return null;
  return isRefusal(error.code) ? error.code : null;
}

/**
 * Meta itself failing, as opposed to us refusing.
 *
 * These arrive as a 502 from any endpoint that talks to Meta — launching,
 * pausing, resuming, deleting, the test tool, insights — and the split between
 * them is the one worth branching on, because the two have different people
 * fixing them. `META_TOKEN_INVALID` is ours and is fixable in minutes by
 * reconnecting the account; `META_UNAVAILABLE` is the request or Meta, and the
 * only moves are retry or edit.
 *
 * Matched on the code alone rather than on the status, unlike `adRefusal`. Not
 * merely because these two name Meta and cannot collide, but because the server
 * reserves the right to refine the transport: a timeout may well become a 504
 * rather than a 502, and pinning to a status would silently degrade exactly
 * those failures — the ones most worth naming — back to "something went wrong".
 * The code is the contract; the status is a detail. `adRefusal` is the other
 * case and still checks its 409, because those codes are generic enough that
 * the status is what stops one colliding with another domain's.
 */
export const AD_UPSTREAM_FAILURES = [
  "META_TOKEN_INVALID",
  "META_UNAVAILABLE",
] as const;

export type AdUpstreamFailure = (typeof AD_UPSTREAM_FAILURES)[number];

const upstreamCodes = new Set<string>(AD_UPSTREAM_FAILURES);

export function metaFailure(error: unknown): AdUpstreamFailure | null {
  if (!(error instanceof ApiError)) return null;
  const code = error.code;
  return code !== undefined && upstreamCodes.has(code)
    ? (code as AdUpstreamFailure)
    : null;
}

/**
 * Meta's own words about a failure, for a staff screen only.
 *
 * The server passes Meta's message through as `detail`, and it is worth showing
 * because it is frequently the only thing that names the actual object or field
 * at fault. It is also English, unlocalised, and often about an ad set id rather
 * than about anything a person did — so it goes beside our sentence rather than
 * instead of it, and it never reaches a client. Treated exactly as
 * `accountStatusLabel` is: our copy leads, the server's prose corroborates.
 */
export function metaDetail(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const detail = error.message.trim();
  return detail === "" ? null : detail;
}

/**
 * Turns a failed advertising request into a sentence, given this screen's copy.
 *
 * Two layers, because they are genuinely different events: a refusal is us
 * saying no for a reason the client can act on, and an upstream failure is Meta
 * saying no for a reason only staff can act on. `otherwise` covers everything
 * that is neither — a validation failure, a throttle, a dead network — so
 * callers keep whatever they already do for those rather than having it
 * flattened into a generic ads message.
 */
export function adErrorMessage(
  error: unknown,
  copy: Record<AdRefusal | AdUpstreamFailure, string>,
  otherwise: () => string,
): string {
  const upstream = metaFailure(error);
  if (upstream) {
    const detail = metaDetail(error);
    return detail ? `${copy[upstream]} ${detail}` : copy[upstream];
  }
  const refusal = adRefusal(error);
  return refusal ? copy[refusal] : otherwise();
}

/**
 * Whether a number that means "unlimited when absent" is in fact unlimited.
 *
 * Trivial, and written down anyway because the failure it prevents is silent:
 * `impressionLimit` is `null` on Custom, and any arithmetic on that null — a
 * comparison, a subtraction, a progress bar — reads as zero and renders the
 * least restricted plan as the most restricted one.
 */
export function isUnlimited(limit: number | null | undefined): boolean {
  return limit === null || limit === undefined;
}

/**
 * Whether a site has delivered more impressions than its plan sells.
 *
 * Possible, and not a bug: the allowance is checked at launch and never
 * reserved, because a campaign cannot know in advance what it will deliver, and
 * reserving against an estimate would sell ten thousand impressions and hand
 * over eight. So the last campaign of a period can run past the ceiling before
 * the figures catch up.
 *
 * This has to compare `used` against `limit` rather than reading
 * `impressionsRemaining`, which the server clamps at zero — an overshoot and an
 * exact landing both arrive as a remaining of 0 and only the numbers either
 * side of it tell them apart.
 */
export function isOverAllowance(allowance: AdAllowance): boolean {
  if (isUnlimited(allowance.impressionLimit)) return false;
  return allowance.impressionsUsed > (allowance.impressionLimit as number);
}

/**
 * Whether a campaign is costing money right now.
 *
 * `ACTIVE` is the obvious half. The other half is why this is a function rather
 * than a comparison: a `FAILED` campaign that reached Meta before it failed is
 * running, and its status is the one word on the screen that suggests it is
 * not. Undeleted is the test both halves share.
 */
export function isSpending(campaign: {
  status: AdCampaignStatus;
  metaCampaignId?: string;
  deletedAt?: string;
}): boolean {
  if (campaign.deletedAt) return false;
  if (campaign.status === "ACTIVE") return true;
  return campaign.status === "FAILED" && Boolean(campaign.metaCampaignId);
}

/**
 * A whole number of impressions, grouped for reading.
 *
 * Lives here rather than in either shell because both render the same allowance
 * and an impression count is the one figure on these screens that is genuinely
 * ours — unlike Meta's figures, which are opaque strings and must never be
 * reformatted. Five significant digits with no separator is the difference
 * between reading 10000 and reading 100000 at a glance, and that misreading is
 * a factor of ten in what somebody thinks they sold.
 */
export function formatCount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === "ka" ? "ka-GE" : "en-US").format(
    value,
  );
}

/**
 * One of Meta's figures, ready to render.
 *
 * The distinction that matters is between "Meta has not reported yet" and
 * "Meta reported nothing happened". The server never writes `insightsReadAt`
 * for an empty report, so an unread campaign has no timestamp — and this
 * returns `null` for it, which callers render as "not yet". A zero is only ever
 * shown when Meta actually said zero.
 */
export function figure(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}
