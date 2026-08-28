/**
 * Mirrors `PublicSiteDtos` in bbloom-back. Every localised value arrives already
 * resolved to one language, so nothing here is a `{ka, en}` pair.
 */

export type SiteLanguage = "ka" | "en";

export type MediaRef = {
  id: string | null;
  url: string;
  width: number | null;
  height: number | null;
  alt: string | null;
};

export type TemplateCode =
  | "shop-simple"
  | "shop-classic"
  | "shop-modern"
  | "restaurant-simple"
  | "restaurant-classic"
  | "restaurant-modern";

export type TemplateRef = {
  code: TemplateCode;
  category: "SHOP" | "RESTAURANT";
  tier: "SIMPLE" | "CLASSIC" | "MODERN";
  name: string;
};

export type SiteThemeColors = {
  background?: string;
  surface?: string;
  surfaceAlt?: string;
  text?: string;
  muted?: string;
  primary?: string;
  primaryContrast?: string;
  accent?: string;
  border?: string;
  gradientFrom?: string;
  gradientTo?: string;
};

export type SiteThemeFonts = {
  heading?: string;
  body?: string;
  headingWeight?: number;
  scale?: "compact" | "comfortable" | "elegant" | "expressive";
};

export type SiteEffects = {
  glassCards?: boolean;
  gradientText?: boolean;
  parallaxHero?: boolean;
  scrollReveal?: boolean;
  hoverLift?: boolean;
  stickyHeader?: boolean;
  stickyOrderBar?: boolean;
  noiseOverlay?: boolean;
  goldDividers?: boolean;
};

export type SiteTheme = {
  mode?: "light" | "dark";
  colors?: SiteThemeColors;
  fonts?: SiteThemeFonts;
  radius?: "sm" | "md" | "lg";
  shadow?: "soft" | "glow";
  density?: "comfortable" | "spacious";
  buttonStyle?: "solid" | "outline" | "pill";
  containerWidth?: string;
  effects?: SiteEffects;
};

/**
 * Capability flags for this site.
 *
 * No longer straight from the template blueprint: the server now resolves them
 * per site, so this is the client's choice with their plan applied on top. Same
 * key, same shape, different provenance — a flag that is `false` here may be one
 * the client switched on and has stopped paying for. Nothing on the public site
 * needs that distinction (a visitor sees what is on), but the editor does, which
 * is why `SiteDetail` carries both halves separately.
 */
export type SiteFeatures = {
  categories?: boolean;
  products?: boolean;
  productDetailPage?: boolean;
  productSearch?: boolean;
  productFilters?: boolean;
  productSorting?: boolean;
  gallery?: boolean;
  testimonials?: boolean;
  faq?: boolean;
  newsletter?: boolean;
  enquiryForm?: boolean;
  reservations?: boolean;
  dietaryTags?: boolean;
  deliveryLinks?: boolean;
  events?: boolean;
  whatsapp?: boolean;
  analyticsReady?: boolean;
  /**
   * Whether this website may sell.
   *
   * Resolved rather than declared: the backend only leaves it `true` on a
   * published render when the plan, the template tier *and* a connected bank
   * account all agree, so a storefront that trusts this flag can never draw a
   * buy button that every attempt would be refused by. The one exception is the
   * editor's draft render, which reports the client's own intent so they can lay
   * a shop out before we have connected their bank — which is exactly why the
   * buying UI must refuse to submit in preview.
   */
  onlineOrders?: boolean;
};

export type SiteMeta = {
  slug: string;
  businessName: string;
  status: string;
  template: TemplateRef;
  theme: SiteTheme | null;
  features: SiteFeatures | null;
  locale: SiteLanguage;
  defaultLanguage: SiteLanguage;
  languages: SiteLanguage[];
  currency: string;
  seo: { title: string | null; description: string | null } | null;
  contact: {
    email: string | null;
    phone: string | null;
    address: string | null;
    mapUrl: string | null;
  } | null;
  social: Record<string, string> | null;
  /** Template wording for catalog chrome — a "product" may be a "dish". */
  labels: { products?: string | null; categories?: string | null } | null;
  logo: MediaRef | null;
  favicon: MediaRef | null;
  /**
   * What credit this site owes us, decided by the backend.
   *
   * A free website is published at its `bbloom.ge` address permanently and is
   * never taken down for billing reasons; carrying our credit is the entire
   * consideration for that. So `badge` is not decoration, it is the price, and
   * a paid plan is what turns it off.
   *
   * `label` and `url` come with it, already localised to the language the site
   * is being rendered in — print them rather than translating again, or a
   * backend rewording lands in one language only. They are *absent* rather than
   * null when there is no badge, and we keep our own copy as a fallback so a
   * missing label can never silently become no credit at all.
   */
  branding?: {
    badge?: boolean;
    label?: string | null;
    url?: string | null;
    /**
     * The previous shape, before hosting stopped being the thing being sold.
     * Read only when `badge` is absent, so this keeps working against a backend
     * that predates the change.
     *
     * @deprecated Replaced by `badge`.
     */
    hidePoweredBy?: boolean;
    /** @deprecated No longer sent. Visitor-facing marketing, not the credit. */
    showUpgradePrompt?: boolean;
  };
};

