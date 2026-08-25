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
import { CLIENT_SESSION_KEY, announceClientSession } from "../clientSession";
import { fetchAccount, loginAccount, registerAccount } from "./api/account";
import type {
  AccountProfile,
  AccountSite,
  EmailLanguage,
  SiteLoginResponse,
  VerificationTicket,
} from "./api/types";

/**
 * The client session. It belongs to an *account*, not to a website: one account
 * can own several sites and hold a different role on each, and a freshly
 * registered account owns none at all.
 *
 * The storage key is unchanged on purpose, so clients who were signed in before
 * this shipped stay signed in through the deploy. It is declared in
 * `src/clientSession.ts` because the marketing home now has to read it too:
 * `/` renders this dashboard for a signed-in client.
 */
const STORAGE_KEY = CLIENT_SESSION_KEY;

type StoredSession = {
  token: string;
  expiresAt: string;
  user: AccountProfile;
  /**
   * What happened to the last confirmation email we watched being sent, and
   * when. Persisted because the build-before-you-sign-up flow registers on the
   * marketing side and then navigates into the panel: a failed send held only
   * in memory would be forgotten in exactly the flow most people arrive by.
   */
  mail?: { at: number; sent?: boolean | null };
  /**
   * When the server said it would accept another confirmation email, verbatim.
   *
   * Separate from `mail` because it is true of the account rather than of a
   * send we watched: signing in reports it for an email somebody else's tab
   * triggered, or that registration sent an hour ago.
   */
  resendAt?: string;
};

/**
 * How long a watched send is still worth reporting.
 *
 * Matched to the code's own fifteen-minute life. After that the client has to
 * resend anyway, which produces a fresh answer â€” so a stale `false` can never
 * outlive the thing it describes and start accusing a healthy server.
 */
const MAIL_FACT_TTL_MS = 15 * 60_000;

function readSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as StoredSession;
    // An account with no website is a legitimate state â€” the only thing that
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
  // `/` is the marketing home to a stranger and this dashboard to a client, so
  // the page outside the provider has to hear about a sign-in on this tab.
  announceClientSession();
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
 * leave the client signed in â€” otherwise finishing a signup would dump them on
 * a login form asking for the password they typed a second ago.
 */
