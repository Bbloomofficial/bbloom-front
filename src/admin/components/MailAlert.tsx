import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { adminStrings } from "../strings";
import { mailNeedsAttention, useSystemStatus } from "../system";
import type { MailFailure } from "../api/types";

/** How many people are owed an email, rather than how many sends failed.
 *
 *  Today's outage was three failed sends to two addresses; two is the number a
 *  human has to act on. The server now counts this independently of the ring,
 *  so it stays exact when the list is truncated — counting the rows is only a
 *  fallback for an older backend, and it undercounts by definition. */
export function peopleWaiting(mail: {
  affectedRecipients?: number;
  recentFailures: MailFailure[];
}): number {
  if (typeof mail.affectedRecipients === "number") {
    return mail.affectedRecipients;
  }
  return new Set(
    mail.recentFailures.map((failure) => failure.recipient.trim().toLowerCase()),
  ).size;
}

/** True when the headline can only be a floor: the list is truncated and the
 *  server did not give us the exact figure. With `affectedRecipients` present
 *  the count is exact even under truncation, so the hedge disappears — a hedge
 *  shown when it isn't needed is its own small lie. */
export function peopleWaitingIsFloor(mail: {
  affectedRecipients?: number;
  consecutiveFailures: number;
  recentFailures: MailFailure[];
}): boolean {
  return (
    typeof mail.affectedRecipients !== "number" && unlistedFailures(mail) > 0
  );
}

/** People still owed an email, whether or not mail is currently broken.
 *
 *  `owedTotal` is tallied separately from the rows, so it stays exact when the
 *  list is truncated. Counting the rows is only a fallback for a backend that
 *  predates the field, where the answer can only ever be a floor. */
export function peopleOwed(mail: {
  owedTotal?: number;
  unresolved?: MailFailure[];
}): number {
  if (typeof mail.owedTotal === "number") return mail.owedTotal;
  return new Set(
    (mail.unresolved ?? []).map((failure) =>
      failure.recipient.trim().toLowerCase(),
    ),
  ).size;
}

/** How many owed people are not in the list.
 *
 *  Deliberately not `unlistedFailures`: that one measures the current outage
 *  via `consecutiveFailures`, which says nothing about a list that outlives
 *  the outage. Using it here would hedge on the wrong number and go quiet at
 *  the wrong times. */
export function unlistedOwed(mail: {
  owedTotal?: number;
  unresolved?: MailFailure[];
}): number {
  return Math.max(0, peopleOwed(mail) - (mail.unresolved?.length ?? 0));
}

/** How many failed sends happened but are no longer listed.
 *
 *  `recentFailures` is a fixed ring (20 at the time of writing) while
 *  `consecutiveFailures` keeps counting past it, so during a long outage the
 *  table is a *sample* of the people owed an email, not the set of them. That
 *  gap has to be said out loud: twenty rows and a full-looking table is exactly
 *  the kind of thing that stops someone looking any further.
 *
 *  Which end gets dropped matters more than the count does. Eviction keeps the
 *  *earliest* entries, so the rows that survive are the people who have been
 *  waiting longest — the ones most likely to have given up — and the failures
 *  that fall off are later ones. The copy says so rather than leaving an admin
 *  to guess which end they are looking at.
 *
 *  The ring size is read from the payload rather than hardcoded, so it stays
 *  true if it changes. */
export function unlistedFailures(mail: {
  consecutiveFailures: number;
  recentFailures: MailFailure[];
}): number {
  return Math.max(0, mail.consecutiveFailures - mail.recentFailures.length);
}

/**
 * The standing alarm for outgoing mail, shown on every admin screen.
 *
 * It lives in the shell rather than on the status page because the status page
 * is somewhere you go once you already suspect something. The failure this was
 * built for was invisible for hours precisely because nobody had a reason to
 * look, and a warning that requires you to already be worried is not a warning.
 */
export default function MailAlert() {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { status } = useSystemStatus();

  const mail = status?.mail;
  if (!mail) return null;

  const broken = mailNeedsAttention(mail.status);
  const owed = peopleOwed(mail);

  // Two different questions, and one banner cannot answer both. "Is mail
  // broken" is the alarm; "does anyone still not have their email" outlives
  // the fix, because the successful send that clears the alarm is usually the
  // admin's own test probe. Showing only the first recreates the original
  // bug at the shell level: green, empty, and nobody has a reason to look.
  if (!broken && owed === 0) return null;

  const waiting = peopleWaiting(mail);
  const tone = broken
    ? "border-danger/30 bg-danger/10 dark:bg-danger/15"
    : "border-amber-300/60 bg-amber-100/70 dark:border-amber-900/60 dark:bg-amber-950/40";
  const text = broken
    ? "text-danger"
    : "text-amber-900 dark:text-amber-100";
  const dot = broken ? "bg-danger" : "bg-amber-500";

  return (
    <div role="alert" className={`border-b ${tone}`}>
      <div className="container-page flex flex-wrap items-center gap-x-3 gap-y-1 py-3">
        <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
        <p className={`text-sm font-bold ${text}`}>
          {broken
            ? waiting > 0
              ? peopleWaitingIsFloor(mail)
                ? t.system.waitingAtLeastTitle(waiting)
                : t.system.waitingTitle(waiting)
              : `${t.system.mailTitle} — ${
                  t.system.mailStatuses[mail.status] ?? mail.status
                }`
            : t.system.owedTitle(owed)}
        </p>
        <Link
          to="/admin/system"
          className={`ms-auto shrink-0 text-sm font-semibold underline underline-offset-2 hover:opacity-80 ${text}`}
        >
          {t.system.bannerAction}
        </Link>
      </div>
    </div>
  );
}
