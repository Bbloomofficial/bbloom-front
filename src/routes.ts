/**
 * Where the two signed-in apps live, which is no longer a constant.
 *
 * The staff panel and the client dashboard each have their own hostname —
 * `admin.bbloom.ge` and `panel.bbloom.ge` — where they are served from the
 * root. On the marketing domain they stay on their old paths, `/admin` and
 * `/dashboard`, so existing links and bookmarks keep working.
 *
 * Every internal link is therefore built from these helpers rather than
 * written out, because the same `<Link>` has to render `/dashboard/s/1` on one
 * hostname and `/s/1` on another. Hard-coding either spelling would break the
 * other.
 *
 * The host is read once. It cannot change without a page load, and reading it
 * per render would invite a link that disagrees with the route it was matched
 * against.
 */

/** Which of our own apps owns this hostname, if any. */
export type AppHost = "admin" | "panel" | null;

/**
 * The label each app answers to, directly under the base domain.
 *
 * These are matched *exactly*. Every client website is served from this same
 * bundle on its own subdomain, so a substring test — `host.includes("admin")`
 * — would hand a client called `admin-supplies` our staff panel instead of
 * their website. The backend now refuses these as slugs for the same reason,
 * but a client site that already existed must not depend on that.
 */
const APP_LABELS: Record<string, Exclude<AppHost, null>> = {
  admin: "admin",
  panel: "panel",
};

function baseDomain(): string {
  return String(import.meta.env.VITE_BASE_DOMAIN ?? "bbloom.ge")
    .trim()
    .toLowerCase();
}

export function resolveAppHost(): AppHost {
  if (typeof window === "undefined") return null;
  // A trailing dot is a legal absolute-FQDN form and would break every compare.
  const host = window.location.hostname.toLowerCase().replace(/\.$/, "");

  // Lets a developer run either app at the root locally, where there is no
  // base domain to hang a label off.
  const forced = String(import.meta.env.VITE_APP_HOST ?? "")
    .trim()
    .toLowerCase();
  if (forced === "admin" || forced === "panel") return forced;

  const base = baseDomain();
  if (!host.endsWith(`.${base}`)) return null;
  const label = host.slice(0, -(base.length + 1));
  // `admin.marita.bbloom.ge` has the label `admin.marita`, which is nobody's
  // app — the exact match is what keeps a nested name from matching.
  return APP_LABELS[label] ?? null;
}

const appHost = resolveAppHost();

/** `""` when the app owns the whole hostname, otherwise its path prefix. */
export const ADMIN_BASE = appHost === "admin" ? "" : "/admin";
export const DASH_BASE = appHost === "panel" ? "" : "/dashboard";

function join(base: string, path: string): string {
  if (!path || path === "/") return base || "/";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** A link into the staff panel. `adminPath()` is its home. */
export function adminPath(path = ""): string {
  return join(ADMIN_BASE, path);
}

/** A link into the client dashboard. `dashPath()` is its home. */
export function dashPath(path = ""): string {
  return join(DASH_BASE, path);
}

/**
 * The route pattern each app is mounted on.
 *
 * At the root of its own hostname an app must claim `/*`, because there is no
 * prefix left to distinguish it from anything else.
 */
export const ADMIN_ROUTE = ADMIN_BASE ? `${ADMIN_BASE}/*` : "/*";
export const DASH_ROUTE = DASH_BASE ? `${DASH_BASE}/*` : "/*";

/** Whether this hostname belongs to one of our apps rather than a client. */
export function isAppHost(): boolean {
  return appHost !== null;
}

/**
 * Absolute homes, for links that have to cross from one hostname to another —
 * the marketing site pointing at the dashboard, say. On the marketing domain
 * these stay relative so a preview deployment keeps working.
 */
export function dashboardHome(): string {
  const base = baseDomain();
  return typeof window !== "undefined" &&
    window.location.hostname.toLowerCase().endsWith(base)
    ? `https://panel.${base}`
    : "/dashboard";
}

/**
 * The marketing site's home.
 *
 * On `admin.bbloom.ge` and `panel.bbloom.ge`, `/` is the app itself, so a
 * "back to bbloom" link written as `/` would reload the app the visitor is
 * trying to leave.
 */
export function marketingHome(): string {
  return appHost ? `https://${baseDomain()}/` : "/";
}
