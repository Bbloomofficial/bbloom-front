/*
  The pure half of the admin list screens: search, sort and paging over rows
  already in memory.

  Every list in the staff panel is small enough to load whole (sites, accounts,
  plans, codes, campaigns), and loading it whole is what lets one search box
  match on anything, any column sort, and the count above the table describe
  the rows under it. The endpoints that page do so 200 at a time here.
*/

/** A value a column sorts by. `null` and `undefined` mean "nothing to compare". */
export type SortValue = string | number | boolean | null | undefined;

export type SortDirection = "asc" | "desc";

/** Lower-cased, trimmed and without combining marks, for matching. */
function fold(value: string): string {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

/**
 * Whether every word of the query appears somewhere in the fields. Word by word
 * rather than as one phrase, so "cafe tbilisi" finds a site called "Cafe" on
 * `tbilisi.bbloom.ge`.
 */
export function matchesQuery(
  fields: Array<string | number | null | undefined>,
  query: string,
): boolean {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = fold(fields.filter((f) => f !== null && f !== undefined).join(" "));
  return words.every((word) => haystack.includes(word));
}

/**
 * Sorted by one value. Rows with no value go last in both directions: an
 * account that has never signed in is not the oldest sign-in, and putting it
 * first on an ascending sort buries the rows somebody was looking for.
 */
export function sortRows<T>(
  rows: readonly T[],
  value: (row: T) => SortValue,
  direction: SortDirection,
  locale = "en",
): T[] {
  const sign = direction === "asc" ? 1 : -1;
  const collator = new Intl.Collator(locale === "ka" ? "ka" : "en", {
    numeric: true,
    sensitivity: "base",
  });
  return [...rows].sort((left, right) => {
    const a = value(left);
    const b = value(right);
    const aMissing = a === null || a === undefined || a === "";
    const bMissing = b === null || b === undefined || b === "";
    if (aMissing && bMissing) return 0;
    if (aMissing) return 1;
    if (bMissing) return -1;
    if (typeof a === "string" && typeof b === "string") {
      return sign * collator.compare(a, b);
    }
    return sign * (Number(a) - Number(b));
  });
}

/** An ISO instant as a number for sorting, or `null` when it does not parse. */
export function instant(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

/** One page of rows, with the page clamped into range. */
export function pageOf<T>(rows: readonly T[], page: number, size: number) {
  const pages = Math.max(Math.ceil(rows.length / size), 1);
  const current = Math.min(Math.max(page, 0), pages - 1);
  return {
    rows: rows.slice(current * size, (current + 1) * size),
    page: current,
    pages,
  };
}

type Paged<T> = { items: T[]; hasNext: boolean };

/**
 * Every page of a paged endpoint, 200 at a time. Stops at a safety limit well
 * past anything these lists hold, rather than looping forever on a server that
 * always says there is more.
 */
export async function loadAllPages<T>(
  fetchPage: (page: number, size: number) => Promise<Paged<T>>,
  size = 200,
  maxPages = 50,
): Promise<T[]> {
  const rows: T[] = [];
  for (let page = 0; page < maxPages; page += 1) {
    const result = await fetchPage(page, size);
    rows.push(...result.items);
    if (!result.hasNext) break;
  }
  return rows;
}
