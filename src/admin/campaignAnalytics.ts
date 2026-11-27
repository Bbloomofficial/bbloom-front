import { isSpending } from "../api/ads";
import type { AdCampaignDto, AdCampaignStatus, AdChannel } from "./api/types";

/*
  The arithmetic behind the campaign manager: filtering, sorting and totals.

  Kept apart from the page, and tested, because this is where a wrong answer is
  silent. A total that drops a campaign, or a sort that puts "9.50" above
  "10.00", reads as a fact about the business, not as a bug.

  Meta's figures are strings and stay strings in the rows (see
  `AdInsightsFigures`). Totalling them still means reading them, so the spend
  sum below is done in exact decimal arithmetic: `0.1 + 0.2` must come out as
  `0.30`, the way Meta's billing will add it up, not as `0.30000000000000004`.
  Ratios (CTR, cost per click) are derived figures, and the page labels them
  as calculated rather than presenting them as Meta's.
*/

// ---------------------------------------------------------------------------
// Exact decimals
// ---------------------------------------------------------------------------

/** A decimal as a whole number of units at `scale` places: 12.34 is 1234 / 2. */
export type Decimal = { units: bigint; scale: number };

const DECIMAL = /^(-?)(\d+)(?:\.(\d+))?$/;

/** Reads one of Meta's decimal strings. Anything else is `null`, not zero. */
export function parseDecimal(value: string | null | undefined): Decimal | null {
  if (value === null || value === undefined) return null;
  const match = DECIMAL.exec(String(value).trim());
  if (!match) return null;
  const [, sign, whole, fraction = ""] = match;
  const units = BigInt(whole + fraction) * (sign ? -1n : 1n);
  return { units, scale: fraction.length };
}

function rescale(value: Decimal, scale: number): bigint {
  return value.units * 10n ** BigInt(scale - value.scale);
}

export function addDecimals(a: Decimal, b: Decimal): Decimal {
  const scale = Math.max(a.scale, b.scale);
  return { units: rescale(a, scale) + rescale(b, scale), scale };
}

export function compareDecimals(a: Decimal, b: Decimal): number {
  const scale = Math.max(a.scale, b.scale);
  const left = rescale(a, scale);
  const right = rescale(b, scale);
  return left < right ? -1 : left > right ? 1 : 0;
}

/** Back to a string with at least two places: `{1234, 2}` is "12.34". */
export function formatDecimal(value: Decimal, minScale = 2): string {
  const scale = Math.max(value.scale, minScale);
  const units = rescale(value, scale);
  const negative = units < 0n;
  const digits = (negative ? -units : units).toString().padStart(scale + 1, "0");
  const whole = digits.slice(0, digits.length - scale);
  const fraction = digits.slice(digits.length - scale);
  return `${negative ? "-" : ""}${whole}${scale ? `.${fraction}` : ""}`;
}

/** For drawing a bar, and only for that. Never for a figure someone reads. */
export function decimalToNumber(value: Decimal): number {
  return Number(value.units) / 10 ** value.scale;
}

/** A whole-number count from Meta (impressions, clicks), or `null`. */
export function parseCount(value: string | null | undefined): number | null {
  const parsed = parseDecimal(value);
  if (!parsed || parsed.scale !== 0) return null;
  return Number(parsed.units);
}

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

export type CampaignFilters = {
  /** Matched against the name, the site and who launched it. */
  query: string;
  /** Empty means every status. */
  statuses: AdCampaignStatus[];
  channel: AdChannel | "";
  siteId: string;
  /** Inclusive, as `YYYY-MM-DD`, against the launch date (or creation). */
  from: string;
  to: string;
  /** Only what may still be costing money, by `isSpending`'s rule. */
  spendingOnly: boolean;
  /** Meta's own status, verbatim; `NOT_READ` for rows Meta has not been asked about. */
  metaStatus: string;
};

/**
 * A campaign as the server answered a pause or resume, without Meta's last
 * word on it. That word was read before the change and now describes the
 * campaign as it was, so ours is shown until Meta is next read.
 */
export function afterOwnChange(campaign: AdCampaignDto): AdCampaignDto {
  const { metaEffectiveStatus: _status, metaDeliveryIssue: _issue, ...rest } = campaign;
  return rest;
}

/** The Meta-status filter value for rows whose status at Meta was never read. */
export const META_NOT_READ = "NOT_READ";

/**
 * Our name for what Ads Manager's Delivery column shows as "Preparing": Meta has
 * the ad switched on (`ACTIVE`) but has not served a single impression yet. The
 * API has no such state of its own, so calling it "Active" would claim delivery
 * that has not happened.
 */
export const META_PREPARING = "PREPARING";

/**
 * The delivery word to show for a campaign, in Meta's terms, or undefined when
 * only ours is meaningful: never sent to Meta, deleted (we stop reading those,
 * so Meta's last word is stale), or not read yet.
 */
