import { request } from "../../api/http";
import type {
  AccountProfile,
  AccountSite,
  CheckoutResponse,
  CreateSiteRequest,
  EmailLanguage,
  MemberRole,
  SiteDetail,
  SiteLoginResponse,
  SiteMember,
  SubscriptionDetail,
  VerificationTicket,
} from "./types";

/**
 * The account half of the client API: everything that exists above a single
 * website — signing up, listing the websites an account can reach, billing them
 * and managing who else may edit them.
 *
 * The per-site endpoints under `/manage` live in `./client`.
 */

function authed<T>(token: string, path: string, init?: RequestInit) {
  return request<T>(path, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init?.headers },
  });
}

/* Account */

/**
 * Registering answers with the same payload as logging in, so a new client is
 * signed in already and must never be asked for the password they just chose.
 *
 * `fullName` is required, and is not called `name`.
 */
export function registerAccount(body: {
  email: string;
  fullName: string;
  password: string;
  /**
   * Which language to write the confirmation email in. Optional on the wire so
   * an older backend simply ignores it, but we always send it: the account has
   * no stored preference yet at the moment it is created, and guessing from an
   * IP address or an `Accept-Language` header is worse than reading the
   * language the client is visibly using right now.
   */
  language?: EmailLanguage;
}): Promise<SiteLoginResponse> {
  return request<SiteLoginResponse>("/account/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function loginAccount(
  email: string,
  password: string,
): Promise<SiteLoginResponse> {
  return request<SiteLoginResponse>("/account/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function fetchAccount(token: string): Promise<AccountProfile> {
  return authed<AccountProfile>(token, "/account/me");
}

export function fetchAccountSites(token: string): Promise<AccountSite[]> {
  return authed<AccountSite[]>(token, "/account/sites");
}

export function changeAccountPassword(
  token: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  return authed<void>(token, "/account/password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

/**
 * Sends a fresh confirmation email — one message carrying both a short code and
 * a link, so it can be finished either by typing or by tapping.
 *
 * The language travels with the request rather than being read from the stored
 * preference, because switching the panel to English is the clearest possible
 * statement of which language the next email should be in.
 */
export function requestVerification(
  token: string,
  language?: EmailLanguage,
): Promise<VerificationTicket> {
  return authed<VerificationTicket>(token, "/account/verification", {
    method: "POST",
    body: JSON.stringify(language ? { language } : {}),
  });
}

/**
 * Deliberately unauthenticated: the confirmation link is opened by whichever
 * browser the mail client hands it to, which is rarely the one that signed up.
 */
export function confirmVerification(
  verificationToken: string,
): Promise<AccountProfile> {
  return request<AccountProfile>("/account/verification/confirm", {
    method: "POST",
    body: JSON.stringify({ token: verificationToken }),
  });
}

/**
 * The typed-code half of the same endpoint, and unauthenticated for a second
 * reason beyond the link's: someone who reads mail on their phone and signed up
 * on a laptop has the code in one place and the session in another. Requiring a
 * token here would mean the code only worked on the device that asked for it,
 * which defeats the point of having a code at all.
 *
 * The email is needed because there is no session to identify the account.
 */
export function confirmVerificationCode(
  email: string,
  code: string,
): Promise<AccountProfile> {
  return request<AccountProfile>("/account/verification/confirm", {
    method: "POST",
    body: JSON.stringify({ email, code: code.trim() }),
  });
}

/* Websites */

/** A signed-in client creates their own website; this no longer needs staff. */
export function createSite(
  token: string,
  body: CreateSiteRequest,
): Promise<SiteDetail> {
  return authed<SiteDetail>(token, "/manage/sites", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/* Billing */

export function fetchSubscription(
  token: string,
  siteId: string,
): Promise<SubscriptionDetail> {
  return authed<SubscriptionDetail>(
    token,
    `/manage/sites/${siteId}/subscription`,
  );
}

/**
 * Owner-only. Answers with either a `redirectUrl` to send the client to, or
 * `instructions` to show them — today only manual bank transfer exists, but
 * card providers are coming, so callers branch on which field arrived.
 *
 * `periods` is optional and defaults to 1; it multiplies the amount. Starting a
 * second checkout replaces the outstanding request rather than adding to it.
 */
export function startCheckout(
  token: string,
  siteId: string,
  planCode: string,
  periods = 1,
): Promise<CheckoutResponse> {
  return authed<CheckoutResponse>(
    token,
    `/manage/sites/${siteId}/subscription/checkout`,
    { method: "POST", body: JSON.stringify({ planCode, periods }) },
  );
}

/**
 * Owner-only, and clients may only stop at the end of the period they paid
 * for: `immediately` is a staff power and the API rejects it from a client.
 */
export function cancelSubscription(
  token: string,
  siteId: string,
): Promise<SubscriptionDetail> {
  return authed<SubscriptionDetail>(
    token,
    `/manage/sites/${siteId}/subscription/cancel`,
    { method: "POST", body: JSON.stringify({ immediately: false }) },
  );
}

/* Members */

export function fetchMembers(
  token: string,
  siteId: string,
): Promise<SiteMember[]> {
  return authed<SiteMember[]>(token, `/manage/sites/${siteId}/users`);
}

/** Attaches an account that already exists to this website. */
export function inviteMember(
  token: string,
  siteId: string,
  email: string,
  role: MemberRole,
): Promise<SiteMember> {
  return authed<SiteMember>(token, `/manage/sites/${siteId}/users`, {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
}

export function setMemberRole(
  token: string,
  siteId: string,
  accountId: string,
  role: MemberRole,
): Promise<SiteMember> {
  return authed<SiteMember>(
    token,
    `/manage/sites/${siteId}/users/${accountId}/role`,
    { method: "POST", body: JSON.stringify({ role }) },
  );
}

export function removeMember(
  token: string,
  siteId: string,
  accountId: string,
): Promise<void> {
  return authed<void>(token, `/manage/sites/${siteId}/users/${accountId}`, {
    method: "DELETE",
  });
}
