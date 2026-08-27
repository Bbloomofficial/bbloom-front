import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import {
  createPlan,
  deletePlan,
  fetchPlan,
  updatePlan,
} from "../api/client";
import type { AdminPlanDto, PlanUpsertRequest } from "../api/types";
import { adminStrings } from "../strings";
import {
  fromEndOfDay,
  fromStartOfDay,
  toDateInput,
  toEndDateInput,
} from "../datetime";
import { formatMinor } from "../../api/plans";
import { adminPath } from "../../routes";

/** The languages a plan is published in, in the order they are edited. */
const LANGUAGES = ["ka", "en"] as const;

const PERIODS = ["MONTHLY", "YEARLY"] as const;

const CURRENCIES = ["USD", "GEL", "EUR"] as const;

/**
 * A blank plan. `active` and `purchasable` start on because the common reason
 * to open this screen is to sell something; a "contact us" tier is the
 * exception and is switched off deliberately.
 */
function emptyPlan(): PlanUpsertRequest {
  return {
    code: "",
    featured: false,
    sortOrder: 0,
    active: true,
    priceMinor: 0,
    currency: "USD",
    billingPeriod: "MONTHLY",
    purchasable: true,
    translations: LANGUAGES.map((language) => ({
      language,
      name: "",
      price: "",
      cadence: "",
      summary: "",
      cta: "",
      features: [],
    })),
  };
}

/**
 * Fills in any language the API did not return, so the form always has a tab
 * per language. Sending them back empty is fine — the backend stores what it is
 * given, and a half-translated plan is better represented as blank fields than
 * as a missing tab staff cannot find.
 */
function toForm(plan: AdminPlanDto): PlanUpsertRequest {
  const blank = emptyPlan();
  const {
    // Answers rather than settings, and dropped so a form that has been open a
    // while cannot post yesterday's arithmetic back as a price.
    discountLive: _live,
    effectivePriceMinor: _effective,
    ...editable
  } = plan;
  return {
    ...blank,
    ...editable,
    translations: LANGUAGES.map(
      (language) =>
        plan.translations.find((item) => item.language === language) ?? {
          language,
          name: "",
          price: "",
          cadence: "",
          summary: "",
          cta: "",
          features: [],
        },
    ),
  };
}

/**
 * The discount as the client will see it applied, worked out the same way the
 * API does: round the discount half-up, then subtract it.
 *
 * Reproduced here only to preview an unsaved percentage — the moment a plan is
 * saved, `effectivePriceMinor` off the response is the figure shown, because a
 * price the screen calculates and a price the server charges must never be two
 * different opinions.
 */
function previewOff(minor: number, percent: number): number {
  return Math.floor((minor * percent + 50) / 100);
}

