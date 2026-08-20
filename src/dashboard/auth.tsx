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
import { fetchProfile, login as loginRequest } from "./api/client";
import type { SiteUserProfile } from "./api/types";

const STORAGE_KEY = "bbloom:site-session";

type StoredSession = { token: string; expiresAt: string; user: SiteUserProfile };

function readSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as StoredSession;
    if (!session?.token || !session.user?.siteId) return null;
    // A token past its expiry is worth nothing; drop it before any request.
    if (session.expiresAt && Date.parse(session.expiresAt) < Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

type AuthValue = {
  token: string | null;
  user: SiteUserProfile | null;
  /** True until the stored session has been checked against the backend. */
  restoring: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  /** Signs out on an expired or rejected token, otherwise rethrows. */
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
  // the login screen rather than on a dashboard full of failed requests.
  useEffect(() => {
    if (!session || !restoring) return;
    let cancelled = false;

    fetchProfile(session.token)
      .then((user) => {
        if (cancelled) return;
        setSession((current) => (current ? { ...current, user } : current));
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

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password);
    const next: StoredSession = {
      token: response.token,
      expiresAt: response.expiresAt,
      user: response.user,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
    setRestoring(false);
  }, []);

  const handleError = useCallback(
    (error: unknown) => {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
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
      signOut,
      handleError,
    }),
    [session, restoring, signIn, signOut, handleError],
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
