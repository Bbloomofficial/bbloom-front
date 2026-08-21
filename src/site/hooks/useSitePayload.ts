import { useCallback, useEffect, useState } from "react";
import { ApiError, fetchSite, fetchSiteByHost } from "../api/client";
import type { SiteLanguage, SitePayload } from "../api/types";

type State = {
  data: SitePayload | null;
  loading: boolean;
  error: ApiError | Error | null;
};

/**
 * Fetches a rendered site payload. `mode` decides whether the ref is treated as
 * a slug (path routing) or a hostname (a real deploy on the site's own domain).
 */
export function useSitePayload(
  ref: string,
  lang: SiteLanguage | undefined,
  mode: "ref" | "host",
) {
  const [state, setState] = useState<State>({
    data: null,
    loading: true,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    const load =
      mode === "host" ? fetchSiteByHost(ref, lang) : fetchSite(ref, lang);

    load
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
  }, [ref, lang, mode, attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { ...state, retry };
}
