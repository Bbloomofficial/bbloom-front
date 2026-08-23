/**
 * Turning the API's failures into something a client can read in their own
 * language.
 *
 * The backend answers with RFC 9457 problem details whose `detail` is English
 * prose — "One or more fields are invalid.", "Invalid credentials." — and whose
 * field messages are raw Bean Validation defaults such as "must not be blank".
 * Printing either one puts an English sentence in the middle of a Georgian
 * panel, which is how this was found: an empty business name on the create-site
 * form answered in a language the client had not chosen.
 *
 * So nothing here parses prose to decide *what happened*. The decision is made
 * from the status code and the stable `code` property, and the English text is
 * consulted only to tell one validation complaint from another, where the
 * status alone cannot. That ordering matters, because the backend has said it
 * intends to reword its prose, and copy that can be reworded is not a contract.
 *
 * When a reason is genuinely unrecognised the server's own words are shown
 * rather than swallowed: an English sentence is bad, but a client staring at
 * "something went wrong" while the server explained exactly what went wrong is
 * worse. That case should stay rare, and each one is a missing translation
 * rather than a permanent state of affairs.
 */

import { ApiError } from "./http";

/**
 * The localised copy this module needs. Each surface owns its own dictionary —
 * the dashboard, the anonymous editor — so the strings are passed in rather
 * than imported, which keeps this usable from all of them without dragging one
 * surface's vocabulary into another's bundle.
 */
export type ProblemStrings = {
  /** Nothing reached the server at all. */
  network: string;
  /** The form was rejected and we have no better sentence for it. */
  validation: string;
  /** A required field was left empty. */
  fieldRequired: string;
  /** A field holds something that is not a valid value. */
  fieldInvalid: string;
  /** An email address that is not an email address. */
  fieldEmail: string;
  /** A password outside the accepted length. */
  fieldPasswordLength: string;
  /** Wrong email or password, or a wrong current password. */
  credentials: string;
  /** The session is gone or was never valid. */
  session: string;
  /** Signed in, but not permitted — an editor attempting an owner's action. */
  forbidden: string;
  /** The thing being acted on is not there. */
  notFound: string;
  /** This email is already registered. */
  emailTaken: string;
  /** Too many requests, throttled. */
  throttled: string;
  /** The server broke. */
  server: string;
};

/** Bean Validation's defaults, which arrive verbatim in `errors`. */
function fieldMessage(raw: string, strings: ProblemStrings): string {
  const text = raw.trim().toLowerCase();
  if (text.includes("must not be blank") || text.includes("must not be empty"))
    return strings.fieldRequired;
  if (text.includes("must not be null")) return strings.fieldRequired;
  if (text.includes("well-formed email")) return strings.fieldEmail;
  if (text.includes("size must be between")) return strings.fieldPasswordLength;
  return strings.fieldInvalid;
}

/**
 * Localises a single field complaint for display next to its input.
 */
export function describeField(
  raw: string | undefined,
  strings: ProblemStrings,
): string | undefined {
  return raw ? fieldMessage(raw, strings) : undefined;
}

/**
 * Localises every field complaint on a failure, keyed as the backend keyed
 * them, for forms that mark up their inputs individually.
 */
export function describeFields(
  caught: unknown,
  strings: ProblemStrings,
): Record<string, string> {
  if (!(caught instanceof ApiError)) return {};
  const out: Record<string, string> = {};
  for (const [field, message] of Object.entries(caught.fields)) {
    out[field] = fieldMessage(message, strings);
  }
  return out;
}

/**
 * The sentence to show a client for a failed request.
 *
 * `fallback` is what the calling screen would say if the server said nothing
 * useful — it is deliberately required, because a generic "request failed" is
 * almost never the most helpful thing a particular form could say.
 */
export function describeProblem(
  caught: unknown,
  strings: ProblemStrings,
  fallback: string,
): string {
  // fetch rejects rather than resolving when the request never lands, so this
  // is a dropped connection or a blocked request, not an answer from the API.
  if (caught instanceof TypeError) return strings.network;
  if (!(caught instanceof ApiError)) return fallback;

  if (caught.status >= 500) return strings.server;

  switch (caught.status) {
    case 400: {
      // A validation failure usually complains about exactly one field, and
      // naming it is far more useful than saying a form is invalid. Where
      // several are wrong, the generic sentence is honest and the inputs are
      // marked individually anyway.
      const messages = Object.values(caught.fields);
      if (messages.length === 1) return fieldMessage(messages[0], strings);
      if (messages.length > 1) return strings.validation;
      // A 400 with no field errors is a malformed request rather than a bad
      // one, and the server's sentence is the only thing that explains it.
      return caught.message || strings.validation;
    }
    case 401:
      // The same status covers "wrong password" and "your session expired",
      // which need opposite things from the client, so they are told apart by
      // whether we were holding a token at all. The credentials case is by far
      // the more common, and a stale-session message on a login form would send
      // someone looking for a session they never had.
      return caught.code === "TOKEN_EXPIRED"
        ? strings.session
        : strings.credentials;
    case 403:
      return strings.forbidden;
    case 404:
      return strings.notFound;
    case 409:
      // Conflicts are the one family whose prose is deliberately actionable and
      // varies case by case, so only the ones we recognise are translated. The
      // publish gate never reaches here: it is derived from subscription state
      // before a request is made.
      if (/already exists/i.test(caught.message)) return strings.emailTaken;
      return caught.message || fallback;
    case 429:
      return strings.throttled;
    default:
      return caught.message || fallback;
  }
}
