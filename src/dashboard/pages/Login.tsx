import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import PasswordField from "../../components/PasswordField";
import { describeProblem } from "../../api/problem";
import { useI18n } from "../../i18n";
import { useAuth } from "../auth";
import { dashboardStrings } from "../strings";
import { AuthShell } from "./Register";

export default function Login() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (caught) {
      setError(describeProblem(caught, t.errors, t.login.failed));
      setSubmitting(false);
    }
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
            to="/dashboard/register"
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
