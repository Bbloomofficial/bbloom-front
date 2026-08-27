import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import {
  createPromoCode,
  deletePromoCode,
  fetchPlans,
  fetchPromoCode,
  updatePromoCode,
} from "../api/client";
import type { AdminPromoCodeDto, PromoCodeUpsertRequest } from "../api/types";
import { adminStrings } from "../strings";
import { formatInstant, fromLocalInput, toLocalInput } from "../datetime";
import { adminPath } from "../../routes";

function emptyPromo(): PromoCodeUpsertRequest {
  return {
    code: "",
    percentOff: 10,
    active: true,
    planCodes: [],
  };
}

export default function PromoCodeEditor() {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { token } = useSession();
  const navigate = useNavigate();
  const { promoId } = useParams();

  const isNew = promoId === "new";
  const numericId = isNew ? null : Number(promoId);

  const { data, loading, error } = useResource(
    () =>
      numericId === null
        ? Promise.resolve(null)
        : fetchPromoCode(token, numericId),
    [token, numericId],
  );

  // The plans are needed to offer the restriction as tick boxes rather than as
  // a free-text list. A code restricted to a plan that does not exist is refused
  // by the API, and typing the codes by hand is the way to earn that.
  const { data: plans } = useResource(() => fetchPlans(token), [token]);

  const [form, setForm] = useState<PromoCodeUpsertRequest>(emptyPromo);
  // Kept as text so a half-deleted "1" is not read as 1% on the way to 15%.
  const [percentText, setPercentText] = useState("10");
  const [expiresText, setExpiresText] = useState("");
  const [maxText, setMaxText] = useState("");
  const [derived, setDerived] = useState<AdminPromoCodeDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 4000);
    return () => window.clearTimeout(timer);
  }, [saved]);

  useEffect(() => {
    if (!data) return;
    adopt(data);
  }, [data]);

  function adopt(promo: AdminPromoCodeDto) {
    setForm({
      code: promo.code,
      percentOff: promo.percentOff,
      active: promo.active,
      expiresAt: promo.expiresAt,
      maxRedemptions: promo.maxRedemptions,
      planCodes: promo.planCodes,
    });
    setPercentText(String(promo.percentOff));
    setExpiresText(toLocalInput(promo.expiresAt));
    setMaxText(
      promo.maxRedemptions === undefined ? "" : String(promo.maxRedemptions),
    );
    setDerived(promo);
  }

  function patch(changes: Partial<PromoCodeUpsertRequest>) {
    setSaved(false);
    setForm((current) => ({ ...current, ...changes }));
  }

  function togglePlan(code: string, restricted: boolean) {
    setSaved(false);
    setForm((current) => ({
      ...current,
      planCodes: restricted
        ? [...current.planCodes, code]
        : current.planCodes.filter((item) => item !== code),
    }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setProblem(null);
    setSaved(false);

    if (!form.code.trim()) {
      setProblem(t.promoCodes.codeRequired);
      return;
    }
    const percent = Number(percentText);
    if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
      setProblem(t.promoCodes.percentInvalid);
      return;
    }
    const max = maxText.trim() === "" ? undefined : Number(maxText);
    if (max !== undefined && (!Number.isInteger(max) || max < 1)) {
      setProblem(t.promoCodes.maxInvalid);
      return;
    }

    const body: PromoCodeUpsertRequest = {
      ...form,
      // Upper-cased here as well as by the API, so the form shows the same
      // thing the client will type rather than settling on save.
      code: form.code.trim().toUpperCase(),
      percentOff: percent,
      expiresAt: fromLocalInput(expiresText),
      maxRedemptions: max,
    };

    setSaving(true);
    try {
      const result =
        numericId === null
          ? await createPromoCode(token, body)
          : await updatePromoCode(token, numericId, body);
      navigate(adminPath(`/promo-codes/${result.id}`), { replace: true });
      adopt(result);
      setSaved(true);
    } catch (cause) {
      setProblem((cause as Error).message || t.promoCodes.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (numericId === null) return;
    if (!window.confirm(t.promoCodes.deleteConfirm)) return;
    setProblem(null);
    setDeleting(true);
    try {
      await deletePromoCode(token, numericId);
      navigate(adminPath("/promo-codes"), { replace: true });
    } catch (cause) {
      setProblem((cause as Error).message || t.promoCodes.deleteBlocked);
    } finally {
      setDeleting(false);
    }
  }

  if (!isNew && loading && !data) {
    return <p className="text-sm text-ink-400">{t.loading}</p>;
  }

  if (!isNew && error) {
    return <p className="text-sm font-semibold text-danger">{error.message}</p>;
  }

  return (
    <div>
      <Link
        to={adminPath("/promo-codes")}
        className="text-sm font-semibold text-ink-600 hover:text-bloom-600"
      >
        {t.promoCodes.back}
      </Link>

      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
        {isNew ? t.promoCodes.newTitle : t.promoCodes.editTitle}
      </h1>

      <form onSubmit={save} className="mt-6 space-y-6">
        <section className="rounded-3xl border border-ink-100 bg-surface p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="promo-code">
                {t.promoCodes.code}
              </label>
              <input
                id="promo-code"
                className="field"
                dir="ltr"
                value={form.code}
                onChange={(e) => patch({ code: e.target.value })}
              />
              <p className="mt-1 text-xs text-ink-400">
                {t.promoCodes.codeHint}
              </p>
            </div>

            <div>
              <label className="label" htmlFor="promo-percent">
                {t.promoCodes.percentOff}
              </label>
              <input
                id="promo-percent"
                className="field"
                inputMode="numeric"
                dir="ltr"
                value={percentText}
                onChange={(e) => {
                  setSaved(false);
                  setPercentText(e.target.value);
                }}
              />
              <p className="mt-1 text-xs text-ink-400">
                {t.promoCodes.percentHint}
              </p>
            </div>

            <div>
              <label className="label" htmlFor="promo-expires">
                {t.promoCodes.expiresAt}
              </label>
              <input
                id="promo-expires"
                className="field"
                type="datetime-local"
                value={expiresText}
                onChange={(e) => {
                  setSaved(false);
                  setExpiresText(e.target.value);
                }}
              />
              <p className="mt-1 text-xs text-ink-400">
                {t.promoCodes.expiresHint}
              </p>
            </div>

            <div>
              <label className="label" htmlFor="promo-max">
                {t.promoCodes.maxRedemptions}
              </label>
              <input
                id="promo-max"
                className="field"
                inputMode="numeric"
                dir="ltr"
                value={maxText}
                onChange={(e) => {
                  setSaved(false);
                  setMaxText(e.target.value);
                }}
              />
              <p className="mt-1 text-xs text-ink-400">
                {t.promoCodes.maxHint}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-ink-100 pt-5">
            <div className="flex items-start gap-3">
              <input
                id="promo-active"
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={form.active}
                onChange={(e) => patch({ active: e.target.checked })}
              />
              <div>
                <label
                  htmlFor="promo-active"
                  className="text-sm font-semibold text-ink-900"
                >
                  {t.promoCodes.active}
                </label>
                <p className="text-xs text-ink-400">
                  {t.promoCodes.activeHint}
                </p>
              </div>
            </div>
          </div>

          {derived && (
            <dl className="mt-6 grid gap-4 border-t border-ink-100 pt-5 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-400">
                  {t.promoCodes.used}
                </dt>
                {/* Counted from payments rather than stored, so an outstanding
                    checkout holds a use and abandoning it gives one back. This
                    figure moves without anybody editing the code. */}
                <dd className="mt-1 font-semibold text-ink-900" dir="ltr">
                  {derived.maxRedemptions === undefined
                    ? derived.redemptions
                    : `${derived.redemptions} / ${derived.maxRedemptions}`}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-400">
                  {t.promoCodes.status}
                </dt>
                <dd
                  className={`mt-1 font-semibold ${
                    derived.usable ? "text-success" : "text-ink-400"
                  }`}
                >
                  {derived.usable
                    ? t.promoCodes.usable
                    : t.promoCodes.notUsable}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-400">
                  {t.promoCodes.created}
                </dt>
                <dd className="mt-1 text-ink-600">
                  {formatInstant(derived.createdAt, locale)}
                </dd>
              </div>
            </dl>
          )}
        </section>

        <section className="rounded-3xl border border-ink-100 bg-surface p-6">
          <h2 className="text-lg font-bold text-ink-900">
            {t.promoCodes.appliesTo}
          </h2>
          <p className="mt-1 text-sm text-ink-600">
            {t.promoCodes.appliesToHint}
          </p>

          {form.planCodes.length === 0 && (
            <p className="mt-4 rounded-2xl bg-tint px-4 py-3 text-sm font-semibold text-tint-fg">
              {t.promoCodes.allPlansNotice}
            </p>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(plans ?? []).map((plan) => {
              const copy =
                plan.translations.find((item) => item.language === locale) ??
                plan.translations[0];
              const restricted = form.planCodes.includes(plan.code);
              return (
                <label
                  key={plan.id}
                  className="flex items-start gap-3 rounded-2xl border border-ink-100 px-4 py-3"
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={restricted}
                    onChange={(e) => togglePlan(plan.code, e.target.checked)}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink-900">
                      {copy?.name || plan.code}
                    </span>
                    <span className="block text-xs text-ink-400" dir="ltr">
                      {plan.code}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        {problem && (
          <p className="text-sm font-semibold text-danger">{problem}</p>
        )}

        {saved && !problem && (
          <p className="rounded-2xl border border-success-border bg-success-soft px-4 py-3 text-sm font-semibold text-success">
            {t.saved}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? t.saving : t.save}
          </button>
          <Link to={adminPath("/promo-codes")} className="btn-secondary">
            {t.cancel}
          </Link>
          {!isNew && (
            <button
              type="button"
              onClick={remove}
              disabled={deleting}
              className="ms-auto text-sm font-semibold text-danger hover:underline"
            >
              {deleting ? t.promoCodes.deleting : t.promoCodes.delete}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
