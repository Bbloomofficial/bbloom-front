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
 * What a subscription currently entitles a website to.
 *
 * There are two separate questions here and they used to be one. Hosting is no
 * longer sold: a website is published free, permanently, at its `bbloom.ge`
 * address, and hosting is never withdrawn for billing reasons — so
 * `allowsHosting` is now always true and is worthless as a signal. Anything
 * asking "may this go online?" is asking a question with only one answer, and
 * would pass silently forever.
 *
 * `allowsPaidFeatures` is the real one: our badge coming off the page, a custom
 * domain resolving, enquiries being emailed out. Read it for every upgrade
 * prompt and every paid affordance.
 *
 * Never infer either from the status name. `TRIALING` hosts happily now.
 */
export type SiteSubscriptionSummary = {
  status: SubscriptionStatus | string;
  /**
   * @deprecated Always true. Kept only because the API still sends it; reading
   * it to gate anything is a condition that can no longer fail.
   */
  allowsHosting: boolean;
  /** Whether the paid extras are currently active. This is the one to read. */
  allowsPaidFeatures?: boolean;
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
  /**
   * Whether putting *this* website online would be refused for want of a paid
   * plan, as of the moment the profile was fetched.
   *
   * Free hosting covers one website online at a time, and this is the server
   * stating whether the slot is spoken for rather than us re-deriving it. It
   * is not a property of the site alone — it turns on what else its owners
   * have online — so it changes underneath us when another site is published
   * or taken offline, and it is only meaningful as fresh as the last refresh.
   *
   * Absent means no. An older API does not send it, and the safe reading of
   * silence is "nothing is in the way": wrongly warning someone their website
   * needs paying for when it does not is far worse than staying quiet and
   * letting the 409 explain itself.
   */
  publishRequiresPlan?: boolean;
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
  /**
   * Whether the server can actually send mail. Absent on older builds, so only
   * an explicit `false` means "nothing will arrive" — treating unknown as off
   * would tell every client on a healthy server that confirmation is broken.
   */
  emailDelivery?: boolean;
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
  /**
   * Whether *this* message was accepted by the mail server.
   *
   * Distinct from `emailDelivery`, which is an aggregate health flag that only
   * goes false after three consecutive failures — so the first two people of
   * every outage see a healthy server and an email that never arrives. This is
   * the per-send answer, and the two are allowed to disagree.
   *
   * Absent or null means unknown: no answer within the server's wait, or
   * nothing was sent at all (signing in mails nothing). Unknown must never be
   * rendered as failure — claiming an email failed while it is still in flight
   * is the same confident wrongness pointing the other way.
   *
   * The ceiling on `true`: it means the SMTP server *accepted* the message, not
   * that it arrived. A typo'd or dead address is accepted and bounces
   * asynchronously at the far end, where no signal reaches us. So `true` rules
   * out the failure that cost a client on 23 August — authentication refused,
   * nothing left the building — and rules out nothing about the address. Copy
   * on this branch may say "sent"; it may not say "delivered".
   */
  mailSent?: boolean | null;
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
  /** @deprecated Always true. See `SiteSubscriptionSummary`. */
  allowsHosting: boolean;
  /** Whether the paid extras are currently active. */
  allowsPaidFeatures?: boolean;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  graceUntil?: string;
  cancelAtPeriodEnd?: boolean;
  /**
   * An amount we have asked for and not yet seen — `null` when nothing is
   * outstanding. It emphatically does not mean the money has arrived: the paid
   * extras stay gated on `allowsPaidFeatures`, so a site with a transfer in
   * flight still carries our badge. Starting another checkout replaces this row
   * rather than adding to it, and activation settles this very row, so there is
   * never a stray pending payment left beside a successful one.
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
 * `resendAvailableAt` is when another send will be accepted — the resend
 * button counts down from it rather than finding the limit by being refused,
 * though the 429 still has to be handled because two tabs can race it.
 */
export type VerificationTicket = {
  email: string;
  /** When the emailed *link* expires — three days, not the code's fifteen minutes. */
  expiresAt?: string;
  /** When the six-digit code expires. This is the one a countdown should follow. */
  codeExpiresAt?: string;
  /**
   * Not an older spelling of `resendAvailableAt`: it belongs to the *sign-in*
   * throttle (`AUTH_RATE_LIMITED`), while the resend throttle
   * (`RESEND_TOO_SOON`) carries `resendAvailableAt`. Two throttles, two
   * fields, both current. Read here only as tolerance — it is not expected on
   * a verification ticket, so it must never be the field a countdown is built
   * on or the countdown silently disappears.
   */
  retryAfter?: string;
  resendAvailableAt?: string;
  /**
   * False when the server has no mail configured, in which case nothing was
   * actually sent and telling the client to check their inbox would be a lie.
   */
  emailDelivery?: boolean;
  /**
   * Whether this particular resend was accepted by the mail server. See
   * `SiteLoginResponse.mailSent`; absent/null is unknown, not failure.
   */
  mailSent?: boolean | null;
  /**
   * Only present while mail delivery was unwired. Never render it: once the
   * backend actually sends the email this field goes away, and a screen that
   * depended on it would break silently.
   */
  token?: string;
};

/**
 * The language an email should be written in. Sent explicitly on every call
 * that causes mail to leave the building, because the account's stored
 * preference cannot know that the client just switched the panel to English.
 */
export type EmailLanguage = "ka" | "en";

export type CreateSiteRequest = {
  businessName: string;
  slug?: string;
  templateCode: string;
  defaultLanguage?: SiteLanguage;
  languages?: SiteLanguage[];
  currency?: string;
  contactEmail?: string;
  contactPhone?: string;
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
  mapUrl?: string;
  social?: Record<string, string>;
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
