import { API_BASE, ApiError, assetUrl, request } from "../../api/http";
import type {
  EnquiryRequest,
  MediaRef,
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
