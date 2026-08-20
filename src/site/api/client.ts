import { API_BASE, ApiError, request } from "../../api/http";
import type { EnquiryRequest, SiteLanguage, SitePayload } from "./types";

// Re-exported so the rest of the site module keeps a single import surface.
export { API_BASE, ApiError };

/**
 * `ref` is a slug, a `<slug>.bbloom.co` subdomain or a custom domain — the
 * backend resolves all three.
 */
export function fetchSite(
  ref: string,
  lang?: SiteLanguage,
): Promise<SitePayload> {
  const query = lang ? `?lang=${lang}` : "";
  return request<SitePayload>(
    `/public/sites/${encodeURIComponent(ref)}${query}`,
  );
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
  });
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
