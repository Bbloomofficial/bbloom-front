/**
 * Shapes returned by the client-facing half of the manage API. Fields the
 * backend leaves null are omitted from the JSON entirely, so almost everything
 * is optional here.
 */

export type SiteLanguage = "ka" | "en";

/** Membership roles. An editor may rewrite a site but not commit it to a bill. */
export type MemberRole = "SITE_OWNER" | "SITE_EDITOR";

/**
 * `DRAFT` is "never published", `SUSPENDED` is "taken offline for non-payment".
 * They are deliberately distinct, so every status readout must handle both.
 */
export type SiteStatus = "DRAFT" | "PUBLISHED" | "SUSPENDED" | "ARCHIVED";

export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "GRACE"
  | "EXPIRED"
  | "CANCELLED";

/**
 * Hosting is allowed for `ACTIVE` and `GRACE` only. `TRIALING` explicitly does
 * not host: a trial buys full editing and no public website. Never infer this
 * from the status here — read `allowsHosting`, which is the backend's answer.
 */
export type SiteSubscriptionSummary = {
  status: SubscriptionStatus | string;
  allowsHosting: boolean;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  graceUntil?: string;
  cancelAtPeriodEnd?: boolean;
};

/** One website an account can reach, with the role it holds on it. */
export type AccountSite = {
  id: string;
  slug: string;
  businessName: string;
  status: SiteStatus | string;
  role: MemberRole | string;
  defaultLanguage?: SiteLanguage;
  templateCode?: string;
  primaryDomain?: string;
  publicUrl?: string;
  hasDraftChanges?: boolean;
  subscription?: SiteSubscriptionSummary;
  createdAt?: string;
};

/**
 * An account exists on its own and may own no website at all — a freshly
 * registered one has `sites: []` and *omits* the flat `siteId`/`siteSlug`/
 * `businessName` keys entirely rather than sending them as null.
 *
 * Those flat fields mirror the first site for backwards compatibility. New code
 * reads `sites`; nothing here should be built on the mirror.
 */
export type AccountProfile = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  emailVerified: boolean;
  siteId?: string;
  siteSlug?: string;
  businessName?: string;
  defaultLanguage?: SiteLanguage;
  sites: AccountSite[];
};

/** The old name, kept so the shared HTTP callers read the same either way. */
export type SiteUserProfile = AccountProfile;

export type SiteLoginResponse = {
  token: string;
  tokenType: string;
  expiresAt: string;
  user: AccountProfile;
};

/**
 * A purchasable hosting plan — defined next to the public plans endpoint,
 * because the marketing pricing page renders the same list.
 */
export type { WebsitePlan } from "../../api/plans";

export type SubscriptionPayment = {
  id: string;
  amountMinor?: number;
  currency?: string;
  status?: string;
  provider?: string;
  /** Which plan the money is for — set on the pending row before it settles. */
  planCode?: string;
  periodStart?: string;
  periodEnd?: string;
  note?: string;
  paidAt?: string;
  createdAt?: string;
};

export type SubscriptionDetail = {
  id: string;
  siteId: string;
  status: SubscriptionStatus | string;
  provider?: string;
  planCode?: string;
  allowsHosting: boolean;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  graceUntil?: string;
  cancelAtPeriodEnd?: boolean;
  /**
   * An amount we have asked for and not yet seen — `null` when nothing is
   * outstanding. It emphatically does not mean the money has arrived: hosting
   * stays gated on `allowsHosting`, and a site with a transfer in flight is
   * still offline. Starting another checkout replaces this row rather than
   * adding to it, and activation settles this very row, so there is never a
   * stray pending payment left beside a successful one.
   */
  pendingPayment?: SubscriptionPayment | null;
  payments?: SubscriptionPayment[];
};

/**
 * Manual bank transfer answers with `instructions` and no `redirectUrl` key at
 * all. Card providers will answer with a `redirectUrl`, so callers branch on
 * which one arrived rather than on the provider name.
 */
export type CheckoutResponse = {
  provider: string;
  redirectUrl?: string;
  instructions?: string;
};

export type SiteMember = {
  accountId: string;
  email: string;
  fullName: string;
  role: MemberRole | string;
  enabled: boolean;
  emailVerified?: boolean;
  addedAt?: string;
  lastLoginAt?: string;
};

/**
 * Email delivery is not wired up yet, so this currently carries the `token`
 * for testing. Nothing in the UI may depend on that field existing.
 *
 * `retryAfter` is when another request will be accepted — the resend button
 * counts down from it rather than finding the limit by being refused, though
 * the 429 still has to be handled because two tabs can race it.
 */
export type VerificationTicket = {
  email: string;
  expiresAt?: string;
  retryAfter?: string;
  token?: string;
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

export type SiteDomain = {
  id: string;
  hostname: string;
  primaryDomain: boolean;
  verified: boolean;
};

export type SiteDetail = {
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
  defaultLanguage?: SiteLanguage;
  languages?: SiteLanguage[];
  currency?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddressKa?: string;
  contactAddressEn?: string;
  domains?: SiteDomain[];
  primaryUrl?: string;
  productCount?: number;
  hasUnpublishedChanges?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** A localised value in the raw (unresolved) content the editor works with. */
export type LocalizedText = Partial<Record<SiteLanguage, string>>;

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "link"
  | "boolean"
  | "number"
  | "select"
  | "image"
  | "list";

export type FieldSchema = {
  key: string;
  type: FieldType;
  label?: LocalizedText;
  hint?: LocalizedText;
  required?: boolean;
  localized?: boolean;
  options?: string[];
  itemFields?: FieldSchema[];
};

export type SectionDto = {
  id: string;
  key: string;
  type: string;
  variant?: string;
  label?: LocalizedText;
  sortOrder: number;
  visible: boolean;
  content: Record<string, unknown>;
  fields?: FieldSchema[];
  /** True while the section holds edits that are not live yet. */
  hasDraft: boolean;
  updatedAt?: string;
};

export type DraftState = { hasDraft: boolean; sectionsChanged: number };

export type MediaItem = {
  id: string;
  url: string;
  contentType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  altTextKa?: string;
  altTextEn?: string;
  originalFilename?: string;
  createdAt?: string;
};

export const ENQUIRY_TYPES = [
  "GENERAL",
  "PRODUCT",
  "RESERVATION",
  "NEWSLETTER",
] as const;

export type EnquiryType = (typeof ENQUIRY_TYPES)[number];

export const ENQUIRY_STATUSES = [
  "NEW",
  "CONTACTED",
  "HANDLED",
  "SPAM",
  "ARCHIVED",
] as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export type Enquiry = {
  id: string;
  type: string;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  productId?: string;
  productName?: string;
  productNameKa?: string;
  productNameEn?: string;
  reservationDate?: string;
  reservationTime?: string;
  partySize?: number;
  metadata?: Record<string, unknown>;
  language?: SiteLanguage;
  status: string;
  internalNote?: string;
  createdAt: string;
  handledAt?: string;
};

export type EnquiryStats = {
  total: number;
  newEnquiries: number;
  last7Days: number;
  last30Days: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
};

export type Page<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
};
