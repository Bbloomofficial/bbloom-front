import { useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "../../api/http";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { addDomain, removeDomain } from "../api/client";
import type { SiteDetail } from "../api/types";
import { adminStrings } from "../strings";

/** Pointing a client's own domain at their bbloom-hosted site. */
export default function DomainsPanel({
  site,
  onChanged,
}: {
  site: SiteDetail;
  onChanged: () => void;
}) {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { token } = useSession();

  const [hostname, setHostname] = useState("");
  const [primary, setPrimary] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const domains = site.domains ?? [];

  async function onAdd(event: FormEvent) {
    event.preventDefault();
    if (busy || !hostname.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await addDomain(token, site.id, hostname.trim().toLowerCase(), primary);
      setHostname("");
      setPrimary(false);
      onChanged();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : String(caught));
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(domainId: string) {
    setBusy(true);
    setError(null);
    try {
      await removeDomain(token, site.id, domainId);
      onChanged();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : String(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card hover:border-ink-100 hover:shadow-none">
      <h2 className="text-lg font-bold text-ink-900">{t.detail.domains}</h2>
      <p className="mt-1 text-sm text-ink-400">{t.detail.domainsHint}</p>

      {domains.length === 0 ? (
        <p className="mt-4 text-sm text-ink-600">{t.detail.noDomains}</p>
      ) : (
        <ul className="mt-4 divide-y divide-ink-100">
          {domains.map((domain) => (
            <li
              key={domain.id}
              className="flex flex-wrap items-center gap-3 py-3"
            >
              <span className="font-semibold text-ink-900" dir="ltr">
                {domain.hostname}
              </span>
              {domain.primaryDomain && (
                <span className="rounded-full bg-bloom-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {t.detail.primary}
                </span>
              )}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  domain.verified
                    ? "bg-success-soft text-success"
                    : "bg-ink-50 text-ink-400"
                }`}
              >
                {domain.verified ? t.detail.verified : t.detail.unverified}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => onRemove(domain.id)}
                className="ms-auto text-sm font-semibold text-danger hover:underline disabled:opacity-50"
              >
                {t.detail.remove}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onAdd} className="mt-5 space-y-3" noValidate>
        <div>
          <label className="label" htmlFor="domain-hostname">
            {t.detail.hostname}
          </label>
          <input
            id="domain-hostname"
            className="field"
            dir="ltr"
            placeholder="cafe.ge"
            value={hostname}
            onChange={(event) => setHostname(event.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            className="h-4 w-4 accent-bloom-600"
            checked={primary}
            onChange={(event) => setPrimary(event.target.checked)}
          />
          {t.detail.makePrimary}
        </label>

        {error && (
          <p role="alert" className="text-sm font-semibold text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn-secondary disabled:opacity-50"
          disabled={busy || !hostname.trim()}
        >
          {t.detail.addDomain}
        </button>
      </form>
    </section>
  );
}
