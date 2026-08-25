import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import PasswordField from "../../components/PasswordField";
import VerifyCodeForm from "../components/VerifyCodeForm";
import { ApiError } from "../../api/http";
import { describeProblem } from "../../api/problem";
import { useI18n } from "../../i18n";
import { useAuth } from "../auth";
import { dashboardStrings } from "../strings";
import { AuthShell } from "./Register";
import { dashPath } from "../../routes";

export default function Login() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { signIn, completeVerification, noteSend } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /**
   * The address the server refused as unconfirmed.
   *
   * Taken from the 403 rather than from the form, because it is the address the
   * server actually matched — the one the code will be checked against. Reading
   * it back off our own input would look identical every time it agreed and
   * would be silently wrong in the one case where it did not.
   */
  const [unverified, setUnverified] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (caught) {
      // An unconfirmed account is not a failed sign-in: the password was
      // right and the only thing missing is the code we already emailed. It
      // gets the confirmation screen instead of a red sentence, because being
      // told "confirm your email" by a form with no way to do so is the state
      // this whole flow exists to avoid.
      if (
        caught instanceof ApiError &&
        caught.code === "EMAIL_NOT_VERIFIED" &&
        typeof caught.problem.email === "string"
      ) {
        setUnverified(caught.problem.email);
        setSubmitting(false);
        return;
      }
      setError(describeProblem(caught, t.errors, t.login.failed));
      setSubmitting(false);
    }
  }

  if (unverified) {
    return (
      <AuthShell>
        <div className="rounded-3xl border border-ink-100 bg-surface p-6 shadow-xl shadow-bloom-600/5 sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
            {t.register.confirmTitle}
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            {t.register.confirmExisting}
          </p>
          <p className="mt-2 text-sm text-ink-600">
            {t.verify.codeSentTo}{" "}
            <span className="font-semibold text-ink-900" dir="ltr">
              {unverified}
            </span>
          </p>

          {/* No `resendAvailableAt`: nothing was emailed by arriving here, so
              the button starts live. The last code may be old or lost, which
              is the likeliest reason someone is on this screen at all. */}
          <VerifyCodeForm
            email={unverified}
            onSendResult={noteSend}
            onVerified={(session) => {
              if (session) completeVerification(session);
              else setUnverified(null);
            }}
          />

          <p className="mt-5 text-center text-sm text-ink-600">
            <button
              type="button"
              onClick={() => setUnverified(null)}
              className="font-semibold text-tint-fg hover:underline"
            >
              {t.login.backToSignIn}
            </button>
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="rounded-3xl border border-ink-100 bg-surface p-6 shadow-xl shadow-bloom-600/5 sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
          {t.login.title}
        </h1>
        <p className="mt-2 text-sm text-ink-600">{t.login.subtitle}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="label" htmlFor="dashboard-email">
              {t.login.email}
            </label>
            <input
              id="dashboard-email"
              name="email"
              type="email"
              autoComplete="username"
              dir="ltr"
              required
              className="field"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="dashboard-password">
              {t.login.password}
            </label>
            <PasswordField
              id="dashboard-password"
              name="password"
              autoComplete="current-password"
              dir="ltr"
              required
              className="field"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-2xl bg-tint px-4 py-3 text-sm font-semibold text-danger"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-60"
          >
            {submitting ? t.login.submitting : t.login.submit}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-600">
          {t.login.noAccount}{" "}
          <Link
            to={dashPath("/register")}
            className="font-semibold text-tint-fg hover:underline"
          >
            {t.login.createAccount}
          </Link>
        </p>
      </div>

      <p className="mt-5 text-center text-xs text-ink-400">{t.login.help}</p>
    </AuthShell>
  );
}
