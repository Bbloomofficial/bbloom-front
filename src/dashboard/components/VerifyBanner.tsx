import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../../api/http";
import { useI18n } from "../../i18n";
import { requestVerification } from "../api/account";
import { useSession } from "../auth";
import { dashboardStrings } from "../strings";

/**
 * The standing "confirm your email" prompt.
 *
 * It says what confirming is *for* — it gates publishing and nothing else —
 * because a prompt that only nags gets ignored, and a client who cannot publish
 * deserves to already know why before they try.
 */

/** Seconds until `iso`, floored at zero. */
function secondsUntil(iso: string | undefined): number {
  if (!iso) return 0;
  const remaining = Date.parse(iso) - Date.now();
  return Number.isNaN(remaining) ? 0 : Math.max(0, Math.ceil(remaining / 1000));
}

export default function VerifyBanner() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { token, user } = useSession();

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const timer = useRef<number | null>(null);

  // The backend hands back the instant it will accept another request, so the
  // button counts down honestly instead of discovering the limit by being told
  // off. The 429 is still handled: two tabs can race the same limit.
  useEffect(() => {
    if (cooldown <= 0) return;
    timer.current = window.setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [cooldown]);

  const resend = useCallback(async () => {
    if (sending || cooldown > 0) return;
    setSending(true);
    setError(null);
    try {
      const ticket = await requestVerification(token);
      setSent(true);
      // Never render `ticket.token`: it is only there while mail is unwired.
      setCooldown(secondsUntil(ticket.retryAfter) || 60);
    } catch (caught) {
      setSent(false);
      if (caught instanceof ApiError && caught.status === 429) {
        setError(t.verify.resendTooSoon);
        setCooldown(60);
      } else {
        setError(t.verify.resendFailed);
      }
    } finally {
      setSending(false);
    }
  }, [sending, cooldown, token, t]);

  if (user.emailVerified) return null;

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/60 dark:bg-amber-950/30">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-bold text-amber-900 dark:text-amber-100">
            {t.verify.bannerTitle}
          </p>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-200/90">
            {t.verify.bannerBody}
          </p>
          <p className="mt-1 text-sm font-semibold text-amber-900 dark:text-amber-100" dir="ltr">
            {user.email}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void resend()}
          disabled={sending || cooldown > 0}
          className="shrink-0 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 disabled:opacity-60 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-100"
        >
          {sending
            ? t.verify.resending
            : cooldown > 0
              ? t.verify.resendWait(cooldown)
              : t.verify.resend}
        </button>
      </div>

      {(sent || error) && (
        <p
          role="status"
          className="mt-3 text-sm font-semibold text-amber-900 dark:text-amber-100"
        >
          {error ?? t.verify.resent}
        </p>
      )}
    </div>
  );
}
