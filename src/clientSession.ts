import { useEffect, useState } from "react";

/**
 * Whether this browser holds a client session — answered without loading the
 * dashboard.
 *
 * The dashboard is not a separate destination any more: `/` is the pitch to a
 * stranger and their websites to a signed-in client. Deciding which of the two
 * to render is therefore the *marketing* bundle's problem, and importing the
 * dashboard's own reader to answer it would pull its API layer, its types and
 * its provider into every visit to the marketing site.
 *
 * So the storage key lives here, and `dashboard/auth.tsx` imports it from this
 * module rather than declaring its own. Two copies of a key that must agree is
 * the kind of duplication that stays correct right up until one of them is
 * renamed.
 */
export const CLIENT_SESSION_KEY = "bbloom:site-session";

/**
 * Fired on this tab whenever the session is written or cleared.
 *
 * The DOM's own `storage` event is deliberately not delivered to the tab that
 * caused the change, so it cannot be used to notice our own sign-out — which is
 * exactly the case that has to re-render `/` from the dashboard back to the
 * marketing home.
 */
export const CLIENT_SESSION_EVENT = "bbloom:client-session";

/**
 * A stored session good enough to render a dashboard for.
 *
 * The checks mirror the dashboard's own `readSession()`. An expired token is
 * treated as absent rather than as present-but-stale: rendering the dashboard
 * for it would sign the visitor out a moment later, and landing on the pitch is
 * the better of the two answers.
 *
 * Deliberately does not clear anything it disagrees with. This runs on the
 * marketing side, where a parse failure means "show the pitch", and a reader
 * that deletes what it cannot read would turn a bug in this file into lost
 * sessions.
 */
export function hasClientSession(): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(CLIENT_SESSION_KEY);
  if (!raw) return false;
  try {
    const session = JSON.parse(raw) as {
      token?: string;
      expiresAt?: string;
      user?: { id?: string };
    };
    if (!session?.token || !session.user?.id) return false;
    if (session.expiresAt && Date.parse(session.expiresAt) < Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Tells this tab that the session was written or cleared. */
export function announceClientSession(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CLIENT_SESSION_EVENT));
}

/** `hasClientSession()`, kept current as the session comes and goes. */
export function useClientSession(): boolean {
  const [present, setPresent] = useState(hasClientSession);

  useEffect(() => {
    const sync = () => setPresent(hasClientSession());
    // `storage` covers the other tabs, the custom event covers this one.
    window.addEventListener("storage", sync);
    window.addEventListener(CLIENT_SESSION_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CLIENT_SESSION_EVENT, sync);
    };
  }, []);

  return present;
}
