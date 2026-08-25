import { Link, Navigate, useParams } from "react-router-dom";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useI18n } from "../../i18n";
import { dashPath } from "../../routes";
import { useSession, sitesOf } from "../auth";
import { SiteScope } from "../site";
import { SiteStatusBadge } from "../components/Badges";
import Editor from "./Editor";
import { editorStrings } from "./strings";

/**
 * The page editor as a window of its own, rather than a screen inside the
 * dashboard.
 *
 * This is the presentation the anonymous `/try` editor has always had, and the
 * reason for it is the same: editing a website is a workspace, and every row of
 * dashboard chrome above it is a row the preview does not get. Opening it in a
 * new tab also means the dashboard stays where it was — the client can leave
 * the editor by closing it, and still be on the page they came from.
 *
 * No token travels to get here. This is the same origin as the dashboard, so
 * the new tab reads the same `localStorage` session; a token in the URL would
 * end up in history and in any `Referer` we send.
 */
export default function EditorWindow() {
  const { siteId } = useParams();
  const { user } = useSession();
  const { locale } = useI18n();
  const t = editorStrings(locale);
  const site = sitesOf(user).find((candidate) => candidate.id === siteId);

  // Same rule as the site-scoped dashboard routes: a site the account no longer
  // belongs to is normal rather than an error, so it lands on the site list.
  if (!site) return <Navigate to={dashPath()} replace />;

  return (
    <SiteScope site={site}>
      {/*
        Fixed height only from `lg`, exactly as the dashboard shell did it. On a
        phone the panel and the preview stack, and a locked-height window there
        would trap the field list in an inner scroller fighting the native
        scroll gesture.
      */}
      <div className="flex min-h-screen flex-col bg-sunken lg:h-screen lg:overflow-hidden">
        <div className="flex items-center gap-3 border-b border-ink-100 bg-surface px-4 py-2">
          {/*
            A link rather than `history.back()`: this tab is usually opened
            fresh from the dashboard, so it has no history of its own to go back
            through, and the button would do nothing.
          */}
          <Link
            to={dashPath(`/s/${site.id}`)}
            className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm font-semibold text-ink-500 transition hover:bg-ink-50 hover:text-ink-900 active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 rtl:rotate-180"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="hidden sm:inline">{t.backToDashboard}</span>
          </Link>

          <span className="min-w-0 truncate text-sm font-bold text-ink-900">
            {site.businessName}
          </span>
          <SiteStatusBadge status={site.status} />

          <div className="ms-auto flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </div>

        <main className="flex min-h-0 flex-1 flex-col">
          <Editor />
        </main>
      </div>
    </SiteScope>
  );
}