/** Section content is free-form JSON authored by the client, so it stays loose. */
export type SectionContent = Record<string, unknown>;

export type PublicSection = {
  key: string;
  type: string;
  variant: string | null;
  sortOrder: number;
  content: SectionContent | null;
};

export type PublicCategory = {
  id: string;
  slug: string;
  name: string | null;
  description: string | null;
  image: MediaRef | null;
  sortOrder: number;
  productCount: number;
};

export type PublicProduct = {
  id: string;
  slug: string;
  name: string | null;
  shortDescription: string | null;
  description: string | null;
  price: number | null;
  compareAtPrice: number | null;
  currency: string | null;
  unit: string | null;
  badge: string | null;
  categoryId: string | null;
  categorySlug: string | null;
  image: MediaRef | null;
  gallery: MediaRef[] | null;
  attributes: ({ tags?: string[] } & Record<string, unknown>) | null;
  available: boolean;
  featured: boolean;
  sortOrder: number;
};

export type SitePayload = {
  site: SiteMeta;
  sections: PublicSection[];
  categories: PublicCategory[];
  products: PublicProduct[];
};

export type EnquiryType = "GENERAL" | "PRODUCT" | "RESERVATION" | "NEWSLETTER";

export type EnquiryRequest = {
  type?: EnquiryType;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  productSlug?: string;
  /** ISO date, RESERVATION only. */
  reservationDate?: string;
  /** 24h HH:mm, RESERVATION only. */
  reservationTime?: string;
  partySize?: number;
  /** Anything a template's form collects that has no dedicated field. */
  metadata?: Record<string, unknown>;
  locale?: SiteLanguage;
  /** Honeypot — rendered hidden, must stay empty for a real visitor. */
  website?: string;
};

/**
 * Buying one thing.
 *
 * Note what is missing: a price, and a total. The server prices every line from
 * the catalogue, and sending a number from here would be a shop selling at
 * whatever figure the customer edited into the page — indistinguishable, in
 * every log and every dashboard, from an honest sale. Do not add one.
 */
export type OrderLineRequest = {
  productId: string;
  /** 1..999, enforced server-side too. */
  quantity: number;
};

export type OrderRequest = {
  /** At most 100 distinct lines. Our storefront only ever sends one. */
  items: OrderLineRequest[];
  name?: string;
  email?: string;
  phone?: string;
  note?: string;
  locale?: SiteLanguage;
  /**
   * Where the bank should return the customer. Checked against the site on the
   * server and silently dropped if it points somewhere else, so this is a
   * convenience rather than something the flow may depend on.
   */
  returnUrl?: string;
  /** Honeypot — rendered hidden, must stay empty for a real visitor. */
  website?: string;
};

export type OrderCreatedResponse = {
  id: string;
  orderNumber: number;
  /**
   * The only handle the thank-you page may use. Order numbers are sequential,
   * so a status page keyed on one would hand every customer's order to anybody
   * willing to count.
   */
  token: string;
  amountMinor: number;
  currency: string;
  provider: string;
  redirectUrl: string;
};

export type OrderStatus =
  | "AWAITING_PAYMENT"
  | "PAID"
  | "FAILED"
  | "EXPIRED"
  | "CANCELLED"
  | "REFUNDED";

export type PublicOrderItem = {
  productId: string;
  name: string;
  sku: string | null;
  unitPriceMinor: number;
  quantity: number;
  lineTotalMinor: number;
};

/** What a customer may read back about their own order, without signing in. */
export type PublicOrder = {
  orderNumber: number;
  status: OrderStatus;
  amountMinor: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
  items: PublicOrderItem[];
};
