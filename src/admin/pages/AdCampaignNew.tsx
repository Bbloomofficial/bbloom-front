import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError } from "../../api/http";
import { formatMinor } from "../../api/plans";
import {
  AD_CHANNELS,
  adErrorMessage,
  formatCount,
  isOverAllowance,
  isUnlimited,
} from "../../api/ads";
import type { AdAllowance, AdChannel } from "../../api/ads";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import {
  createAdCampaign,
  fetchAdAllowance,
  fetchAdStatus,
  fetchSites,
} from "../api/client";
import { adminStrings } from "../strings";

/**
 * Launching a campaign for a client.
 *
 * This form has no draft to fall back on. Meta has no concept of a campaign
 * that exists but is not running, and the server does not create one paused —
 * so the submit button is the moment the client's money starts being spent, and
 * everything here is arranged around making that obvious before it happens:
 * the warning above the button, the confirm on it, the ceiling shown beside the
 * budget field.
 *
 * The budget is checked here *and* on the server. The local check is not the
 * guard — the server's `Max` on `dailyBudgetMinor` is — it exists so a slipped
 * decimal point is caught before it becomes a request that might half-succeed.
 */

/** What the client may run, in one sentence, or null when we cannot say. */
function AllowanceNote({ allowance }: { allowance: AdAllowance | null }) {
  const { locale } = useI18n();
  const strings = adminStrings(locale);
  const t = strings.ads.form;
  if (!allowance) return null;

  const used = formatCount(allowance.impressionsUsed, locale);
  const impressions = isUnlimited(allowance.impressionLimit)
    ? t.allowanceImpressionsUnmetered(used)
    : t.allowanceImpressions(
        used,
        formatCount(allowance.impressionLimit as number, locale),
      );
  const channels = (allowance.channels ?? [])
    .map((channel) => strings.ads.channels[channel] ?? channel)
    .join(", ");
  const over = isOverAllowance(allowance);

  return (
    <div className="mt-4 rounded-2xl border border-ink-100 bg-ink-50 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        {t.allowanceTitle}
      </h3>
      {allowance.allowed ? (
        <p className="mt-1 text-sm text-ink-700">
          {allowance.planCode ? `${allowance.planCode} — ` : ""}
          {impressions}
          {channels ? `. ${t.allowanceChannels(channels)}` : ""}.
        </p>
      ) : (
        <p className="mt-1 text-sm font-semibold text-danger">
          {t.allowanceNone}
        </p>
      )}
      {/*
        An overshoot is not a bug and is worth its own sentence: the allowance is
        checked at launch and never reserved, because a campaign cannot know what
        it will deliver, so the last one of a period can run past the ceiling.
        It has to be read from used-against-limit — the server clamps
        `impressionsRemaining` at zero, so an overshoot and an exact landing look
        identical there.
      */}
      {allowance.allowed && over && (
        <p className="mt-2 text-sm font-semibold text-danger">
          {t.allowanceOver(
            formatCount(allowance.impressionsUsed, locale),
            formatCount(allowance.impressionLimit as number, locale),
          )}
        </p>
      )}
      {/* Shown even when `allowed` is still true: a site with nothing left is
          allowed right up until the launch that is refused. */}
      {allowance.allowed &&
        !over &&
        !isUnlimited(allowance.impressionsRemaining) &&
        allowance.impressionsRemaining === 0 && (
          <p className="mt-2 text-sm font-semibold text-danger">
            {t.allowanceSpent}
          </p>
        )}
      {allowance.allowed && !isUnlimited(allowance.impressionLimit) && (
        <p className="mt-2 text-xs text-ink-500">{t.allowanceStale}</p>
      )}
    </div>
  );
}

