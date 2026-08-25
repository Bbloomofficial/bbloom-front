import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { ApiError } from "../api/http";
import { useAuth } from "./auth";
import { fetchSystemStatus } from "./api/client";
import type { MailHealth, MailStatus, SystemStatus } from "./api/types";

/**
 * Polls the staff health endpoint once for the whole admin shell.
 *
 * One poller rather than one per screen, because the banner in the header and
 * the detail page must never disagree about whether mail is working — two
 * independent fetches would let them, and a header that says "fine" over a page
 * that says "three people are waiting" is worse than either alone.
 */

const POLL_MS = 60_000;

type SystemValue = {
  status: SystemStatus | null;
  /** True when this staff account may not read the endpoint at all. */
  forbidden: boolean;
  reload: () => void;
  /**
   * Replaces the mail reading with one taken elsewhere — specifically the one
   * the test-send endpoint returns after its attempt.
   *
   * Without this the page and the header disagree for up to a minute after a
   * staff test fixes or breaks something, which is the exact failure this
   * provider was written as a single poller to prevent. The test send is also
   * the most likely moment for the reading to change, so it is the worst minute
   * to be stale in.
   */
  applyMail: (mail: MailHealth) => void;
};

const SystemContext = createContext<SystemValue | null>(null);

export function SystemProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Kept in a ref so the polling effect does not restart every time a poll
  // resolves, which would reset the interval and poll far more often than
  // intended.
  const forbiddenRef = useRef(false);
  forbiddenRef.current = forbidden;

  useEffect(() => {
    if (!token) {
      setStatus(null);
      setForbidden(false);
      return;
    }
    let cancelled = false;

    const load = () => {
      if (forbiddenRef.current) return;
      fetchSystemStatus(token)
        .then((next) => {
          if (!cancelled) setStatus(next);
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          // Deliberately never routed through `handleError`. That signs a
          // session out on any 401 or 403, and this endpoint answers 403 to a
          // perfectly valid non-admin staff token — so delegating here would
          // log a working user out of a screen they were using, because of a
          // background poll they never asked for.
          if (error instanceof ApiError && error.status === 403) {
            setForbidden(true);
            return;
          }
          // Anything else — a 502, a dropped connection — leaves the last
          // known reading on screen. Replacing a real warning with an empty
          // panel because one poll failed would hide the very thing this is
          // for.
        });
    };

    load();
    const timer = window.setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [token, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  const applyMail = useCallback((mail: MailHealth) => {
    setStatus((previous) => ({
      // A test send can be the first thing that ever populates this screen, so
      // there may be no previous reading to merge into. `checkedAt` then has to
      // come from us rather than be left undefined and rendered as an invalid
      // date.
      checkedAt: previous?.checkedAt ?? new Date().toISOString(),
      mail,
    }));
  }, []);

  const value = useMemo<SystemValue>(
    () => ({ status, forbidden, reload, applyMail }),
    [status, forbidden, reload, applyMail],
  );

  return (
    <SystemContext.Provider value={value}>{children}</SystemContext.Provider>
  );
}

export function useSystemStatus(): SystemValue {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error("useSystemStatus must be used inside a SystemProvider");
  }
  return context;
}

/**
 * Whether a mail state is one somebody has to act on.
 *
 * `DEGRADED` counts. It means at least one send failed while the process still
 * considers itself healthy — and on the day this endpoint was written, the
 * first failure and the lost customer were the same send. A surface that only
 * reacts to `FAILING` would have been accurate about the outage and three
 * sends too late for the person it cost.
 */
export function mailNeedsAttention(status: MailStatus | undefined): boolean {
  return status === "DEGRADED" || status === "FAILING";
}