export function storeSession(response: {
  token: string;
  expiresAt: string;
  user: AccountProfile;
  mailSent?: boolean | null;
}): void {
  writeSession({
    token: response.token,
    expiresAt: response.expiresAt,
    user: response.user,
    // Only registration mails anything here; a sign-in carries no `mailSent`
    // and must not leave a send fact behind for the panel to render.
    mail:
      response.mailSent === undefined
        ? undefined
        : { at: Date.now(), sent: response.mailSent },
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
  }) => Promise<VerificationTicket>;
  /**
   * Adopts the session that confirming an address hands back, which is now the
   * only way a newly registered client ever becomes signed in.
   */
  completeVerification: (session: SiteLoginResponse) => void;
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
  /**
   * True only when a send we watched explicitly reported failure and is recent
   * enough to still be the one the client is waiting for. Unknown is never
   * failure.
   */
  lastSendFailed: boolean;
  /** Records the outcome of a send made elsewhere, e.g. the resend button. */
  noteSend: (sent: boolean | null | undefined) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

/**
 * How long the backend makes a client wait between confirmation emails.
 *
 * A mirror of a server rule, which is normally a thing to avoid â€” but it is
 * only ever used to grey out a button early, and only when the server has not
 * told us its own deadline. `resendAvailableAt` on the register and login
 * responses is preferred wherever it exists, and the 429 overrides both the
 * first time they disagree, so the two cannot drift into a client that lets
 * someone press a button the server will refuse.
 */
const RESEND_INTERVAL_MS = 60_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(readSession);
  const [restoring, setRestoring] = useState(session !== null);
  /**
   * When the confirmation email we know about was sent, in ms.
   *
   * Registration mails a code itself, so the resend button is refused the
   * moment the new client arrives in the panel. This is a local floor derived
   * from an event we watched happen, not a claim about server state, and it is
   * now only the fallback: the server does put `resendAvailableAt` on the
   * register and login responses, which the comment here previously denied.
   * Measured against production rather than assumed. Getting the floor wrong is
   * harmless in both directions: too short and the 429 handler sets the real
   * figure, too long and the client waits a few extra seconds for a mail they
   * have already been sent.
   */
  const [mailedAt, setMailedAt] = useState<number | null>(
    () => readSession()?.mail?.at ?? null,
  );
  /**
   * The server's own answer to "when will you accept another one", when it has
   * given us one.
   *
   * Preferred over the mirror below because it is the only thing that covers
   * signing in. Registration mails a code and then hands over a session, so a
   * client who closes the tab and signs in ten seconds later gets a form that
   * knows about no send at all â€” measured against production, the button was
   * live and the server answered 429. The deadline is a property of the
   * account, not of a send this tab watched, which is why signing in reports it
   * even though signing in mails nothing.
   */
  const [resendAt, setResendAt] = useState<string | null>(
    () => readSession()?.resendAt ?? null,
  );
  /**
   * Whether that send actually left. `false` is the case this exists for: the
   * client is sitting in the panel being told to check an inbox that will stay
   * empty, and nothing else on the screen knows. Undefined is unknown and must
   * read as "check your inbox", not as failure.
   */
  const [mailSent, setMailSent] = useState<boolean | null | undefined>(
    () => readSession()?.mail?.sent,
  );

  const signOut = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    announceClientSession();
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
    (
      response: {
        token: string;
        expiresAt: string;
        user: AccountProfile;
        mailSent?: boolean | null;
        /**
         * The server's own deadline for the next confirmation email. Present on
         * both register and login â€” verified against production â€” which is what
         * makes the local mirror below a fallback rather than the source.
         */
        resendAvailableAt?: string | null;
      },
      /** Whether this response is one that caused an email to be sent. */
      mailed: boolean,
    ) => {
      // Signing in sends nothing, so it must clear any earlier send result
      // rather than inherit it. A `false` left over from a previous session
      // would accuse a healthy server on a screen with no send behind it.
      const mail = mailed
        ? { at: Date.now(), sent: response.mailSent }
        : undefined;
      const next: StoredSession = {
        token: response.token,
        expiresAt: response.expiresAt,
        user: response.user,
        mail,
        resendAt: response.resendAvailableAt ?? undefined,
      };
      writeSession(next);
      setSession(next);
      setMailedAt(mail?.at ?? null);
      setResendAt(response.resendAvailableAt ?? null);
      setMailSent(mail?.sent);
      setRestoring(false);
    },
    [],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      start(await loginAccount(email, password), false);
    },
    [start],
  );

  // Registration no longer answers with a session: it answers 202 and mails a
  // code. So this hands the ticket back rather than signing anyone in, and the
  // caller is responsible for showing the confirmation screen. The cooldown and
  // send result on that ticket are the reason it is returned whole â€” they are
  // the difference between a live resend button and one the server refuses.
  const signUp = useCallback(
    async (input: {
      email: string;
      fullName: string;
      password: string;
      language?: EmailLanguage;
    }) => registerAccount(input),
    [],
  );

  // Confirming is what issues the first token. `mailed: false` because this
  // response is the end of an email's life, not the start of one â€” treating it
  // as a send would leave a fresh cooldown on a screen with nothing to resend.
  const completeVerification = useCallback(
    (session: SiteLoginResponse) => start(session, false),
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
      // was offered and refused, which says nothing about the token â€” and
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

  const noteSend = useCallback((sent: boolean | null | undefined) => {
    const at = Date.now();
    setMailedAt(at);
    setMailSent(sent);
    setSession((current) => {
      if (!current) return current;
      const next = { ...current, mail: { at, sent } };
      writeSession(next);
      return next;
    });
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      token: session?.token ?? null,
      user: session?.user ?? null,
      restoring,
      signIn,
      signUp,
      completeVerification,
      signOut,
      refresh,
      handleError,
      noteSend,
      lastSendFailed:
        mailSent === false &&
        mailedAt !== null &&
        Date.now() - mailedAt < MAIL_FACT_TTL_MS,
      resendAvailableAt:
        resendAt ??
        (mailedAt === null
          ? null
          : new Date(mailedAt + RESEND_INTERVAL_MS).toISOString()),
    }),
    [
      session,
      restoring,
      signIn,
      signUp,
      completeVerification,
      signOut,
      refresh,
      handleError,
      noteSend,
      mailedAt,
      mailSent,
      resendAt,
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
