import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../../api/http";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { deleteSite } from "../api/client";
import type { SiteDetail } from "../api/types";
import { adminStrings } from "../strings";

/**
 * Deleting a site takes its content, its client accounts and its stored images
 * with it, so the slug has to be typed out — no one does that by accident.
 */
export default function DangerZone({ site }: { site: SiteDetail }) {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { token } = useSession();
  const navigate = useNavigate();

  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const armed = confirmation.trim() === site.slug;

  async function onDelete() {
    if (!armed || busy) return;
    setBusy(true);
    setError(null);
    try {
      await deleteSite(token, site.id);
      navigate("/admin", { replace: true });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : String(caught));
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-danger/30 bg-surface p-6 sm:p-7">
      <h2 className="text-lg font-bold text-danger">{t.detail.danger}</h2>
      <p className="mt-1 text-sm text-ink-600">{t.detail.dangerHint}</p>

      <div className="mt-5 max-w-sm">
        <label className="label" htmlFor="delete-confirm">
          {t.detail.deleteConfirm(site.slug)}
        </label>
        <input
          id="delete-confirm"
          className="field"
          dir="ltr"
          autoComplete="off"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-danger">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onDelete}
        disabled={!armed || busy}
        className="btn mt-5 bg-danger text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? t.detail.deleting : t.detail.deleteSite}
      </button>
    </section>
  );
}
