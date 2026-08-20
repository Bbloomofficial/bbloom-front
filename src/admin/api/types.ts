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
  /** Already resolved to the `lang` we asked for — this endpoint is public. */
  name: string;
  tagline?: string;
  description?: string;
  /**
   * Root-relative path to a generated wireframe thumbnail
   * (`/api/v1/templates/{code}/preview`). Resolve it with `assetUrl` rather
   * than using it raw, and keep a fallback: it can be absent on older builds.
   */
  previewUrl?: string | null;
  demoUrl?: string | null;
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
  contactPhone?: string;
  contactAddressKa?: string;
  contactAddressEn?: string;
  mapUrl?: string;
  domains?: SiteDomain[];
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
  contactPhone?: string | null;
  contactAddressKa?: string | null;
  contactAddressEn?: string | null;
  mapUrl?: string | null;
};
