import { request } from "../../api/http";
import type {
  Enquiry,
  EnquiryStats,
  Page,
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
