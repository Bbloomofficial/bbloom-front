import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { fetchEnquiries } from "../api/client";
import { ENQUIRY_STATUSES, ENQUIRY_TYPES } from "../api/types";
import type { Enquiry } from "../api/types";
import { useResource } from "../hooks";
import { dashboardStrings, formatDateTime } from "../strings";
import { StatusBadge, TypeBadge } from "../components/Badges";
import EnquiryDetail from "../components/EnquiryDetail";

const PAGE_SIZE = 20;

function FilterPills({
  label,
  options,
  value,
  onChange,
  labels,
  allLabel,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
  labels: Record<string, string>;
  allLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </span>
      {["", ...options].map((option) => (
        <button
          key={option || "all"}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            option === value
              ? "bg-ink-900 text-canvas"
              : "border border-ink-100 bg-surface text-ink-600 hover:border-bloom-300 hover:text-bloom-600"
          }`}
        >
          {option ? (labels[option] ?? option) : allLabel}
        </button>
      ))}
    </div>
  );
}

export default function Inbox() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { token, user } = useSession();

  // Filters live in the URL so the overview can deep-link into a filtered view
  // and a client can bookmark or share one.
  const [params, setParams] = useSearchParams();
  const type = params.get("type") ?? "";
  const status = params.get("status") ?? "";
  const page = Math.max(0, Number(params.get("page") ?? "0") || 0);
  const selectedId = params.get("selected");

  const list = useResource(
    () =>
      fetchEnquiries(token, user.siteId, {
        type: type || undefined,
        status: status || undefined,
        page,
        size: PAGE_SIZE,
      }),
    [token, user.siteId, type, status, page],
  );

  // Patched rows are kept locally so the list reflects a status change without
  // a refetch that could reshuffle the page under the client.
  const [patched, setPatched] = useState<Record<string, Enquiry>>({});
  useEffect(() => setPatched({}), [type, status, page]);

  const items = useMemo(
    () => (list.data?.items ?? []).map((item) => patched[item.id] ?? item),
    [list.data, patched],
  );

  const selected = items.find((item) => item.id === selectedId) ?? null;

  const update = useCallback((next: Partial<Record<string, string>>) => {
    setParams(
      (current) => {
        const draft = new URLSearchParams(current);
        for (const [key, value] of Object.entries(next)) {
          if (value) draft.set(key, value);
          else draft.delete(key);
        }
        return draft;
      },
      { replace: true },
    );
  }, [setParams]);

  const totalPages = list.data?.totalPages ?? 1;
  const filtered = Boolean(type || status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {t.inbox.title}
          </h1>
          <p className="mt-1 text-sm text-ink-600">{t.inbox.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={list.reload}
          className="btn-secondary"
          disabled={list.loading}
        >
          {t.inbox.refresh}
        </button>
      </div>

      <div className="space-y-3 rounded-3xl border border-ink-100 bg-surface p-4 sm:p-5">
        <FilterPills
          label={t.inbox.type}
          options={ENQUIRY_TYPES}
          value={type}
          onChange={(next) => update({ type: next, page: "", selected: "" })}
          labels={t.types}
          allLabel={t.inbox.all}
        />
        <FilterPills
          label={t.inbox.status}
          options={ENQUIRY_STATUSES}
          value={status}
          onChange={(next) => update({ status: next, page: "", selected: "" })}
          labels={t.statuses}
          allLabel={t.inbox.all}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-ink-100 bg-surface">
            {list.loading && !list.data ? (
              <p className="p-6 text-sm text-ink-400">{t.loading}</p>
            ) : list.error ? (
              <div className="p-6">
                <p className="text-sm font-semibold text-danger">
                  {list.error.message}
                </p>
                <button
                  type="button"
                  onClick={list.reload}
                  className="btn-secondary mt-4"
                >
                  {t.retry}
                </button>
              </div>
            ) : items.length === 0 ? (
              <p className="p-6 text-sm text-ink-400">
                {filtered ? t.inbox.emptyFiltered : t.inbox.empty}
              </p>
            ) : (
              <ul>
                {items.map((enquiry) => {
                  const active = enquiry.id === selectedId;
                  return (
                    <li
                      key={enquiry.id}
                      className="border-t border-ink-100 first:border-0"
                    >
                      <button
                        type="button"
                        onClick={() => update({ selected: enquiry.id })}
                        className={`flex w-full flex-wrap items-center gap-3 px-5 py-4 text-start transition ${
                          active ? "bg-tint" : "hover:bg-ink-50"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            enquiry.status === "NEW"
                              ? "bg-bloom-500"
                              : "bg-transparent"
                          }`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink-900">
                            {enquiry.name ??
                              enquiry.email ??
                              t.types[enquiry.type] ??
                              enquiry.type}
                          </span>
                          <span className="block truncate text-xs text-ink-400">
                            {enquiry.subject ??
                              enquiry.message ??
                              (enquiry.name ? enquiry.email : "")}
                          </span>
                        </span>
                        <TypeBadge type={enquiry.type} />
                        <StatusBadge status={enquiry.status} />
                        <span className="w-full text-xs text-ink-400 sm:w-auto">
                          {formatDateTime(enquiry.createdAt, locale)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {list.data && list.data.totalItems > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="text-ink-400">
                {t.inbox.results(list.data.totalItems)}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-secondary disabled:opacity-50"
                    disabled={page === 0}
                    onClick={() =>
                      update({ page: String(page - 1), selected: "" })
                    }
                  >
                    {t.inbox.prev}
                  </button>
                  <span className="text-ink-600">
                    {t.inbox.page(page + 1, totalPages)}
                  </span>
                  <button
                    type="button"
                    className="btn-secondary disabled:opacity-50"
                    disabled={!list.data.hasNext}
                    onClick={() =>
                      update({ page: String(page + 1), selected: "" })
                    }
                  >
                    {t.inbox.next}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-ink-100 bg-surface">
            {selected ? (
              <EnquiryDetail
                key={selected.id}
                enquiry={selected}
                onChange={(updated) =>
                  setPatched((current) => ({
                    ...current,
                    [updated.id]: updated,
                  }))
                }
                onClose={() => update({ selected: "" })}
              />
            ) : (
              <p className="p-6 text-sm text-ink-400">{t.inbox.select}</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
