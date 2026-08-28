import { useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "../../api/http";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import {
  connectPaymentAccount,
  disablePaymentAccount,
  fetchPaymentAccount,
} from "../api/client";
import type { SiteDetail } from "../api/types";
import { formatDate } from "../format";
import { useResource } from "../hooks";
import { adminStrings } from "../strings";

/**
 * Attaching a client's own bank merchant account to their website.
 *
 * Staff-only, and there is no client-facing twin on purpose: the credentials
 * come out of a contract between the business and its bank, and somebody here
 * transcribes them once. The copy leans hard on whose money this is, because
 * the one dangerous misreading of this panel is "bbloom takes the payment" —
 * we do not, we cannot refund it, and a staff member who believes otherwise
 * will say so to a client on the phone.
 *
 * Nothing here ever shows a stored secret. The API does not return one, so the
 * form is write-only: an existing account can be replaced, never edited field
 * by field, and the panel says so rather than leaving somebody hunting for a
 * pre-filled box that is empty for a reason.
 */

/**
 * The settings each bank wants beyond an id and a secret.
 *
 * Written out per provider rather than offered as a free key/value editor: the
 * keys are the ones the gateway actually reads, and a typo in a raw editor
 * produces an account that stores fine and fails at the first payment. A third
 * bank is a third entry here plus its two labels.
 */
const extraFields: Record<
  string,
  { key: string; label: "baseUrl" | "tokenUrl" | "callbackPublicKey" }[]
> = {
  TBC: [{ key: "baseUrl", label: "baseUrl" }],
  BOG: [
    { key: "baseUrl", label: "baseUrl" },
    { key: "tokenUrl", label: "tokenUrl" },
    { key: "callbackPublicKey", label: "callbackPublicKey" },
  ],
};

export default function PaymentAccountPanel({ site }: { site: SiteDetail }) {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { token } = useSession();

  const view = useResource(
    () => fetchPaymentAccount(token, site.id),
    [token, site.id],
  );

  const [provider, setProvider] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [merchantRef, setMerchantRef] = useState("");
  const [currency, setCurrency] = useState(site.currency ?? "GEL");
  const [returnUrl, setReturnUrl] = useState("");
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const account = view.data?.account ?? null;
  const providers = view.data?.availableProviders ?? [];
  // Falls back to the first gateway the server admits to rather than a
  // hard-coded "TBC": which banks exist is the backend's answer, and a picker
  // defaulting to one this build knows about but the server does not would be
  // an account that cannot be saved.
  const chosen = provider || account?.provider || providers[0] || "";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!clientId.trim() || !clientSecret.trim()) {
      setError(t.payments.required);
      return;
    }
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await connectPaymentAccount(token, site.id, {
        provider: chosen,
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
        merchantRef: merchantRef.trim() || undefined,
        currency: currency.trim() || undefined,
        returnUrl: returnUrl.trim() || undefined,
        extra: Object.fromEntries(
          Object.entries(extra).filter(([, value]) => value.trim()),
        ),
      });
      // Cleared the moment it is accepted. The secret has no further use on
      // this side and leaving it in a React state that survives a route change
      // is a bank credential sitting in memory for no reason.
      setClientId("");
      setClientSecret("");
      setExtra({});
      setSaved(true);
      view.reload();
    } catch (caught) {
      setError(describe(caught));
    } finally {
      setBusy(false);
    }
  }

  async function onDisable() {
    if (busy || !window.confirm(t.payments.disableConfirm)) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      view.set(await disablePaymentAccount(token, site.id));
    } catch (caught) {
      setError(describe(caught));
    } finally {
      setBusy(false);
    }
  }

  /**
   * Matched on the problem `code`, never on the sentence. None of these are a
   * mistake by whoever is typing — two are server misconfiguration and one is a
   * field left blank — and all three are worth naming precisely, because "we
   * could not save it" would send a staff member back to re-check credentials
   * that were fine.
   */
  function describe(caught: unknown): string {
    if (caught instanceof ApiError) {
      if (caught.code === "PAYMENTS_NOT_CONFIGURED")
        return t.payments.notConfigured;
      if (caught.code === "UNKNOWN_PAYMENT_GATEWAY")
        return t.payments.unknownProvider;
      // The same rule the form checks before posting. Both exist on purpose:
      // this one is the authority, the local one only saves a round trip.
      if (caught.code === "PAYMENT_CREDENTIALS_REQUIRED")
        return t.payments.required;
      return caught.message || t.payments.failed;
    }
    return t.payments.failed;
  }

  return (
    <section className="card hover:border-ink-100 hover:shadow-none">
      <h2 className="text-lg font-bold text-ink-900">{t.payments.title}</h2>
      <p className="mt-1 text-sm text-ink-400">{t.payments.hint}</p>

      <div className="mt-4 rounded-2xl border border-ink-100 bg-sunken p-4">
        <p className="text-sm font-semibold text-ink-900">
          {t.payments.ownership}
        </p>
        <p className="mt-2 text-sm text-ink-600">{t.payments.consequence}</p>
      </div>

      {view.loading && !view.data ? (
        <p className="mt-4 text-sm text-ink-400">{t.loading}</p>
      ) : account ? (
        <div className="mt-5 space-y-3">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [t.payments.provider, account.provider],
              [
                t.payments.status,
                t.payments.statuses[account.status] ?? account.status,
              ],
              [t.payments.merchantRef, account.merchantRef || "—"],
              [t.payments.currency, account.currency || "—"],
              [t.payments.returnUrl, account.returnUrl || "—"],
              [t.payments.connectedAt, formatDate(account.connectedAt, locale)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs uppercase tracking-wide text-ink-400">
                  {label}
                </dt>
                <dd className="mt-1 break-words text-sm font-semibold text-ink-900">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-ink-400">{t.payments.secretWriteOnly}</p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onDisable}
              disabled={busy}
              className="text-sm font-semibold text-danger hover:underline disabled:opacity-50"
            >
              {busy ? t.payments.disabling : t.payments.disable}
            </button>
            <span className="text-xs text-ink-400">
              {t.payments.disableHint}
            </span>
          </div>
        </div>
      ) : (
        <p className="mt-5 text-sm text-ink-600">{t.payments.notConnected}</p>
      )}

      {providers.length === 0 && view.data ? (
        <p className="mt-5 text-sm text-ink-600">{t.payments.noProviders}</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="payment-provider">
                {t.payments.provider}
              </label>
              <select
                id="payment-provider"
                className="field"
                value={chosen}
                onChange={(event) => {
                  setProvider(event.target.value);
                  // The extra keys are per-bank, so carrying BOG's signing key
                  // over to TBC would store a value TBC never reads and nobody
                  // would ever see it again to remove.
                  setExtra({});
                }}
              >
                {providers.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-ink-400">
                {t.payments.providerHint}
              </p>
            </div>
            <div>
              <label className="label" htmlFor="payment-merchant-ref">
                {t.payments.merchantRef}
              </label>
              <input
                id="payment-merchant-ref"
                className="field"
                dir="ltr"
                maxLength={120}
                value={merchantRef}
                onChange={(event) => setMerchantRef(event.target.value)}
              />
              <p className="mt-1 text-xs text-ink-400">
                {t.payments.merchantRefHint}
              </p>
            </div>
            <div>
              <label className="label" htmlFor="payment-client-id">
                {t.payments.clientId}
              </label>
              <input
                id="payment-client-id"
                className="field"
                dir="ltr"
                autoComplete="off"
                maxLength={190}
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="payment-client-secret">
                {t.payments.clientSecret}
              </label>
              <input
                id="payment-client-secret"
                className="field"
                dir="ltr"
                type="password"
                autoComplete="new-password"
                maxLength={400}
                value={clientSecret}
                onChange={(event) => setClientSecret(event.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="payment-currency">
                {t.payments.currency}
              </label>
              <input
                id="payment-currency"
                className="field"
                dir="ltr"
                maxLength={3}
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value.toUpperCase())
                }
              />
            </div>
            <div>
              <label className="label" htmlFor="payment-return-url">
                {t.payments.returnUrl}
              </label>
              <input
                id="payment-return-url"
                className="field"
                dir="ltr"
                maxLength={300}
                value={returnUrl}
                onChange={(event) => setReturnUrl(event.target.value)}
              />
              <p className="mt-1 text-xs text-ink-400">
                {t.payments.returnUrlHint}
              </p>
            </div>
          </div>

          {(extraFields[chosen] ?? []).length > 0 && (
            <div className="rounded-2xl border border-ink-100 p-4">
              <p className="text-sm font-bold text-ink-900">
                {t.payments.extraTitle}
              </p>
              <p className="mt-1 text-xs text-ink-400">
                {t.payments.extraHint}
              </p>
              <div className="mt-3 space-y-3">
                {(extraFields[chosen] ?? []).map((field) => (
                  <div key={field.key}>
                    <label className="label" htmlFor={`payment-${field.key}`}>
                      {t.payments[field.label]}
                    </label>
                    <input
                      id={`payment-${field.key}`}
                      className="field"
                      dir="ltr"
                      autoComplete="off"
                      value={extra[field.key] ?? ""}
                      onChange={(event) =>
                        setExtra((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                    />
                    <p className="mt-1 text-xs text-ink-400">
                      {t.payments[`${field.label}Hint` as const]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm font-semibold text-danger">
              {error}
            </p>
          )}
          {saved && (
            <p role="status" className="text-sm font-semibold text-success">
              {t.payments.saved}
            </p>
          )}

          <button
            type="submit"
            className="btn-secondary disabled:opacity-50"
            disabled={busy}
          >
            {busy
              ? t.payments.saving
              : account
                ? t.payments.replace
                : t.payments.connect}
          </button>
        </form>
      )}
    </section>
  );
}
