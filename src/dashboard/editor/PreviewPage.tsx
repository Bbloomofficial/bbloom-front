import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { request } from "../../api/http";
import type { SiteLanguage, SitePayload } from "../../site/api/types";
import { SiteBody } from "../../site/SitePage";
import { readStoredToken } from "../auth";
import { PREVIEW_MESSAGE } from "./PreviewFrame";

/**
 * The editor's preview target. Same origin as the dashboard, so it can read the
 * stored session and call the manage preview endpoint, which returns the very
 * same payload shape the public site renders — no second renderer to maintain.
 */

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-white px-6 text-center text-sm text-neutral-500">
      {children}
    </div>
  );
}

export default function PreviewPage() {
  const { siteId = "" } = useParams<{ siteId: string }>();
  const [search] = useSearchParams();
  const langParam = search.get("lang");
  const lang: SiteLanguage | undefined =
    langParam === "ka" || langParam === "en" ? langParam : undefined;
  const draft = search.get("draft") !== "false";

  const [payload, setPayload] = useState<SitePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = readStoredToken();
    if (!token) {
      setError("Session expired");
      return;
    }
    let cancelled = false;
    const params = new URLSearchParams();
    if (lang) params.set("lang", lang);
    params.set("includeHidden", "false");
    params.set("draft", draft ? "true" : "false");

    request<SitePayload>(`/manage/sites/${siteId}/preview?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => {
        if (!cancelled) setPayload(data);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Preview failed");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [siteId, lang, draft]);

  // The editor asks us to bring a section into view when it is selected.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; action?: string; key?: string };
      if (data?.type !== PREVIEW_MESSAGE || data.action !== "focus") return;
      if (!data.key) return;
      const target = document.getElementById(data.key);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // A preview is for looking, not for browsing: keep clicks from navigating the
  // frame away from the page being edited.
  const swallowNavigation = useCallback((event: React.MouseEvent) => {
    const anchor = (event.target as HTMLElement | null)?.closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href") ?? "";
    if (href.startsWith("#")) return;
    event.preventDefault();
  }, []);

  if (error) return <Notice>{error}</Notice>;
  if (!payload) return <Notice>…</Notice>;

  return (
    <div onClickCapture={swallowNavigation}>
      <SiteBody
        payload={payload}
        siteRef={siteId}
        onLanguageChange={() => {}}
        onOpenProduct={() => {}}
        onCloseProduct={() => {}}
      />
    </div>
  );
}