/** Minor units in, whole currency out — "19900" becomes "199". */
function majorFromMinor(minor: number): string {
  const amount = minor / 100;
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

export default function PlanEditor() {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { token } = useSession();
  const navigate = useNavigate();
  const { planId } = useParams();

  const isNew = planId === "new";
  const numericId = isNew ? null : Number(planId);

  const { data, loading, error } = useResource(
    () => (numericId === null ? Promise.resolve(null) : fetchPlan(token, numericId)),
    [token, numericId],
  );

  const [form, setForm] = useState<PlanUpsertRequest>(emptyPlan);
  // Kept as text so a half-typed "1" is not rounded into the model on every
  // keystroke, and so clearing the field does not read as a free plan.
  const [priceText, setPriceText] = useState("0");
  /**
   * The sale, held as the strings its inputs read and write: a percentage
   * mid-typing, and two local wall-clock times. Empty is meaningful for all
   * three — no percentage is "not on sale", and a missing bound is "already on"
   * or "until someone stops it" — so they are cleared rather than defaulted.
   */
  const [discountText, setDiscountText] = useState("");
  const [startsAtText, setStartsAtText] = useState("");
  const [endsAtText, setEndsAtText] = useState("");
  const [language, setLanguage] = useState<string>(LANGUAGES[0]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  // The confirmation clears itself, so it cannot still be claiming success over
  // a form that has been edited since.
  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 4000);
    return () => window.clearTimeout(timer);
  }, [saved]);

  useEffect(() => {
    if (!data) return;
    setForm(toForm(data));
    setPriceText(majorFromMinor(data.priceMinor));
    setDiscountText(
      data.discountPercent === undefined ? "" : String(data.discountPercent),
    );
    setStartsAtText(toDateInput(data.discountStartsAt));
    setEndsAtText(toEndDateInput(data.discountEndsAt));
  }, [data]);

  const translation = useMemo(
    () =>
      form.translations.find((item) => item.language === language) ??
      form.translations[0],
    [form.translations, language],
  );

  /**
   * What the sale currently in the form comes to.
   *
   * `null` when there is nothing to preview. Live is judged here rather than
   * read off `discountLive`, because the point of this box is to show the
   * effect of a percentage typed a second ago that the server has not seen.
   */
  const preview = useMemo(() => {
    const percent = Number(discountText);
    if (
      !discountText.trim() ||
      !Number.isFinite(percent) ||
      percent <= 0 ||
      percent > 100
    ) {
      return null;
    }
    const major = Number(priceText);
    if (!Number.isFinite(major) || major < 0) return null;

    const minor = Math.round(major * 100);
    const now = Date.now();
    const startsAt = fromStartOfDay(startsAtText);
    const endsAt = fromEndOfDay(endsAtText);
    return {
      was: formatMinor(minor, form.currency, locale),
      now: formatMinor(
        minor - previewOff(minor, percent),
        form.currency,
        locale,
      ),
      live:
        (!startsAt || Date.parse(startsAt) <= now) &&
        (!endsAt || Date.parse(endsAt) > now),
    };
  }, [
    discountText,
    priceText,
    startsAtText,
    endsAtText,
    form.currency,
    locale,
  ]);

  function patch(changes: Partial<PlanUpsertRequest>) {
    setSaved(false);
    setForm((current) => ({ ...current, ...changes }));
  }

  function patchTranslation(
    changes: Partial<PlanUpsertRequest["translations"][number]>,
  ) {
    setSaved(false);
    setForm((current) => ({
      ...current,
      translations: current.translations.map((item) =>
        item.language === language ? { ...item, ...changes } : item,
      ),
    }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setProblem(null);
    setSaved(false);

    if (!form.code.trim()) {
      setProblem(t.plans.codeRequired);
      return;
    }
    const major = Number(priceText);
    if (!Number.isFinite(major) || major < 0) {
      setProblem(t.plans.priceInvalid);
      return;
    }
    if (form.translations.some((item) => !item.name.trim())) {
      setProblem(t.plans.nameRequired);
      return;
    }

    const percent = discountText.trim() === "" ? null : Number(discountText);
    if (
      percent !== null &&
      (!Number.isInteger(percent) || percent < 1 || percent > 100)
    ) {
      setProblem(t.plans.discountInvalid);
      return;
    }
    // Caught here as well as by the API, because the API's refusal names a
    // field this form would otherwise have to translate back into "you can't
    // discount a tier that isn't for sale".
    if (percent !== null && !form.purchasable) {
      setProblem(t.plans.discountNotPurchasable);
      return;
    }
    if (percent === null && (startsAtText || endsAtText)) {
      setProblem(t.plans.discountWindowWithoutPercent);
      return;
    }
    const startsAt = fromStartOfDay(startsAtText);
    const endsAt = fromEndOfDay(endsAtText);
    if (startsAt && endsAt && Date.parse(endsAt) <= Date.parse(startsAt)) {
      setProblem(t.plans.discountWindowBackwards);
      return;
    }

    // Rounded rather than truncated: 199.999 typed by hand should not quietly
    // become 199.99 in the ledger.
    //
    // Features are tidied here rather than while typing: a blank line renders
    // as a tick beside nothing, but removing it mid-keystroke fights the caret.
    //
    // Clearing the percentage clears its window with it, so a plan taken off
    // sale does not keep last quarter's dates waiting to be noticed.
    const body: PlanUpsertRequest = {
      ...form,
      code: form.code.trim(),
      priceMinor: Math.round(major * 100),
      discountPercent: percent ?? undefined,
      discountStartsAt: percent === null ? undefined : startsAt,
      discountEndsAt: percent === null ? undefined : endsAt,
      translations: form.translations.map((item) => ({
        ...item,
        features: item.features.map((line) => line.trim()).filter(Boolean),
      })),
    };

    setSaving(true);
    try {
      const result =
        numericId === null
          ? await createPlan(token, body)
          : await updatePlan(token, numericId, body);
      navigate(adminPath(`/plans/${result.id}`), { replace: true });
      setForm(toForm(result));
      setPriceText(majorFromMinor(result.priceMinor));
      setDiscountText(
        result.discountPercent === undefined
          ? ""
          : String(result.discountPercent),
      );
      setStartsAtText(toDateInput(result.discountStartsAt));
      setEndsAtText(toEndDateInput(result.discountEndsAt));
      setSaved(true);
    } catch (cause) {
      setProblem((cause as Error).message || t.plans.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (numericId === null) return;
    if (!window.confirm(t.plans.deleteConfirm)) return;
    setProblem(null);
    setDeleting(true);
    try {
      await deletePlan(token, numericId);
      navigate(adminPath("/plans"), { replace: true });
    } catch (cause) {
      setProblem((cause as Error).message || t.plans.deleteBlocked);
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
        to={adminPath("/plans")}
        className="text-sm font-semibold text-ink-600 hover:text-bloom-600"
      >
        {t.plans.back}
      </Link>

      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
        {isNew ? t.plans.newTitle : t.plans.editTitle}
      </h1>

      <form onSubmit={save} className="mt-6 space-y-6">
        <section className="rounded-3xl border border-ink-100 bg-surface p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="plan-code">
                {t.plans.code}
              </label>
              <input
                id="plan-code"
                className="field"
                value={form.code}
                onChange={(e) => patch({ code: e.target.value })}
              />
              <p className="mt-1 text-xs text-ink-400">{t.plans.codeHint}</p>
            </div>

            <div>
              <label className="label" htmlFor="plan-price">
                {t.plans.price}
              </label>
              <input
                id="plan-price"
                className="field"
                inputMode="decimal"
                dir="ltr"
                value={priceText}
                onChange={(e) => setPriceText(e.target.value)}
              />
              <p className="mt-1 text-xs text-ink-400">{t.plans.priceHint}</p>
            </div>

            <div>
              <label className="label" htmlFor="plan-currency">
                {t.plans.currency}
              </label>
              <select
                id="plan-currency"
                className="field"
                value={form.currency}
                onChange={(e) => patch({ currency: e.target.value })}
              >
                {CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="plan-period">
                {t.plans.billingPeriod}
              </label>
              <select
                id="plan-period"
                className="field"
                value={form.billingPeriod}
                onChange={(e) => patch({ billingPeriod: e.target.value })}
              >
                {PERIODS.map((period) => (
                  <option key={period} value={period}>
                    {t.plans.periods[period] ?? period}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="plan-order">
                {t.plans.sortOrder}
              </label>
              <input
                id="plan-order"
                className="field"
                type="number"
                value={form.sortOrder}
                onChange={(e) => patch({ sortOrder: Number(e.target.value) || 0 })}
              />
              <p className="mt-1 text-xs text-ink-400">{t.plans.sortOrderHint}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 border-t border-ink-100 pt-5">
            <Toggle
              id="plan-active"
              label={t.plans.active}
              hint={t.plans.activeHint}
              checked={form.active}
              onChange={(active) => patch({ active })}
            />
            <Toggle
              id="plan-purchasable"
              label={t.plans.purchasable}
              hint={t.plans.purchasableHint}
              checked={form.purchasable}
              onChange={(purchasable) => patch({ purchasable })}
            />
            <Toggle
              id="plan-featured"
              label={t.plans.featured}
              hint={t.plans.featuredHint}
              checked={form.featured}
              onChange={(featured) => patch({ featured })}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-ink-100 bg-surface p-6">
          <h2 className="text-lg font-bold text-ink-900">{t.plans.discount}</h2>
          <p className="mt-1 text-sm text-ink-600">{t.plans.discountHint}</p>

          {!form.purchasable ? (
            /* A negotiated tier has no listed price to take a percentage off,
               and the API refuses one rather than saving a setting that would
               show up nowhere. Saying so is kinder than a disabled field with
               no explanation. */
            <p className="mt-4 rounded-2xl bg-tint px-4 py-3 text-sm text-ink-600">
              {t.plans.discountNotPurchasable}
            </p>
          ) : (
            <>
              <div className="mt-4 grid gap-5 sm:grid-cols-3">
                <div>
                  <label className="label" htmlFor="plan-discount">
                    {t.plans.discountPercent}
                  </label>
                  <input
                    id="plan-discount"
                    className="field"
                    inputMode="numeric"
                    dir="ltr"
                    placeholder="0"
                    value={discountText}
                    onChange={(e) => {
                      setSaved(false);
                      setDiscountText(e.target.value);
                    }}
                  />
                  <p className="mt-1 text-xs text-ink-400">
                    {t.plans.discountPercentHint}
                  </p>
                </div>

                <div>
                  <label className="label" htmlFor="plan-discount-start">
                    {t.plans.discountStarts}
                  </label>
                  <input
                    id="plan-discount-start"
                    className="field"
                    type="date"
                    value={startsAtText}
                    onChange={(e) => {
                      setSaved(false);
                      setStartsAtText(e.target.value);
                    }}
                  />
                  <p className="mt-1 text-xs text-ink-400">
                    {t.plans.discountStartsHint}
                  </p>
                </div>

                <div>
                  <label className="label" htmlFor="plan-discount-end">
                    {t.plans.discountEnds}
                  </label>
                  <input
                    id="plan-discount-end"
                    className="field"
                    type="date"
                    value={endsAtText}
                    onChange={(e) => {
                      setSaved(false);
                      setEndsAtText(e.target.value);
                    }}
                  />
                  <p className="mt-1 text-xs text-ink-400">
                    {t.plans.discountEndsHint}
                  </p>
                </div>
              </div>

              {preview && (
                <div className="mt-5 rounded-2xl border border-ink-100 bg-sunken px-4 py-3">
                  <p className="text-sm text-ink-600">
                    {t.plans.discountPreview}{" "}
                    <span className="text-ink-400 line-through" dir="ltr">
                      {preview.was}
                    </span>{" "}
                    <span className="font-bold text-ink-900" dir="ltr">
                      {preview.now}
                    </span>
                  </p>
                  {/* Scheduled but not started, or already finished — the price
                      above is what it *would* be, and saying so stops it being
                      read as what the pricing page is showing right now. */}
                  {!preview.live && (
                    <p className="mt-1 text-xs font-semibold text-ink-600">
                      {t.plans.discountNotLive}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </section>
        <section className="rounded-3xl border border-ink-100 bg-surface p-6">
          <h2 className="text-lg font-bold text-ink-900">{t.plans.translations}</h2>
          <p className="mt-1 text-sm text-ink-600">{t.plans.translationsHint}</p>

          <div className="mt-4 flex gap-2">
            {LANGUAGES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={
                  code === language
                    ? "rounded-full bg-bloom-600 px-4 py-1.5 text-sm font-semibold text-white"
                    : "rounded-full border border-ink-100 px-4 py-1.5 text-sm font-semibold text-ink-600 hover:text-bloom-600"
                }
              >
                {t.plans.languageNames[code] ?? code}
              </button>
            ))}
          </div>

          {translation && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="plan-name">
                  {t.plans.name}
                </label>
                <input
                  id="plan-name"
                  className="field"
                  value={translation.name}
                  onChange={(e) => patchTranslation({ name: e.target.value })}
                />
              </div>

              <div>
                <label className="label" htmlFor="plan-cta">
                  {t.plans.cta}
                </label>
                <input
                  id="plan-cta"
                  className="field"
                  value={translation.cta}
                  onChange={(e) => patchTranslation({ cta: e.target.value })}
                />
              </div>

              <div>
                <label className="label" htmlFor="plan-display-price">
                  {t.plans.displayPrice}
                </label>
                <input
                  id="plan-display-price"
                  className="field"
                  value={translation.price}
                  onChange={(e) => patchTranslation({ price: e.target.value })}
                />
                <p className="mt-1 text-xs text-ink-400">
                  {t.plans.displayPriceHint}
                </p>
              </div>

              <div>
                <label className="label" htmlFor="plan-cadence">
                  {t.plans.cadence}
                </label>
                <input
                  id="plan-cadence"
                  className="field"
                  value={translation.cadence}
                  onChange={(e) => patchTranslation({ cadence: e.target.value })}
                />
                <p className="mt-1 text-xs text-ink-400">{t.plans.cadenceHint}</p>
              </div>

              <div className="sm:col-span-2">
                <label className="label" htmlFor="plan-summary">
                  {t.plans.summary}
                </label>
                <textarea
                  id="plan-summary"
                  className="field"
                  rows={2}
                  value={translation.summary}
                  onChange={(e) => patchTranslation({ summary: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label" htmlFor="plan-features">
                  {t.plans.features}
                </label>
                <textarea
                  id="plan-features"
                  className="field"
                  rows={6}
                  value={translation.features.join("\n")}
                  onChange={(e) =>
                    patchTranslation({
                      // Split only. Trimming or dropping blank lines here would
                      // edit the text from under the caret — a typed space at
                      // the end of a line vanishes and the cursor jumps to the
                      // end of the box. Normalising happens on save instead.
                      features: e.target.value.split("\n"),
                    })
                  }
                />
                <p className="mt-1 text-xs text-ink-400">{t.plans.featuresHint}</p>
              </div>
            </div>
          )}
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
          <Link to={adminPath("/plans")} className="btn-secondary">
            {t.cancel}
          </Link>
          {!isNew && (
            <button
              type="button"
              onClick={remove}
              disabled={deleting}
              className="ms-auto text-sm font-semibold text-danger hover:underline"
            >
              {deleting ? t.plans.deleting : t.plans.delete}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Toggle({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        className="mt-1 h-4 w-4"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-ink-900">
          {label}
        </label>
        <p className="text-xs text-ink-400">{hint}</p>
      </div>
    </div>
  );
}
