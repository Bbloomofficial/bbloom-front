/**
 * Shapes returned by the staff half of the manage API. The backend omits null
 * fields from its JSON entirely, so nearly everything here is optional.
 *
 * Note the manage API never resolves a language for us — bilingual values
 * arrive as `*Ka`/`*En` pairs, and it is the screen's job to pick one.
 */

export type SiteLanguage = "ka" | "en";

export const SITE_LANGUAGES: SiteLanguage[] = ["ka", "en"];

/** A staff account. Unlike a client profile this carries no `siteId` — that
 *  absence is exactly what makes the token good for every site. */
export type StaffProfile = {
  id: string;
  email: string;
  fullName: string;
  role: string;
};

export type StaffLoginResponse = {
  token: string;
  tokenType: string;
  expiresAt: string;
  user: StaffProfile;
};

export type Page<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
};

/** The backend's category enum is `SHOP`, not `ONLINE_SHOP`. */
export const TEMPLATE_CATEGORIES = ["SHOP", "RESTAURANT"] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

/** Ordered from plainest to richest, which is also how we lay them out. */
export const TEMPLATE_TIERS = ["SIMPLE", "CLASSIC", "MODERN"] as const;
export type TemplateTier = (typeof TEMPLATE_TIERS)[number];

export type TemplateSummary = {
  code: string;
  category: string;
  tier: string;
  /**
   * Resolved to whatever `lang` the request asked for. Prefer the `*Ka`/`*En`
   * pairs below and keep these as the fallback: reading the pair means a
   * language toggle re-renders from data we already hold.
   */
  name: string;
  tagline?: string;
  description?: string;
  nameKa?: string;
  nameEn?: string;
  taglineKa?: string;
  taglineEn?: string;
  descriptionKa?: string;
  descriptionEn?: string;
  /**
   * Root-relative path to a generated wireframe thumbnail
   * (`/api/v1/templates/{code}/preview`). Resolve it with `assetUrl` rather
   * than using it raw, and keep a fallback: it can be absent on older builds.
   */
  previewUrl?: string | null;
  /**
   * Slug of a live, published site built from this template. The wireframe
   * says what the layout is; this says what it actually looks like, so it is
   * worth linking wherever there is room. Absent on older builds.
   */
  demoSlug?: string | null;
  flagship?: boolean;
  sections?: string[];
};

export type SiteStatus = "DRAFT" | "PUBLISHED";

export type SiteSummary = {
  id: string;
  slug: string;
  businessName: string;
  status: string;
  templateCode: string;
  templateName?: string;
  templateNameKa?: string;
  templateNameEn?: string;
  category?: string;
  tier?: string;
  primaryUrl?: string;
  publishedAt?: string;
  updatedAt?: string;
  /**
   * Page edits are saved but not yet public. Resolved for the whole page in
   * one query, so badging every row costs no more than badging one. It covers
   * *section* edits only — catalog and media changes apply immediately.
   */
  hasUnpublishedChanges?: boolean;
};

export type SiteDomain = {
  id: string;
  hostname: string;
  primaryDomain: boolean;
  verified: boolean;
};

export type SiteDetail = SiteSummary & {
  defaultLanguage?: SiteLanguage;
  languages?: SiteLanguage[];
  currency?: string;
  social?: Record<string, string> | null;
  seoTitleKa?: string;
  seoTitleEn?: string;
  seoDescriptionKa?: string;
  seoDescriptionEn?: string;
  contactEmail?: string;
  /**
   * Where enquiry notifications are sent. Null means they go to
   * `contactEmail` instead — it is a fallback, not "nobody is told".
   */
  notificationEmail?: string;
  contactPhone?: string;
  contactAddressKa?: string;
  contactAddressEn?: string;
  mapUrl?: string;
  domains?: SiteDomain[];
  /**
   * True when section edits are saved but not yet published — the site is
   * live, yet visitors still see the previous version. Publishing clears it.
   * The list summary carries the same flag.
   */
  hasUnpublishedChanges?: boolean;
  productCount?: number;
  createdAt?: string;
};

