import { API_BASE, request } from "../../api/http";
import type {
  CreateSiteRequest,
  Page,
  SiteDetail,
  SiteSummary,
  SiteUser,
  StaffLoginResponse,
  StaffProfile,
  TemplateSummary,
  UpdateSiteRequest,
} from "./types";

/**
 * The staff side of the API. It is the same `/manage` surface the client
 * dashboard uses, but a staff token is scoped to every site rather than one.
 */

function authed<T>(token: string, path: string, init?: RequestInit) {
  return request<T>(path, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init?.headers },
  });
}

/**
 * Turns a path the API hands us — a template preview, a media file — into
 * something an `<img src>` can use. The API returns these root-relative
 * (`/api/v1/templates/{code}/preview`), which only works when the app is
 * served from the same origin, so the `/api/v1` prefix is swapped for whatever
 * `API_BASE` is pointing at. Absolute URLs are left alone.
 */
export function assetUrl(path: string): string {
  if (/^(https?:)?\/\//i.test(path)) return path;
  const suffix = path.startsWith("/api/v1") ? path.slice("/api/v1".length) : path;
  return `${API_BASE}${suffix}`;
}

/** Staff sign-in. The token comes back as `token` — not `accessToken`. */
export function login(
  email: string,
  password: string,
): Promise<StaffLoginResponse> {
  return request<StaffLoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function fetchProfile(token: string): Promise<StaffProfile> {
  return authed<StaffProfile>(token, "/auth/me");
}

/**
 * The template catalog is public and resolves one language server-side, so the
 * picker refetches when staff switch the interface language.
 */
export function fetchTemplates(lang: string): Promise<TemplateSummary[]> {
  return request<TemplateSummary[]>(`/templates?lang=${lang}`);
}

export type SiteQuery = { q?: string; page?: number; size?: number };

export function fetchSites(
  token: string,
  query: SiteQuery = {},
): Promise<Page<SiteSummary>> {
  const params = new URLSearchParams();
  // The search parameter is `q`; `query` is silently ignored by the backend.
  if (query.q) params.set("q", query.q);
  params.set("page", String(query.page ?? 0));
  params.set("size", String(query.size ?? 20));
  return authed<Page<SiteSummary>>(token, `/manage/sites?${params}`);
}

export function createSite(
  token: string,
  body: CreateSiteRequest,
): Promise<SiteDetail> {
  return authed<SiteDetail>(token, "/manage/sites", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function fetchSite(token: string, siteId: string): Promise<SiteDetail> {
  return authed<SiteDetail>(token, `/manage/sites/${siteId}`);
}

export function updateSite(
  token: string,
  siteId: string,
  changes: UpdateSiteRequest,
): Promise<SiteDetail> {
  return authed<SiteDetail>(token, `/manage/sites/${siteId}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
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

export function deleteSite(token: string, siteId: string): Promise<void> {
  return authed<void>(token, `/manage/sites/${siteId}`, { method: "DELETE" });
}

export function addDomain(
  token: string,
  siteId: string,
  hostname: string,
  primaryDomain: boolean,
): Promise<unknown> {
  return authed(token, `/manage/sites/${siteId}/domains`, {
    method: "POST",
    body: JSON.stringify({ hostname, primaryDomain }),
  });
}

export function removeDomain(
  token: string,
  siteId: string,
  domainId: string,
): Promise<void> {
  return authed<void>(token, `/manage/sites/${siteId}/domains/${domainId}`, {
    method: "DELETE",
  });
}

export function fetchSiteUsers(
  token: string,
  siteId: string,
): Promise<SiteUser[]> {
  return authed<SiteUser[]>(token, `/manage/sites/${siteId}/users`);
}

export function createSiteUser(
  token: string,
  siteId: string,
  body: { email: string; fullName: string; password: string; role: string },
): Promise<SiteUser> {
  return authed<SiteUser>(token, `/manage/sites/${siteId}/users`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function setSiteUserEnabled(
  token: string,
  siteId: string,
  userId: string,
  enabled: boolean,
): Promise<SiteUser> {
  return authed<SiteUser>(
    token,
    `/manage/sites/${siteId}/users/${userId}/${enabled ? "enable" : "disable"}`,
    { method: "POST" },
  );
}

export function deleteSiteUser(
  token: string,
  siteId: string,
  userId: string,
): Promise<void> {
  return authed<void>(token, `/manage/sites/${siteId}/users/${userId}`, {
    method: "DELETE",
  });
}

export function resetSiteUserPassword(
  token: string,
  siteId: string,
  userId: string,
  password: string,
): Promise<void> {
  return authed<void>(
    token,
    `/manage/sites/${siteId}/users/${userId}/password`,
    { method: "POST", body: JSON.stringify({ newPassword: password }) },
  );
}
