import { API_BASE, ApiError, assetUrl, request } from "../../api/http";
import type {
  EnquiryRequest,
  MediaRef,
  OrderCreatedResponse,
  OrderRequest,
  PublicOrder,
  SiteLanguage,
  SitePayload,
} from "./types";

// Re-exported so the rest of the site module keeps a single import surface.
export { API_BASE, ApiError };

/**
 * Media arrives as a root-relative `/api/v1/media/{id}`, which resolves against
 * the page rather than the API — the same host only by accident, and not at all
 * once the API is on its own origin. Rewriting it here means every component
 * downstream can put `media.url` straight into an `<img src>`. Section content
 * is handled by `toMedia`, the equivalent funnel on that side.
 */
function absolute<T extends MediaRef | null | undefined>(media: T): T {
  if (!media?.url) return media;
  return { ...media, url: assetUrl(media.url) };
}

function withAbsoluteMedia(payload: SitePayload): SitePayload {
  return {
    ...payload,
    site: {
      ...payload.site,
      logo: absolute(payload.site.logo),
      favicon: absolute(payload.site.favicon),
    },
    categories:
      payload.categories?.map((category) => ({
        ...category,
        image: absolute(category.image),
      })) ?? payload.categories,
    products:
      payload.products?.map((product) => ({
        ...product,
        image: absolute(product.image),
        gallery: product.gallery?.map((item) => absolute(item)) ?? null,
      })) ?? payload.products,
  };
}

/**
 * `ref` is a slug, a `<slug>.bbloom.ge` subdomain or a custom domain — the
 * backend resolves all three.
 */
export function fetchSite(
  ref: string,
  lang?: SiteLanguage,
): Promise<SitePayload> {
  const query = lang ? `?lang=${lang}` : "";
  return request<SitePayload>(
    `/public/sites/${encodeURIComponent(ref)}${query}`,
  ).then(withAbsoluteMedia);
}

/** Used when the site is served from its own hostname rather than a `/site/:slug` path. */
export function fetchSiteByHost(
  host: string,
  lang?: SiteLanguage,
): Promise<SitePayload> {
  const query = new URLSearchParams();
  if (lang) query.set("lang", lang);
  const suffix = query.toString() ? `?${query}` : "";
  return request<SitePayload>(`/public/sites/by-host${suffix}`, {
    headers: { "X-Site-Host": host },
  }).then(withAbsoluteMedia);
}

export function submitEnquiry(
  ref: string,
  payload: EnquiryRequest,
): Promise<{ id: string | null; message: string }> {
  return request(`/public/sites/${encodeURIComponent(ref)}/enquiries`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Places an order and gets back the bank's payment page.
 *
 * Every refusal to sell comes back as a single 409 `ORDERING_UNAVAILABLE` with
 * one deliberately unhelpful sentence. That vagueness is a feature: a stranger
 * walking the slug space must not be able to read off which shops are unpaid or
 * unbanked. So callers show the message and do not attempt to explain it.
 */
export function placeOrder(
  ref: string,
  payload: OrderRequest,
): Promise<OrderCreatedResponse> {
  return request(`/public/sites/${encodeURIComponent(ref)}/orders`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Reads one order back by its opaque token — no login, and no site ref, because
 * the token already identifies both.
 */
export function fetchPublicOrder(token: string): Promise<PublicOrder> {
  return request(`/public/orders/${encodeURIComponent(token)}`);
}
