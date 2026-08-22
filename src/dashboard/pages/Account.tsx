import { useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "../../api/http";
import { useI18n } from "../../i18n";
import { changeAccountPassword } from "../api/account";
import { useSession } from "../auth";
import { dashboardStrings } from "../strings";

/** The account itself — the details that are not about any one website. */
export default function Account() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { token, user } = useSession();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      await changeAccountPassword(token, currentPassword, newPassword);
      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.message
          ? caught.message
          : t.account.submit,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
          {t.account.title}
        </h1>
        <p className="mt-1 text-sm text-ink-600">{t.account.subtitle}</p>
      </div>

      <section className="rounded-3xl border border-ink-100 bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 py-2">
          <span className="text-sm text-ink-400">{t.account.name}</span>
          <span className="text-sm font-semibold text-ink-900">
            {user.fullName}
          </span>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-ink-100 py-2">
          <span className="text-sm text-ink-400">{t.account.email}</span>
          <span className="text-sm font-semibold text-ink-900" dir="ltr">
            {user.email}
            {user.emailVerified && (
              <span className="ms-2 rounded-full bg-success-soft px-2 py-0.5 text-xs font-bold text-success">
                {t.verify.verified}
              </span>
            )}
          </span>
        </div>
      </section>

      <form
        onSubmit={onSubmit}
        className="rounded-3xl border border-ink-100 bg-surface p-5 sm:p-6"
        noValidate
      >
        <h2 className="text-sm font-bold text-ink-900">
          {t.account.passwordTitle}
        </h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="label" htmlFor="current-password">
              {t.account.currentPassword}
            </label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              dir="ltr"
              required
              className="field"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="new-password">
              {t.account.newPassword}
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              dir="ltr"
              required
              minLength={8}
              maxLength={72}
              className="field"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-2xl bg-tint px-4 py-3 text-sm font-semibold text-danger"
          >
            {error}
          </p>
        )}
        {saved && (
          <p role="status" className="mt-4 text-sm font-semibold text-success">
            {t.account.saved}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary mt-5 disabled:opacity-60"
        >
          {submitting ? t.account.submitting : t.account.submit}
        </button>
      </form>
    </div>
  );
}
