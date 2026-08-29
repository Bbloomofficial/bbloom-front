/**
 * Shapes returned by the client-facing half of the manage API. Fields the
 * backend leaves null are omitted from the JSON entirely, so almost everything
 * is optional here.
 */

import type {
  AdChannel,
  AdCampaignStatus,
  AdInsightsFigures,
} from "../../api/ads";

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
 * domain resolving, visitors being able to write to the client through a
 * message form on the website. Read it for every upgrade prompt and every paid
 * affordance.
 *
 * Not "enquiries being emailed out", which is what this used to say. Nobody's
 * enquiries are emailed, paid or free — the notification sender is switched off
 * globally. The paid extra is *collecting* the message, not delivering it.
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
 * Those flat fields mirror the *earliest* site for backwards compatibility —
 * not `sites[0]`, which is the newest, since the list arrives newest-first. New
 * code reads `sites`; nothing here should be built on the mirror.
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
  /** The code that was used, if one was. */
  promoCode?: string;
  /**
   * How much came off. `amountMinor` is already net of it. Always present — a
   * primitive on the API side, so `0` rather than absent when nothing came off.
   */
  discountMinor: number;
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
/**
 * What a checkout will cost, worked out by the API.
 *
 * Every figure here is the server's, and none of them may be recomputed on this
 * side: the discount is rounded server-side and a multi-period purchase is
 * discounted once on the total rather than per period, so arithmetic done here
 * disagrees with the invoice by a cent on some percentages.
 */
export type CheckoutQuote = {
  planCode: string;
  currency: string;
  periods: number;
  /** One period at list price. */
  unitPriceMinor: number;
  /** The whole purchase at list price — the figure to strike through. */
  listAmountMinor: number;
  discountMinor: number;
  /** What will actually be charged. */
  amountMinor: number;
  discountPercent?: number;
  discountSource?: "PLAN_SALE" | "PROMO_CODE" | "FIRST_PURCHASE";
  /**
   * How many of the `periods` above the discount actually covers — `1` for
   * `FIRST_PURCHASE`, all of them for the other two, and absent when nothing is
   * discounted.
   *
   * It exists so the breakdown can explain itself: a quote reading 50% off
   * beside a `discountMinor` worth a sixth of the struck-through figure looks
   * like a bug to anyone who cannot see that only one period was discounted.
   */
  discountPeriods?: number;
  /**
   * The code that was sent, echoed back **even when it lost** to a better sale
   * price. Read with `promoCodeApplied` — a code that lost is not refused and
   * is not spent, and telling the client it was invalid would be a lie.
   */
  promoCode?: string;
  promoCodeApplied: boolean;
};

