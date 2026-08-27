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
  /**
   * Signing in was refused because the address has never been confirmed. Its
   * own sentence because it is the opposite of a credentials failure and the
   * remedy is a code, not a different password.
   */
  emailNotVerified: string;
  slugReserved: string;
  /**
   * An invitation naming someone who has no bbloom account. The invite form
   * only ever attaches an existing colleague, so this is the whole answer for
   * the client rather than a step they can correct in place.
   */
  memberAccountMissing: string;
  /**
   * An invitation that would have to create the account and was given no name.
   * Unreachable from this client today -- it sends neither a password nor a
   * name, and the backend reports the missing password first -- so this is
   * here so that a future invite form that does create accounts refuses in
   * Georgian rather than in the backend's English.
   */
  memberNameRequired: string;
  /**
   * The four ways a promo code can be refused.
   *
   * An unknown code and one staff switched off are deliberately indistinguishable
   * — the API answers `PROMO_CODE_UNKNOWN` for both, because telling them apart
   * tells anyone guessing which guesses are real.
   *
   * None of these covers a *valid* code that simply lost to a better sale price:
   * that is not a refusal, comes back on the quote rather than as an error, and
   * does not spend the code.
   */
  promoUnknown: string;
  promoExpired: string;
  promoNotForPlan: string;
  /**
   * A plan that is advertised but not open for business yet.
   *
   * Reachable without any UI bug: the plan's code is in the public pricing
   * payload, and the disabled button only stops people who use the button.
   */
  planComingSoon: string;
  /**
   * A negotiated tier, which has no self-serve checkout at all.
   *
   * Distinct from `planComingSoon`: this one will never open on its own, and
   * the way forward is to talk to us rather than to wait. The API used to
   * refuse both as a bare `CONFLICT`, so telling them apart meant reading its
   * English.
   */
  planNotPurchasable: string;
  /**
   * A code that has been used its maximum number of times.
   *
   * Deliberately not "you have used this too often" and not "invalid": the
   * count is of everyone's checkouts, an outstanding one holds a use, and
   * abandoning it releases it again — so a code can be refused here and work
   * ten minutes later. Nobody reading this did anything wrong.
   */
  promoLimitReached: string;
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
  /**
   * Sign-up, which shares the `AUTH_RATE_LIMITED` code with sign-in but is
   * still counted per address alone — pairing it with the email would defeat
   * it, since someone registering picks a fresh address every time. So this
   * one really can be spent by a stranger on the same carrier NAT, and it
   * says "from this connection" rather than naming an account that, on a
   * sign-up form, does not exist yet.
   */
  signUpThrottled: string;
  /** As above, when the server told us how long the wait is. */
  signUpThrottledFor: (minutes: number) => string;
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
export type DescribeOptions = {
  /**
   * Which credential action the screen is performing. Sign-in and sign-up
   * share one error code but not one explanation: sign-in is throttled per
   * (address, account) and sign-up per address alone, and a form creating an
   * account cannot describe the limit as belonging to that account, because
   * it does not exist yet. Defaults to sign-in, which is where a 401 or 429
   * almost always arrives.
   */
  authAction?: "signIn" | "signUp";
};
export function describeProblem(
  caught: unknown,
  strings: ProblemStrings,
  fallback: string,
  options: DescribeOptions = {},
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
      // An unconfirmed account is refused here, and it is not a permission
      // problem: the password was right. Every screen that can act on it
      // intercepts the code and shows the confirmation box instead, so this
      // is only the wording for somewhere that cannot — and it must not say
      // "check your password", which is the one thing that was correct.
      if (caught.code === "EMAIL_NOT_VERIFIED") return strings.emailNotVerified;
      return strings.forbidden;
    case 404:
      return strings.notFound;
    case 409:
      // Conflicts are the one family whose prose is deliberately actionable and
      // varies case by case, so only the ones we recognise are translated. The
      // publish gate never reaches here: it is derived from subscription state
      // before a request is made.
      //
      // Addresses like `admin` and `panel` are ours — they serve the staff
      // panel and the client dashboard — so a client asking for one is refused
      // rather than quietly given something else. A slug the backend derived
      // from a business name is adjusted instead (`admin-2`), so this can only
      // arrive in answer to an address someone typed on purpose.
      if (caught.code === "SLUG_RESERVED") return strings.slugReserved;
      // The invite form attaches an existing colleague and cannot create an
      // account, so "no account for this address" is the end of the road here
      // rather than a field to fill in. Both are matched on `code`: the
      // backend writes these `detail` strings to be shown as-is, but they are
      // English and this admin is read in Georgian.
      if (caught.code === "MEMBER_ACCOUNT_MISSING")
        return strings.memberAccountMissing;
      if (caught.code === "MEMBER_NAME_REQUIRED")
        return strings.memberNameRequired;
      if (caught.code === "PROMO_CODE_UNKNOWN") return strings.promoUnknown;
      if (caught.code === "PROMO_CODE_EXPIRED") return strings.promoExpired;
      if (caught.code === "PROMO_CODE_NOT_FOR_PLAN")
        return strings.promoNotForPlan;
      if (caught.code === "PROMO_CODE_LIMIT_REACHED")
        return strings.promoLimitReached;
      if (caught.code === "PLAN_COMING_SOON") return strings.planComingSoon;
      if (caught.code === "PLAN_NOT_PURCHASABLE")
        return strings.planNotPurchasable;
      // Matched on the code first. The message test behind it is the older
      // check and stays only as tolerance for a backend that predates the
      // code — reading English prose to decide what happened is exactly the
      // thing that breaks when someone rewords a sentence.
      if (caught.code === "EMAIL_ALREADY_REGISTERED") return strings.emailTaken;
      if (/already exists/i.test(caught.message)) return strings.emailTaken;
      return caught.message || fallback;
    case 429: {
      // Two different throttles share this status. The sign-in one is counted
      // per (caller address, account) pair — it was briefly per caller alone,
      // which let one person's failures lock out everyone behind the same
      // office line or carrier NAT.
      //
      // Pairing narrows that but does not close it, so the wording still
      // describes the state and never asserts who caused it: a small business
      // sharing one login is the common case here, and one colleague
      // mistyping it ten times locks out the other. What no longer happens is
      // collateral damage between *different* accounts on one address.
      if (caught.code !== "AUTH_RATE_LIMITED") return strings.throttled;
      const minutes = minutesUntil(caught.problem.retryAfter);
      // Sign-up shares the code but not the key: it is still counted per
      // address alone, so unlike sign-in it genuinely can be spent by a
      // stranger sharing a carrier NAT, and there is no account to name.
      if (options.authAction === "signUp") {
        return minutes
          ? strings.signUpThrottledFor(minutes)
          : strings.signUpThrottled;
      }
      return minutes
        ? strings.signInThrottledFor(minutes)
        : strings.signInThrottled;
    }
    default:
      return caught.message || fallback;
  }
}
