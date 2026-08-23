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
 * So nothing here parses prose to decide *what happened*. Every decision is
 * made from the status, the problem's `code`, and — for a rejected field — the
 * `fieldCodes` map, which names the Bean Validation constraint that failed
 * (`NotBlank`, `Size`, `Email`). That is the constraint itself rather than a
 * sentence describing it, so it cannot be reworded out from under us, and the
 * backend has said it intends to reword its prose.
 *
 * The one thing still read out of a message is the pair of *numbers* in a
 * `Size` violation, because the limit lives in the backend's field definitions
 * and there is nowhere else on this side to learn it. If that ever fails to
 * match, the message degrades to a sentence with no numbers in it rather than
 * to nothing.
 *
 * When a reason is genuinely unrecognised the server's own words are shown
 * rather than swallowed: an English sentence is bad, but a client staring at
 * "something went wrong" while the server explained exactly what went wrong is
 * worse. That case should stay rare, and each one is a missing translation
 * rather than a permanent state of affairs.
 */

import { ApiError, authFailure, type FieldLimits } from "./http";

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
  /** The server could not read the request at all — our bug, not theirs. */
  malformed: string;
  /** A required field was left empty. */
  fieldRequired: string;
  /** A field holds something that is not a valid value. */
  fieldInvalid: string;
  /** An email address that is not an email address. */
  fieldEmail: string;
  /** A password outside the accepted length. */
  fieldPasswordLength: string;
  /** Text longer than the column behind it allows. */
  fieldTooLong: (max: number) => string;
  /** Text outside a length the backend insists on at both ends. */
  fieldLengthRange: (min: number, max: number) => string;
  /** Text shorter than the backend accepts, with no upper bound worth naming. */
  fieldTooShort: (min: number) => string;
  /** A value in the wrong shape — the web address of a site, for instance. */
  fieldPattern: string;
  /** A number that has to be larger than it is. */
  fieldNumber: string;
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
  /**
   * Sign-in specifically, which is throttled per caller rather than per
   * account. Whoever reads this may not be who spent the budget, so it must
   * not accuse them of having been trying.
   */
  signInThrottled: string;
  /** As above, when the server told us how long the wait is. */
  signInThrottledFor: (minutes: number) => string;
  /** The server broke. */
  server: string;
};

/**
 * `size must be between 8 and 72` — the limits, not the sentence. Returns null
 * rather than guessing if the shape is not the one we know.
 *
 * Kept only for a backend that does not yet send `fieldLimits`, and expected to
 * stop matching the moment the backend localises its validation messages, which
 * it intends to. That is exactly why it is no longer the primary source: the
 * numbers would have disappeared out of this sentence on the day the rest of it
 * finally arrived in Georgian.
 */
function sizeLimits(raw: string): { min: number; max: number } | null {
  const match = /between (\d+) and (\d+)/.exec(raw);
  if (!match) return null;
  return { min: Number(match[1]), max: Number(match[2]) };
}

/**
 * The sentence for a length violation, given whatever bounds we have.
 *
 * Either bound may be missing — the backend omits one it does not consider
 * meaningful, so a field with only a maximum arrives with no `min` key at all —
 * so this says only what it can stand behind, rather than naming a limit it had
 * to invent. "At least 0 characters" is worse than saying nothing.
 */
function lengthMessage(limits: FieldLimits, strings: ProblemStrings): string {
  const { min, max } = limits;
  // A minimum of one is "not empty" wearing a different hat, and someone who
  // left a field blank is better served by being told to fill it in.
  const floor = min !== undefined && min > 1 ? min : undefined;
  // A pair that cannot both be satisfied describes no length at all. Rendering
  // it would produce a confident instruction ("between 100 and 5 characters")
  // that no input can follow, so the pair is dropped and the wider sentence is
  // used instead. This cannot come from the annotations as they stand; it is
  // here because the alternative to checking is trusting two numbers that
  // arrived separately over a network to have kept their order.
  if (floor !== undefined && max !== undefined && floor > max)
    return strings.fieldInvalid;
  if (floor !== undefined && max !== undefined)
    return strings.fieldLengthRange(floor, max);
  if (max !== undefined) return strings.fieldTooLong(max);
  if (floor !== undefined) return strings.fieldTooShort(floor);
  return strings.fieldInvalid;
}

