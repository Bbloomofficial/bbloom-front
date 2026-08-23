import { useState } from "react";
import type { FormEvent } from "react";
import Logo from "../../components/Logo";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import PasswordField from "../../components/PasswordField";
import { ApiError } from "../../api/http";
import { useI18n } from "../../i18n";
import { useAuth } from "../auth";
import { adminStrings } from "../strings";

export default function Login() {
  const { locale } = useI18n();
  const t = adminStrings(locale);
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
      // 401 comes back as a generic problem detail; anything else is worth showing.
      const message =
        caught instanceof ApiError && caught.status !== 401
          ? caught.message
          : t.login.failed;
      setError(message);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="container-page flex h-16 items-center justify-between">
        <a href="/" aria-label="bbloom">
          <Logo />
        </a>
        <LanguageSwitcher />
      </header>

      <main className="container-page flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-ink-100 bg-surface p-6 shadow-xl shadow-bloom-600/5 sm:p-8">
            <span className="eyebrow">{t.brand}</span>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink-900">
              {t.login.title}
            </h1>
            <p className="mt-2 text-sm text-ink-600">{t.login.subtitle}</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label className="label" htmlFor="admin-email">
                  {t.login.email}
                </label>
                <input
                  id="admin-email"
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
                <label className="label" htmlFor="admin-password">
                  {t.login.password}
                </label>
                <PasswordField
                  id="admin-password"
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
          </div>

          <p className="mt-5 text-center text-xs text-ink-400">{t.login.help}</p>
        </div>
      </main>
    </div>
  );
}
