import { formatMinor } from "../../api/plans";
import { figure } from "../../api/ads";
import type { AdCampaignStatus, AdChannel } from "../../api/ads";

/**
 * The small pieces every ads screen renders the same way.
 *
 * They live together because the four ads screens have to agree about money,
 * status words and Meta's figures. A budget shown with a different currency on
 * the list than on the detail, or a null spend rendered as `0` on one screen and
 * "not yet" on another, would each be read as a fact about the campaign rather
 * than as a difference between two components.
 */

export type Tone = "good" | "bad" | "neutral";

export function toneClasses(tone: Tone): string {
  if (tone === "bad") return "border-danger/30 bg-danger/10 dark:bg-danger/15";
  if (tone === "good") return "border-success-border bg-success-soft";
  return "border-ink-100 bg-ink-50";
}

export function dotClass(ok: boolean): string {
  return ok ? "bg-success" : "bg-danger";
}

/**
 * A budget in the ad account's currency.
 *
 * The currency is read from the payload rather than assumed, because it is
 * Meta's to choose and this account may well be billed in USD. Where we do not
 * know it, the amount is withheld rather than rendered against a guessed
 * symbol: a figure with the wrong currency on it is worse than no figure, since
 * it is the one thing on the screen somebody might act on.
 */
export function Budget({
  minor,
  currency,
  locale,
}: {
  minor: number | undefined;
  currency: string | undefined;
  locale: string;
}) {
  if (minor === undefined) return <>—</>;
  if (!currency) return <>{(minor / 100).toFixed(2)}</>;
  return <>{formatMinor(minor, currency, locale)}</>;
}

/**
 * One of Meta's reported figures, exactly as Meta sent it.
 *
 * Every insights number arrives as a string and stays one — see `figure()` for
 * why. The only decision here is what an absent figure looks like, and it is
 * deliberately not `0`: a campaign an hour old has been seen by nobody *yet*,
 * which is a different statement from having been seen by no one.
 */
export function Insight({
  value,
  notYet,
}: {
  value: string | null | undefined;
  notYet: string;
}) {
  const text = figure(value);
  if (text === null) return <span className="text-ink-400">{notYet}</span>;
  return (
    <span dir="ltr" className="tabular-nums">
      {text}
    </span>
  );
}

const STATUS_TONE: Record<AdCampaignStatus, string> = {
  ACTIVE: "border-success-border bg-success-soft text-success-strong",
  PAUSED: "border-ink-200 bg-ink-50 text-ink-600",
  FAILED: "border-danger/30 bg-danger/10 text-danger",
  DELETED: "border-ink-200 bg-ink-50 text-ink-400",
};

/**
 * The status word.
 *
 * Unknown values render raw rather than falling through to a friendly-looking
 * default: if the API grows a status this build has not heard of, showing it
 * verbatim is honest, while showing it as "Paused" is a lie about money.
 */
export function StatusPill({
  status,
  labels,
}: {
  status: string;
  labels: Record<string, string>;
}) {
  const tone = STATUS_TONE[status as AdCampaignStatus] ?? "border-ink-200 bg-ink-50 text-ink-600";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

export function Channels({
  channels,
  labels,
}: {
  channels: AdChannel[] | undefined;
  labels: Record<string, string>;
}) {
  if (!channels?.length) return <>—</>;
  return <>{channels.map((c) => labels[c] ?? c).join(", ")}</>;
}
