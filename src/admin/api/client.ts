import { request } from "../../api/http";
import type { AdAllowance, AdInsights } from "../../api/ads";
import type {
  CreateSiteRequest,
  Page,
  AdminAccountDto,
  AdminPlanDto,
  AdminPromoCodeDto,
  AdminNewCustomerOfferDto,
  ConnectPaymentAccountRequest,
  AdCampaignDto,
  AdCampaignCreateRequest,
  AdCampaignQuery,
  AdStatus,
  AdTestRequest,
  AdTestResult,
  NewCustomerOfferUpdateRequest,
  OrderingStatus,
  PaymentAccountView,
  PromoCodeUpsertRequest,
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

/**
 * The client's bank merchant account. Under `/admin` rather than `/manage`
 * because there is no client-facing equivalent and there is not meant to be:
 * these are credentials from the client's own merchant contract, transcribed
 * once by somebody at bbloom, and a form inviting a shop owner to paste a bank
 * secret into a browser is a worse outcome than the support ticket it saves.
 */
export function fetchPaymentAccount(
  token: string,
  siteId: string,
): Promise<PaymentAccountView> {
  return authed<PaymentAccountView>(
    token,
    `/admin/sites/${siteId}/payment-account`,
  );
}

/**
 * A `PUT`, because a site has one live account and connecting it twice with the
 * same values must not produce two. The answer is the ordering status rather
 * than the account, which is the more useful thing to show: it says whether the
 * site can now actually sell.
 */
export function connectPaymentAccount(
  token: string,
  siteId: string,
  body: ConnectPaymentAccountRequest,
): Promise<OrderingStatus> {
  return authed<OrderingStatus>(
    token,
    `/admin/sites/${siteId}/payment-account`,
    { method: "PUT", body: JSON.stringify(body) },
  );
}

/** Disables rather than deletes: orders in flight still need these credentials. */
export function disablePaymentAccount(
  token: string,
  siteId: string,
): Promise<PaymentAccountView> {
  return authed<PaymentAccountView>(
    token,
    `/admin/sites/${siteId}/payment-account`,
    { method: "DELETE" },
  );
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

/**
 * Promo codes. The same staff can set a plan's price and hand out a percentage
 * off it, so these carry no narrower guard than the plan endpoints do.
 */
export function fetchPromoCodes(token: string): Promise<AdminPromoCodeDto[]> {
  return authed<AdminPromoCodeDto[]>(token, "/admin/promo-codes");
}

export function fetchPromoCode(
  token: string,
  promoId: number,
): Promise<AdminPromoCodeDto> {
  return authed<AdminPromoCodeDto>(token, `/admin/promo-codes/${promoId}`);
}

export function createPromoCode(
  token: string,
  body: PromoCodeUpsertRequest,
): Promise<AdminPromoCodeDto> {
  return authed<AdminPromoCodeDto>(token, "/admin/promo-codes", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updatePromoCode(
  token: string,
  promoId: number,
  body: PromoCodeUpsertRequest,
): Promise<AdminPromoCodeDto> {
  return authed<AdminPromoCodeDto>(token, `/admin/promo-codes/${promoId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * Refused with `PROMO_CODE_IN_USE` once any payment names the code — the takings
 * audit reads the code off the payment, so removing it would orphan the record.
 * Switch it off instead.
 */
export function deletePromoCode(
  token: string,
  promoId: number,
): Promise<void> {
  return authed<void>(token, `/admin/promo-codes/${promoId}`, {
    method: "DELETE",
  });
}

/**
 * The new-customer offer. A singleton, so there is no list and no id — reading
 * it always answers with a record, switched off rather than missing when the
 * offer is not running.
 */
export function fetchNewCustomerOffer(
  token: string,
): Promise<AdminNewCustomerOfferDto> {
  return authed<AdminNewCustomerOfferDto>(token, "/admin/new-customer-offer");
}

export function updateNewCustomerOffer(
  token: string,
  body: NewCustomerOfferUpdateRequest,
): Promise<AdminNewCustomerOfferDto> {
  return authed<AdminNewCustomerOfferDto>(token, "/admin/new-customer-offer", {
    method: "PUT",
    body: JSON.stringify(body),
  });
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

/**
 * Whether Facebook and Instagram advertising works. Never fails, so the status
 * card can poll it without a failure path of its own.
 */
export function fetchAdStatus(token: string): Promise<AdStatus> {
  return authed<AdStatus>(token, "/admin/ads/status");
}

/**
 * Launches a real campaign, on real money, immediately.
 *
 * The mail test sends one message that costs nothing and can be ignored; this
 * one starts spending and keeps spending until somebody deletes it. That is not
 * a wording problem to solve at the call site — it is why `stillSpending` and
 * the delete endpoint exist, and why the button that calls this must confirm
 * first and must say what it does.
 *
 * There is deliberately no budget parameter. The amount is server config, so
 * the worst a mistyped form can do here is choose the wrong channel.
 *
 * A refusal from Meta comes back as **200** with `outcome: "FAILED"`, exactly
 * like `sendMailTest`. Rate limited to five an hour per admin, which arrives as
 * a 429.
 */
export function runAdTest(
  token: string,
  body: AdTestRequest,
): Promise<AdTestResult> {
  return authed<AdTestResult>(token, "/admin/ads/test-campaign", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Every campaign the test tool has ever launched, newest first and unpaged.
 * Deliberately not filtered to the live ones: a deleted test is the evidence
 * that somebody dealt with it.
 */
export function fetchAdTestCampaigns(
  token: string,
): Promise<AdCampaignDto[]> {
  return authed<AdCampaignDto[]>(token, "/admin/ads/test-campaigns");
}

/** Stops a test campaign at Meta. Answers with the updated row. */
export function deleteAdTestCampaign(
  token: string,
  campaignId: string,
): Promise<AdCampaignDto> {
  return authed<AdCampaignDto>(
    token,
    `/admin/ads/test-campaigns/${campaignId}`,
    { method: "DELETE" },
  );
}

/**
 * Client campaigns. Test campaigns are excluded unless asked for: they are ours
 * and they are not advertising anybody bought.
 */
export function fetchAdCampaigns(
  token: string,
  query: AdCampaignQuery = {},
): Promise<Page<AdCampaignDto>> {
  const params = new URLSearchParams();
  if (query.siteId) params.set("siteId", query.siteId);
  if (query.status) params.set("status", query.status);
  params.set("test", String(query.test ?? false));
  params.set("page", String(query.page ?? 0));
  params.set("size", String(query.size ?? 20));
  return authed<Page<AdCampaignDto>>(token, `/admin/ads/campaigns?${params}`);
}

export function fetchAdCampaign(
  token: string,
  campaignId: string,
): Promise<AdCampaignDto> {
  return authed<AdCampaignDto>(token, `/admin/ads/campaigns/${campaignId}`);
}

/**
 * Creates a campaign — and launches it.
 *
 * There is no draft and no paused-first step at Meta, so this is not "save"
 * followed by "go live" later. When this resolves, the client's money is being
 * spent. Anything calling it must confirm first and must say so in the copy.
 */
export function createAdCampaign(
  token: string,
  body: AdCampaignCreateRequest,
): Promise<AdCampaignDto> {
  return authed<AdCampaignDto>(token, "/admin/ads/campaigns", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function pauseAdCampaign(
  token: string,
  campaignId: string,
): Promise<AdCampaignDto> {
  return authed<AdCampaignDto>(
    token,
    `/admin/ads/campaigns/${campaignId}/pause`,
    { method: "POST" },
  );
}

/** Starts the spending again. As immediate as the original launch. */
export function resumeAdCampaign(
  token: string,
  campaignId: string,
): Promise<AdCampaignDto> {
  return authed<AdCampaignDto>(
    token,
    `/admin/ads/campaigns/${campaignId}/resume`,
    { method: "POST" },
  );
}

/**
 * Deletes at Meta. Answers with the campaign rather than 204, deliberately: the
 * useful thing to show afterwards is the row in its new state, including a
 * `failureReason` when Meta refused the delete — which is the case where the
 * money keeps going and a 204 would have looked like success.
 */
export function deleteAdCampaign(
  token: string,
  campaignId: string,
): Promise<AdCampaignDto> {
  return authed<AdCampaignDto>(token, `/admin/ads/campaigns/${campaignId}`, {
    method: "DELETE",
  });
}

/**
 * Meta's figures for one campaign, read live — and written through, so opening
 * a campaign also refreshes what the list shows for it.
 *
 * Carries `reach`, `ctr` and `cpc`, which the list DTO does not. 200 with nulls
 * when Meta has nothing yet; that is a twenty-minute-old campaign, not a fault.
 */
export function fetchAdInsights(
  token: string,
  campaignId: string,
): Promise<AdInsights> {
  return authed<AdInsights>(
    token,
    `/admin/ads/campaigns/${campaignId}/insights`,
  );
}

/**
 * What a site may advertise, read from its website plan.
 *
 * There is no grant here and no retainer to end: advertising comes with the
 * subscription, so changing what a client may run is the subscription screen's
 * job. This endpoint only reports.
 */
export function fetchAdAllowance(
  token: string,
  siteId: string,
): Promise<AdAllowance> {
  return authed<AdAllowance>(token, `/admin/ads/sites/${siteId}/allowance`);
}
