/**
 * The shared HTTP layer. Both the client-site renderer and the client dashboard
 * talk to the same backend, which answers with RFC 9457 problem details on
 * every error, so parsing them belongs in one place.
 */

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

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
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
