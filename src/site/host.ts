/**
 * Decides whether the current hostname belongs to a client website rather than
 * the marketing site. Kept apart from the renderer so `App` can check it without
 * pulling the whole site bundle in.
 */
export function resolveSiteHost(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname.toLowerCase();

  const configured = (import.meta.env.VITE_SITE_HOSTS ?? "")
    .split(",")
    .map((value: string) => value.trim().toLowerCase())
    .filter(Boolean);
  if (configured.includes(host)) return host;

  if (host.endsWith(".bbloom.co")) {
    const label = host.slice(0, -".bbloom.co".length);
    if (label && label !== "www" && label !== "app" && label !== "api")
      return host;
  }
  return null;
}
