import { useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "../../api/http";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useSystemStatus } from "../system";
import { sendMailTest } from "../api/client";
import { adminStrings } from "../strings";
import { formatDateTime } from "../format";
import FailureTable from "./FailureTable";
import type { MailTestResult } from "../api/types";

/**
 * The one thing this screen could not do until now: ask whether email works
 * *right now*, rather than report what happened the last time something tried.
 *
 * Everything below turns on keeping three answers apart. `SENT`, `FAILED` and
 * `NOT_CONFIGURED` are three different pieces of advice — "it went", "here is
 * why it did not", and "nothing was attempted, stop looking for a fault" — and
 * a panel that shows two of them identically sends someone to debug a mail
 * password that is not configured and was never used.
 */

const LANGUAGES = ["ka", "en"] as const;

type Tone = "good" | "bad" | "neutral";

function toneClasses(tone: Tone): string {
  if (tone === "bad") return "border-danger/30 bg-danger/10 dark:bg-danger/15";
  if (tone === "good") return "border-success-border bg-success-soft";
  return "border-ink-100 bg-ink-50";
}

export default function MailTest() {
  const { locale } = useI18n();
  const t = adminStrings(locale).system.test;
  const { token, user, handleError } = useSession();
  const { applyMail } = useSystemStatus();

  // Their own address, because testing to yourself is the common case and it is
  // the one address a tired admin cannot mistype into someone else's inbox.
  const [recipient, setRecipient] = useState(user.email);
  const [language, setLanguage] = useState<string>(locale);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<MailTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    // The previous answer has to go before the new attempt starts, or a stale
    // "accepted for delivery" sits reassuringly on screen for the half minute a
    // failing send takes to time out.
    setResult(null);
    setError(null);
    setPending(true);
    try {
      const next = await sendMailTest(token, recipient.trim(), language);
      setResult(next);
      // Push the post-attempt reading into the shared poller so the header
      // banner cannot still claim mail is fine under a panel that just watched
      // it fail.
      if (next.mail) applyMail(next.mail);
    } catch (caught) {
      setError(describe(caught));
      // A dead token should land on the sign-in screen. A 403 must not: this
      // endpoint answers 403 to a valid non-admin staff token, and signing
      // someone out over a button they pressed is a worse answer than telling
      // them they may not press it.
      if (caught instanceof ApiError && caught.status === 401) {
        handleError(caught);
      }
    } finally {
      setPending(false);
    }
  }

  function describe(caught: unknown): string {
    if (!(caught instanceof ApiError)) return t.requestFailed;
    if (caught.status === 400) {
      // Our own sentence rather than the server's. The backend's English is
      // prose and may be reworded; the rejected *field* is the contract.
      if (caught.fields.recipient) return t.badAddress;
      return t.requestFailed;
    }
    if (caught.status === 429) {
      // Optional by design: the public forms throw the same exception without
      // an instant, and the backend omits the key rather than sending null.
      // "Try again at undefined" is worse than the vague sentence, so this
      // branches on presence rather than on the value.
      const until = caught.problem.retryAfter;
      if (typeof until === "string" && until) {
        return `${t.rateLimited} ${t.rateLimitedUntil(formatDateTime(until, locale))}`;
      }
      return t.rateLimited;
    }
    if (caught.status === 403) return t.notPermitted;
    return t.requestFailed;
  }

  const outcome = result?.outcome;
  const tone: Tone =
    outcome === "SENT" ? "good" : outcome === "FAILED" ? "bad" : "neutral";
  const cleared = result?.clearedFailures ?? [];

  return (
    <section className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6 sm:p-7">
      <h2 className="text-lg font-bold text-ink-900">{t.title}</h2>
      <p className="mt-2 text-sm text-ink-600">{t.body}</p>

      <form onSubmit={submit} className="mt-5 grid gap-4 sm:max-w-lg">
        <label className="block">
          <span className="text-sm font-semibold text-ink-900">
            {t.recipientLabel}
          </span>
          <input
            type="email"
            required
            dir="ltr"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            className="mt-1.5 w-full rounded-2xl border border-ink-100 bg-surface px-4 py-3 text-sm text-ink-900 outline-none focus:border-bloom-400"
          />
          <span className="mt-1.5 block text-xs text-ink-400">
            {t.recipientHint}
          </span>
        </label>

        <div>
          <span className="text-sm font-semibold text-ink-900">
            {t.languageLabel}
          </span>
          <div className="mt-1.5 flex gap-2">
            {LANGUAGES.map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={language === code}
                onClick={() => setLanguage(code)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  language === code
                    ? "border-bloom-600 bg-bloom-600 text-white"
                    : "border-ink-100 bg-surface text-ink-600 hover:text-ink-900"
                }`}
              >
                {adminStrings(locale).languageNames[code] ?? code}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? t.sending : t.send}
          </button>
          {pending && (
            <span className="text-xs text-ink-400">{t.sendingNote}</span>
          )}
        </div>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger dark:bg-danger/15"
        >
          {error}
        </p>
      )}

      {result && (
        <div
          role="status"
          className={`mt-5 rounded-2xl border p-5 ${toneClasses(tone)}`}
        >
          <p className="text-sm font-bold text-ink-900">
            {outcome === "SENT" && t.sentTitle}
            {outcome === "FAILED" && t.failedTitle}
            {outcome === "NOT_CONFIGURED" && t.notConfiguredTitle}
            {/* An outcome this build has never heard of. Rendering it as either
                a success or a failure would be inventing an answer, so it is
                shown raw and left for a human to read. */}
            {outcome !== "SENT" &&
              outcome !== "FAILED" &&
              outcome !== "NOT_CONFIGURED" &&
              outcome}
          </p>
          <p className="mt-1.5 text-sm text-ink-600">
            {outcome === "SENT" && t.sentBody}
            {outcome === "FAILED" && t.failedBody}
            {outcome === "NOT_CONFIGURED" && t.notConfiguredBody}
          </p>

          {result.failureReason && (
            <p className="mt-2 text-sm font-semibold text-danger">
              {result.failureReason}
            </p>
          )}

          <p className="mt-3 text-sm text-ink-600">
            <span dir="ltr" className="font-semibold text-ink-900">
              {result.recipient}
            </span>
            {result.attemptedAt && (
              <>
                {" · "}
                {t.attemptedAt}: {formatDateTime(result.attemptedAt, locale)}
              </>
            )}
          </p>

          {/* The backend issues a reference before it decides whether to send,
              so `NOT_CONFIGURED` carries one too — for a message that was never
              composed and never attempted. Printing it there would put an
              official-looking code under the words "nothing was sent", which
              invites someone to go and correlate a non-event. The panel's whole
              job in that state is to stop the search. */}
          {result.reference && outcome !== "NOT_CONFIGURED" ? (
            <div className="mt-4 rounded-2xl border border-ink-100 bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                {t.reference}
              </p>
              <p
                dir="ltr"
                className="mt-1 font-mono text-xl font-extrabold tracking-widest text-ink-900"
              >
                {result.reference}
              </p>
              <p className="mt-2 text-xs text-ink-600">
                {/* The code means two different things depending on the
                    outcome. After a successful send it is what staff match in
                    an inbox; after a refusal there is no message anywhere, and
                    telling someone to go and find one sends them looking for
                    evidence that cannot exist. */}
                {outcome === "SENT" ? t.referenceNote : t.referenceFailedNote}
              </p>
            </div>
          ) : (
            outcome === "SENT" && (
              <p className="mt-4 text-xs text-ink-400">{t.noReference}</p>
            )
          )}
        </div>
      )}

      {cleared.length > 0 && (
        <div className="mt-5 rounded-2xl border border-ink-100 bg-ink-50 p-5">
          <p className="text-sm font-bold text-ink-900">
            {t.clearedTitle(cleared.length)}
          </p>
          <p className="mt-1.5 text-sm text-ink-600">{t.clearedBody}</p>
          <FailureTable rows={cleared} />
        </div>
      )}
    </section>
  );
}
