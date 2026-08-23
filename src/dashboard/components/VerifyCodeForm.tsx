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

/**
 * What to tell the client, kept as a description rather than as finished text.
 *
 * The language can be switched while a message is on screen, and a string
 * resolved when the request failed would sit there in the previous language
 * until something else replaced it. Storing the reason and resolving it at
 * render keeps the whole panel in one language.
 *
 * `server` is the exception: prose the backend wrote, which cannot be
 * re-resolved and is carried verbatim.
 */
type Message =
  | { kind: "codeFailed" }
  | { kind: "codeExpired" }
  | { kind: "codeTooManyAttempts" }
  | { kind: "codeWrong" }
  | { kind: "codeAttemptsLeft"; remaining: number }
  | { kind: "resendFailed" }
  | { kind: "resendTooSoon" }
  | { kind: "resendDailyLimit" }
  | { kind: "deliveryOff" }
  | { kind: "sendFailed" }
  | { kind: "resent" }
  | { kind: "resentAgain" }
  | { kind: "server"; text: string };

type Props = {
  /** The address the code was sent to; needed because there is no session. */
  email: string;
  /**
   * A session token, when one exists. Resending is authenticated, so without a
   * token the resend button is hidden rather than offered and then refused.
   */
  token?: string | null;
  onVerified: (profile?: AccountProfile) => void;
  /**
   * Whether the server can send mail. Only an explicit `false` changes what is
   * said, so an older build that omits the field keeps the normal wording.
   */
  emailDelivery?: boolean;
  /** Renders on the amber banner instead of on a plain surface. */
  tone?: "surface" | "warning";
  /**
   * When the next resend will be accepted, if a code has just been sent by
   * something other than this form — registration now mails one itself. Without
   * it the button is live the instant the page renders and the client learns
   * about the rate limit by being refused by it, which reads as a fault.
   */
  resendAvailableAt?: string | null;
  /**
   * Reports what the server said about the resend it just made, so a surface
   * that renders its own "we emailed you" headline can stop claiming it.
   */
  onSendResult?: (sent: boolean | null | undefined) => void;
};