export type SiteUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  enabled: boolean;
  createdAt?: string;
  lastLoginAt?: string;
};

export type CreateSiteRequest = {
  businessName: string;
  slug?: string;
  templateCode: string;
  defaultLanguage?: SiteLanguage;
  languages?: SiteLanguage[];
  currency?: string;
  contactEmail?: string;
  contactPhone?: string;
  includeSampleContent?: boolean;
};

/**
 * Every key is optional and `null` clears that one field — the manage API
 * treats PATCH as a true partial update, so we only ever send what changed.
 */
export type UpdateSiteRequest = {
  businessName?: string;
  defaultLanguage?: SiteLanguage;
  languages?: SiteLanguage[];
  currency?: string | null;
  social?: Record<string, string> | null;
  seoTitleKa?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionKa?: string | null;
  seoDescriptionEn?: string | null;
  contactEmail?: string | null;
  notificationEmail?: string | null;
  contactPhone?: string | null;
  contactAddressKa?: string | null;
  contactAddressEn?: string | null;
  mapUrl?: string | null;
};

/**
 * Operational health of the API process, for the staff status screen.
 *
 * This is a snapshot of the running container's memory, not an audit log: it
 * resets on every deploy. It answers "is something wrong now", and a screen
 * built on it must not imply it can answer "what happened last week".
 */

/**
 * `OFF` means no from-address is configured, so mail is deliberately a no-op.
 * That is the correct state on a developer's laptop and must not be rendered
 * as an outage.
 */
export const MAIL_STATUSES = ["OK", "DEGRADED", "FAILING", "OFF"] as const;
export type MailStatus = (typeof MAIL_STATUSES)[number];

/**
 * One send that did not leave the building. `recipient` is deliberately
 * unmasked by the backend and must stay that way — the only job this screen
 * has is telling a human who to go and apologise to.
 */
export type MailFailure = {
  at: string;
  recipient: string;
  subject: string;
  reason: string;
};

export type MailHealth = {
  status: MailStatus;
  configured: boolean;
  /**
   * The *client-facing* flag, which stays true through the first two failures
   * by design. Never branch on it here: on the day it mattered, the first
   * failure and the lost customer were the same send. Branch on `status`.
   */
  healthy: boolean;
  consecutiveFailures: number;
  /** Absent — not null — when the process has restarted and not yet sent. */
  lastSuccessAt?: string;
  /**
   * Distinct addresses affected by the current run, counted independently of
   * the list, so it stays exact when the list is truncated. Always present on
   * a current backend, including `0`; absent on an older one, where the only
   * available answer is to count the rows and hedge.
   */
  affectedRecipients?: number;
  /**
   * The newest failure, which the list itself no longer carries: eviction now
   * keeps the *earliest* entries, so every visible `reason` is frozen at the
   * start of an outage. These two are what stop an admin diagnosing a problem
   * that has already been replaced by a different one. Absent, never null.
   */
  lastFailureAt?: string;
  lastFailureReason?: string;
  /**
   * People still owed an email, which is a different question from whether
   * mail is broken. Everything else on this payload clears on the next
   * successful send — and an outage *ends* with an admin sending themselves a
   * test, which is a successful send. On 23 August that probe would have wiped
   * the real client off the screen at the moment somebody opened it to find
   * out who to apologise to.
   *
   * So this list survives recovery and may be non-empty while `status` is
   * `OK`. That is not the impossible pairing — that one is `OK` with a
   * non-empty `recentFailures`, and it still holds. Never gate this on
   * `status`: a panel that hides it when the light is green loses the same
   * person twice.
   *
   * One row per person, holding their *first* failure, oldest first. An entry
   * disappears when that person receives something, not when anybody does.
   * Because the timestamp is their first failure rather than their latest, it
   * marks when they *started* waiting — which is what makes "longest wait"
   * meaningful rather than a guess at when they gave up.
   *
   * Capped at 20, and evicted from the **opposite end to `recentFailures`**:
   * this list drops the *oldest* row to admit a new person, so that a stale
   * list can never hide a live outage. The consequence for the screen is
   * counter-intuitive and is the reason the truncation note is worded as it
   * is — when this list is truncated, the people missing from it are the ones
   * who have been waiting *longest*, not the ones who have just joined. An
   * admin working top-down through the visible rows is not starting with the
   * worst case; they are starting with the worst case still on the screen.
   *
   * Two claims live in the truncation copy and must not be collapsed into one
   * by a future edit: the *visible* rows really are longest-wait-first, and
   * the *missing* ones have waited longer than any of them. Both are true and
   * they pull in opposite directions, which is precisely why the sentence
   * cannot be shortened without becoming false.
   *
   * Finally, this list is a *lower bound* on who is owed, and in a sharper way
   * than "we cannot see bounces". The row is cleared on SMTP *acceptance*, not
   * on delivery — so a message accepted by the relay and bounced afterwards
   * removes a person who was already listed here. Not merely never added:
   * deleted, by the event that failed them. The copy must therefore never
   * claim this list is everyone who is owed, only everyone we know of.
   */
  unresolved?: MailFailure[];
  /**
   * How many people are owed in total, listed or not — counted from a separate
   * tally rather than from the rows, so truncation cannot make it lie. A
   * primitive int, so `0` genuinely means zero rather than unknown.
   */
  owedTotal?: number;
  /**
   * Cleared by the next successful send, so a non-empty list means these
   * people are still waiting. Most recent first, but the most recent is
   * routinely the least important entry: render all of them.
   */
  recentFailures: MailFailure[];
};

