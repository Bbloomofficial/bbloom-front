import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { ApiError } from "../api/http";
import { fetchAccount, loginAccount, registerAccount } from "./api/account";
import type { AccountProfile, AccountSite } from "./api/types";

/**
 * The client session. It belongs to an *account*, not to a website: one account
 * can own several sites and hold a different role on each, and a freshly
 * registered account owns none at all.
 *
 * The storage key is unchanged on purpose, so clients who were signed in before
 * this shipped stay signed in through the deploy.
 */
const STORAGE_KEY = "bbloom:site-session";

type StoredSession = { token: string; expiresAt: string; user: AccountProfile };

function readSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as StoredSession;
    // An account with no website is a legitimate state — the only thing that
    // makes a stored session worthless is a missing or expired token.
    if (!session?.token || !session.user?.id) return null;
    if (session.expiresAt && Date.parse(session.expiresAt) < Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function writeSession(session: StoredSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

/** Reads the persisted token without mounting the provider (used by the preview frame). */
export function readStoredToken(): string | null {
  return readSession()?.token ?? null;
}

/**
 * Starts a session from outside the provider.
 *
 * The build-before-you-sign-up flow lives on the marketing side of the app,
 * where `AuthProvider` is not mounted, but it registers a real account and must
 * leave the client signed in — otherwise finishing a signup would dump them on
 * a login form asking for the password they typed a second ago.
 */
export function storeSession(response: {
  token: string;
  expiresAt: string;
  user: AccountProfile;
}): void {
  writeSession({
    token: response.token,
    expiresAt: response.expiresAt,
    user: response.user,
  });
}

/**
 * A session restored from before this release predates `sites`, and a failed
 * revalidation can leave us on that older copy, so the list is never assumed.
 */
export function sitesOf(user: AccountProfile | null): AccountSite[] {
  return user?.sites ?? [];
}

type AuthValue = {
  token: string | null;
  user: AccountProfile | null;
  /** True until the stored session has been checked against the backend. */
  restoring: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    email: string;
    fullName: string;
    password: string;
  }) => Promise<void>;
  signOut: () => void;
  /** Re-reads the profile; the site list moves under several flows. */
  refresh: () => Promise<AccountProfile | null>;
  /** Signs out on a rejected token, otherwise does nothing. */
  handleError: (error: unknown) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(readSession);
  const [restoring, setRestoring] = useState(session !== null);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setRestoring(false);
  }, []);

  // Revalidate a restored token once, so a revoked or expired session lands on
  // the login screen rather than on a panel full of failed requests.
  useEffect(() => {
    if (!session || !restoring) return;
    let cancelled = false;

    fetchAccount(session.token)
      .then((user) => {
        if (cancelled) return;
        setSession((current) => {
          if (!current) return current;
          const next = { ...current, user };
          writeSession(next);
          return next;
        });
        setRestoring(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status < 500) signOut();
        else setRestoring(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session, restoring, signOut]);

  const start = useCallback(
    (response: { token: string; expiresAt: string; user: AccountProfile }) => {
      const next: StoredSession = {
        token: response.token,
        expiresAt: response.expiresAt,
        user: response.user,
      };
      writeSession(next);
      setSession(next);
      setRestoring(false);
    },
    [],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      start(await loginAccount(email, password));
    },
    [start],
  );

  // Registration answers with a session, so a new client goes straight into the
  // panel instead of being bounced to a login form they just filled in.
  const signUp = useCallback(
    async (input: { email: string; fullName: string; password: string }) => {
      start(await registerAccount(input));
    },
    [start],
  );

  const refresh = useCallback(async () => {
    const token = session?.token;
    if (!token) return null;
    try {
      const user = await fetchAccount(token);
      setSession((current) => {
        if (!current) return current;
        const next = { ...current, user };
        writeSession(next);
        return next;
      });
      return user;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) signOut();
      return null;
    }
  }, [session?.token, signOut]);

  const handleError = useCallback(
    (error: unknown) => {
      // A 403 is no longer proof of a dead session: an editor who reaches an
      // owner-only endpoint gets one too, and signing them out for it would be
      // absurd. Only an outright rejected token ends the session.
      if (error instanceof ApiError && error.status === 401) signOut();
    },
    [signOut],
  );

  const value = useMemo<AuthValue>(
    () => ({
      token: session?.token ?? null,
      user: session?.user ?? null,
      restoring,
      signIn,
      signUp,
      signOut,
      refresh,
      handleError,
    }),
    [session, restoring, signIn, signUp, signOut, refresh, handleError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}

/** Narrower hook for pages that only render once a session exists. */
export function useSession() {
  const auth = useAuth();
  if (!auth.token || !auth.user) {
    throw new Error("useSession requires an authenticated dashboard route");
  }
  return { ...auth, token: auth.token, user: auth.user };
}
