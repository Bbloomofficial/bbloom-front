/**
 * Decides whether the current hostname belongs to a client website rather than
 * the marketing site. Kept apart from the renderer so `App` can check it without
 * pulling the whole site bundle in.
 *
 * The rule is deliberately inverted: anything that is not recognisably one of
 * *our* hostnames is treated as a client site, and the backend's
 * /public/sites/by-host decides whether it actually exists (a miss renders the
 * "site not found" page). Listing client domains at build time instead would
 * mean rebuilding and redeploying both surfaces every time a client points a
 * new domain at us, which is the one thing this product does routinely.
 *
 * Nothing arbitrary reaches this code anyway: Caddy only completes a TLS
 * handshake for hostnames the API has already vouched for.
 */

/** Hosts that are never a client site, whatever the base domain is. */
const DEV_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"]);

/**
 * Labels under the base domain that belong to us rather than to a client.
 *
 * `admin` and `panel` serve our two signed-in apps (see `src/routes.ts`); the
 * rest are infrastructure. A client site must never be able to claim one, or
 * it would take over a surface that visitors read as bbloom speaking. The
 * backend refuses these as slugs now, but sites created before it did are
 * still out there, so this list is the one that has to hold.
 */
const RESERVED_LABELS = new Set(["www", "app", "api", "admin", "panel"]);

function hostList(value: unknown): string[] {
  return String(value ?? "")
    .split(",")
    .map((entry: string) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveSiteHost(): string | null {
  if (typeof window === "undefined") return null;
  // A trailing dot is a legal absolute-FQDN form and would break every compare.
  const host = window.location.hostname.toLowerCase().replace(/\.$/, "");

  // An explicit list still wins, so a single host can be forced during dev.
  if (hostList(import.meta.env.VITE_SITE_HOSTS).includes(host)) return host;

  if (DEV_HOSTS.has(host) || host.endsWith(".local")) return null;
  // Vercel preview deployments serve the marketing site, not a client's.
  if (host.endsWith(".vercel.app")) return null;

  const base = String(import.meta.env.VITE_BASE_DOMAIN ?? "bbloom.ge")
    .trim()
    .toLowerCase();
  const marketing = hostList(import.meta.env.VITE_MARKETING_HOSTS);
  if (marketing.includes(host)) return null;
  if (host === base) return null;

  if (host.endsWith(`.${base}`)) {
    const label = host.slice(0, -(base.length + 1));
    return label && !RESERVED_LABELS.has(label) ? host : null;
  }

  // An unrecognised domain reached us because someone pointed DNS here on
  // purpose, so ask the backend rather than showing them our marketing site.
  return host;
}