export type SystemStatus = {
  checkedAt: string;
  mail: MailHealth;
};

export const MAIL_TEST_OUTCOMES = ["SENT", "FAILED", "NOT_CONFIGURED"] as const;

/**
 * What became of one staff test send.
 *
 * Three values, not two, and the third is the reason the endpoint is worth
 * having: `NOT_CONFIGURED` means no from-address is set and **nothing was
 * attempted**. It is not a failure, and showing it as one sends somebody to
 * check a password that was never used — which is the confusion that cost hours
 * in August and the whole point of the split.
 *
 * `SENT` is acceptance by the mail server, not arrival. The honest ceiling of
 * this button is "we handed it over"; only a human finding `reference` in an
 * inbox closes the rest.
 */
export type MailTestOutcome = (typeof MAIL_TEST_OUTCOMES)[number];

export type MailTestResult = {
  outcome: MailTestOutcome;
  recipient: string;
  attemptedAt: string;
  /**
   * Six hex characters, repeated in the subject line. The one field that makes
   * the answer checkable: two tests in a row produce two near-identical
   * emails, and the older one makes a *failed* second test look like a pass.
   * Without matching this, the feature can confirm mail works while it is
   * broken.
   */
  reference?: string;
  subject?: string;
  /** Absent — not null — unless `outcome` is `FAILED`. Show it verbatim. */
  failureReason?: string;
  /**
   * The failure rows this send erased, handed back because the person pressing
   * the button is usually the person reading that list — so without this the
   * evidence vanishes mid-read.
   *
   * Not the owed list: these people survive in `mail.unresolved` and leave it
   * only when they personally receive something.
   */
  clearedFailures?: MailFailure[];
  /** A fresh reading taken after the attempt, so one call refreshes the page. */
  mail?: MailHealth;
};

/**
 * The staff view of one website attached to an account.
 *
 * Every optional field here is **absent when unset, never `null`**: the API
 * serialises with `non_null` inclusion platform-wide, so an unset value drops
 * the key rather than sending it as null. The `| null` below is tolerance in
 * case that setting ever changes, not a shape observed on the wire — a
 * `=== null` test against any of these would be dead code today. Read them
 * with `??` or a truthiness check.
 *
 * `planCode` is absent on **every** site in production, including the paid
 * ones, because no plan has been sold yet. It is therefore not the answer to
 * "is this client paying" — `paid` is, and `subscriptionStatus` is reliably
 * present. Rendering the plan name as the paid signal would show blank
 * against a genuinely paying account.
 */
