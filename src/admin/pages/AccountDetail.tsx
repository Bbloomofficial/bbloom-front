import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import {
  confirmAccountEmail,
  fetchAccount,
  resendAccountConfirmation,
  updateFreeAllowance,
} from "../api/client";
import { formatDate } from "../format";
import { adminStrings } from "../strings";
import { adminPath } from "../../routes";
import { ApiError } from "../../api/http";
import { StatusBadge } from "../components/Badges";

export default function AccountDetail() {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { token } = useSession();
  const { accountId } = useParams<{ accountId: string }>();

  const { data: account, loading, error, reload, set } = useResource(
    () => fetchAccount(token, accountId!),
    [token, accountId],
  );

  const [confirming, setConfirming] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [allowance, setAllowance] = useState<number | null>(null);
  const [updatingAllowance, setUpdatingAllowance] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleConfirm = useCallback(async () => {
    if (confirming || !accountId) return;
    setConfirming(true);
    setActionError(null);
    try {
      const updated = await confirmAccountEmail(token, accountId);
      set(updated);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : t.accounts.failed);
    } finally {
      setConfirming(false);
    }
  }, [confirming, token, accountId, set, t]);

  const handleResend = useCallback(async () => {
    if (resending || !accountId) return;
    setResending(true);
    setResendNotice(null);
    setResendError(null);
    try {
      await resendAccountConfirmation(token, accountId);
      setResendNotice(t.accounts.resent);
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        const retryAfter =
          e.problem.resendAvailableAt ?? e.problem.retryAfter;
        const minutes =
          typeof retryAfter === "string"
            ? Math.ceil(
                Math.max(Date.parse(retryAfter) - Date.now(), 0) / 60_000,
              ) || 1
            : null;
        if (e.code === "DAILY_LIMIT") {
          setResendError(t.accounts.resendDailyLimit);
        } else if (minutes) {
          setResendError(t.accounts.resendTooSoon(minutes));
        } else {
          setResendError(t.accounts.resendTooSoon(1));
        }
      } else {
        setResendError(e instanceof Error ? e.message : t.accounts.failed);
      }
    } finally {
      setResending(false);
    }
  }, [resending, token, accountId, t]);

  const handleAllowance = useCallback(async () => {
    if (updatingAllowance || allowance === null || !accountId) return;
    setUpdatingAllowance(true);
    setActionError(null);
    try {
      const updated = await updateFreeAllowance(token, accountId, allowance);
      set(updated);
      setAllowance(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : t.accounts.failed);
    } finally {
      setUpdatingAllowance(false);
    }
  }, [updatingAllowance, allowance, token, accountId, set, t]);

  if (loading && !account) {
    return <p className="text-sm text-ink-400">{t.loading}</p>;
  }

  if (error && !account) {
    return (
      <div className="rounded-3xl border border-ink-100 bg-surface p-6 text-center">
        <p className="text-sm font-semibold text-danger">{error.message}</p>
        <button type="button" onClick={reload} className="btn-secondary mt-4">
          {t.retry}
        </button>
      </div>
    );
  }

  if (!account) return null;

  const currentAllowance = allowance ?? account.freeSiteAllowance;
  const allowanceDirty = allowance !== null && allowance !== account.freeSiteAllowance;

  return (
    <div>
      <Link
        to={adminPath("/accounts")}
        className="text-sm font-semibold text-bloom-600 hover:text-bloom-700"
      >
        ← {t.accounts.back}
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          {account.fullName}
        </h1>
        <p className="mt-1 text-sm text-ink-600" dir="ltr">
          {account.email}
        </p>
      </div>

      {actionError && (
        <p className="mt-4 text-sm font-semibold text-danger">{actionError}</p>
      )}

      <div className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              {t.accounts.created}
            </dt>
            <dd className="mt-1 text-sm text-ink-900">
              {formatDate(account.createdAt, locale)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              {t.accounts.lastLogin}
            </dt>
            <dd className="mt-1 text-sm text-ink-900">
              {account.lastLoginAt
                ? formatDate(account.lastLoginAt, locale)
                : t.accounts.never}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              {t.accounts.language}
            </dt>
            <dd className="mt-1 text-sm text-ink-900">
              {/* The API sends this uppercase ("KA") while the name table is
                  keyed lowercase, so a direct lookup silently misses and shows
                  staff a bare language code. Fall back to the raw value rather
                  than an em dash: an unknown code is still information, and
                  hiding it would make a wrong `language` look like an unset
                  one. */}
              {account.language
                ? (t.languageNames[account.language.toLowerCase()] ??
                  account.language)
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              {t.accounts.emailStatus}
            </dt>
            <dd className="mt-1 text-sm text-ink-900">
              {account.enabled ? t.accounts.enabled : t.accounts.disabled}
            </dd>
          </div>
        </dl>
      </div>

      {/* Email verification section */}
      <div className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6">
        <h2 className="text-lg font-bold text-ink-900">
          {t.accounts.emailStatus}
        </h2>
        <p className="mt-2 text-sm text-ink-600">
          {account.emailVerified ? (
            <span className="font-semibold text-success">
              {t.accounts.verified}
              {account.emailVerifiedAt &&
                ` — ${formatDate(account.emailVerifiedAt, locale)}`}
            </span>
          ) : (
            <span className="font-semibold text-warning">
              {t.accounts.unverified}
            </span>
          )}
        </p>

        {!account.emailVerified && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn-primary"
              disabled={confirming}
              onClick={handleConfirm}
            >
              {confirming ? t.accounts.confirming : t.accounts.confirmEmail}
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={resending}
              onClick={handleResend}
            >
              {resending
                ? t.accounts.resending
                : t.accounts.resendConfirmation}
            </button>
          </div>
        )}
        {resendNotice && (
          <p className="mt-3 text-sm font-semibold text-success">
            {resendNotice}
          </p>
        )}
        {resendError && (
          <p className="mt-3 text-sm font-semibold text-danger">
            {resendError}
          </p>
        )}
      </div>

      {/* Free allowance section */}
      <div className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6">
        <h2 className="text-lg font-bold text-ink-900">
          {t.accounts.freeAllowance}
        </h2>
        <p className="mt-1 text-sm text-ink-600">
          {t.accounts.freeAllowanceHint}
        </p>
        <p className="mt-2 text-sm text-ink-600">
          {t.accounts.freeAllowanceUsed(
            account.freeSitesUsed,
            account.freeSiteAllowance,
          )}
          {account.atFreeLimit && (
            <span className="ml-2 inline-flex items-center rounded-full border border-warning-border bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning">
              {t.accounts.atLimit}
            </span>
          )}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="number"
            min={0}
            max={10}
            className="field w-24"
            value={currentAllowance}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (Number.isFinite(v)) setAllowance(Math.max(0, Math.min(10, v)));
            }}
          />
          <button
            type="button"
            className="btn-primary"
            disabled={!allowanceDirty || updatingAllowance}
            onClick={handleAllowance}
          >
            {updatingAllowance
              ? t.accounts.updating
              : t.accounts.updateAllowance}
          </button>
        </div>
        <p className="mt-2 text-xs text-ink-400">
          {t.accounts.freeAllowanceNoEffect}
        </p>
      </div>

      {/* Sites section */}
      <div className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6">
        <h2 className="text-lg font-bold text-ink-900">
          {t.accounts.sitesTitle}
        </h2>
        {!account.sites?.length ? (
          <p className="mt-4 text-sm text-ink-600">{t.accounts.noSites}</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-ink-100">
            <table className="w-full text-start text-sm">
              <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                <tr>
                  <th className="px-4 py-2.5 text-start font-semibold">
                    {t.accounts.siteSlug}
                  </th>
                  <th className="px-4 py-2.5 text-start font-semibold">
                    {t.accounts.siteStatus}
                  </th>
                  <th className="hidden px-4 py-2.5 text-start font-semibold sm:table-cell">
                    {t.accounts.siteRole}
                  </th>
                  <th className="hidden px-4 py-2.5 text-start font-semibold md:table-cell">
                    {t.accounts.sitePlan}
                  </th>
                </tr>
              </thead>
              <tbody>
                {account.sites.map((site) => (
                  <tr
                    key={site.id}
                    className="border-b border-ink-100 last:border-0 hover:bg-ink-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={adminPath("/sites/" + site.id)}
                        className="font-semibold text-ink-900 hover:text-bloom-600"
                      >
                        {site.businessName}
                      </Link>
                      <div className="text-xs text-ink-400" dir="ltr">
                        {site.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={site.status}
                        label={t.statuses[site.status] ?? site.status}
                      />
                    </td>
                    <td className="hidden px-4 py-3 text-ink-600 sm:table-cell">
                      {site.role
                        ? (t.accounts.roles[site.role] ?? site.role)
                        : "—"}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="flex flex-wrap items-center gap-2">
                        {site.paid ? (
                          <span className="text-xs font-semibold text-success">
                            {t.accounts.paidPlan}
                          </span>
                        ) : (
                          <span className="text-xs text-ink-400">
                            {t.accounts.noPlan}
                          </span>
                        )}
                        {site.usingFreeSlot && (
                          <span className="inline-flex items-center rounded-full bg-tint px-2 py-0.5 text-xs font-semibold text-tint-fg">
                            {t.accounts.freeSlot}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