export default function AdCampaignNew() {
  const { locale } = useI18n();
  const strings = adminStrings(locale);
  const t = strings.ads;
  const f = t.form;
  const { token, handleError } = useSession();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const status = useResource(() => fetchAdStatus(token), [token]);
  /*
    A wide page of sites, unsorted by anything but the API's own order. This is
    a staff screen used a handful of times a week, so a plain select beats a
    search box: the whole client list fits, and picking the wrong client here
    spends the wrong person's money.
  */
  const sites = useResource(() => fetchSites(token, { size: 200 }), [token]);

  const [siteId, setSiteId] = useState(params.get("siteId") ?? "");
  const [name, setName] = useState("");
  const [channels, setChannels] = useState<AdChannel[]>(["FACEBOOK"]);
  const [budget, setBudget] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [primaryText, setPrimaryText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [country, setCountry] = useState("GE");
  const [cityKey, setCityKey] = useState("");
  const [ageMin, setAgeMin] = useState("18");
  const [ageMax, setAgeMax] = useState("65");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
    The allowance is read per site rather than once, because it is the answer to
    "may this client have another campaign", and that is a different answer for
    every row in the select above.
  */
  const allowance = useResource(
    () => (siteId ? fetchAdAllowance(token, siteId) : Promise.resolve(null)),
    [token, siteId],
  );

  const currency = status.data?.currency ?? status.data?.meta?.currency;
  const ceiling = status.data?.maxDailyBudgetMinor;

  /*
    A channel can be off the table for two unrelated reasons, and they are not
    the client's to discover through a refusal: the plan may not sell it — Simple
    is Facebook-only, so even asking for Instagram alone is refused — or we may
    have no Instagram account connected at all. Both are known before the button
    is pressed, so both disable the box rather than costing a round trip.

    `channels` keeps whatever was ticked and the available set is filtered out of
    it at the edges, so switching between two clients does not silently carry one
    client's Instagram over to a site that cannot run it, and switching back
    restores it.
  */
  const planChannels = allowance.data?.channels;
  const instagramOff = Boolean(status.data && !status.data.instagramConfigured);

  function notInPlan(channel: AdChannel): boolean {
    return Boolean(planChannels && !planChannels.includes(channel));
  }

  function unavailable(channel: AdChannel): boolean {
    if (channel === "INSTAGRAM" && instagramOff) return true;
    return notInPlan(channel);
  }

  const selected = channels.filter((channel) => !unavailable(channel));

  function toggleChannel(channel: AdChannel) {
    setChannels((current) =>
      current.includes(channel)
        ? current.filter((item) => item !== channel)
        : [...current, channel],
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;

    if (!siteId || !name.trim()) {
      setError(f.required);
      return;
    }
    if (selected.length === 0) {
      setError(f.pickChannel);
      return;
    }
    /*
      Entered in whole units and sent in minor ones. Rounding rather than
      truncating: `Math.round` turns a stray "49.999" into fifty, where `|0`
      would silently bill forty-nine.
    */
    const minor = Math.round(Number(budget) * 100);
    if (!Number.isFinite(minor) || minor < 1) {
      setError(f.budgetTooSmall);
      return;
    }
    if (ceiling !== undefined && minor > ceiling) {
      setError(f.budgetOverCeiling);
      return;
    }
    const destination = destinationUrl.trim();
    if (destination && !/^https?:\/\//i.test(destination)) {
      setError(f.badUrl);
      return;
    }

    if (!window.confirm(f.confirm)) return;

    setSubmitting(true);
    setError(null);
    try {
      const created = await createAdCampaign(token, {
        siteId,
        name: name.trim(),
        channels: selected,
        dailyBudgetMinor: minor,
        destinationUrl: destination || undefined,
        headline: headline.trim() || undefined,
        primaryText: primaryText.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        country: country.trim().toUpperCase() || undefined,
        cityKey: cityKey.trim() || undefined,
        ageMin: Number(ageMin) || undefined,
        ageMax: Number(ageMax) || undefined,
      });
      navigate(`/ads/${created.id}`);
    } catch (caught) {
      handleError(caught);
      setError(
        adErrorMessage(caught, t.refusals, () => {
          /*
            The one 400 worth naming is the budget ceiling: it is a number the
            server holds and this screen only mirrors, so it is the field most
            likely to be wrong here in a way the person can fix.
          */
          if (
            caught instanceof ApiError &&
            caught.fields?.dailyBudgetMinor !== undefined
          ) {
            return f.budgetOverCeiling;
          }
          return f.createFailed;
        }),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {f.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-600">{f.subtitle}</p>
        </div>
        <Link to="/ads" className="btn-secondary">
          {t.backToCampaigns}
        </Link>
      </div>

      <form
        onSubmit={submit}
        className="mt-6 max-w-3xl rounded-3xl border border-ink-100 bg-surface p-6"
      >
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-ink-800">
            {f.siteLabel}
          </span>
          <select
            value={siteId}
            onChange={(event) => setSiteId(event.target.value)}
            className="field w-full"
          >
            <option value="">{f.sitePlaceholder}</option>
            {(sites.data?.items ?? []).map((site) => (
              <option key={site.id} value={site.id}>
                {site.businessName}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-ink-500">{f.siteHint}</span>
        </label>

        <AllowanceNote allowance={allowance.data ?? null} />

        <label className="mt-5 block text-sm">
          <span className="mb-1 block font-semibold text-ink-800">
            {f.nameLabel}
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={200}
            className="field w-full"
          />
          <span className="mt-1 block text-xs text-ink-500">{f.nameHint}</span>
        </label>

        <fieldset className="mt-5">
          <legend className="mb-1 text-sm font-semibold text-ink-800">
            {f.channelLabel}
          </legend>
          <div className="flex flex-wrap gap-4">
            {AD_CHANNELS.map((channel) => (
              <label
                key={channel}
                className={`flex items-center gap-2 text-sm ${
                  unavailable(channel) ? "text-ink-400" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(channel)}
                  disabled={unavailable(channel)}
                  onChange={() => toggleChannel(channel)}
                />
                <span>{t.channels[channel] ?? channel}</span>
              </label>
            ))}
          </div>
          {/* Each disabled box says why it is disabled, and the two reasons are
              different: one is the client's plan, the other is our setup. */}
          {AD_CHANNELS.some(notInPlan) && (
            <p className="mt-2 text-xs text-ink-500">{f.channelNotInPlan}</p>
          )}
          {instagramOff && (
            <p className="mt-2 text-xs text-ink-500">
              {t.test.instagramUnavailable}
            </p>
          )}
        </fieldset>

        <label className="mt-5 block text-sm">
          <span className="mb-1 block font-semibold text-ink-800">
            {f.budgetLabel}
          </span>
          <input
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            inputMode="decimal"
            dir="ltr"
            className="field w-full sm:w-48"
          />
          <span className="mt-1 block text-xs text-ink-500">
            {f.budgetHint}
            {ceiling !== undefined && currency
              ? ` ${f.budgetCeiling(formatMinor(ceiling, currency, locale))}`
              : ""}
          </span>
        </label>

        <label className="mt-5 block text-sm">
          <span className="mb-1 block font-semibold text-ink-800">
            {f.destinationLabel}
          </span>
          <input
            value={destinationUrl}
            onChange={(event) => setDestinationUrl(event.target.value)}
            dir="ltr"
            placeholder="https://"
            className="field w-full"
          />
          <span className="mt-1 block text-xs text-ink-500">
            {f.destinationHint}
          </span>
        </label>

        <label className="mt-5 block text-sm">
          <span className="mb-1 block font-semibold text-ink-800">
            {f.headlineLabel}
          </span>
          <input
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
            maxLength={200}
            className="field w-full"
          />
        </label>

        <label className="mt-5 block text-sm">
          <span className="mb-1 block font-semibold text-ink-800">
            {f.primaryTextLabel}
          </span>
          <textarea
            value={primaryText}
            onChange={(event) => setPrimaryText(event.target.value)}
            maxLength={600}
            rows={4}
            className="field w-full"
          />
        </label>

        <label className="mt-5 block text-sm">
          <span className="mb-1 block font-semibold text-ink-800">
            {f.imageLabel}
          </span>
          <input
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            maxLength={500}
            dir="ltr"
            className="field w-full"
          />
        </label>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-ink-800">
              {f.countryLabel}
            </span>
            <input
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              maxLength={2}
              dir="ltr"
              className="field w-full sm:w-24"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-ink-800">
              {f.cityLabel}
            </span>
            <input
              value={cityKey}
              onChange={(event) => setCityKey(event.target.value)}
              className="field w-full"
            />
            <span className="mt-1 block text-xs text-ink-500">{f.cityHint}</span>
          </label>
        </div>

        <fieldset className="mt-5">
          <legend className="mb-1 text-sm font-semibold text-ink-800">
            {f.ageLabel}
          </legend>
          <div className="flex items-center gap-3">
            <input
              value={ageMin}
              onChange={(event) => setAgeMin(event.target.value)}
              inputMode="numeric"
              dir="ltr"
              className="field w-20"
            />
            <span className="text-sm text-ink-500">{f.ageTo}</span>
            <input
              value={ageMax}
              onChange={(event) => setAgeMax(event.target.value)}
              inputMode="numeric"
              dir="ltr"
              className="field w-20"
            />
          </div>
        </fieldset>

        <p className="mt-6 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm font-semibold text-danger dark:bg-danger/15">
          {f.warning}
        </p>

        {error && <p className="mt-4 text-sm font-semibold text-danger">{error}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="submit" className="rounded-xl bg-danger px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-40" disabled={submitting}>
            {submitting ? f.creating : f.create}
          </button>
          <Link to="/ads" className="btn-secondary">
            {f.cancel}
          </Link>
          {submitting && (
            <span className="text-xs text-ink-500">{f.creatingNote}</span>
          )}
        </div>
      </form>
    </div>
  );
}
