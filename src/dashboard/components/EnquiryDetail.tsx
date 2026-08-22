import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { updateEnquiry } from "../api/client";
import { ENQUIRY_STATUSES } from "../api/types";
import type { Enquiry } from "../api/types";
import { dashboardStrings, formatDate, formatDateTime } from "../strings";
import { StatusBadge, TypeBadge } from "./Badges";
import { useActiveSite } from "../site";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </p>
      <div className="mt-1 text-sm text-ink-800">{children}</div>
    </div>
  );
}

function humanKey(key: string) {
  const spaced = key.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export default function EnquiryDetail({
  enquiry,
  onChange,
  onClose,
}: {
  enquiry: Enquiry;
  onChange: (updated: Enquiry) => void;
  onClose: () => void;
}) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { token, handleError } = useSession();
  const site = useActiveSite();

  const [note, setNote] = useState(enquiry.internalNote ?? "");
  const [saving, setSaving] = useState<"status" | "note" | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The row carries both languages, so the product reads in the owner's own.
  const productName =
    (locale === "en" ? enquiry.productNameEn : enquiry.productNameKa) ??
    enquiry.productName;
  const root = useRef<HTMLDivElement>(null);

  // On narrow screens the detail sits below the list, so bring it into view.
  useEffect(() => {
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    root.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [enquiry.id]);

  useEffect(() => {
    setNote(enquiry.internalNote ?? "");
    setSaved(false);
    setError(null);
  }, [enquiry.id]);

  async function patch(
    changes: { status?: string; internalNote?: string },
    kind: "status" | "note",
  ) {
    setSaving(kind);
    setError(null);
    try {
      const updated = await updateEnquiry(
        token,
        site.id,
        enquiry.id,
        changes,
      );
      onChange(updated);
      if (kind === "note") setSaved(true);
    } catch (caught) {
      handleError(caught);
      setError((caught as Error).message);
    } finally {
      setSaving(null);
    }
  }

  const metadata = Object.entries(enquiry.metadata ?? {}).filter(
    ([, value]) => value !== null && value !== "",
  );

  return (
    <div ref={root} className="space-y-6 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={enquiry.type} />
            <StatusBadge status={enquiry.status} />
          </div>
          <h2 className="mt-3 truncate text-xl font-extrabold tracking-tight text-ink-900">
            {enquiry.name ?? enquiry.email ?? t.types[enquiry.type] ?? enquiry.type}
          </h2>
          <p className="mt-1 text-xs text-ink-400">
            {t.detail.received} · {formatDateTime(enquiry.createdAt, locale)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="icon-button shrink-0 lg:hidden"
          aria-label={t.detail.close}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      {(enquiry.email || enquiry.phone) && (
        <Field label={t.detail.contact}>
          <div className="flex flex-wrap items-center gap-3" dir="ltr">
            {enquiry.email && (
              <a
                href={`mailto:${enquiry.email}`}
                className="font-semibold text-tint-fg hover:underline"
              >
                {enquiry.email}
              </a>
            )}
            {enquiry.phone && (
              <a
                href={`tel:${enquiry.phone.replace(/\s+/g, "")}`}
                className="font-semibold text-tint-fg hover:underline"
              >
                {enquiry.phone}
              </a>
            )}
          </div>
        </Field>
      )}

      {productName && <Field label={t.detail.product}>{productName}</Field>}

      {(enquiry.reservationDate || enquiry.partySize) && (
        <Field label={t.detail.reservation}>
          <div className="rounded-2xl bg-tint px-4 py-3 font-semibold text-tint-fg">
            {[
              formatDate(enquiry.reservationDate, locale),
              enquiry.reservationTime?.slice(0, 5),
              enquiry.partySize ? t.detail.partySize(enquiry.partySize) : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </Field>
      )}

      {(enquiry.subject || enquiry.message) && (
        <Field label={t.detail.message}>
          {enquiry.subject && (
            <p className="font-semibold text-ink-900">{enquiry.subject}</p>
          )}
          {enquiry.message && (
            <p className="mt-1 whitespace-pre-wrap text-ink-600">
              {enquiry.message}
            </p>
          )}
        </Field>
      )}

      {metadata.length > 0 && (
        <Field label={t.detail.details}>
          <dl className="grid gap-1.5">
            {metadata.map(([key, value]) => (
              <div key={key} className="flex gap-3">
                <dt className="w-32 shrink-0 text-ink-400">{humanKey(key)}</dt>
                <dd className="min-w-0 break-words">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </Field>
      )}

      <div className="border-t border-ink-100 pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          {t.detail.status}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ENQUIRY_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              disabled={saving === "status" || status === enquiry.status}
              onClick={() => void patch({ status }, "status")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                status === enquiry.status
                  ? "bg-bloom-600 text-white"
                  : "border border-ink-100 bg-surface text-ink-600 hover:border-bloom-300 hover:text-bloom-600"
              } disabled:opacity-60`}
            >
              {t.statuses[status]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="enquiry-note">
          {t.detail.note}
        </label>
        <textarea
          id="enquiry-note"
          rows={3}
          className="field resize-y"
          placeholder={t.detail.notePlaceholder}
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
            setSaved(false);
          }}
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            className="btn-secondary disabled:opacity-60"
            disabled={saving === "note" || note === (enquiry.internalNote ?? "")}
            onClick={() => void patch({ internalNote: note }, "note")}
          >
            {saving === "note" ? t.detail.saving : t.detail.save}
          </button>
          {saved && (
            <span className="text-xs font-semibold text-success">
              {t.detail.saved}
            </span>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm font-semibold text-danger">
          {error}
        </p>
      )}

      {enquiry.email && (
        <a
          href={`mailto:${enquiry.email}?subject=${encodeURIComponent(
            enquiry.subject ?? site.businessName,
          )}`}
          className="btn-primary w-full"
        >
          {t.detail.reply}
        </a>
      )}
    </div>
  );
}
