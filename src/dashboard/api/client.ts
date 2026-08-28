import { request } from "../../api/http";
import type {
  DraftState,
  Enquiry,
  EnquiryStats,
  MediaItem,
  Order,
  OrderStats,
  OrderingStatus,
  Page,
  SectionDto,
  SiteDetail,
  SiteFeatureFlags,
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
  /**
   * Patch-merged by the server, so send only the flags being changed. Sending
   * the whole object back would re-assert flags this build does not know about
   * — a newer flag added on the backend would be silently overwritten with a
   * stale value read from a page loaded before it existed.
   */
  features?: SiteFeatureFlags;
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
 * Online orders. Everything here is scoped to one website, and none of it
 * touches money: the shop moves fulfilment and writes notes, the bank moves
 * payment, and there is no endpoint that lets the first do the second.
 */

export type OrderQuery = {
  status?: string;
  fulfilment?: string;
  page?: number;
  size?: number;
};

export function fetchOrders(
  token: string,
  siteId: string,
  query: OrderQuery = {},
): Promise<Page<Order>> {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.fulfilment) params.set("fulfilment", query.fulfilment);
  params.set("page", String(query.page ?? 0));
  params.set("size", String(query.size ?? 20));
  return authed<Page<Order>>(token, `/manage/sites/${siteId}/orders?${params}`);
}

export function fetchOrderStats(
  token: string,
  siteId: string,
): Promise<OrderStats> {
  return authed<OrderStats>(token, `/manage/sites/${siteId}/orders/stats`);
}

/**
 * Whether this website can sell yet, and what is missing if not.
 *
 * Asked once per site by the shell, because it decides whether the orders tab
 * is worth showing at all. A client whose site cannot sell has no use for a
 * list that will always be empty — but the page itself stays reachable by URL
 * and explains the reason, so hiding the tab never hides the explanation.
 */
export function fetchOrderingStatus(
  token: string,
  siteId: string,
): Promise<OrderingStatus> {
  return authed<OrderingStatus>(token, `/manage/sites/${siteId}/orders/status`);
}

export function fetchOrder(
  token: string,
  siteId: string,
  orderId: string,
): Promise<Order> {
  return authed<Order>(token, `/manage/sites/${siteId}/orders/${orderId}`);
}

/**
 * The only two things a shop may change.
 *
 * There is deliberately no payment status here, and adding one would not work:
 * the API has no field for it. Moving an unpaid order into preparation is
 * refused with a 409 `ORDER_NOT_PAID`, which callers must surface rather than
 * swallow — the whole point of the refusal is that somebody was about to cook
 * for a customer who has not paid.
 */
export function updateOrder(
  token: string,
  siteId: string,
  orderId: string,
  changes: { fulfilment?: string; internalNote?: string },
): Promise<Order> {
  return authed<Order>(token, `/manage/sites/${siteId}/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

/**
 * Records a refund that a human has already made at the bank. Staff only, and
 * it moves no money — the money is in the client's own account and only the
 * client's own bank interface can send it back.
 */
export function recordRefund(
  token: string,
  siteId: string,
  orderId: string,
  note?: string,
): Promise<Order> {
  return authed<Order>(
    token,
    `/manage/sites/${siteId}/orders/${orderId}/refund`,
    { method: "POST", body: JSON.stringify({ note }) },
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