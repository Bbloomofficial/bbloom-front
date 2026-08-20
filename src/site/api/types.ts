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

/** Template-level capability flags, straight from the blueprint. */
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
  logo: MediaRef | null;
  favicon: MediaRef | null;
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
