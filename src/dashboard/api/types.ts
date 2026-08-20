/**
 * Shapes returned by the client-facing half of the manage API. Fields the
 * backend leaves null are omitted from the JSON entirely, so almost everything
 * is optional here.
 */

export type SiteLanguage = "ka" | "en";

export type SiteUserProfile = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  siteId: string;
  siteSlug: string;
  businessName: string;
  defaultLanguage?: SiteLanguage;
};

export type SiteLoginResponse = {
  token: string;
  tokenType: string;
  expiresAt: string;
  user: SiteUserProfile;
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
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
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
