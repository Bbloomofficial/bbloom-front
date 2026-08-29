import { useEffect, useState } from "react";
import { describeProblem } from "../../api/problem";
import { useSession } from "../auth";
import { updateSiteSettings } from "../api/client";
import type { SiteDetail, SiteLanguage } from "../api/types";
import type { EditorStrings } from "./strings";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-ink-100 bg-sunken px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-bloom-400 focus:ring-2 focus:ring-bloom-200";

/**
 * The address the map is drawn from, edited where the client is actually
 * working.
 *
 * Every template shows the business on a map — `contact` sections do it
 * directly, restaurant-classic does it beside its opening hours — and all of
 * them read the same site-level `contact.address`/`mapUrl`. Those two fields
 * only existed on a dashboard settings page, so the one screen where a client
 * edits their page could not fix the one thing that makes the map appear.
 *
 * It saves on its own rather than through the section draft: site settings are
 * not part of the draft/publish cycle on the server, so folding this into
 * `save()` would let a client press Publish expecting their address to go live
 * with everything else when it went live the moment they typed it. The copy
 * says so instead of pretending otherwise.
 */
export function LocationPanel({
  site,
  lang,
  t,
  onSaved,
}: {
  site: SiteDetail;
  lang: SiteLanguage;
  t: EditorStrings;
  onSaved: () => void;
}) {
  const { token, handleError } = useSession();

  const [address, setAddress] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /*
    The address is stored per language, so switching the content language
    swaps which one is on screen. No fallback to the other language: showing
    the Georgian address in an English field and then saving it would quietly
    copy it into `contactAddressEn`.
  */
  useEffect(() => {
    setAddress(
      (lang === "en" ? site.contactAddressEn : site.contactAddressKa) ?? "",
    );
    setMapUrl(site.mapUrl ?? "");
    setDirty(false);
    setError(null);
  }, [site, lang]);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      await updateSiteSettings(token, site.id, {
        [lang === "en" ? "contactAddressEn" : "contactAddressKa"]:
          address.trim() || null,
        mapUrl: mapUrl.trim() || null,
      });
      setDirty(false);
      setSavedAt(Date.now());
      onSaved();
    } catch (cause) {
      handleError(cause);
      setError(describeProblem(cause, t.errors, t.locationSaveFailed));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-ink-100 bg-sunken p-4">
      <h3 className="text-sm font-bold text-ink-900">{t.locationTitle}</h3>
      <p className="mt-1 text-xs text-ink-400">{t.locationHint}</p>

      <label className="mt-3 block">
        <span className="text-xs font-semibold text-ink-500">
          {t.locationAddress}
        </span>
        <input
          className={inputClass}
          value={address}
          onChange={(event) => {
            setAddress(event.target.value);
            setDirty(true);
          }}
        />
      </label>

      <label className="mt-3 block">
        <span className="text-xs font-semibold text-ink-500">
          {t.locationMapUrl}
        </span>
        <input
          className={inputClass}
          value={mapUrl}
          dir="ltr"
          placeholder="https://maps.google.com/…"
          onChange={(event) => {
            setMapUrl(event.target.value);
            setDirty(true);
          }}
        />
        <span className="mt-1 block text-xs text-ink-400">
          {t.locationMapHint}
        </span>
      </label>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={!dirty || saving}
          className="inline-flex min-h-11 items-center rounded-xl border border-ink-100 bg-surface px-3 py-2 text-sm font-semibold text-ink-900 transition hover:border-bloom-300 hover:text-bloom-600 active:scale-95 disabled:opacity-40 lg:min-h-0"
        >
          {saving ? t.saving : t.save}
        </button>
        <span className="text-xs text-ink-400">
          {dirty ? t.unsaved : savedAt ? t.saved : ""}
        </span>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-xs font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </section>
  );
}
