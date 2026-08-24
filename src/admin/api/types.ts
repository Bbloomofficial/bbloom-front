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
