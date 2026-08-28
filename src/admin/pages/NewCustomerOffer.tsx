import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import {
  fetchNewCustomerOffer,
  updateNewCustomerOffer,
} from "../api/client";
import type { AdminNewCustomerOfferDto } from "../api/types";
import { adminStrings } from "../strings";
import { formatInstant } from "../datetime";

/**
 * The new-customer offer: a percentage off a client's first billing period.
 *
 * A single record rather than a list, so there is no index screen in front of
 * this one and nothing to create or delete — the offer always exists and is
 * simply on or off. That is also why the form loads straight into the editor:
 * a list of one row would be a click in front of the only thing there is.
 */
export default function NewCustomerOffer() {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { token } = useSession();

  const { data, loading, error, reload } = useResource(
    () => fetchNewCustomerOffer(token),
    [token],
  );

  const [active, setActive] = useState(false);
  // Text, not a number: a half-deleted "5" on the way to "50" would otherwise
  // be read as 5% and saved that way by a quick hand on the save button.
  const [percentText, setPercentText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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

  function adopt(offer: AdminNewCustomerOfferDto) {
    setActive(offer.active);
    setPercentText(String(offer.percentOff));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setProblem(null);
    setSaved(false);

    // Checked even while the offer is being switched off, because the API takes
    // both fields on every write: a percentage that is rejected there would
    // lose the switch along with it.
    const percent = Number(percentText);
    if (!Number.isInteger(percent) || percent < 1 || percent > 99) {
      setProblem(t.newCustomerOffer.percentInvalid);
      return;
    }

    setSaving(true);
    try {
      adopt(await updateNewCustomerOffer(token, { percentOff: percent, active }));
      setSaved(true);
    } catch (cause) {
      setProblem((cause as Error).message || t.newCustomerOffer.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) {
    return <p className="text-sm text-ink-400">{t.loading}</p>;
  }

  if (error && !data) {
    return (
      <div className="rounded-3xl border border-ink-100 bg-surface p-6 text-center">
        <p className="text-sm font-semibold text-danger">
          {error.message || t.newCustomerOffer.loadFailed}
        </p>
        <button type="button" onClick={reload} className="btn-secondary mt-4">
          {t.retry}
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
        {t.newCustomerOffer.title}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-600">
        {t.newCustomerOffer.subtitle}
      </p>

      <form onSubmit={save} className="mt-6 max-w-2xl space-y-6">
        <section className="rounded-3xl border border-ink-100 bg-surface p-6">
          <div className="max-w-xs">
            <label className="label" htmlFor="offer-percent">
              {t.newCustomerOffer.percentOff}
            </label>
            <input
              id="offer-percent"
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
              {t.newCustomerOffer.percentHint}
            </p>
          </div>

          <div className="mt-6 border-t border-ink-100 pt-5">
            <div className="flex items-start gap-3">
              <input
                id="offer-active"
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={active}
                onChange={(e) => {
                  setSaved(false);
                  setActive(e.target.checked);
                }}
              />
              <div>
                <label
                  htmlFor="offer-active"
                  className="text-sm font-semibold text-ink-900"
                >
                  {t.newCustomerOffer.active}
                </label>
                <p className="text-xs text-ink-400">
                  {t.newCustomerOffer.activeHint}
                </p>
              </div>
            </div>
          </div>

          {data && (
            <dl className="mt-6 grid gap-4 border-t border-ink-100 pt-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-400">
                  {t.newCustomerOffer.status}
                </dt>
                {/* The saved state, not the state of the tick box above it: a
                    switch that reads "Running" before anybody has saved would
                    be reporting an intention as a fact. */}
                <dd
                  className={`mt-1 font-semibold ${
                    data.active ? "text-success" : "text-ink-400"
                  }`}
                >
                  {data.active
                    ? t.newCustomerOffer.running
                    : t.newCustomerOffer.notRunning}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-400">
                  {t.newCustomerOffer.updated}
                </dt>
                <dd className="mt-1 text-ink-600">
                  {data.updatedAt
                    ? formatInstant(data.updatedAt, locale)
                    : t.newCustomerOffer.neverUpdated}
                </dd>
              </div>
            </dl>
          )}
        </section>

        <p className="rounded-2xl bg-tint px-4 py-3 text-sm text-tint-fg">
          {t.newCustomerOffer.rules}
        </p>

        {problem && (
          <p className="text-sm font-semibold text-danger">{problem}</p>
        )}

        {saved && !problem && (
          <p className="rounded-2xl border border-success-border bg-success-soft px-4 py-3 text-sm font-semibold text-success">
            {t.saved}
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? t.saving : t.save}
        </button>
      </form>
    </div>
  );
}
