import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "../../api/http";
import { adErrorMessage } from "../../api/ads";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import { fetchAdSettings, updateAdSettings } from "../api/client";
import { adminStrings } from "../strings";
import { formatDateTime } from "../format";

/**
 * The Meta credentials, on their own route under the ads section.
 *
 * Almost everything unusual about this screen comes from one property of the
 * endpoint behind it: the access token goes in and never comes back. There is
 * no flag that would return it, so the form cannot be the usual "load, edit,
 * save" — the token field is a blank box sitting over a stored secret, which
 * makes "blank" mean *keep* rather than *clear*, which in turn means clearing
 * has to be its own explicit button.
 *
 * The rest of the copy exists to move consequences in front of the save
 * instead of behind it. Two of them are irreversible in practice and both are
 * easy to walk into: the first save takes the server's environment out of the
 * loop for every field at once, and a missing encryption key means a pasted
 * credential is refused outright. Each is a 409 or a nasty surprise if left to
 * be discovered, and each is knowable before anybody types anything.
 */

export default function AdSettings() {
  const { locale } = useI18n();
  const strings = adminStrings(locale);
  const t = strings.ads.settings;
  const { token } = useSession();

  const view = useResource(() => fetchAdSettings(token), [token]);
  const settings = view.data ?? null;

  const [enabled, setEnabled] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [adAccountId, setAdAccountId] = useState("");
  const [pageId, setPageId] = useState("");
  const [instagramAccountId, setInstagramAccountId] = useState("");
  const [apiVersion, setApiVersion] = useState("");
  const [graphBaseUrl, setGraphBaseUrl] = useState("");
  const [maxDailyBudget, setMaxDailyBudget] = useState("");
  const [testDailyBudget, setTestDailyBudget] = useState("");
  const [defaultCountry, setDefaultCountry] = useState("");
  const [testDestinationUrl, setTestDestinationUrl] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Seeded from the server's effective values rather than left blank, because
  // blank means something specific here — a built-in default, not "unchanged".
  // Showing what is actually in force is also the only way a staff member can
  // tell which layer they are looking at while `source` is still ENVIRONMENT.
  useEffect(() => {
    if (!settings) return;
    setEnabled(settings.enabled);
    setAdAccountId(settings.adAccountId ?? "");
    setPageId(settings.pageId ?? "");
    setInstagramAccountId(settings.instagramAccountId ?? "");
    setApiVersion(settings.apiVersion);
    setGraphBaseUrl(settings.graphBaseUrl);
    setMaxDailyBudget(String(settings.maxDailyBudgetMinor));
    setTestDailyBudget(String(settings.testDailyBudgetMinor));
    setDefaultCountry(settings.defaultCountry);
    setTestDestinationUrl(settings.testDestinationUrl);
  }, [settings]);

  // Locked rather than hidden: a staff member needs to see which account is
  // configured in order to understand why it will not move, and the count is
  // the whole explanation. Only once the panel is the source, though: that is
  // the only time the server refuses the move, and locking it earlier would
  // block a change the server accepts.
  const accountLocked =
    settings?.source === "PANEL" &&
    !!settings.adAccountId &&
    settings.liveCampaigns > 0;

  // While the environment is the source, the token in force lives in the
  // server's environment and the first save cannot carry it over: the API
  // never hands it back, and a save with no token stores none. So that save
  // has to bring the token with it, or it switches the source and leaves
  // advertising with no token at all.
  const tokenMustBeResent =
    settings?.source === "ENVIRONMENT" && settings.tokenSet;

  /**
   * Matched on the code, then on the field errors the server sends for the two
   * numeric limits and the country. The generic sentence is last on purpose:
   * every case above it sends somebody somewhere different, and "we couldn't
   * save it" would send them back to re-check credentials that were fine.
   */
  function describe(caught: unknown): string {
    if (caught instanceof ApiError) {
      if (
        caught.fields?.maxDailyBudgetMinor !== undefined ||
        caught.fields?.testDailyBudgetMinor !== undefined
      )
        return t.badBudget;
      if (caught.fields?.defaultCountry !== undefined) return t.badCountry;
    }
    return adErrorMessage(caught, strings.ads.refusals, () => t.saveFailed);
  }

  /**
   * Blank is a real choice here — it asks for the built-in default — but text
   * that is not a whole number is not. It has to be caught before the body is
   * built, because `Number("x")` is NaN and JSON.stringify writes NaN as null,
   * so a typo would arrive looking exactly like a deliberate "use the default".
   * Fractions are refused too: the field is an integer of minor units, and the
   * server would quietly truncate `1.5` rather than reject it.
   */
  function budgetOf(raw: string): number | null | undefined {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isInteger(parsed) ? parsed : undefined;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !settings) return;

    if (tokenMustBeResent && !accessToken.trim()) {
      setSaved(false);
      setError(
        settings.credentialKeyConfigured
          ? t.firstSaveNeedsToken
          : t.firstSaveNeedsKey,
      );
      return;
    }

    const maxBudget = budgetOf(maxDailyBudget);
    const testBudget = budgetOf(testDailyBudget);
    if (maxBudget === undefined || testBudget === undefined) {
      setSaved(false);
      setError(t.badBudget);
      return;
    }

    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const next = await updateAdSettings(token, {
        enabled,
        // Blank is "keep", so it is left out of the body entirely rather than
        // sent as an empty string — the API treats both the same way, and not
        // sending it is the clearer statement of intent.
        accessToken: accessToken.trim() || undefined,
        removeAccessToken: false,
        // The ad account is the one field the server may refuse to move. Sent
        // as whatever is stored when locked, so a save of the other fields is
        // not turned into an ADS_ACCOUNT_IN_USE by a disabled input.
        adAccountId: accountLocked
          ? settings.adAccountId
          : adAccountId.trim() || null,
        pageId: pageId.trim() || null,
        instagramAccountId: instagramAccountId.trim() || null,
        apiVersion: apiVersion.trim() || null,
        graphBaseUrl: graphBaseUrl.trim() || null,
        defaultCountry: defaultCountry.trim() || null,
        testDestinationUrl: testDestinationUrl.trim() || null,
        maxDailyBudgetMinor: maxBudget,
        testDailyBudgetMinor: testBudget,
      });
      // Cleared the moment it is accepted: the token has no further use on this
      // side, and leaving it in a React state that survives a route change is a
      // live credential sitting in memory for no reason.
      setAccessToken("");
      view.set(next);
      setSaved(true);
    } catch (caught) {
      setError(describe(caught));
    } finally {
      setBusy(false);
    }
  }

  async function clearToken() {
    if (busy || !settings) return;
    const confirmText =
      settings.source === "ENVIRONMENT"
        ? t.clearTokenConfirmEnv
        : t.clearTokenConfirm;
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      /*
        The stored values are echoed back rather than omitted, and the form's
        unsaved edits are deliberately not used.

        Omitting them would be safe only if an absent field meant "keep", and it
        does not appear to: a blank box falls back to a built-in default rather
        than to what is stored. Under that reading, clearing a token with a bare
        body would also silently drop the ad account and page ids. Echoing what
        the server last told us is correct under either reading — a no-op if
        absent means keep, and a preservation if it does not.
      */
      const next = await updateAdSettings(token, {
        enabled: settings.enabled,
        removeAccessToken: true,
        adAccountId: settings.adAccountId,
        pageId: settings.pageId,
        instagramAccountId: settings.instagramAccountId,
        apiVersion: settings.apiVersion,
        graphBaseUrl: settings.graphBaseUrl,
        defaultCountry: settings.defaultCountry,
        testDestinationUrl: settings.testDestinationUrl,
        maxDailyBudgetMinor: settings.maxDailyBudgetMinor,
        testDailyBudgetMinor: settings.testDailyBudgetMinor,
      });
      setAccessToken("");
      view.set(next);
    } catch (caught) {
      setError(describe(caught));
    } finally {
      setBusy(false);
    }
  }

  if (!settings) {
    return (
      <div>
        {view.error ? (
          <div className="rounded-2xl border border-ink-100 bg-surface p-6">
            <p className="text-sm text-ink-500">{t.loadFailed}</p>
            <button
              type="button"
              onClick={view.reload}
              className="btn-primary mt-3"
            >
              {strings.ads.retry}
            </button>
          </div>
        ) : (
          <p className="mt-8 text-sm text-ink-400">{strings.loading}</p>
        )}
      </div>
    );
  }

  const fromEnvironment = settings.source === "ENVIRONMENT";

  return (
    <div className="pb-16">
      <h1 className="text-[28px] font-bold text-balance tracking-[-0.01em] text-ink-900 leading-tight">
        {t.title}
      </h1>
      <p className="mt-1 text-base text-ink-600">{t.subtitle}</p>

      {/*
        The one fault the server reports as prose rather than a code, and the
        only state where /status blames Meta for something that has nothing to
        do with Meta: the stored token will not decrypt. Red and first, because
        while it is set nothing else on this page matters.
      */}
      {settings.problem && (
        <div className="mt-6 rounded-2xl border border-danger/30 bg-danger/5 p-6">
          <p className="text-sm font-bold text-danger">{t.problemTitle}</p>
          <p className="mt-2 text-sm text-ink-700">{settings.problem}</p>
        </div>
      )}

      {/*
        Which layer is in force. Said before the form rather than after a save,
        because the first save is not reversible from here: it moves every field
        at once and the environment stops being consulted for good.
      */}
      <div
        className={`mt-6 rounded-3xl border p-6 ${
          fromEnvironment
            ? "border-warning/30 bg-warning/5"
            : "border-ink-100 bg-sunken"
        }`}
      >
        <p className="text-sm font-bold text-ink-900">
          {fromEnvironment ? t.sourceEnvTitle : t.sourcePanelTitle}
        </p>
        <p className="mt-2 text-sm text-ink-600">
          {fromEnvironment ? t.sourceEnvBody : t.sourcePanelBody}
        </p>
        {settings.updatedAt && (
          <p className="mt-2 text-xs text-ink-400">
            {settings.updatedByEmail
              ? t.savedBy(
                  formatDateTime(settings.updatedAt, locale),
                  settings.updatedByEmail,
                )
              : t.savedAt(formatDateTime(settings.updatedAt, locale))}
          </p>
        )}
      </div>

      {/*
        Said up front rather than left to the 409. Somebody who reads this after
        pasting a live credential into a box has already done the thing we would
        rather they had not.
      */}
      {!settings.credentialKeyConfigured && (
        <div className="mt-6 rounded-2xl border border-warning/30 bg-warning/5 p-6">
          <p className="text-sm font-bold text-ink-900">{t.noKeyTitle}</p>
          <p className="mt-2 text-sm text-ink-600">{t.noKeyBody}</p>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-6" noValidate>
        <section className="card hover:border-ink-100 hover:shadow-none">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 accent-ink-900"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
            />
            <span>
              <span className="text-sm font-semibold text-ink-900">
                {t.enabledLabel}
              </span>
              <span className="mt-1 block text-xs text-ink-400">
                {t.enabledHint}
              </span>
            </span>
          </label>
          {!enabled && (
            <p className="mt-3 text-sm font-semibold text-ink-700">
              {t.enabledOffHint}
            </p>
          )}
        </section>

        <section className="card hover:border-ink-100 hover:shadow-none">
          <h2 className="text-lg font-bold text-ink-900">
            {t.credentialsTitle}
          </h2>

          <div className="mt-4">
            <label className="label" htmlFor="ad-token">
              {t.tokenLabel}
            </label>
            <p className="mb-2 text-sm text-ink-600">
              {/* A short token is set but has no hint, by design. */}
              {settings.tokenSet
                ? settings.tokenHint
                  ? t.tokenStored(settings.tokenHint)
                  : t.tokenStoredNoHint
                : t.tokenNotStored}
            </p>
            <input
              spellCheck={false}
              id="ad-token"
              className="field"
              type="password"
              dir="ltr"
              autoComplete="new-password"
              disabled={!settings.credentialKeyConfigured}
              value={accessToken}
              onChange={(event) => setAccessToken(event.target.value)}
            />
            <p className="mt-1 text-xs text-ink-400">
              {tokenMustBeResent
                ? t.tokenEnvHint
                : settings.tokenSet
                  ? t.tokenKeepHint
                  : t.tokenNewHint}
            </p>
            {settings.tokenSet && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={clearToken}
                  disabled={busy}
                  className="text-sm font-semibold text-danger hover:underline disabled:opacity-50"
                >
                  {t.clearToken}
                </button>
                <span className="text-xs text-ink-400">{t.clearTokenHint}</span>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="ad-account">
                {t.adAccountLabel}
              </label>
              <input
                autoComplete="off"
                spellCheck={false}
                id="ad-account"
                className="field"
                dir="ltr"
                disabled={accountLocked}
                value={adAccountId}
                onChange={(event) => setAdAccountId(event.target.value)}
              />
              <p className="mt-1 text-xs text-ink-400">
                {accountLocked
                  ? t.adAccountLockedHint(settings.liveCampaigns)
                  : t.adAccountHint}
              </p>
            </div>
            <div>
              <label className="label" htmlFor="ad-page">
                {t.pageLabel}
              </label>
              <input
                autoComplete="off"
                spellCheck={false}
                id="ad-page"
                className="field"
                dir="ltr"
                value={pageId}
                onChange={(event) => setPageId(event.target.value)}
              />
              <p className="mt-1 text-xs text-ink-400">{t.pageHint}</p>
            </div>
            <div>
              <label className="label" htmlFor="ad-instagram">
                {t.instagramLabel}
              </label>
              <input
                autoComplete="off"
                spellCheck={false}
                id="ad-instagram"
                className="field"
                dir="ltr"
                value={instagramAccountId}
                onChange={(event) =>
                  setInstagramAccountId(event.target.value)
                }
              />
              <p className="mt-1 text-xs text-ink-400">{t.instagramHint}</p>
            </div>
          </div>
        </section>

        <section className="card hover:border-ink-100 hover:shadow-none">
          <h2 className="text-lg font-bold text-ink-900">{t.tuningTitle}</h2>
          <p className="mt-1 text-sm text-ink-400">{t.tuningBody}</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="ad-api-version">
                {t.apiVersionLabel}
              </label>
              <input
                autoComplete="off"
                spellCheck={false}
                id="ad-api-version"
                className="field"
                dir="ltr"
                value={apiVersion}
                onChange={(event) => setApiVersion(event.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="ad-graph-url">
                {t.graphBaseUrlLabel}
              </label>
              <input
                autoComplete="off"
                spellCheck={false}
                id="ad-graph-url"
                className="field"
                dir="ltr"
                value={graphBaseUrl}
                onChange={(event) => setGraphBaseUrl(event.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="ad-max-budget">
                {t.maxBudgetLabel}
              </label>
              <input
                autoComplete="off"
                spellCheck={false}
                id="ad-max-budget"
                className="field"
                dir="ltr"
                inputMode="numeric"
                value={maxDailyBudget}
                onChange={(event) => setMaxDailyBudget(event.target.value)}
              />
              <p className="mt-1 text-xs text-ink-400">{t.maxBudgetHint}</p>
            </div>
            <div>
              <label className="label" htmlFor="ad-test-budget">
                {t.testBudgetLabel}
              </label>
              <input
                autoComplete="off"
                spellCheck={false}
                id="ad-test-budget"
                className="field"
                dir="ltr"
                inputMode="numeric"
                value={testDailyBudget}
                onChange={(event) => setTestDailyBudget(event.target.value)}
              />
              <p className="mt-1 text-xs text-ink-400">{t.testBudgetHint}</p>
            </div>
            <div>
              <label className="label" htmlFor="ad-country">
                {t.countryLabel}
              </label>
              <input
                autoComplete="off"
                spellCheck={false}
                id="ad-country"
                className="field"
                dir="ltr"
                maxLength={2}
                value={defaultCountry}
                onChange={(event) => setDefaultCountry(event.target.value)}
              />
              <p className="mt-1 text-xs text-ink-400">{t.countryHint}</p>
            </div>
            <div>
              <label className="label" htmlFor="ad-test-destination">
                {t.testDestinationLabel}
              </label>
              <input
                autoComplete="off"
                spellCheck={false}
                id="ad-test-destination"
                className="field"
                dir="ltr"
                value={testDestinationUrl}
                onChange={(event) => setTestDestinationUrl(event.target.value)}
              />
              <p className="mt-1 text-xs text-ink-400">
                {t.testDestinationHint}
              </p>
            </div>
          </div>
        </section>

        {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
        {saved && !error && (
          <p role="status" className="text-sm font-semibold text-ink-900">{t.saved}</p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? t.saving : t.save}
          </button>
          {/*
            The server's own verdict on whether these settings are complete,
            beside the button that changes them. It is the same `configured` the
            status card shows, and having it here means a save that leaves a
            required field empty says so on the spot rather than on another page.
          */}
          <span className="text-sm text-ink-400">
            {settings.configured
              ? strings.ads.status.configured
              : strings.ads.status.notConfigured}
          </span>
        </div>
      </form>
    </div>
  );
}
