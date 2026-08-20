import type { EnquiryRequest, SiteLanguage, SitePayload } from "./types";

/** Base path of the API. Proxied to the backend in dev, same-origin in prod. */
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export class ApiError extends Error {
  readonly status: number;
  readonly fields: Record<string, string>;

  constructor(
    message: string,
    status: number,
    fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

type ProblemDetail = {
  title?: string;
  detail?: string;
  errors?: Record<string, string> | { field: string; message: string }[];
};

/** RFC 9457 problem details come back on every backend error. */
async function toError(response: Response): Promise<ApiError> {
  let problem: ProblemDetail = {};
  try {
    problem = (await response.json()) as ProblemDetail;
  } catch {
    /* not JSON — fall through to the status text */
  }

  const fields: Record<string, string> = {};
  if (Array.isArray(problem.errors)) {
    for (const item of problem.errors) fields[item.field] = item.message;
  } else if (problem.errors) {
    Object.assign(fields, problem.errors);
  }

  const message =
    problem.detail ?? problem.title ?? response.statusText ?? "Request failed";
  return new ApiError(message, response.status, fields);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) throw await toError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

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
