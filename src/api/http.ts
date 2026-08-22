/**
 * The shared HTTP layer. The client-site renderer, the client dashboard and the
 * staff admin all talk to the same backend, which answers with RFC 9457 problem
 * details on every error, so parsing them belongs in one place.
 */

/** Base path of the API. Proxied to the backend in dev, same-origin in prod. */
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

/**
 * Turns a path the API hands us — a template preview, a media file — into
 * something an `<img src>` can use.
 *
 * These arrive root-relative and already complete, `/api/v1` included
 * (`/api/v1/templates/{code}/preview`), so they resolve against the API's
 * *origin*: not against `API_BASE`, which already carries the prefix, and not
 * against the page, which is only the same host by accident. In dev Vite
 * proxies `/api` to the backend, so leaving a path untouched appears to work
 * right up until the API is served from another origin.
 *
 * Absolute URLs are passed through, and so is a same-origin `API_BASE`, where
 * the path already resolves correctly on its own.
 *
 * So is anything that is not a path at all. The anonymous editor previews a
 * freshly picked logo as a `data:` URL — that image never went near the API,
 * and prefixing it with the API's origin turned a valid picture into a broken
 * one that still looked right in the panel thumbnail beside it.
 */
export function assetUrl(path: string): string {
  if (!path.startsWith("/")) return path;
  if (path.startsWith("//")) return path;
  const origin = /^(https?:)?\/\//i.test(API_BASE)
    ? new URL(API_BASE).origin
    : "";
  return `${origin}${path}`;
}

export class ApiError extends Error {
  readonly status: number;
  readonly fields: Record<string, string>;
  /**
   * The backend's stable machine-readable reason, where it has one — the
   * `code` of an RFC 9457 problem detail, such as `CODE_EXPIRED`.
   *
   * Worth keeping separate from `message`: `detail` is prose written to be
   * shown to a client and may be reworded at any time, so branching on it is
   * branching on copy. `code` is the contract.
   */
  readonly code?: string;
  /**
   * The rest of the problem body. Some failures carry extra facts that only
   * make sense for that failure — how many attempts remain, when a throttle
   * lifts — and inventing a typed field per case would be worse than keeping
   * the payload and reading it where it is understood.
   */
  readonly problem: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    fields: Record<string, string> = {},
    problem: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
    this.problem = problem;
    const code = problem.code;
    this.code = typeof code === "string" ? code : undefined;
  }
}

type ProblemDetail = {
  title?: string;
  detail?: string;
  code?: string;
  errors?: Record<string, string> | { field: string; message: string }[];
};

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
  return new ApiError(
    message,
    response.status,
    fields,
    problem as Record<string, unknown>,
  );
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // FormData sets its own multipart content type, boundary included.
  const isJsonBody = init?.body != null && !(init.body instanceof FormData);
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) throw await toError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
