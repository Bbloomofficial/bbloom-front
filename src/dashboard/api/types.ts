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