export type AdminAccountSiteDto = {
  id: string;
  slug: string;
  businessName: string;
  status: "DRAFT" | "PUBLISHED";
  role: "SITE_OWNER" | "SITE_EDITOR" | null;
  paid: boolean;
  planCode?: string | null;
  subscriptionStatus?: string | null;
  currentPeriodEnd?: string | null;
  usingFreeSlot: boolean;
  createdAt: string;
};

/**
 * A client account as staff see it. Same absent-not-null rule as above.
 *
 * `sites` is the exception that is always present: it arrives as `[]` for an
 * account with no websites rather than being dropped. It is still read
 * defensively, because it is the one field whose absence empties the whole
 * admin panel rather than blanking a row — verified by removing the guard.
 *
 * `language` arrives **uppercase** (`"KA"`), so lower-case it before looking
 * up a display name or the lookup silently misses and staff see a bare code.
 */
export type AdminAccountDto = {
  id: string;
  email: string;
  fullName: string;
  language?: string | null;
  enabled: boolean;
  emailVerified: boolean;
  emailVerifiedAt?: string | null;
  createdAt: string;
  lastLoginAt?: string | null;
  freeSiteAllowance: number;
  freeSitesUsed: number;
  atFreeLimit: boolean;
  sites: AdminAccountSiteDto[];
};

/**
 * One language's copy for a plan. `price` is a display string ("negotiable",
 * "from $199") and is never what a client is charged — the plan's `priceMinor`
 * is. Both exist because a "contact us" tier has copy where a number would go.
 */
export type AdminPlanTranslationDto = {
  /** Lowercase, as the API writes it: `ka`, `en`. */
  language: string;
  name: string;
  price: string;
  cadence: string;
  summary: string;
  cta: string;
  features: string[];
};

/**
 * A plan as staff edit it, which is more than the public pricing page sees:
 * inactive and non-purchasable tiers are included so they can be brought back
 * without a database session.
 *
 * `purchasable` and `active` are separate on purpose. An inactive plan is gone
 * from the site; a non-purchasable one is advertised but has no self-serve
 * checkout, which is what the negotiated "Custom" tier is.
 */
export type AdminPlanDto = {
  id: number;
  code: string;
  featured: boolean;
  sortOrder: number;
  active: boolean;
  /** Minor units — 19900 is $199.00. The only billable number here. */
  priceMinor: number;
  currency: string;
  billingPeriod: string;
  purchasable: boolean;
  /**
   * Announced on the pricing page but not open for business. Distinct from
   * `purchasable` on purpose: that one is the negotiated tier, whose price is a
   * conversation, while this one advertises a real price that simply cannot be
   * paid yet. Self-serve checkout is refused with a `PLAN_COMING_SOON` 409.
   *
   * A sale is still allowed on one of these, unlike on a negotiated tier — a
   * launch offer set up in advance is already running the day the plan opens.
   */
  comingSoon: boolean;
  translations: AdminPlanTranslationDto[];
  /**
   * A sale on this plan: how much off, and for how long.
   *
   * Both dates are optional and mean different things by their absence — no
   * start is "already running", no end is "until someone stops it". The window
   * is judged against the clock on every read, so a sale that has run out stops
   * applying with nobody touching the record.
   *
   * The API refuses a discount on a non-purchasable plan rather than ignoring
   * one: a percentage off a negotiated tier would be accepted, saved, and show
   * up nowhere.
   */
  discountPercent?: number;
  discountStartsAt?: string;
  discountEndsAt?: string;
  /** Read-only. Whether the window above covers right now. */
  discountLive: boolean;
  /**
   * Read-only. What a client would be charged today — `priceMinor` when no sale
   * is live. Computed by the API so the editor never has to agree with the
   * server's rounding.
   */
  effectivePriceMinor: number;
};

/**
 * The body of a create or update.
 *
 * The two derived fields are dropped rather than sent back: they are answers,
 * not settings, and a stale `effectivePriceMinor` posted from a form that has
 * been open a while would be a price nobody typed.
 */
