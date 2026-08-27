import { request } from "../../api/http";
import type {
  CreateSiteRequest,
  Page,
  AdminAccountDto,
  AdminPlanDto,
  PlanUpsertRequest,
  SiteDetail,
  SiteSummary,
  SiteUser,
  StaffLoginResponse,
  StaffProfile,
  SystemStatus,
  MailTestResult,
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
 * Turns a path the API hands us into something an `<img src>` can use.
 * Re-exported from the shared HTTP layer so the admin, the renderer and the
 * marketing site all resolve these the same way.
 */
export { assetUrl } from "../../api/http";

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
 * Operational health of the API process. Staff-only, and the reason it exists
 * is that a failed confirmation email used to be visible only in container
 * logs — while the client it belonged to sat looking at a screen that said
 * everything had gone fine.
 */
export function fetchSystemStatus(token: string): Promise<SystemStatus> {
  return authed<SystemStatus>(token, "/admin/system/status");
}

/**
 * Sends one real email and reports what happened to it.
 *
 * There is deliberately no subject or body parameter. Staff have no reason to
 * compose the message, and an authenticated endpoint that mails arbitrary text
 * from our own domain is a phishing tool wearing our branding.
 *
 * Synchronous, and slow on purpose: around a second normally, up to thirty when
 * SMTP is timing out. Queueing it would make the reply "we have accepted your
 * request to find out", which is the reassurance-without-evidence this button
 * exists to replace — so the caller must show a real pending state rather than
 * shorten the wait.
 *
 * A refusal comes back as **200** with `outcome: "FAILED"`. The request
 * succeeded; we asked what happened and were told. Treating non-2xx as the only
 * failure path would render a refusal as a success.
 */
export function sendMailTest(
  token: string,
  recipient: string,
  language: string,
): Promise<MailTestResult> {
  return authed<MailTestResult>(token, "/admin/system/mail-test", {
    method: "POST",
    body: JSON.stringify({ recipient, language }),
  });
}

/**
 * The template catalog is public, and unusually for the public API it carries
 * both languages as `*Ka`/`*En` pairs alongside the resolved strings. So we
 * fetch it once and let the picker re-render from what it already holds when
 * staff switch language, rather than dropping the grid into a loading state.
 */
export function fetchTemplates(): Promise<TemplateSummary[]> {
  return request<TemplateSummary[]>("/templates");
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

export type AccountQuery = { q?: string; page?: number; size?: number };

export function fetchAccounts(
  token: string,
  query: AccountQuery = {},
): Promise<Page<AdminAccountDto>> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  params.set("page", String(query.page ?? 0));
  params.set("size", String(query.size ?? 20));
  return authed<Page<AdminAccountDto>>(token, `/admin/accounts?${params}`);
}

export function fetchAccount(
  token: string,
  accountId: string,
): Promise<AdminAccountDto> {
  return authed<AdminAccountDto>(token, `/admin/accounts/${accountId}`);
}

export function confirmAccountEmail(
  token: string,
  accountId: string,
): Promise<AdminAccountDto> {
  return authed<AdminAccountDto>(
    token,
    `/admin/accounts/${accountId}/confirm-email`,
    { method: "POST" },
  );
}

export function resendAccountConfirmation(
  token: string,
  accountId: string,
): Promise<void> {
  return authed<void>(
    token,
    `/admin/accounts/${accountId}/resend-confirmation`,
    { method: "POST" },
  );
}

/**
 * The pricing plans, as staff edit them. Unlike `/plans/website`, this returns
 * inactive and non-purchasable tiers too, and every translation rather than one
 * resolved language — staff edit both languages on one screen.
 */
export function fetchPlans(token: string): Promise<AdminPlanDto[]> {
  return authed<AdminPlanDto[]>(token, "/admin/plans");
}

export function fetchPlan(token: string, planId: number): Promise<AdminPlanDto> {
  return authed<AdminPlanDto>(token, `/admin/plans/${planId}`);
}

export function createPlan(
  token: string,
  body: PlanUpsertRequest,
): Promise<AdminPlanDto> {
  return authed<AdminPlanDto>(token, "/admin/plans", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updatePlan(
  token: string,
  planId: number,
  body: PlanUpsertRequest,
): Promise<AdminPlanDto> {
  return authed<AdminPlanDto>(token, `/admin/plans/${planId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * Removes a plan. The API refuses this while a subscription still points at it,
 * in which case deactivate it instead — an unsellable plan and a plan that
 * never existed are different things to a client holding an invoice.
 */
export function deletePlan(token: string, planId: number): Promise<void> {
  return authed<void>(token, `/admin/plans/${planId}`, { method: "DELETE" });
}

export function updateFreeAllowance(
  token: string,
  accountId: string,
  allowance: number,
): Promise<AdminAccountDto> {
  return authed<AdminAccountDto>(
    token,
    `/admin/accounts/${accountId}/free-allowance`,
    { method: "PUT", body: JSON.stringify({ allowance }) },
  );
}