export function metaDelivery(campaign: AdCampaignDto): string | undefined {
  if (!campaign.metaCampaignId) return undefined;
  if (campaign.status === "DELETED" || campaign.deletedAt) return undefined;
  const state = campaign.metaEffectiveStatus;
  if (!state) return undefined;
  // Read before our own last pause, so it describes the campaign before it:
  // a pause made here would otherwise still read "Active" for up to an hour.
  if (
    campaign.status === "PAUSED" &&
    campaign.pausedAt &&
    !(Date.parse(campaign.metaStatusReadAt ?? "") >= Date.parse(campaign.pausedAt))
  ) {
    return undefined;
  }
  if (state === "ACTIVE" && !(Number(campaign.impressions ?? 0) > 0)) {
    return META_PREPARING;
  }
  return state;
}

export const NO_FILTERS: CampaignFilters = {
  query: "",
  statuses: [],
  channel: "",
  siteId: "",
  from: "",
  to: "",
  spendingOnly: false,
  metaStatus: "",
};

/** When a campaign started: its launch, or its creation if it never launched. */
export function campaignDate(campaign: AdCampaignDto): string {
  return campaign.launchedAt ?? campaign.createdAt;
}

/** The local calendar day of an instant, as `YYYY-MM-DD`. */
function localDay(instant: string): string | null {
  const parsed = Date.parse(instant);
  if (Number.isNaN(parsed)) return null;
  const date = new Date(parsed);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function filterCampaigns(
  campaigns: AdCampaignDto[],
  filters: CampaignFilters,
): AdCampaignDto[] {
  const needle = filters.query.trim().toLowerCase();
  return campaigns.filter((campaign) => {
    if (needle) {
      const haystack = [campaign.name, campaign.siteName, campaign.createdByEmail]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    if (filters.statuses.length && !filters.statuses.includes(campaign.status)) {
      return false;
    }
    if (filters.channel && !campaign.channels.includes(filters.channel)) {
      return false;
    }
    if (filters.siteId && campaign.siteId !== filters.siteId) return false;
    if (filters.spendingOnly && !isSpending(campaign)) return false;
    if (filters.metaStatus) {
      const atMeta = metaDelivery(campaign) ?? META_NOT_READ;
      if (atMeta !== filters.metaStatus) return false;
    }
    if (filters.from || filters.to) {
      const day = localDay(campaignDate(campaign));
      if (!day) return false;
      if (filters.from && day < filters.from) return false;
      if (filters.to && day > filters.to) return false;
    }
    return true;
  });
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

export const SORT_KEYS = [
  "name",
  "site",
  "status",
  "budget",
  "spend",
  "impressions",
  "clicks",
  "ctr",
  "date",
] as const;
export type SortKey = (typeof SORT_KEYS)[number];
export type SortDirection = "asc" | "desc";

/** Clicks per hundred impressions, from the row's own counts. */
export function rowCtr(campaign: AdCampaignDto): number | null {
  const impressions = parseCount(campaign.impressions);
  const clicks = parseCount(campaign.clicks);
  if (impressions === null || clicks === null || impressions === 0) return null;
  return (clicks / impressions) * 100;
}

type SortValue = string | number | Decimal | null;

function sortValue(campaign: AdCampaignDto, key: SortKey): SortValue {
  switch (key) {
    case "name":
      return campaign.name.toLowerCase();
    case "site":
      return campaign.siteName?.toLowerCase() ?? null;
    case "status":
      return campaign.status;
    case "budget":
      return campaign.dailyBudgetMinor;
    case "spend":
      return parseDecimal(campaign.spend);
    case "impressions":
      return parseCount(campaign.impressions);
    case "clicks":
      return parseCount(campaign.clicks);
    case "ctr":
      return rowCtr(campaign);
    case "date":
      return Date.parse(campaignDate(campaign)) || null;
  }
}

function compareValues(a: Exclude<SortValue, null>, b: Exclude<SortValue, null>) {
  if (typeof a === "object" && typeof b === "object") return compareDecimals(a, b);
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

/**
 * Sorted by one column. A campaign with no figure for that column goes last in
 * both directions: "not reported yet" is not the smallest spend, and putting it
 * first on an ascending sort hides the cheapest campaigns behind it.
 */
export function sortCampaigns(
  campaigns: AdCampaignDto[],
  key: SortKey,
  direction: SortDirection,
): AdCampaignDto[] {
  const sign = direction === "asc" ? 1 : -1;
  return [...campaigns].sort((left, right) => {
    const a = sortValue(left, key);
    const b = sortValue(right, key);
    if (a === null && b === null) return 0;
    if (a === null) return 1;
    if (b === null) return -1;
    return sign * compareValues(a, b);
  });
}

// ---------------------------------------------------------------------------
// Totals
// ---------------------------------------------------------------------------

/** Money per currency. One ad account is normally one currency, but not always. */
export type MoneyTotals = Record<string, Decimal>;

export type Bucket = {
  campaigns: number;
  impressions: number;
  clicks: number;
  spend: MoneyTotals;
};

export type CampaignTotals = Bucket & {
  /** Possibly costing money now, by `isSpending`'s rule. */
  live: number;
  test: number;
  /** Daily budget of the live ones, in minor units per currency. */
  liveDailyBudgetMinor: Record<string, number>;
  /** Campaigns Meta has not reported on yet — absent from the figures. */
  unreported: number;
  /** Clicks per hundred impressions across the set, or `null` with none. */
  ctr: number | null;
  byStatus: Record<string, Bucket>;
  bySite: Array<Bucket & { siteId: string; siteName?: string }>;
  byChannel: Record<string, Bucket>;
};

function emptyBucket(): Bucket {
  return { campaigns: 0, impressions: 0, clicks: 0, spend: {} };
}

/** The currency a campaign was billed in, or "?" when the row does not say. */
function currencyOf(campaign: AdCampaignDto): string {
  return campaign.currency || "?";
}

function addTo(bucket: Bucket, campaign: AdCampaignDto) {
  bucket.campaigns += 1;
  bucket.impressions += parseCount(campaign.impressions) ?? 0;
  bucket.clicks += parseCount(campaign.clicks) ?? 0;
  const spend = parseDecimal(campaign.spend);
  if (spend) {
    const currency = currencyOf(campaign);
    const current = bucket.spend[currency];
    bucket.spend[currency] = current ? addDecimals(current, spend) : spend;
  }
}

/** A channel combination as one label key: "FACEBOOK+INSTAGRAM". */
export function channelKey(channels: AdChannel[]): string {
  return [...channels].sort().join("+") || "—";
}

export function totalCampaigns(campaigns: AdCampaignDto[]): CampaignTotals {
  const totals: CampaignTotals = {
    ...emptyBucket(),
    live: 0,
    test: 0,
    liveDailyBudgetMinor: {},
    unreported: 0,
    ctr: null,
    byStatus: {},
    bySite: [],
    byChannel: {},
  };
  const sites = new Map<string, Bucket & { siteId: string; siteName?: string }>();

  for (const campaign of campaigns) {
    addTo(totals, campaign);
    if (campaign.test) totals.test += 1;
    if (!campaign.insightsReadAt) totals.unreported += 1;
    if (isSpending(campaign)) {
      totals.live += 1;
      const currency = currencyOf(campaign);
      totals.liveDailyBudgetMinor[currency] =
        (totals.liveDailyBudgetMinor[currency] ?? 0) + campaign.dailyBudgetMinor;
    }

    addTo((totals.byStatus[campaign.status] ??= emptyBucket()), campaign);
    addTo(
      (totals.byChannel[channelKey(campaign.channels)] ??= emptyBucket()),
      campaign,
    );

    let site = sites.get(campaign.siteId);
    if (!site) {
      site = { ...emptyBucket(), siteId: campaign.siteId, siteName: campaign.siteName };
      sites.set(campaign.siteId, site);
    }
    site.siteName ??= campaign.siteName;
    addTo(site, campaign);
  }

  totals.ctr =
    totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : null;
  totals.bySite = [...sites.values()].sort(
    (a, b) => compareMoney(b.spend, a.spend) || b.impressions - a.impressions,
  );
  return totals;
}

/**
 * Orders two money totals for ranking. Compares the shared currencies' sum
 * only when both are in one currency; mixed currencies fall back to equal, and
 * the caller's tiebreak decides.
 */
function compareMoney(a: MoneyTotals, b: MoneyTotals): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  if (keys.size !== 1) return 0;
  const [currency] = keys;
  const zero: Decimal = { units: 0n, scale: 0 };
  return compareDecimals(a[currency] ?? zero, b[currency] ?? zero);
}

/** Spend divided by clicks, per currency, when there were clicks. */
export function costPerClick(
  spend: MoneyTotals,
  clicks: number,
): Record<string, number> {
  const result: Record<string, number> = {};
  if (clicks <= 0) return result;
  for (const [currency, amount] of Object.entries(spend)) {
    result[currency] = decimalToNumber(amount) / clicks;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

function csvCell(value: string | number | undefined | null): string {
  const text = value === undefined || value === null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * The rows as CSV. Meta's figures go out exactly as Meta sent them, and the
 * budget in major units with the currency beside it, so a spreadsheet adds up
 * what this screen shows.
 */
export function campaignsToCsv(
  campaigns: AdCampaignDto[],
  headers: string[],
): string {
  const lines = [headers.map(csvCell).join(",")];
  for (const c of campaigns) {
    lines.push(
      [
        c.name,
        c.siteName,
        c.status,
        metaDelivery(c) ?? "",
        c.test ? "test" : "",
        c.channels.join("+"),
        (c.dailyBudgetMinor / 100).toFixed(2),
        c.currency,
        c.spend,
        c.impressions,
        c.clicks,
        c.launchedAt,
        c.createdAt,
        c.createdByEmail,
        c.id,
      ]
        .map(csvCell)
        .join(","),
    );
  }
  return lines.join("\r\n");
}
