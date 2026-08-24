/**
 * The shared HTTP layer. The client-site renderer, the client dashboard and the
 * staff admin all talk to the same backend, which answers with RFC 9457 problem
 * details on every error, so parsing them belongs in one place.
 *
 * **One rule holds across every payload this API returns: an unset value is
 * absent, never `null`.** The backend serialises with `non_null` inclusion
 * configured platform-wide, so a null field drops its key instead of being
 * sent as null. Two consequences worth knowing before writing a check:
 *
 * - `x === null` against a response field is dead code — it cannot fire.
 *   Use `??`, optional chaining, or a truthiness test.
 * - `"key" in obj` does not mean "has been configured"; the key is simply
 *   missing whenever the value is unset, so presence and configuredness are
 *   the same question rather than two.
 *
 * Types in this codebase still declare `?: T | null` in places. That is
 * tolerance in case the setting ever changes, not a shape seen on the wire.
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

export type FieldLimits = { min?: number; max?: number };

/**
 * Pulls the length bounds off a problem body, keeping only what is actually a
 * number. This arrives over the network, so a bound that is a string, a null or
 * missing entirely has to read as "no bound" rather than as `NaN`, which would
 * otherwise reach a client as "at most NaN characters".
 */
function readFieldLimits(problem: Record<string, unknown>) {
  const raw = problem.fieldLimits;
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, FieldLimits> = {};
  for (const [field, bounds] of Object.entries(raw)) {
    if (!bounds || typeof bounds !== "object") continue;
    const { min, max } = bounds as Record<string, unknown>;
    const limits: FieldLimits = {};
    if (typeof min === "number" && Number.isFinite(min)) limits.min = min;
    if (typeof max === "number" && Number.isFinite(max)) limits.max = max;
    if (limits.min !== undefined || limits.max !== undefined)
      out[field] = limits;
  }
  return out;
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
   * The Bean Validation annotation behind each rejected field — `NotBlank`,
   * `Size`, `Email` — keyed as `fields` is.
   *
   * Same argument as `code`, one level down. `fields` carries the framework's
   * English default message, which is prose and can be reworded; the
   * annotation name is the constraint itself and cannot.
   */
  readonly fieldCodes: Record<string, string>;
  /**
   * The numbers behind a length constraint — `{ password: { min: 8, max: 72 } }`
   * — keyed as `fields` is.
   *
   * These used to be read out of the digits in `size must be between 8 and 72`,
   * for want of anywhere else to learn them. That was a fuse with a date on it:
   * the message belongs to Bean Validation, the backend intends to localise its
   * errors, and the day it did, the pattern would stop matching and the limit
   * would silently vanish out of the sentence. Taken from the annotation
   * instead, the number survives the backend changing language.
   *
   * A bound the backend does not consider meaningful is absent rather than
   * present-and-default, so `min` is frequently missing. `@Size` defaults `min`
   * to 0 and `max` to 2147483647, and no client should ever be told either.
   */
  readonly fieldLimits: Record<string, FieldLimits>;
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
    fieldCodes: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
    this.fieldCodes = fieldCodes;
    this.fieldLimits = readFieldLimits(problem);
    this.problem = problem;
    const code = problem.code;
    this.code = typeof code === "string" ? code : undefined;
  }
}

/**
 * Which of the two very different things a 401 means.
 *
 * The status alone conflates them: "the password you just typed is wrong" and
 * "you are not signed in any more" are the same number, and treating one as the
 * other is a real failure in both directions. Sign someone out for mistyping a
 * field and they lose the form they were filling in; tell someone with a dead
 * token that their current password is wrong and they will retype a correct
 * password forever, because the thing that is wrong is not the thing we named.
 *
 * `unknown` is returned rather than guessed at, so each caller can pick the
 * safe default for its own screen: a background read should assume the session
 * is gone, and a password form should assume the password is.
 */
export type AuthFailure = "credentials" | "session" | "unknown";

export function authFailure(error: unknown): AuthFailure {
  if (!(error instanceof ApiError) || error.status !== 401) return "unknown";
  if (error.code === "INVALID_CREDENTIALS") return "credentials";
  if (error.code === "AUTHENTICATION_REQUIRED") return "session";
  return "unknown";
}

type ProblemDetail = {
  title?: string;
  detail?: string;
  code?: string;
  errors?: Record<string, string> | { field: string; message: string }[];
  fieldCodes?: Record<string, string>;
  fieldLimits?: Record<string, { min?: number; max?: number }>;
  /**
   * When a throttle will next accept a request, as an ISO instant. Named
   * `retryAfter` on the sign-in limit and `resendAvailableAt` on the code
   * resend; both are the same shape and both are read.
   */
  retryAfter?: string;
  resendAvailableAt?: string;
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
    problem.fieldCodes ?? {},
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
  // 204 is not the only empty success: the staff resend endpoint answers 202
  // with no body, and `response.json()` throws on an empty payload — which
  // surfaced to staff as a raw `Unexpected end of JSON input` on a send that
  // had actually gone out. Decide on the body that is present rather than on
  // a list of statuses we happen to know about, so the next endpoint that
  // returns 201-with-no-content doesn't reintroduce this.
  //
  // A non-empty body that fails to parse still throws: that is a real
  // disagreement about the contract and should not be swallowed.
  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