export type PlanUpsertRequest = Omit<
  AdminPlanDto,
  "id" | "discountLive" | "effectivePriceMinor"
>;

/**
 * A promo code, as staff manage it.
 *
 * `planCodes` is a *restriction*, and an empty list means it applies to every
 * plan rather than to none — the permissive default. Each entry must name a
 * plan that exists; a typo is refused rather than saved, because a mistyped
 * restriction is a code that looks configured and works nowhere.
 *
 * The code itself is stored upper-cased and trimmed, so a client typing
 * `spring` matches `SPRING`. Read the canonical form back off the response
 * rather than assuming the input survived.
 */
export type AdminPromoCodeDto = {
  id: number;
  code: string;
  percentOff: number;
  active: boolean;
  expiresAt?: string;
  maxRedemptions?: number;
  /**
   * Both derived on read, never stored.
   *
   * A redemption is a payment naming the code, so an outstanding checkout holds
   * a use and abandoning it releases one — this figure moves without anybody
   * editing the code.
   */
  redemptions: number;
  usable: boolean;
  planCodes: string[];
  createdAt: string;
};

/**
 * The body of a create or update.
 *
 * `percentOff` is a primitive on the API side: omitting it is a 400 rather than
 * a defaulted zero, so it is required here too.
 */
export type PromoCodeUpsertRequest = {
  code: string;
  percentOff: number;
  active: boolean;
  expiresAt?: string;
  maxRedemptions?: number;
  planCodes: string[];
};

/**
 * The new-customer offer: a percentage off a client's first billing period,
 * once per account ever.
 *
 * A single setting rather than a list — there is one offer, it is either on or
 * off, and it cannot be created or deleted. That is why this has no `id`: there
 * is nothing to address, and the endpoints are a bare `GET` and `PUT`.
 *
 * Switching it off leaves every discount already granted alone; the offer is
 * recorded on the payment that took it, so the takings still explain
 * themselves and no client is re-charged.
 */
export type AdminNewCustomerOfferDto = {
  percentOff: number;
  active: boolean;
  /** When staff last changed it. Absent until somebody has. */
  updatedAt?: string;
};

/**
 * The body of the update. A full replacement, matching the `PUT` convention of
 * the promo code endpoints — both fields are always sent, so switching the
 * offer off cannot silently carry a half-edited percentage with it.
 */
export type NewCustomerOfferUpdateRequest = {
  percentOff: number;
  active: boolean;
};

/**
 * A client's bank merchant account, as staff see it.
 *
 * Note what is missing: the credential. The API never reads one back out, by
 * design, so nothing here can pre-fill a secret field and no screen may pretend
 * to. Editing is therefore write-only — the form says a secret is *set*, and
 * changing the provider means retyping both halves.
 */
export type ConnectedPaymentAccount = {
  provider: string;
  /** `PENDING` is stored-but-not-live; `DISABLED` is a retired predecessor. */
  status: "PENDING" | "ACTIVE" | "DISABLED" | string;
  merchantRef?: string;
  currency?: string;
  returnUrl?: string;
  connectedAt?: string;
};

/**
 * `availableProviders` is the set of banks this server actually has a gateway
 * for. It is read rather than hard-coded here so that a third bank shipped on
 * the backend appears in the picker without a frontend deploy.
 */
export type PaymentAccountView = {
  account: ConnectedPaymentAccount | null;
  availableProviders: string[];
};

/**
 * Connecting an account. `extra` is whatever one bank needs and another does
 * not — TBC wants a base url, BOG wants a base url, a token url and the public
 * key its callbacks are signed with.
 */
export type ConnectPaymentAccountRequest = {
  provider: string;
  clientId: string;
  clientSecret: string;
  merchantRef?: string;
  currency?: string;
  returnUrl?: string;
  extra?: Record<string, string>;
};

