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
