import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { ApiError } from "../../api/http";
import { useI18n } from "../../i18n";
import { confirmVerificationCode, requestVerification } from "../api/account";
import type { AccountProfile } from "../api/types";
import { dashboardStrings } from "../strings";

/**
 * Entry of the six-digit confirmation code we email on signup.
 *
 * A code rather than only a link, because the two devices are so often
 * different ones: mail arrives on a phone, the account was created on a laptop,
 * and a link can only ever finish the job in whichever browser the mail client
 * happens to open. A code crosses that gap by being something a person can
 * carry across the room in their head.
 *
 * The link still works and is still in the email — this is the second door, not
 * a replacement for the first.
 */

const LENGTH = 6;

/** Seconds until `iso`, floored at zero. */
function secondsUntil(iso: string | undefined): number {
  if (!iso) return 0;
  const remaining = Date.parse(iso) - Date.now();
  return Number.isNaN(remaining) ? 0 : Math.max(0, Math.ceil(remaining / 1000));
}

/** Keeps only digits, and never more of them than a code can hold. */
function digitsOf(value: string): string {
  return value.replace(/\D+/g, "").slice(0, LENGTH);
}

type Props = {
  /** The address the code was sent to; needed because there is no session. */
  email: string;
  /**
   * A session token, when one exists. Resending is authenticated, so without a
   * token the resend button is hidden rather than offered and then refused.
   */
  token?: string | null;
  onVerified: (profile?: AccountProfile) => void;
  /** Renders on the amber banner instead of on a plain surface. */
  tone?: "surface" | "warning";
};

