import { request } from "../../api/http";
import type {
  AccountProfile,
  AccountSite,
  CheckoutResponse,
  CheckoutQuote,
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
 * Registering no longer produces a session. It answers `202` with a
 * `VerificationTicket` and no token: the account row exists, but confirming the
 * emailed code or link is what issues the first JWT.
 *
 * So every caller has to follow this with the confirmation screen. There is no
 * "register and continue" path any more, and a caller that reads `.token` off
 * this response reads `undefined` — which is why the return type changed rather
 * than being widened.
 *
 * The 202 body does carry `mailSent`, unlike the resend below. Registration is
 * allowed to be informative because the client just typed the address into the
 * form in front of them; it tells them nothing about anybody else's account.
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
}): Promise<VerificationTicket> {
  return request<VerificationTicket>("/account/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Signing in refuses an unconfirmed account with `403 EMAIL_NOT_VERIFIED`, and
 * that response carries the `email` at the top level. Callers should read it
 * from there rather than from their own form: it is the address the server
 * matched, so handing it to the confirmation screen cannot disagree with the
 * account the code will be checked against.
 */
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
 * The same thing for someone who has no session — which, now that logging in is
 * gated on confirmation, is everybody who actually needs it. The authenticated
 * version above sat behind the door it was meant to open.
 *
 * Its answer is deliberately uninformative and must stay that way. An unknown
 * address, an unconfirmed one and an already-confirmed one all return a
 * byte-identical shape; I checked all three against production and they differ
 * only in the address echoed back and the timestamp. In particular `mailSent`
 * is *absent* here though it is present on registration, because reporting it
 * would turn an endpoint anyone can post to into an account-existence oracle.
 *
 * So a screen calling this can only ever say "if that address has an account,
 * we have sent it a code". That is the contract rather than a gap in it, and
 * copy must not be written that quietly promises more.
 */
export function resendVerification(
  email: string,
  language?: EmailLanguage,
): Promise<VerificationTicket> {
  return request<VerificationTicket>("/account/verification/resend", {
    method: "POST",
    body: JSON.stringify(language ? { email, language } : { email }),
  });
}

/**
 * Deliberately unauthenticated: the confirmation link is opened by whichever
 * browser the mail client hands it to, which is rarely the one that signed up.
 *
 * Confirming is now what *issues* the session, so this answers a full
 * `LoginResponse` rather than a profile. Callers must store it — a caller that
 * merely shows a tick and sends them to log in strands a client who has just
 * done the only thing that could have let them in.
 */
export function confirmVerification(
  verificationToken: string,
): Promise<SiteLoginResponse> {
  return request<SiteLoginResponse>("/account/verification/confirm", {
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
): Promise<SiteLoginResponse> {
  return request<SiteLoginResponse>("/account/verification/confirm", {
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
  promoCode?: string,
): Promise<CheckoutResponse> {
  return authed<CheckoutResponse>(
    token,
    `/manage/sites/${siteId}/subscription/checkout`,
    {
      method: "POST",
      // The price is never sent. The API re-prices from the plan code, the
      // period count and the typed code, so a stale quote on this screen cannot
      // become a stale charge.
      body: JSON.stringify({ planCode, periods, promoCode }),
    },
  );
}

/**
 * What a purchase would cost, without starting one.
 *
 * Holds nothing and spends nothing — quoting a code is not using it. Entirely
 * optional too: `startCheckout` re-prices through the same code path, so a
 * client who skips this, or changes the code afterwards, is charged correctly
 * either way.
 */
export function quoteCheckout(
  token: string,
  siteId: string,
  planCode: string,
  periods = 1,
  promoCode?: string,
): Promise<CheckoutQuote> {
  return authed<CheckoutQuote>(
    token,
    `/manage/sites/${siteId}/subscription/quote`,
    {
      method: "POST",
      body: JSON.stringify({ planCode, periods, promoCode }),
    },
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
