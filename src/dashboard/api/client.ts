import { request } from "../../api/http";
import type {
  DraftState,
  Enquiry,
  EnquiryStats,
  MediaItem,
  Page,
  SectionDto,
  SiteDetail,
  SiteLoginResponse,
  SiteUserProfile,
} from "./types";

/**
 * The client dashboard talks to `/manage`, which is the same API bbloom staff
 * use — a client's token is simply scoped to their own site.
 */

function authed<T>(token: string, path: string, init?: RequestInit) {
  return request<T>(path, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init?.headers },
  });
}

export function login(
  email: string,
  password: string,
): Promise<SiteLoginResponse> {
  return request<SiteLoginResponse>("/auth/site/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function fetchProfile(token: string): Promise<SiteUserProfile> {
  return authed<SiteUserProfile>(token, "/auth/site/me");
}

export function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  return authed<void>(token, "/auth/site/password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function fetchSiteDetail(
  token: string,
  siteId: string,
): Promise<SiteDetail> {
  return authed<SiteDetail>(token, `/manage/sites/${siteId}`);
}

/**
 * Site settings. Verified against production: `contactPhone`, `contactEmail`,
 * `contactAddressKa`/`contactAddressEn`, `mapUrl` and `social` are accepted.
 */
export type SiteSettingsPatch = {
  businessName?: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  contactAddressKa?: string | null;
  contactAddressEn?: string | null;
  mapUrl?: string | null;
  social?: Record<string, string>;
};

export function updateSiteSettings(
  token: string,
  siteId: string,
  patch: SiteSettingsPatch,
): Promise<SiteDetail> {
  return authed<SiteDetail>(token, `/manage/sites/${siteId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function setPublished(
  token: string,
  siteId: string,
  published: boolean,
): Promise<SiteDetail> {
  return authed<SiteDetail>(
    token,
    `/manage/sites/${siteId}/${published ? "publish" : "unpublish"}`,
    { method: "POST" },
  );
}

export type EnquiryQuery = {
  status?: string;
  type?: string;
  page?: number;
  size?: number;
};

export function fetchEnquiries(
  token: string,
  siteId: string,
  query: EnquiryQuery = {},
): Promise<Page<Enquiry>> {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.type) params.set("type", query.type);
  params.set("page", String(query.page ?? 0));
  params.set("size", String(query.size ?? 20));
  return authed<Page<Enquiry>>(
    token,
    `/manage/sites/${siteId}/enquiries?${params}`,
  );
}

export function fetchEnquiryStats(
  token: string,
  siteId: string,
): Promise<EnquiryStats> {
  return authed<EnquiryStats>(token, `/manage/sites/${siteId}/enquiries/stats`);
}

export function updateEnquiry(
  token: string,
  siteId: string,
  enquiryId: string,
  changes: { status?: string; internalNote?: string },
): Promise<Enquiry> {
  return authed<Enquiry>(
    token,
    `/manage/sites/${siteId}/enquiries/${enquiryId}`,
    { method: "PATCH", body: JSON.stringify(changes) },
  );
}

/**
 * Page editor. Section writes land in a draft: the public page only changes
 * when the draft is published.
 */

export function fetchSections(
  token: string,
  siteId: string,
): Promise<SectionDto[]> {
  return authed<SectionDto[]>(token, `/manage/sites/${siteId}/sections`);
}

export function updateSection(
  token: string,
  siteId: string,
  key: string,
  changes: { content?: Record<string, unknown>; visible?: boolean },
): Promise<SectionDto> {
  return authed<SectionDto>(token, `/manage/sites/${siteId}/sections/${key}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export function resetSection(
  token: string,
  siteId: string,
  key: string,
): Promise<SectionDto> {
  return authed<SectionDto>(
    token,
    `/manage/sites/${siteId}/sections/${key}/reset`,
    { method: "POST" },
  );
}

export function reorderSections(
  token: string,
  siteId: string,
  keys: string[],
): Promise<SectionDto[]> {
  return authed<SectionDto[]>(
    token,
    `/manage/sites/${siteId}/sections/reorder`,
    { method: "POST", body: JSON.stringify({ keys }) },
  );
}

export function publishSections(
  token: string,
  siteId: string,
): Promise<DraftState> {
  return authed<DraftState>(
    token,
    `/manage/sites/${siteId}/sections/publish`,
    { method: "POST" },
  );
}

export function discardSections(
  token: string,
  siteId: string,
): Promise<DraftState> {
  return authed<DraftState>(
    token,
    `/manage/sites/${siteId}/sections/discard`,
    { method: "POST" },
  );
}

export function fetchMedia(
  token: string,
  siteId: string,
  query: { page?: number; size?: number } = {},
): Promise<Page<MediaItem>> {
  const params = new URLSearchParams();
  params.set("page", String(query.page ?? 0));
  params.set("size", String(query.size ?? 40));
  return authed<Page<MediaItem>>(
    token,
    `/manage/sites/${siteId}/media?${params}`,
  );
}

export function deleteMedia(
  token: string,
  siteId: string,
  mediaId: string,
): Promise<void> {
  return authed<void>(token, `/manage/sites/${siteId}/media/${mediaId}`, {
    method: "DELETE",
  });
}

export function uploadMedia(
  token: string,
  siteId: string,
  file: File,
  alt: { ka?: string; en?: string } = {},
): Promise<MediaItem> {
  const body = new FormData();
  body.append("file", file);
  const params = new URLSearchParams();
  if (alt.ka) params.set("altTextKa", alt.ka);
  if (alt.en) params.set("altTextEn", alt.en);
  const query = params.toString();
  return authed<MediaItem>(
    token,
    `/manage/sites/${siteId}/media${query ? `?${query}` : ""}`,
    { method: "POST", body },
  );
}