/**
 * Whether a website can sell, and what is missing if not. The same shape the
 * client dashboard reads; staff see it here as confirmation that connecting an
 * account actually switched ordering on, which is the part of this that is
 * easiest to get wrong and hardest to notice.
 */
export type OrderingStatus = {
  enabled: boolean;
  blockedReason?: string;
  provider?: string;
  merchantRef?: string;
  currency?: string;
  connectedAt?: string;
};

/*
  Facebook and Instagram advertising.

  Every campaign in here runs out of one bbloom-owned agency ad account, on
  behalf of a client, launched by staff. Two consequences shape these types.

  The first is that a campaign goes live the moment it is created — there is no
  draft and no paused-first step — so anything that creates or resumes one is
  spending real money on the press of a button, and the screens say so.

  The second is that budgets are minor units of the *ad account's* currency,
  which is Meta's to decide and not ours. Every amount here therefore travels
  with a currency code and is rendered through `formatMinor`, which takes one.
  Nothing may assume GEL.
*/

/** Where an ad is shown. The plan a site is on decides which of these it sells. */
export type { AdChannel, AdCampaignStatus } from "../../api/ads";
export { AD_CHANNELS } from "../../api/ads";
import type {
  AdChannel,
  AdCampaignStatus,
  AdInsightsFigures,
  AdUpstreamFailure,
} from "../../api/ads";

export type AdCampaignDto = {
  id: string;
  siteId: string;
  siteName?: string;
  name: string;
  objective: "TRAFFIC";
  status: AdCampaignStatus;
  channels: AdChannel[];
  dailyBudgetMinor: number;
  /** The ad account's currency, not the client's. Never assume GEL. */
  currency: string;
  destinationUrl?: string;
  headline?: string;
  primaryText?: string;
  imageUrl?: string;
  country?: string;
  cityKey?: string;
  ageMin?: number;
  ageMax?: number;
  /**
   * Meta's own identifiers. Staff-only, and deliberately absent from the
   * client's copy of this DTO: one ad account is shared across every client,
   * so an id handed to one of them is a handle on everybody's spending.
   */
  metaCampaignId?: string;
  metaAdSetId?: string;
  metaCreativeId?: string;
  metaAdId?: string;
  /** A campaign launched by the admin test tool rather than for a client. */
  test: boolean;
  createdByEmail?: string;
  /** Absent unless `status` is `FAILED`. Show it verbatim. */
  failureReason?: string;
  launchedAt?: string;
  pausedAt?: string;
  deletedAt?: string;
  createdAt: string;
} & AdInsightsFigures & {
    /**
     * When Meta's figures above were last read. **Null until Meta has actually
     * reported** — the server deliberately does not stamp an empty report, so a
     * campaign nobody has heard back about cannot render a confident zero.
     *
     * Non-null means the numbers are cached rather than live, so they are shown
     * as "as of <time>". Meta's own reporting lags hours and gets restated
     * afterwards, so the staleness is stated rather than implied.
     */
    insightsReadAt?: string | null;
  };

export type AdTestOutcome = "LAUNCHED" | "FAILED" | "NOT_CONFIGURED";

/**
 * What the test button did.
 *
 * Always arrives as **200**, including when Meta refuses — the same envelope as
 * `MailTestResult`, and for the same reason: the request succeeded, we asked
 * what happened and were told. `outcome` carries the answer, so a `FAILED` must
 * not be rendered as a request error.
 *
 * There is no budget field on the request that produces this. The budget is
 * server configuration, so a mistyped one cannot spend a client's month in an
 * afternoon.
 */
