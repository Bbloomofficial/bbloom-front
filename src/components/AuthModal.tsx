import { useCallback, useEffect } from "react";
import type { Location } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AuthProvider } from "../dashboard/auth";
import Login from "../dashboard/pages/Login";
import Register from "../dashboard/pages/Register";
import { AuthSurfaceProvider } from "../dashboard/pages/authSurface";
import { dashboardStrings } from "../dashboard/strings";
import { useI18n } from "../i18n";

export type AuthMode = "login" | "register";

/**
 * Signing in and signing up, over whatever page the visitor was reading.
 *
 * `/login` and `/register` stay real addresses — they are in sent mail and in
 * bookmarks — but they now render this dialog above a background route rather
 * than a screen of their own. Closing it returns to that background, which is
 * why the location is passed in rather than guessed: it is the page the visitor
 * came from, or the landing page when they arrived at the address cold.
 */
export default function AuthModal({
  mode,
  background,
}: {
  mode: AuthMode;
  background: Location;
}) {
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const dash = dashboardStrings(locale);

  const close = useCallback(() => {
    navigate(`${background.pathname}${background.search}${background.hash}`, {
      replace: true,
    });
  }, [navigate, background]);

  const go = useCallback(
    (next: AuthMode) => {
      // Replace rather than push, and carry the background along: the switch
      // between the two forms is one decision, not two pages, so Back should
      // return to the page underneath and not to the other form.
      navigate(`/${next}`, {
        replace: true,
        state: { backgroundLocation: background },
      });
    },
    [navigate, background],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    // The page behind stays put while the dialog scrolls, otherwise dismissing
    // it drops the visitor somewhere they never scrolled to.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [close]);

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-ink-900/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "register" ? dash.register.title : dash.login.title}
      onMouseDown={(event) => {
        // `mouseDown` on the backdrop itself only: a drag that starts inside
        // the form and ends outside it is a text selection, not a dismissal.
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6">
        <div className="relative w-full max-w-md">
          <button
            type="button"
            onClick={close}
            aria-label={t.nav.close}
            className="absolute -top-2 right-0 z-10 grid h-9 w-9 place-items-center rounded-full bg-surface text-ink-600 shadow-lg transition hover:text-ink-900 sm:-top-3 sm:-right-3"
          >
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>

          <AuthProvider>
            <AuthSurfaceProvider value={{ modal: true, go }}>
              {mode === "register" ? <Register /> : <Login />}
            </AuthSurfaceProvider>
          </AuthProvider>
        </div>
      </div>
    </div>
  );
}
