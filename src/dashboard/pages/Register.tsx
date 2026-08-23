import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { describeProblem } from "../../api/problem";
import { useI18n } from "../../i18n";
import { useAuth } from "../auth";
import { dashboardStrings } from "../strings";

/** Shared chrome for the signed-out screens. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="container-page flex h-16 items-center justify-between">
        <a href="/" aria-label="bbloom">
          <Logo />
        </a>
        <LanguageSwitcher />
      </header>
      <main className="container-page flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

export default function Register() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState("");
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
      // Registering signs them in, so there is nowhere to navigate to: the
      // shell re-renders into the panel as soon as the session lands.
      //
      // `language` decides which language the confirmation email is written in.
      // The panel's current language is the best evidence we have, and it is
      // better evidence than anything the server could infer.
      await signUp({
        email: email.trim(),
        fullName: fullName.trim(),
        password,
        language: locale,
      });
    } catch (caught) {
      // A duplicate email and a rejected password each get their own sentence;
      // both are things the client can act on, so neither is flattened into a
      // generic failure.
      setError(describeProblem(caught, t.errors, t.register.failed));
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="rounded-3xl border border-ink-100 bg-surface p-6 shadow-xl shadow-bloom-600/5 sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
          {t.register.title}
        </h1>
        <p className="mt-2 text-sm text-ink-600">{t.register.subtitle}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="label" htmlFor="register-name">
              {t.register.fullName}
            </label>
            <input
              id="register-name"
              name="fullName"
              autoComplete="name"
              required
              className="field"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="register-email">
              {t.register.email}
            </label>
            <input
              id="register-email"
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
            <label className="label" htmlFor="register-password">
              {t.register.password}
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              dir="ltr"
              required
              minLength={8}
              maxLength={72}
              className="field"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <p className="mt-1.5 text-xs text-ink-400">
              {t.register.passwordHint}
            </p>
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
            {submitting ? t.register.submitting : t.register.submit}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-600">
          {t.register.haveAccount}{" "}
          <Link
            to="/dashboard/login"
            className="font-semibold text-tint-fg hover:underline"
          >
            {t.register.signIn}
          </Link>
        </p>
      </div>

      <p className="mt-5 text-center text-xs text-ink-400">{t.register.terms}</p>
    </AuthShell>
  );
}
