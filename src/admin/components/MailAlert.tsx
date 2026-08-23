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
  if (!mail || !mailNeedsAttention(mail.status)) return null;

  const waiting = peopleWaiting(mail);

  return (
    <div
      role="alert"
      className="border-b border-danger/30 bg-danger/10 dark:bg-danger/15"
    >
      <div className="container-page flex flex-wrap items-center gap-x-3 gap-y-1 py-3">
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-danger" />
        <p className="text-sm font-bold text-danger">
          {waiting > 0
            ? peopleWaitingIsFloor(mail)
              ? t.system.waitingAtLeastTitle(waiting)
              : t.system.waitingTitle(waiting)
            : `${t.system.mailTitle} — ${
                t.system.mailStatuses[mail.status] ?? mail.status
              }`}
        </p>
        <Link
          to="/admin/system"
          className="ms-auto shrink-0 text-sm font-semibold text-danger underline underline-offset-2 hover:opacity-80"
        >
          {t.system.bannerAction}
        </Link>
      </div>
    </div>
  );
}