export default function VerifyCodeForm({
  email,
  token,
  onVerified,
  tone = "surface",
}: Props) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);

  const [digits, setDigits] = useState<string[]>(() => Array(LENGTH).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  /**
   * Set when the backend does not understand a typed code yet. The frontend can
   * ship before the backend does, and when it has, the honest thing to show is
   * the flow that actually works — the link — rather than a box that will
   * reject every code it is given.
   */
  const [codeUnsupported, setCodeUnsupported] = useState(false);

  const boxes = useRef<Array<HTMLInputElement | null>>([]);
  // The submit is fired from a change handler, so it must not fire twice for
  // the same code while the first request is still in the air.
  const inFlight = useRef(false);

  const code = useMemo(() => digits.join(""), [digits]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const focusBox = useCallback((index: number) => {
    boxes.current[Math.max(0, Math.min(LENGTH - 1, index))]?.focus();
  }, []);

  const submit = useCallback(
    async (value: string) => {
      if (inFlight.current || value.length !== LENGTH) return;
      inFlight.current = true;
      setSubmitting(true);
      setError(null);
      setNotice(null);
      try {
        onVerified(await confirmVerificationCode(email, value));
      } catch (caught) {
        setDigits(Array(LENGTH).fill(""));
        focusBox(0);

        if (!(caught instanceof ApiError)) {
          setError(t.verify.codeFailed);
          return;
        }

        // An address already confirmed is not a failure worth showing as one:
        // the client asked for a state the account is already in, and the only
        // honest response is to move on.
        if (caught.code === "ALREADY_VERIFIED") {
          onVerified();
          return;
        }

        // 404/405 mean this backend has no typed-code path at all. A 400
        // complaining that `token` is missing was the same thing said
        // differently by the build that shipped before codes existed. Either
        // way the box is a dead end, so say so rather than blaming digits the
        // client typed correctly.
        //
        // A response carrying a `code` is from a build that does understand
        // them, and must never be read this way.
        const rejectsShape =
          !caught.code &&
          (caught.status === 404 ||
            caught.status === 405 ||
            (caught.status === 400 && Boolean(caught.fields.token)));
        if (rejectsShape) {
          setCodeUnsupported(true);
          return;
        }

        switch (caught.code) {
          case "CODE_EXPIRED":
            setError(t.verify.codeExpired);
            return;
          case "TOO_MANY_ATTEMPTS":
            setError(t.verify.codeTooManyAttempts);
            return;
          case "CODE_INVALID": {
            // Saying how many tries are left turns a dead end into a decision:
            // look at the email again, or ask for a new code before the last
            // attempt burns this one.
            const left = caught.problem.attemptsRemaining;
            setError(
              typeof left === "number" && left > 0
                ? t.verify.codeAttemptsLeft(left)
                : t.verify.codeWrong,
            );
            return;
          }
          default:
            if (caught.status === 429) {
              setError(t.verify.codeTooManyAttempts);
              return;
            }
            // An unrecognised failure still has the server's own words, which
            // are written to be shown.
            setError(caught.message || t.verify.codeWrong);
        }
      } finally {
        inFlight.current = false;
        setSubmitting(false);
      }
    },
    [email, focusBox, onVerified, t],
  );

  const write = useCallback(
    (index: number, raw: string) => {
      const typed = digitsOf(raw);
      if (!typed) {
        // A cleared box is a deletion, not a no-op.
        setDigits((current) => {
          const next = [...current];
          next[index] = "";
          return next;
        });
        return;
      }

      setDigits((current) => {
        const next = [...current];
        // Typing into one box may deliver several digits at once — autofill of
        // an SMS-style code does exactly this — so they spill rightwards.
        for (let i = 0; i < typed.length && index + i < LENGTH; i += 1) {
          next[index + i] = typed[i];
        }
        const filled = next.join("");
        if (filled.length === LENGTH && !filled.includes("")) {
          // Auto-submitting saves a click on the one screen where the client is
          // already waiting on us.
          void submit(filled);
        }
        return next;
      });

      focusBox(index + typed.length);
      setError(null);
    },
    [focusBox, submit],
  );

  const onKeyDown = useCallback(
    (index: number, event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Backspace" && !digits[index] && index > 0) {
        // Backspace in an empty box steps back and clears, which is what every
        // code input people have used before this one does.
        event.preventDefault();
        setDigits((current) => {
          const next = [...current];
          next[index - 1] = "";
          return next;
        });
        focusBox(index - 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        focusBox(index - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        focusBox(index + 1);
      }
    },
    [digits, focusBox],
  );

  const onPaste = useCallback(
    (event: ClipboardEvent<HTMLInputElement>) => {
      const pasted = digitsOf(event.clipboardData.getData("text"));
      if (!pasted) return;
      // Pasting the whole code is the most common way this gets filled in, so
      // it lands from the first box regardless of which one received the paste.
      event.preventDefault();
      const next = Array(LENGTH).fill("");
      for (let i = 0; i < pasted.length; i += 1) next[i] = pasted[i];
      setDigits(next);
      setError(null);
      focusBox(pasted.length);
      if (pasted.length === LENGTH) void submit(pasted);
    },
    [focusBox, submit],
  );

  const resend = useCallback(async () => {
    if (!token || resending || cooldown > 0) return;
    setResending(true);
    setError(null);
    setNotice(null);
    try {
      const ticket = await requestVerification(token, locale);
      setCodeUnsupported(false);
      setDigits(Array(LENGTH).fill(""));
      focusBox(0);
      // The backend says when it will accept another; the fallback only covers
      // an older build that does not.
      setCooldown(
        secondsUntil(ticket.resendAvailableAt ?? ticket.retryAfter) || 60,
      );
      // `emailDelivery: false` means the server has no mail configured and
      // nothing left the building. Telling someone to check an inbox that will
      // stay empty wastes their time and makes them doubt the address they
      // typed, so it says what actually happened instead.
      setNotice(
        ticket.emailDelivery === false
          ? t.verify.deliveryOff
          : t.verify.resent,
      );
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 429) {
        const until = caught.problem.resendAvailableAt;
        setCooldown(
          (typeof until === "string" ? secondsUntil(until) : 0) || 60,
        );
        setError(
          caught.code === "DAILY_LIMIT"
            ? t.verify.resendDailyLimit
            : t.verify.resendTooSoon,
        );
      } else {
        setError(t.verify.resendFailed);
      }
    } finally {
      setResending(false);
    }
  }, [token, resending, cooldown, locale, t, focusBox]);

  const warning = tone === "warning";

  if (codeUnsupported) {
    return (
      <div className="mt-4">
        <p
          className={
            warning
              ? "text-sm text-amber-800 dark:text-amber-200/90"
              : "text-sm text-ink-600"
          }
        >
          {t.verify.linkOnly}
        </p>
        {token && (
          <button
            type="button"
            onClick={() => void resend()}
            disabled={resending || cooldown > 0}
            className="btn-secondary mt-3 disabled:opacity-60"
          >
            {resending
              ? t.verify.resending
              : cooldown > 0
                ? t.verify.resendWait(cooldown)
                : t.verify.resend}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <label
        htmlFor="verify-code-0"
        className={
          warning
            ? "block text-sm font-semibold text-amber-900 dark:text-amber-100"
            : "block text-sm font-semibold text-ink-900"
        }
      >
        {t.verify.codeLabel}
      </label>

      {/* Left-to-right even in Georgian: a code is a number, and numbers do not
          change direction with the surrounding prose. A grid rather than a row
          of fixed widths, because six 48px boxes plus gaps do not fit inside a
          card on a 320px phone — the narrowest screen these clients use. */}
      <div className="mt-2 grid max-w-xs grid-cols-6 gap-1.5 sm:gap-2" dir="ltr">
        {digits.map((digit, index) => (
          <input
            key={index}
            id={`verify-code-${index}`}
            ref={(node) => {
              boxes.current[index] = node;
            }}
            value={digit}
            onChange={(event) => write(index, event.target.value)}
            onKeyDown={(event) => onKeyDown(index, event)}
            onPaste={onPaste}
            onFocus={(event) => event.target.select()}
            disabled={submitting}
            inputMode="numeric"
            // The browser and iOS both offer to fill a one-time code when they
            // see this, which turns the whole screen into a single tap.
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={LENGTH}
            aria-label={t.verify.codeDigit(index + 1)}
            className={
              warning
                ? "h-12 w-full min-w-0 rounded-xl border border-amber-300 bg-white text-center text-lg font-bold text-amber-900 tabular-nums outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-400/40 disabled:opacity-60 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-50"
                : "h-12 w-full min-w-0 rounded-xl border border-ink-200 bg-surface text-center text-lg font-bold text-ink-900 tabular-nums outline-none transition focus:border-bloom-500 focus:ring-2 focus:ring-bloom-500/30 disabled:opacity-60"
            }
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void submit(code)}
          disabled={submitting || code.length !== LENGTH}
          className="btn-primary disabled:opacity-60"
        >
          {submitting ? t.verify.codeChecking : t.verify.codeSubmit}
        </button>

        {token && (
          <button
            type="button"
            onClick={() => void resend()}
            disabled={resending || cooldown > 0}
            className={
              warning
                ? "text-sm font-semibold text-amber-900 underline underline-offset-4 disabled:opacity-60 dark:text-amber-100"
                : "text-sm font-semibold text-bloom-700 underline underline-offset-4 disabled:opacity-60"
            }
          >
            {resending
              ? t.verify.resending
              : cooldown > 0
                ? t.verify.resendWait(cooldown)
                : t.verify.resendCode}
          </button>
        )}
      </div>

      {(error || notice) && (
        <p
          role="status"
          aria-live="polite"
          className={
            error
              ? "mt-3 text-sm font-semibold text-danger"
              : warning
                ? "mt-3 text-sm font-semibold text-amber-900 dark:text-amber-100"
                : "mt-3 text-sm font-semibold text-ink-700"
          }
        >
          {error ?? notice}
        </p>
      )}
    </div>
  );
}