export default function VerifyCodeForm({
  email,
  token,
  onVerified,
  emailDelivery,
  tone = "surface",
  resendAvailableAt,
  onSendResult,
}: Props) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);

  const say = useCallback(
    (message: Message): string => {
      switch (message.kind) {
        case "codeFailed":
          return t.verify.codeFailed;
        case "codeExpired":
          return t.verify.codeExpired;
        case "codeTooManyAttempts":
          return t.verify.codeTooManyAttempts;
        case "codeWrong":
          return t.verify.codeWrong;
        case "codeAttemptsLeft":
          return t.verify.codeAttemptsLeft(message.remaining);
        case "resendFailed":
          return t.verify.resendFailed;
        case "resendTooSoon":
          return t.verify.resendTooSoon;
        case "resendDailyLimit":
          return t.verify.resendDailyLimit;
        case "deliveryOff":
          return t.verify.deliveryOff;
        case "sendFailed":
          return t.verify.sendFailed;
        case "resent":
          return t.verify.resent;
        case "resentAgain":
          return t.verify.resentAgain;
        case "server":
          return message.text;
      }
    },
    [t],
  );

  const [digits, setDigits] = useState<string[]>(() => Array(LENGTH).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Message | null>(null);
  const [notice, setNotice] = useState<Message | null>(null);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(() =>
    secondsUntil(resendAvailableAt ?? undefined),
  );
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

  /**
   * How many times this person has asked for another code.
   *
   * A real client asked three times in 28 minutes during an outage, and each
   * time we answered with the same sentence: "Sent. Check your inbox." That
   * reply is correct about the request and silent about the thing they were
   * reporting, which is that the last one never arrived. Repeating it verbatim
   * tells someone their third attempt looks, to us, exactly like their first —
   * so the natural conclusion is that they mistyped their own address, which is
   * the one explanation that is usually wrong and always demoralising.
   *
   * Asking twice is the signal. Once is ordinary impatience or a slow relay.
   *
   * Deliberately counts *asks* and states no total. The obvious version named
   * how many emails had been sent, and it was measured wrong against
   * production: registration sends one itself, but this form can only infer
   * that from a cooldown still running when it mounts, and a client who signs
   * in later — which is exactly what someone chasing a missing email does —
   * mounts it with the cooldown long expired. It said "2" where the truth was
   * 3. The count would also reset on reload and differ across devices. None of
   * that is worth fixing, because the number was never the point: the value is
   * acknowledging that this is not their first attempt and giving them a way
   * out. A figure that can be wrong in three directions buys nothing and costs
   * the credibility of the sentence carrying it.
   */
  const asks = useRef(0);

  const code = useMemo(() => digits.join(""), [digits]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  // The caller can learn when the next send is allowed after this form has
  // already mounted. Only ever extends the wait — never shortens one already
  // running, which would hand the client a live button the server will refuse.
  useEffect(() => {
    const seconds = secondsUntil(resendAvailableAt ?? undefined);
    if (seconds > 0) setCooldown((current) => Math.max(current, seconds));
  }, [resendAvailableAt]);

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
          setError({ kind: "codeFailed" });
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
            setError({ kind: "codeExpired" });
            return;
          case "TOO_MANY_ATTEMPTS":
            setError({ kind: "codeTooManyAttempts" });
            return;
          case "CODE_INVALID": {
            // Saying how many tries are left turns a dead end into a decision:
            // look at the email again, or ask for a new code before the last
            // attempt burns this one.
            const left = caught.problem.attemptsRemaining;
            setError(
              typeof left === "number" && left > 0
                ? { kind: "codeAttemptsLeft", remaining: left }
                : { kind: "codeWrong" },
            );
            return;
          }
          default:
            if (caught.status === 429) {
              setError({ kind: "codeTooManyAttempts" });
              return;
            }
            // An unrecognised failure still has the server's own words, which
            // are written to be shown.
            setError(
              caught.message
                ? { kind: "server", text: caught.message }
                : { kind: "codeWrong" },
            );
        }
      } finally {
        inFlight.current = false;
        setSubmitting(false);
      }
    },
    [email, focusBox, onVerified],
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
      //
      // `mailSent: false` is narrower and newer: mail works, this one message
      // did not go. It gets its own line because the remedy differs — resending
      // is worth trying, whereas resending into an unconfigured server is not.
      // Absent or null is unknown and must stay optimistic; claiming a failure
      // while the send is still in flight is the same lie reversed.
      onSendResult?.(ticket.mailSent);
      asks.current += 1;
      setNotice(
        ticket.emailDelivery === false
          ? { kind: "deliveryOff" }
          : ticket.mailSent === false
            ? { kind: "sendFailed" }
            : asks.current >= 2
              ? { kind: "resentAgain" }
              : { kind: "resent" },
      );
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 429) {
        const until = caught.problem.resendAvailableAt;
        setCooldown(
          (typeof until === "string" ? secondsUntil(until) : 0) || 60,
        );
        setError(
          caught.code === "DAILY_LIMIT"
            ? { kind: "resendDailyLimit" }
            : { kind: "resendTooSoon" },
        );
      } else {
        setError({ kind: "resendFailed" });
      }
    } finally {
      setResending(false);
    }
  }, [token, resending, cooldown, locale, focusBox]);

  const warning = tone === "warning";
  const undeliverable = emailDelivery === false;

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
        {undeliverable ? t.verify.unavailableHaveCode : t.verify.codeLabel}
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

        {/* Resending is pointless when the server cannot send: it would burn a
            throttle slot and promise a second email that will not arrive
            either. */}
        {token && !undeliverable && (
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
          {say(error ?? notice ?? { kind: "codeFailed" })}
        </p>
      )}
    </div>
  );
}
