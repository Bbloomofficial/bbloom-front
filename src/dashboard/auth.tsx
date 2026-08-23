import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { ApiError, authFailure } from "../api/http";
import { fetchAccount, loginAccount, registerAccount } from "./api/account";
import type { AccountProfile, AccountSite, EmailLanguage } from "./api/types";

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
 * The signed-in account, for surfaces outside the provider.
 *
 * The build-before-you-sign-up flow needs to know whether it is talking to a
 * stranger or to someone who already has websites here, because asking a
 * returning client to "create an account" to save their second site is both
 * wrong and impossible.
 */
export function readStoredAccount(): {
  token: string;
  email: string;
  emailDelivery?: boolean;
} | null {
  const session = readSession();
  return session
    ? {
        token: session.token,
        email: session.user.email,
        emailDelivery: session.user.emailDelivery,
      }
    : null;
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
    language?: EmailLanguage;
  }) => Promise<void>;
  signOut: () => void;
  /** Re-reads the profile; the site list moves under several flows. */
  refresh: () => Promise<AccountProfile | null>;
  /** Signs out on a rejected token, otherwise does nothing. */
  handleError: (error: unknown) => void;
  /**
   * Earliest a resend should be offered, ISO, when we know a code has just
   * been sent by something other than the resend button itself.
   */
  resendAvailableAt: string | null;
};

const AuthContext = createContext<AuthValue | null>(null);

/**
 * How long the backend makes a client wait between confirmation emails.
 *
 * A mirror of a server rule, which is normally a thing to avoid — but it is
 * only ever used to grey out a button early. The server's own `resendAvailableAt`
 * overrides it the first time it disagrees, so the two cannot drift into a
 * client that lets someone press a button the server will refuse.
 */
const RESEND_INTERVAL_MS = 60_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(readSession);
  const [restoring, setRestoring] = useState(session !== null);
  /**
   * When the confirmation email we know about was sent, in ms.
   *
   * Registration mails a code itself, so the resend button is refused the
   * moment the new client arrives in the panel. The server has the real
   * deadline but does not put it on the register response — only on the 429 —
   * so this is a local floor derived from an event we watched happen, not a
   * claim about server state. Getting it wrong is harmless in both directions:
   * too short and the 429 handler sets the real figure, too long and the client
   * waits a few extra seconds for a mail they have already been sent.
   */
  const [mailedAt, setMailedAt] = useState<number | null>(null);

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
  // panel instead of being bounced to a login form they just filled in. The
  // panel then asks for the emailed code — which is a prompt inside a working
  // account, not a gate in front of one.
  const signUp = useCallback(
    async (input: {
      email: string;
      fullName: string;
      password: string;
      language?: EmailLanguage;
    }) => {
      start(await registerAccount(input));
      setMailedAt(Date.now());
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
      // 401 is a rejected token. 404 is stranger and worse: the token is
      // perfectly valid and the account behind it is gone, which happens when
      // an account is deleted while someone is signed in. Nothing about that
      // recovers, and without treating it as a dead session the panel sits
      // there signed in to nobody, answering "not found" to everything with no
      // way back out but clearing site data by hand.
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 404)
      ) {
        signOut();
      }
      return null;
    }
  }, [session?.token, signOut]);

  const handleError = useCallback(
    (error: unknown) => {
      // A 403 is no longer proof of a dead session: an editor who reaches an
      // owner-only endpoint gets one too, and signing them out for it would be
      // absurd. Only an outright rejected token ends the session.
      //
      // Nor is every 401. A 401 carrying `INVALID_CREDENTIALS` means a password
      // was offered and refused, which says nothing about the token — and
      // ending the session over it would throw away whatever the client was in
      // the middle of. An unrecognised 401 still signs out, because for a
      // background read a dead token is by far the likelier explanation.
      if (
        error instanceof ApiError &&
        error.status === 401 &&
        authFailure(error) !== "credentials"
      ) {
        signOut();
      }
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
      resendAvailableAt:
        mailedAt === null
          ? null
          : new Date(mailedAt + RESEND_INTERVAL_MS).toISOString(),
    }),
    [
      session,
      restoring,
      signIn,
      signUp,
      signOut,
      refresh,
      handleError,
      mailedAt,
    ],
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
