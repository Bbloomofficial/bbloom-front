import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Logo from "../components/Logo";
import LanguageSwitcher from "../components/LanguageSwitcher";
import VerifyCodeForm from "../dashboard/components/VerifyCodeForm";
import { confirmVerification } from "../dashboard/api/account";
import { readStoredAccount } from "../dashboard/auth";
import { dashboardStrings } from "../dashboard/strings";
import { useI18n } from "../i18n";

/**
 * The email confirmation landing page.
 *
 * Deliberately outside the panel and unauthenticated: the link is opened by
 * whichever browser the mail client hands it to, which is very often not the
 * one holding the session — so requiring a login here would strand people on
 * the one screen that is supposed to be frictionless.
 *
 * It serves both halves of the same email. With `?token=` it confirms the link
 * on arrival; without one it asks for the six-digit code, which is what someone
 * reaches by typing the address in by hand or by tapping a stale bookmark.
 */

type State = "checking" | "done" | "failed" | "code";

export default function Verify() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const [search] = useSearchParams();
  const token = search.get("token");

  // The address can be carried in the link, and otherwise comes from a session
  // stored in this browser. Both can be absent — someone may open this page on
  // a device that has never signed in — and that case is handled rather than
  // guessed at.
  const [session] = useState(() => readStoredAccount());
  const [email] = useState(
    () => search.get("email")?.trim() || readStoredAccount()?.email || "",
  );

  const [state, setState] = useState<State>(token ? "checking" : "code");
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    confirmVerification(token)
      .then(() => {
        if (!cancelled) setState("done");
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setState("failed");
        setDetail(error.message);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="container-page flex h-16 items-center justify-between">
        <a href="/" aria-label="bbloom">
          <Logo />
        </a>
        <LanguageSwitcher />
      </header>

      <main className="container-page flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-md rounded-3xl border border-ink-100 bg-surface p-6 shadow-xl shadow-bloom-600/5 sm:p-8">
          {state === "checking" ? (
            <p className="text-center text-sm text-ink-400">
              {t.verify.pageChecking}
            </p>
          ) : state === "done" ? (
            <div className="text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success-soft text-success">
                <svg
                  viewBox="0 0 20 20"
                  className="h-6 w-6"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" />
                </svg>
              </span>
              <h1 className="mt-4 text-xl font-extrabold tracking-tight text-ink-900">
                {t.verify.pageSuccessTitle}
              </h1>
              <p className="mt-2 text-sm text-ink-600">
                {t.verify.pageSuccessBody}
              </p>
            </div>
          ) : state === "code" ? (
            <>
              <h1 className="text-xl font-extrabold tracking-tight text-ink-900">
                {t.verify.pageTitle}
              </h1>
              <p className="mt-2 text-sm text-ink-600">{t.verify.pageBody}</p>

              {email ? (
                <>
                  <p className="mt-2 text-sm text-ink-600">
                    {t.verify.codeSentTo}{" "}
                    <span className="font-semibold text-ink-900" dir="ltr">
                      {email}
                    </span>
                  </p>
                  <VerifyCodeForm
                    email={email}
                    token={session?.token ?? null}
                    onVerified={() => setState("done")}
                  />
                </>
              ) : (
                // Without an address there is nothing to confirm against, and
                // asking someone to type both their email and a code on a page
                // they reached by accident is worse than sending them to log in.
                <p className="mt-3 text-sm text-ink-600">
                  {t.verify.pageNoEmail}
                </p>
              )}
            </>
          ) : (
            <div>
              <div className="text-center">
                <h1 className="text-xl font-extrabold tracking-tight text-ink-900">
                  {t.verify.pageFailedTitle}
                </h1>
                <p className="mt-2 text-sm text-ink-600">
                  {t.verify.pageFailedBody}
                </p>
                {/* The server's own words, in case it refused for a reason we
                    have not learned to phrase ourselves. */}
                {detail && <p className="mt-3 text-xs text-ink-400">{detail}</p>}
              </div>

              {/* A dead link is the likeliest moment to reach for the code
                  instead, so the box is offered here rather than after another
                  round trip through the panel. */}
              {email && (
                <VerifyCodeForm
                  email={email}
                  token={session?.token ?? null}
                  onVerified={() => setState("done")}
                />
              )}
            </div>
          )}

          <Link to="/dashboard" className="btn-primary mt-6 w-full">
            {t.verify.goToPanel}
          </Link>
        </div>
      </main>
    </div>
  );
}
