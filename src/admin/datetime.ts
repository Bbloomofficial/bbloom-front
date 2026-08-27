/**
 * Conversion between the API's ISO instants and what `<input type="datetime-local">`
 * reads and writes.
 *
 * The input speaks `YYYY-MM-DDTHH:mm` with no zone, meaning *the browser's* local
 * time — the timezone of whoever is typing. The API speaks instants. Handing one
 * to the other unchanged is the classic way to schedule a sale four hours off,
 * which nobody notices until it starts at the wrong time.
 *
 * A sale is judged against the clock on the server, so this cannot be avoided by
 * being vague: staff mean "8pm here", and that has to become a real moment.
 */

/** An API instant as the local wall-clock time the input wants. */
export function toLocalInput(iso: string | undefined): string {
  if (!iso) return "";
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  // Built from the local getters rather than `toISOString()`, which would hand
  // back UTC and shift the displayed time by the reader's offset.
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}` +
    `T${pad(at.getHours())}:${pad(at.getMinutes())}`
  );
}

/**
 * A local wall-clock time as an API instant. Empty in, `undefined` out — the
 * absence of a bound is meaningful to the API ("already on", "until stopped"),
 * so it must be omitted rather than sent as an empty string.
 */
export function fromLocalInput(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const at = new Date(trimmed);
  if (Number.isNaN(at.getTime())) return undefined;
  return at.toISOString();
}

/** An API instant as something to read, in the reader's own timezone. */
export function formatInstant(iso: string | undefined, locale: string): string {
  if (!iso) return "";
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(at);
}

/* -------------------------------------------------------------------------
 * Whole days.
 *
 * Nobody schedules a sale to the minute. They say "runs to the end of the
 * month", and being made to answer 2:00 PM to say so is the native
 * `datetime-local` picker's whole problem: a calendar with two spinning time
 * columns beside it, for a decision that has no time in it.
 *
 * So the fields ask for a day and this does the arithmetic. A start is local
 * midnight of the day named. An end is local midnight of the day *after* the
 * one named, because the API's bound is exclusive and "ends on the 30th"
 * plainly includes the 30th. Getting that backwards silently shortens every
 * sale by a day.
 * ------------------------------------------------------------------------- */

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function localDay(at: Date): string {
  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`;
}

/** An API instant as the day it falls on, for a start bound. */
export function toDateInput(iso: string | undefined): string {
  if (!iso) return "";
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  return localDay(at);
}

/**
 * An API instant as the last day it *includes*, for an exclusive end bound.
 *
 * A moment before the boundary, so an end of 1 October 00:00 reads back as
 * 30 September — the day staff typed, rather than the day after it.
 */
export function toEndDateInput(iso: string | undefined): string {
  if (!iso) return "";
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  return localDay(new Date(at.getTime() - 1));
}

function parseDay(value: string): Date | null {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const [year, month, day] = trimmed.split("-").map(Number);
  // Built through the local constructor rather than `new Date("2026-09-30")`,
  // which the spec parses as UTC midnight and would shift the day for anyone
  // east or west of Greenwich.
  const at = new Date(year, month - 1, day);
  return Number.isNaN(at.getTime()) ? null : at;
}

/** A named day as the instant it begins, locally. */
export function fromStartOfDay(value: string): string | undefined {
  const at = parseDay(value);
  return at ? at.toISOString() : undefined;
}

/** A named day as the instant it *ends* — midnight at the start of the next. */
export function fromEndOfDay(value: string): string | undefined {
  const at = parseDay(value);
  if (!at) return undefined;
  at.setDate(at.getDate() + 1);
  return at.toISOString();
}

/** An API instant as a plain day, for reading back. */
export function formatDay(iso: string | undefined, locale: string): string {
  if (!iso) return "";
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    dateStyle: "medium",
  }).format(at);
}

/** An exclusive end instant as the last day it includes. */
export function formatEndDay(iso: string | undefined, locale: string): string {
  if (!iso) return "";
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  return formatDay(new Date(at.getTime() - 1).toISOString(), locale);
}
