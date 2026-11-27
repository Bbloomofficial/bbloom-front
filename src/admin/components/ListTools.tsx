import type { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { useI18n } from "../../i18n";
import { adminStrings } from "../strings";
import type { SortDirection } from "../listTools";

/**
 * The shared pieces of every admin list: search, filters, sortable headers and
 * paging, all kept in the address so a filtered view can be bookmarked or sent
 * to a colleague, and survives going into a row and coming back.
 */

export type ListParams<F extends string, S extends string> = {
  query: string;
  sort: S;
  direction: SortDirection;
  page: number;
  filters: Record<F, string>;
  /** Changes some parameters. Any change but paging returns to page one. */
  update: (changes: Partial<Record<F | "q" | "sort" | "dir" | "page", string | null>>) => void;
  /** A header click: the same column flips, a new one starts at `first`. */
  sortBy: (column: S, first: SortDirection) => void;
  setPage: (page: number) => void;
  /** Whether a search or any filter narrows the list. */
  narrowed: boolean;
  clear: () => void;
};

export function useListParams<F extends string, S extends string>(
  filterKeys: readonly F[],
  sortKeys: readonly S[],
  defaults: { sort: S; direction: SortDirection },
): ListParams<F, S> {
  const [params, setParams] = useSearchParams();

  const rawSort = params.get("sort") as S | null;
  const sort = rawSort && sortKeys.includes(rawSort) ? rawSort : defaults.sort;
  const rawDir = params.get("dir");
  const direction: SortDirection =
    rawDir === "asc" || rawDir === "desc" ? rawDir : defaults.direction;
  const page = Math.max(Number.parseInt(params.get("page") ?? "1", 10) - 1, 0) || 0;
  const query = params.get("q") ?? "";
  const filters = Object.fromEntries(
    filterKeys.map((key) => [key, params.get(key) ?? ""]),
  ) as Record<F, string>;

  function update(changes: Partial<Record<string, string | null>>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!("page" in changes)) next.delete("page");
    setParams(next, { replace: true });
  }

  return {
    query,
    sort,
    direction,
    page,
    filters,
    update,
    sortBy(column, first) {
      const dir =
        column === sort ? (direction === "asc" ? "desc" : "asc") : first;
      update({ sort: column, dir });
    },
    setPage(value) {
      update({ page: value > 0 ? String(value + 1) : null });
    },
    narrowed: Boolean(query) || filterKeys.some((key) => Boolean(filters[key])),
    clear() {
      update(
        Object.fromEntries([["q", null], ...filterKeys.map((key) => [key, null])]),
      );
    },
  };
}

/** The bar above a list: search first, then filters, then the count. */
export function ListToolbar({
  query,
  onQuery,
  placeholder,
  children,
  shown,
  total,
  narrowed,
  onClear,
}: {
  query: string;
  onQuery: (value: string) => void;
  placeholder: string;
  children?: ReactNode;
  shown: number;
  total: number;
  narrowed: boolean;
  onClear: () => void;
}) {
  const { locale } = useI18n();
  const t = adminStrings(locale).list;
  return (
    <div className="mt-6 flex flex-wrap items-end gap-3">
      <label className="min-w-60 flex-1 text-sm">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400">
          {t.search}
        </span>
        <input
          autoComplete="off"
          type="search"
          className="field w-full"
          placeholder={placeholder}
          value={query}
          onChange={(event) => onQuery(event.target.value)}
        />
      </label>
      {children}
      <div className="flex items-center gap-3 pb-2.5 text-sm">
        <span className="whitespace-nowrap text-ink-400">{t.results(shown, total)}</span>
        {narrowed && (
          <button
            type="button"
            onClick={onClear}
            className="whitespace-nowrap font-semibold text-tint-fg hover:underline"
          >
            {t.clear}
          </button>
        )}
      </div>
    </div>
  );
}

export type Option = { value: string; label: string };

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}) {
  const { locale } = useI18n();
  const t = adminStrings(locale).list;
  return (
    <label className="text-sm">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field"
      >
        <option value="">{t.all}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** A header cell that sorts its column. */
export function SortTh<S extends string>({
  column,
  label,
  list,
  first = "asc",
  className = "",
}: {
  column: S;
  label: string;
  list: { sort: S; direction: SortDirection; sortBy: (c: S, f: SortDirection) => void };
  /** Which way a fresh click starts: A→Z for words, largest first for figures. */
  first?: SortDirection;
  className?: string;
}) {
  const active = list.sort === column;
  return (
    <th
      aria-sort={
        active ? (list.direction === "asc" ? "ascending" : "descending") : "none"
      }
      className={`px-5 py-3 text-start font-semibold ${className}`}
    >
      <button
        type="button"
        onClick={() => list.sortBy(column, first)}
        className={`inline-flex items-center gap-1 uppercase tracking-wide hover:text-ink-900 ${
          active ? "text-ink-900" : ""
        }`}
      >
        {label}
        <span aria-hidden className="text-[10px]">
          {active ? (list.direction === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}

export function Pager({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (page: number) => void;
}) {
  const { locale } = useI18n();
  const t = adminStrings(locale).list;
  if (pages <= 1) return null;
  return (
    <div className="mt-5 flex items-center justify-between gap-3">
      <button
        type="button"
        className="btn-secondary disabled:opacity-50"
        disabled={page === 0}
        onClick={() => onPage(page - 1)}
      >
        {t.prev}
      </button>
      <span className="text-sm text-ink-400">{t.page(page + 1, pages)}</span>
      <button
        type="button"
        className="btn-secondary disabled:opacity-50"
        disabled={page >= pages - 1}
        onClick={() => onPage(page + 1)}
      >
        {t.next}
      </button>
    </div>
  );
}
