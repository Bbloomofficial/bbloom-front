import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { describeProblem } from "../../api/problem";
import { dashPath } from "../../routes";
import { useSession } from "../auth";
import { fetchSiteDetail, fetchSiteQr } from "../api/client";
import type { QrFormat } from "../api/client";
import type { SiteDetail, SiteLanguage } from "../api/types";
import { SITE_LANGUAGES } from "../api/types";
import { useResource } from "../hooks";
import { useActiveSite, useIsOwner } from "../site";
import { paidBlock } from "../gate";
import type { PaidBlock } from "../gate";
import { pendingDomain, qrFilename, qrPaidBlock } from "../qr";
import { dashboardStrings } from "../strings";

/**
 * The printable QR card.
 *
 * A screen of its own rather than a panel on the overview, because printing is
 * an errand: a client comes here once, with a printer or a print shop in mind,
 * and leaves. Routed for every plan — a client who has not paid meets the offer
 * here rather than finding the tab missing and never learning the card exists.
 *
 * Everything about the card is made on the server. This screen fetches bytes,
 * shows them, and saves them.
 */
export default function SiteQr() {
  const { locale } = useI18n();
  const strings = dashboardStrings(locale);
  const t = strings.qr;
  const { token, handleError } = useSession();
  const active = useActiveSite();
  const siteId = active.id;

  /**
   * What local state already knows about the subscription.
   *
   * Checked before anything is requested, and when it says no, nothing is
   * requested at all: a free client should meet an offer, not a spinner
   * followed by a refusal they have to read twice.
   */
  const localBlock = paidBlock(active);

  /*
    The site only for the pending-domain notice, and deliberately not awaited:
    the card is the point of this screen, and holding the preview behind a
    second request would make the common case slower for the sake of a warning
    that applies to very few clients.
  */
  const detail = useResource<SiteDetail | null>(
    () => (localBlock ? Promise.resolve(null) : fetchSiteDetail(token, siteId)),
    [token, siteId, localBlock],
  );

  /**
   * The language printed on the card. `undefined` means "as the server sees
   * fit", which is the site's own default language and is right for nearly
   * everyone — so it is the initial state rather than something resolved here.
   */
  const [cardLang, setCardLang] = useState<SiteLanguage | undefined>(undefined);
  const [preview, setPreview] = useState<{ url: string; blob: Blob; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverBlock, setServerBlock] = useState<PaidBlock | null>(null);
  const [pending, setPending] = useState<QrFormat | null>(null);
  const [attempt, setAttempt] = useState(0);

  const refused = useCallback(
    (caught: unknown) => {
      handleError(caught);
      const blocked = qrPaidBlock(caught, localBlock);
      if (blocked) {
        setServerBlock(blocked);
        setError(null);
      } else {
        setError(describeProblem(caught, strings.errors, t.error));
      }
    },
    [handleError, localBlock, strings.errors, t.error],
  );

  /*
    The preview, and the PNG download's payload: the same bytes serve both, so
    saving a PNG after looking at one costs no second request.

    The object URL is created here and revoked in the cleanup below — the only
    place it is revoked. Revoking it anywhere else as well would double-free a
    handle this effect is about to replace, and leaving it out would leak one
    decoded image per visit to this screen, which for a client flipping between
    card languages is a leak per click.
  */
  useEffect(() => {
    if (localBlock) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    let created: string | null = null;

    setLoading(true);
    setError(null);
    setServerBlock(null);
    setPreview(null);

    fetchSiteQr(token, siteId, "png", cardLang)
      .then(({ blob, filename }) => {
        if (cancelled) return;
        created = URL.createObjectURL(blob);
        setPreview({ url: created, blob, name: filename });
        setLoading(false);
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        refused(caught);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [token, siteId, cardLang, attempt, localBlock, refused]);

  function save(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Revoked on the next tick rather than immediately: a handle freed in the
    // same task as the click can cancel the save before the browser has read
    // the blob, which fails silently and looks like a dead button.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function download(format: QrFormat) {
    setPending(format);
    setError(null);
    try {
      if (format === "png" && preview) {
        save(preview.blob, preview.name ?? qrFilename(active.slug, "png"));
        return;
      }
      const { blob, filename } = await fetchSiteQr(
        token,
        siteId,
        format,
        cardLang,
      );
      save(blob, filename ?? qrFilename(active.slug, format));
    } catch (caught) {
      refused(caught);
    } finally {
      setPending(null);
    }
  }

  const blocked = localBlock ?? serverBlock;
  const waiting = hostname(detail.data);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          {t.title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-600">{t.subtitle}</p>
      </div>

      {blocked ? (
        <Locked block={blocked} copy={t.locked[blocked]} siteId={siteId} />
      ) : (
        <section className="rounded-3xl border border-ink-100 bg-surface p-6 sm:p-7">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
            <div>
              {loading ? (
                <div
                  role="status"
                  aria-label={t.preparing}
                  className="aspect-[3/4] w-full animate-pulse rounded-2xl border border-ink-100 bg-sunken"
                />
              ) : preview ? (
                <img
                  src={preview.url}
                  alt={t.previewAlt(active.businessName)}
                  className="w-full rounded-2xl border border-ink-100 bg-white shadow-sm"
                />
              ) : (
                <div className="aspect-[3/4] w-full rounded-2xl border border-dashed border-ink-200 bg-sunken" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => void download("pdf")}
                    disabled={loading || pending !== null}
                    className="btn-primary w-full disabled:opacity-60 sm:w-auto"
                  >
                    {pending === "pdf" ? t.preparing : t.downloadPdf}
                  </button>
                  <p className="mt-2 max-w-xs text-xs text-ink-500">
                    {t.downloadPdfHint}
                  </p>
                </div>
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => void download("png")}
                    disabled={loading || pending !== null}
                    className="btn-secondary w-full disabled:opacity-60 sm:w-auto"
                  >
                    {pending === "png" ? t.preparing : t.downloadPng}
                  </button>
                  <p className="mt-2 max-w-xs text-xs text-ink-500">
                    {t.downloadPngHint}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-5">
                  <p role="alert" className="text-sm font-semibold text-danger">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => setAttempt((value) => value + 1)}
                    className="mt-2 text-sm font-semibold text-tint-fg hover:underline"
                  >
                    {strings.retry}
                  </button>
                </div>
              )}

              {waiting && (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-900">
                    {t.pendingDomain(waiting)}
                  </p>
                </div>
              )}

              <div className="mt-7 border-t border-ink-100 pt-5">
                <p className="text-sm font-semibold text-ink-900">
                  {t.cardLanguage}
                </p>
                <p className="mt-1 max-w-md text-xs text-ink-500">
                  {t.cardLanguageHint}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SITE_LANGUAGES.map((option) => {
                    const chosen =
                      (cardLang ?? active.defaultLanguage ?? "ka") === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={chosen}
                        disabled={loading || pending !== null}
                        onClick={() => setCardLang(option)}
                        className={`rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                          chosen
                            ? "border-bloom-300 bg-tint text-tint-fg"
                            : "border-ink-100 bg-control text-ink-600 hover:border-bloom-300 hover:text-bloom-600"
                        }`}
                      >
                        {t.languages[option]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="mt-6 text-xs text-ink-400">{t.printHint}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function hostname(detail: SiteDetail | null | undefined) {
  return detail ? pendingDomain(detail.domains) : undefined;
}

/**
 * What a client sees instead of the card when their plan does not include it.
 *
 * The link is owner-only for the same reason it is on the forms panel: sending
 * an editor to billing turns a plan problem into what reads as a permissions
 * problem with the card. The explanation stays either way — an editor still
 * learns why the card is not there, and who to ask.
 */
function Locked({
  block,
  copy,
  siteId,
}: {
  block: PaidBlock;
  copy: { title: string; body: string; action: string };
  siteId: string;
}) {
  const isOwner = useIsOwner();
  return (
    <section
      data-testid={`qr-locked-${block}`}
      className="rounded-3xl border border-ink-100 bg-surface p-6 sm:p-7"
    >
      <p className="text-base font-bold text-ink-900">{copy.title}</p>
      <p className="mt-2 max-w-2xl text-sm text-ink-600">{copy.body}</p>
      {isOwner && (
        <Link
          to={dashPath(`/s/${siteId}/billing`)}
          className="btn-primary mt-5 inline-flex"
        >
          {copy.action}
        </Link>
      )}
    </section>
  );
}
