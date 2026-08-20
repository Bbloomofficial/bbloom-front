import { useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "../../api/http";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import {
  createSiteUser,
  fetchSiteUsers,
  resetSiteUserPassword,
  setSiteUserEnabled,
} from "../api/client";
import type { SiteDetail, SiteUser } from "../api/types";
import { formatDate } from "../format";
import { adminStrings } from "../strings";

/**
 * Creating the owner's login is the last step of onboarding — until it exists
 * the client cannot get into their own dashboard, so an empty list says so
 * loudly rather than sitting quietly.
 */
export default function ClientAccountsPanel({ site }: { site: SiteDetail }) {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { token } = useSession();

  const { data, loading, error, reload } = useResource(
    () => fetchSiteUsers(token, site.id),
    [token, site.id],
  );
  const users = data ?? [];
  const hasOwner = users.some((user) => user.role === "SITE_OWNER");

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("SITE_OWNER");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /** Which account's password is being reset, and to what. */
  const [resetting, setResetting] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (password.length < 8) {
      setFormError(t.detail.passwordTooShort);
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      await createSiteUser(token, site.id, {
        email: email.trim(),
        fullName: fullName.trim(),
        password,
        role,
      });
      setEmail("");
      setFullName("");
      setPassword("");
      setOpen(false);
      reload();
    } catch (caught) {
      setFormError(caught instanceof ApiError ? caught.message : String(caught));
    } finally {
      setBusy(false);
    }
  }

  async function toggleEnabled(user: SiteUser) {
    setBusy(true);
    try {
      await setSiteUserEnabled(token, site.id, user.id, !user.enabled);
      reload();
    } catch (caught) {
      setFormError(caught instanceof ApiError ? caught.message : String(caught));
    } finally {
      setBusy(false);
    }
  }

  async function submitReset(user: SiteUser) {
    if (resetPassword.length < 8) {
      setFormError(t.detail.passwordTooShort);
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      await resetSiteUserPassword(token, site.id, user.id, resetPassword);
      setNotice(`${t.detail.passwordReset} — ${user.email}`);
      setResetting(null);
      setResetPassword("");
    } catch (caught) {
      setFormError(caught instanceof ApiError ? caught.message : String(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className={[
        "card hover:shadow-none",
        // No owner means the handover is unfinished; make that impossible to miss.
        hasOwner
          ? "hover:border-ink-100"
          : "border-bloom-300 bg-tint/40 hover:border-bloom-300",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink-900">
            {hasOwner ? t.detail.users : t.detail.handover}
          </h2>
          <p className="mt-1 text-sm text-ink-400">{t.detail.usersHint}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={hasOwner ? "btn-secondary" : "btn-primary"}
        >
          {t.detail.addUser}
        </button>
      </div>

      {loading && !data && <p className="mt-4 text-sm text-ink-400">{t.loading}</p>}
      {error && (
        <p className="mt-4 text-sm font-semibold text-danger">{error.message}</p>
      )}

      {data && users.length === 0 && (
        <p className="mt-4 rounded-2xl bg-surface px-4 py-3 text-sm font-semibold text-ink-800">
          {t.detail.noUsers}
        </p>
      )}

      {users.length > 0 && (
        <ul className="mt-4 divide-y divide-ink-100">
          {users.map((user) => (
            <li key={user.id} className="py-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-40 flex-1">
                  <div className="font-semibold text-ink-900">{user.fullName}</div>
                  <div className="text-xs text-ink-400" dir="ltr">
                    {user.email}
                  </div>
                </div>
                <span className="rounded-full bg-ink-50 px-2.5 py-1 text-[11px] font-semibold text-ink-600">
                  {user.role === "SITE_OWNER"
                    ? t.detail.roleOwner
                    : t.detail.roleEditor}
                </span>
                {!user.enabled && (
                  <span className="rounded-full bg-tint px-2.5 py-1 text-[11px] font-semibold text-danger">
                    {t.detail.disabled}
                  </span>
                )}
                <span className="hidden text-xs text-ink-400 lg:inline">
                  {t.detail.lastLogin}:{" "}
                  {user.lastLoginAt
                    ? formatDate(user.lastLoginAt, locale)
                    : t.detail.never}
                </span>
                <div className="ms-auto flex items-center gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setResetting((current) =>
                        current === user.id ? null : user.id,
                      );
                      setResetPassword("");
                      setFormError(null);
                    }}
                    className="text-sm font-semibold text-ink-600 hover:text-bloom-600 disabled:opacity-50"
                  >
                    {t.detail.resetPassword}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => toggleEnabled(user)}
                    className="text-sm font-semibold text-ink-600 hover:text-bloom-600 disabled:opacity-50"
                  >
                    {user.enabled ? t.detail.disable : t.detail.enable}
                  </button>
                </div>
              </div>

              {resetting === user.id && (
                <div className="mt-3 flex flex-wrap items-end gap-3 rounded-2xl bg-surface p-3">
                  <div className="min-w-52 flex-1">
                    <label className="label" htmlFor={`reset-${user.id}`}>
                      {t.detail.newPassword}
                    </label>
                    <input
                      id={`reset-${user.id}`}
                      type="text"
                      dir="ltr"
                      autoComplete="off"
                      className="field"
                      value={resetPassword}
                      onChange={(event) => setResetPassword(event.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={busy || resetPassword.length < 8}
                    onClick={() => submitReset(user)}
                    className="btn-primary disabled:opacity-50"
                  >
                    {t.save}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetting(null)}
                    className="btn-secondary"
                  >
                    {t.cancel}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {notice && <p className="mt-3 text-sm font-semibold text-success">{notice}</p>}

      {open && (
        <form onSubmit={onCreate} className="mt-5 space-y-4 border-t border-ink-100 pt-5" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="user-name">
                {t.detail.userName}
              </label>
              <input
                id="user-name"
                className="field"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="user-email">
                {t.detail.userEmail}
              </label>
              <input
                id="user-email"
                type="email"
                dir="ltr"
                className="field"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="user-password">
                {t.detail.userPassword}
              </label>
              <input
                id="user-password"
                type="text"
                dir="ltr"
                className="field"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <p className="mt-1.5 text-xs text-ink-400">
                {t.detail.passwordTooShort}
              </p>
            </div>
            <div>
              <label className="label" htmlFor="user-role">
                {t.detail.userRole}
              </label>
              <select
                id="user-role"
                className="field"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="SITE_OWNER">{t.detail.roleOwner}</option>
                <option value="SITE_EDITOR">{t.detail.roleEditor}</option>
              </select>
            </div>
          </div>

          {formError && (
            <p role="alert" className="text-sm font-semibold text-danger">
              {formError}
            </p>
          )}

          <button type="submit" className="btn-primary disabled:opacity-50" disabled={busy}>
            {busy ? t.detail.creating : t.detail.createUser}
          </button>
        </form>
      )}
    </section>
  );
}