export type AdTestResult = {
  outcome: AdTestOutcome;
  campaignId?: string;
  metaCampaignId?: string;
  name?: string;
  channels?: AdChannel[];
  dailyBudgetMinor?: number;
  currency?: string;
  destinationUrl?: string;
  attemptedAt?: string;
  /** Absent — not null — unless `outcome` is `FAILED`. */
  failureReason?: string;
  /**
   * Meta's verdict as a code, when Meta gave one.
   *
   * The same two values the 502 carries, deliberately, so one dictionary serves
   * both. **Null does not mean Meta was happy**: it also covers a break on our
   * side of the call before Meta had a verdict, and `NOT_CONFIGURED`, where
   * nothing was asked of Meta at all. So this is only ever read as "Meta said
   * this", never as "Meta said nothing is wrong".
   */
  failureCode?: AdUpstreamFailure | null;
  /**
   * Something is live at Meta and costing money. True on a failure that got far
   * enough to create the campaign, which is exactly the case where the row
   * looks like nothing happened. When this is set the delete button is the
   * point of the screen.
   */
  stillSpending?: boolean;
};

/**
 * Meta's own reading of the ad account, taken live. Null on the status payload
 * when we are not configured — there is nobody to ask.
 */
export type AdMetaAccount = {
  /** Whether Meta answered at all, as opposed to whether our settings look right. */
  reachable: boolean;
  adAccountName?: string;
  /** Meta's numeric account state. `1` is the only healthy value. */
  accountStatus?: number;
  /**
   * Meta's own words for `accountStatus` ("Unsettled — a payment has failed").
   * English, and the backend's prose rather than ours, so it is a fallback for
   * a status this build has no sentence for — not the primary rendering. The
   * numeric `accountStatus` is the contract.
   */
  accountStatusLabel?: string;
  currency?: string;
  timezone?: string;
  pageName?: string;
  instagramUsername?: string;
  tokenOwner?: string;
  failureReason?: string;
};

/**
 * Whether advertising works, answered twice on purpose.
 *
 * `configured` is "our settings look complete" and `meta.reachable` is "Meta
 * actually answered". They fail independently and they send someone to two
 * different places, so the card shows both rather than reducing them to one
 * light — the same split as the mail card's configured/sending.
 *
 * Safe to poll: it never fails.
 */
export type AdStatus = {
  checkedAt?: string;
  configured: boolean;
  enabled: boolean;
  instagramConfigured: boolean;
  adAccountId?: string;
  apiVersion?: string;
  /**
   * The server-side ceiling on a daily budget, in minor units. Exceeding it is
   * a 400 with a `Max` constraint on `dailyBudgetMinor`.
   */
  maxDailyBudgetMinor?: number;
  /**
   * The currency those minor units are in. Read from here first and from
   * `meta.currency` second: `meta` is null exactly when we are unconfigured or
   * Meta is unreachable, which is when a budget figure with no unit is most
   * misleading.
   */
  currency?: string;
  /** How many campaigns are spending money right now. */
  liveCampaigns: number;
  /**
   * Live campaigns from the test tool. Any number above zero is a fault: it
   * means somebody left a test running and it is billing us, not a client.
   */
  liveTestCampaigns: number;
  meta?: AdMetaAccount | null;
};

export type AdTestRequest = {
  channels: AdChannel[];
  destinationUrl?: string;
};

/**
 * A new campaign.
 *
 * Worth remembering while reading the form that builds this: there is no draft
 * state on the far side. The server creates the campaign, ad set, creative and
 * ad at Meta and it is live when the response arrives, so this request is the
 * last point at which anything can be checked.
 *
 * `destinationUrl` blank means the client's own site, resolved server-side. It
 * is left out of the body entirely rather than sent empty, so the default is
 * the server's to choose.
 */
export type AdCampaignCreateRequest = {
  siteId: string;
  name: string;
  channels: AdChannel[];
  dailyBudgetMinor: number;
  destinationUrl?: string;
  headline?: string;
  primaryText?: string;
  imageUrl?: string;
  /** Two letters. The server defaults to `GE` when this is absent. */
  country?: string;
  cityKey?: string;
  ageMin?: number;
  ageMax?: number;
};

export type AdCampaignQuery = {
  siteId?: string;
  status?: AdCampaignStatus;
  /**
   * Whether to include the admin test tool's own campaigns. Defaults to
   * excluding them: they are ours, they are not a client's advertising, and
   * leaving them in the main list is how one gets mistaken for work.
   */
  test?: boolean;
  page?: number;
  size?: number;
};