export type CheckoutResponse = {
  provider: string;
  redirectUrl?: string;
  instructions?: string;
  /**
   * Whether this provider can actually take money today.
   *
   * Card checkout is written and switched off — bbloom has no merchant contract
   * of its own yet — so the API answers the request rather than refusing it, and
   * says so here. It is a field of its own precisely because the alternative,
   * inferring it from a missing `redirectUrl`, cannot tell "you cannot pay
   * online yet" apart from bank transfer, which also has no redirect and is a
   * perfectly good way to pay. Conflating them would either hide working
   * transfer instructions or promise a card form that does not exist.
   */
  available: boolean;
  /** The final breakdown, so the result needs no second call to explain itself. */
  quote?: CheckoutQuote;
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

/**
 * Capability flags. Only the ones this app branches on are named; the server
 * sends more and a partial patch leaves the rest alone.
 */
export type SiteFeatureFlags = {
  enquiryForm?: boolean;
  reservations?: boolean;
  newsletter?: boolean;
} & Record<string, boolean | undefined>;

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
  /**
   * What the client *chose*. `null`/absent means they have never chosen, so the
   * template's own default stands.
   *
   * Deliberately separate from `effectiveFeatures`, which is what is actually on
   * once the plan is applied. The two disagree exactly when a client switched
   * something on and then stopped paying — and in that case the editor must keep
   * showing their choice. Driving the toggle from `effectiveFeatures` would flip
   * it off under them and read as "my setting was thrown away"; it was not, and
   * it comes back when they pay.
   */
  features?: SiteFeatureFlags | null;
  /** What is on right now, plan applied. Everything a visitor sees follows this. */
  effectiveFeatures?: SiteFeatureFlags;
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

/**
 * Online orders.
 *
 * Two status columns, deliberately, and they must never be merged in the UI.
 * `status` is where the money is and only the bank moves it; `fulfilment` is
 * how far the shop has got and only the shop moves it. A single combined badge
 * would have to invent pairings — "paid and cancelled" is a real and important
 * state, and it is a refund waiting to happen.
 */
export const ORDER_STATUSES = [
  "AWAITING_PAYMENT",
  "PAID",
  "FAILED",
  "EXPIRED",
  "CANCELLED",
  "REFUNDED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const FULFILMENT_STATUSES = [
  "NEW",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

export type FulfilmentStatus = (typeof FULFILMENT_STATUSES)[number];

/**
 * One line of an order, priced by the server when the order was placed.
 *
 * `lineTotalMinor` is the server's own multiplication and is rendered as sent.
 * Recomputing it from `unitPriceMinor * quantity` would look identical today
 * and diverge the first time a line carries anything the client cannot see —
 * and it would diverge silently, on a receipt.
 */
export type OrderItem = {
  productId: string;
  name: string;
  sku?: string;
  unitPriceMinor: number;
  quantity: number;
  lineTotalMinor: number;
};

/** Every amount is in minor units, as stored. Format for display, never divide. */
export type Order = {
  id: string;
  /** Sequential per shop, which is why the public page is keyed on a token. */
  orderNumber: number;
  status: OrderStatus | string;
  fulfilment: FulfilmentStatus | string;
  amountMinor: number;
  currency: string;
  provider?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerNote?: string;
  internalNote?: string;
  language?: SiteLanguage;
  paidAt?: string;
  createdAt: string;
  items: OrderItem[];
};

export type OrderStats = {
  total: number;
  awaitingPayment: number;
  paid: number;
  /** Orders nobody at the shop has opened yet — `fulfilment === "NEW"`. */
  newOrders: number;
  last7Days: number;
  last30Days: number;
  paidTotalMinor: number;
  currency: string;
};

/**
 * Why a shop cannot sell. A code rather than a sentence, because the panel is
 * read in Georgian and matching on the backend's English prose would break the
 * first time anybody reworded it.
 *
 * The three are not interchangeable and each has a different next step: the
 * first needs a different template, the second needs paying for, and the third
 * the client cannot fix at all — connecting a bank account is staff work, so
 * telling them to go and do it would send them looking for a screen that does
 * not exist for them.
 */
export type OrderingBlockedReason =
  | "TEMPLATE_TIER"
  | "FEATURE_OFF"
  | "NO_PAYMENT_ACCOUNT";

export type OrderingStatus = {
  enabled: boolean;
  blockedReason?: OrderingBlockedReason | string;
  provider?: string;
  merchantRef?: string;
  currency?: string;
  connectedAt?: string;
};

/**
 * A client's view of one of their Facebook/Instagram campaigns.
 *
 * Read-only, and deliberately smaller than the staff DTO. It carries no Meta
 * identifiers, because every client's advertising runs out of one shared bbloom
 * ad account — an id handed to one client is a handle on everybody else's
 * spending. There is no field to ask for and none to add.
 *
 * The client cannot create, pause or delete either. Advertising is a service
 * staff run for them, so this screen reports and does not act.
 */
export type ClientAdCampaign = {
  id: string;
  name: string;
  status: AdCampaignStatus;
  channels: AdChannel[];
  dailyBudgetMinor: number;
  /** The ad account's currency, not necessarily the client's. Never assume GEL. */
  currency: string;
  destinationUrl?: string;
  headline?: string;
  primaryText?: string;
  imageUrl?: string;
  launchedAt?: string;
  createdAt: string;
} & AdInsightsFigures & {
    /** Null until Meta has reported. See `AdInsightsFigures`. */
    insightsReadAt?: string | null;
  };
