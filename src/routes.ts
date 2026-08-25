/**
 * Where the two signed-in apps live, which is no longer a constant.
 *
 * The staff panel has a hostname of its own — `admin.bbloom.ge` — where it is
 * served from the root, and stays on `/admin` on the marketing domain so old
 * links keep working.
 *
 * The client dashboard is no longer a destination of its own. It is a page on
 * the marketing site: `/` is the landing page for everyone, signed in or not,
 * and `/dashboard` is a signed-in client's websites. Its screens sit at the
 * root — `/s/{id}`, `/account`, `/new` — because the backend composes mail
 * links against those paths. `panel.bbloom.ge` redirects there path-for-path,
 * and the in-app `panel` host below stays as the fallback for anyone who
 * reaches the bundle on that hostname anyway, so links in mail we have already
 * sent keep working.
 *
 * Every internal link is still built from these helpers rather than written out.
 * The staff panel is the case that needs it — the same `<Link>` has to render
 * `/admin/sites` on the marketing domain and `/sites` on `admin.bbloom.ge` — and
 * the client dashboard keeps going through them so that moving it again is one
 * edit here rather than a search across every screen, which is what made this
 * move a one-line change.
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

/**
 * Where a visitor who arrived on `panel.bbloom.ge` should be sent instead.
 *
 * The client dashboard is not a website of its own any more, and the panel
 * hostname has to stop being one — otherwise "removed" means "still there, on
 * the address people have bookmarked". `vercel.json` cannot do it: that host is
 * served by Caddy from the Hetzner box, and Vercel never sees the request. This
 * was checked rather than assumed — `panel.bbloom.ge` answers with
 * `Server: Caddy` while the marketing domain does not.
 *
 * The real hostname is read here rather than `resolveAppHost()`, because that
 * one also answers "panel" for `VITE_APP_HOST=panel`, which is how the
 * dashboard is run at the root on a laptop. Redirecting on that would send a
 * developer to production mid-edit.
 *
 * Returns `null` when there is nowhere to go, so the caller renders the app
 * rather than a blank page.
 */
export function panelHostExit(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname.toLowerCase().replace(/\.$/, "");
  const base = baseDomain();
  if (host !== `panel.${base}`) return null;
  const { pathname, search, hash } = window.location;
  // Path-for-path, with one exception: the panel's home was `/`, and `/` on the
  // marketing domain is the landing page. Someone arriving from a bookmark of
  // the panel wanted their websites, so they get `/dashboard` rather than the
  // pitch. Every other path already names the screen it wants.
  const path = pathname === "/" || pathname === "" ? DASH_HOME : pathname;
  return `https://${base}${path}${search}${hash}`;
}

/** `""` when the app owns the whole hostname, otherwise its path prefix. */
export const ADMIN_BASE = appHost === "admin" ? "" : "/admin";

/**
 * The client dashboard is a *page* on the marketing site, not a site of its own
 * and not the site's home page.
 *
 * Two constants rather than one, because the dashboard's home and its screens
 * are at different depths on purpose:
 *
 * - `DASH_HOME` is `/dashboard`. `/` belongs to the marketing landing page and
 *   always renders it, signed in or out.
 * - `DASH_BASE` is `""`, so the screens stay at `/s/{id}`, `/account`, `/new`.
 *   That is not cosmetic: the backend composes enquiry notification links as
 *   `<origin>/s/{siteId}/inbox`, so moving these would silently break mail that
 *   has already been sent.
 *
 * Kept as constants rather than inlined so `dashPath()` stays the single place
 * every dashboard link is built — which is what has made each of today's moves
 * an edit here instead of an edit to fifty call sites.
 */
export const DASH_BASE = "";
export const DASH_HOME = "/dashboard";

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
  if (!path || path === "/") return DASH_HOME;
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
 * the staff panel pointing at a client's dashboard, say. On a hostname that is
 * not under the base domain these stay relative so a preview deployment keeps
 * working.
 *
 * They name different pages again. The dashboard is a page *on* the marketing
 * site rather than its home: `/` is the landing page for everyone, and
 * `/dashboard` is where a signed-in client's websites are.
 */
export function dashboardHome(): string {
  const base = marketingHome();
  return base === "/" ? DASH_HOME : `${base.replace(/\/$/, "")}${DASH_HOME}`;
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
