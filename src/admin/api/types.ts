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