/**
 * Whole minutes until an instant, rounded up, or null if there is no usable
 * one. A deadline that has passed, is unparseable or is absent all read as
 * "no figure to show" rather than as zero, so the caller falls back to a
 * sentence without a number instead of promising a wait of nothing.
 */
function minutesUntil(iso: unknown): number | null {
  if (typeof iso !== "string") return null;
  const remaining = Date.parse(iso) - Date.now();
  if (!Number.isFinite(remaining) || remaining <= 0) return null;
  return Math.ceil(remaining / 60_000);
}

/**
 * The sentence for one rejected field.
 *
 * `constraint` is the Bean Validation annotation the backend reports in
 * `fieldCodes`. Where it is missing — an older deploy, or a failure that never
 * came from validation — the English default is read as a last resort, so this
 * degrades to the previous behaviour instead of to nothing.
 */
function fieldMessage(
  field: string,
  raw: string,
  constraint: string | undefined,
  limits: FieldLimits | undefined,
  strings: ProblemStrings,
): string {
  switch (constraint) {
    case "NotBlank":
    case "NotNull":
    case "NotEmpty":
      return strings.fieldRequired;
    case "Email":
      return strings.fieldEmail;
    case "Pattern":
      return strings.fieldPattern;
    case "Positive":
    case "PositiveOrZero":
    case "Min":
    case "Max":
      return strings.fieldNumber;
    case "Size": {
      // A password is the one length a client is asked to *reach* rather than
      // stay under, and it deserves the sentence that says so.
      if (/password/i.test(field)) return strings.fieldPasswordLength;
      return lengthMessage(limits ?? sizeLimits(raw) ?? {}, strings);
    }
  }

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
  caught: unknown,
  field: string,
  strings: ProblemStrings,
): string | undefined {
  if (!(caught instanceof ApiError)) return undefined;
  const raw = caught.fields[field];
  if (!raw) return undefined;
  return fieldMessage(
    field,
    raw,
    caught.fieldCodes[field],
    caught.fieldLimits[field],
    strings,
  );
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
    out[field] = fieldMessage(
      field,
      message,
      caught.fieldCodes[field],
      caught.fieldLimits[field],
      strings,
    );
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
      // Not every 400 is a rejected form. When the body itself cannot be read
      // — an enum we sent a value the API does not accept, say — the failure is
      // reported before anything binds, so there are no field errors to show
      // and no field to attach them to. The server's sentence names the field
      // and its accepted values, which is exactly what a developer needs and
      // nothing a client could act on, so it goes to the console and the client
      // is told, honestly, that this one is not their fault.
      if (caught.code === "MALFORMED_REQUEST") {
        console.error("Rejected by the API as unreadable:", caught.message);
        return strings.malformed;
      }

      // A validation failure usually complains about exactly one field, and
      // naming it is far more useful than saying a form is invalid. Where
      // several are wrong, the generic sentence is honest and the inputs are
      // marked individually anyway.
      const entries = Object.entries(caught.fields);
      if (entries.length === 1) {
        const [field, message] = entries[0];
        return fieldMessage(
          field,
          message,
          caught.fieldCodes[field],
          caught.fieldLimits[field],
          strings,
        );
      }
      if (entries.length > 1) return strings.validation;
      // A 400 we have no code for and no fields on. The server's sentence is
      // the only thing that explains it, so it is shown rather than swallowed.
      return caught.message || strings.validation;
    }
    case 401:
      // The same status covers "wrong password" and "your session expired",
      // which need opposite things from the client. The server names which,
      // and where it does not, the credentials reading is the safer default:
      // a stale-session message on a login form sends someone looking for a
      // session they never had, and a login form is where most 401s happen.
      return authFailure(caught) === "session"
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
    case 429: {
      // Two different throttles share this status. The sign-in one is counted
      // per caller rather than per account, so the person reading this may not
      // be the person who spent the budget — an office or a mobile carrier can
      // put many people behind one address. The wording therefore describes the
      // state and never asserts who caused it.
      if (caught.code !== "AUTH_RATE_LIMITED") return strings.throttled;
      const minutes = minutesUntil(caught.problem.retryAfter);
      return minutes
        ? strings.signInThrottledFor(minutes)
        : strings.signInThrottled;
    }
    default:
      return caught.message || fallback;
  }
}
