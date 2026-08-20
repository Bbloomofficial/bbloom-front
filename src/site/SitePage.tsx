import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { SiteLanguage, SitePayload } from "./api/types";
import { ApiError } from "./api/client";
import { ProductModal } from "./components/ProductModal";
import { SiteProvider } from "./context";
import { useSitePayload } from "./hooks/useSitePayload";
import { SectionRenderer } from "./sections/registry";
import { loadFonts } from "./theme/fonts";
import { themeToCssVars } from "./theme/tokens";
import { stringsFor } from "./utils/strings";
import { resolveSiteHost } from "./host";

export { resolveSiteHost } from "./host";

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center text-neutral-800">
      {children}
    </div>
  );
}

function SiteHead({ payload }: { payload: SitePayload }) {
  const meta = payload.site;

  useEffect(() => {
    const previousTitle = document.title;
    const previousLang = document.documentElement.lang;
    document.title = meta.seo?.title ?? meta.businessName;

    const description = meta.seo?.description;
    let tag = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const previousDescription = tag?.content ?? null;
    if (description) {
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = "description";
        document.head.appendChild(tag);
      }
      tag.content = description;
    }

    let icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const previousIcon = icon?.href ?? null;
    if (meta.favicon?.url) {
      if (!icon) {
        icon = document.createElement("link");
        icon.rel = "icon";
        document.head.appendChild(icon);
      }
      icon.href = meta.favicon.url;
    }

    document.documentElement.lang = meta.locale ?? "ka";

    return () => {
      document.title = previousTitle;
      document.documentElement.lang = previousLang;
      if (tag && previousDescription !== null)
        tag.content = previousDescription;
      if (icon && previousIcon !== null) icon.href = previousIcon;
    };
  }, [meta]);

  return null;
}

function SiteBody({
  payload,
  siteRef,
  onLanguageChange,
  productSlug,
  onOpenProduct,
  onCloseProduct,
}: {
  payload: SitePayload;
  siteRef: string;
  onLanguageChange: (language: SiteLanguage) => void;
  productSlug?: string;
  onOpenProduct: (slug: string) => void;
  onCloseProduct: () => void;
}) {
  const theme = payload.site.theme;
  const style = useMemo(() => themeToCssVars(theme), [theme]);

  useEffect(() => {
    loadFonts(theme?.fonts?.heading, theme?.fonts?.body);
  }, [theme]);

  return (
    <SiteProvider
      payload={payload}
      siteRef={siteRef}
      onLanguageChange={onLanguageChange}
      onOpenProduct={onOpenProduct}
      onCloseProduct={onCloseProduct}
    >
      <SiteHead payload={payload} />
      <div
        id="top"
        className={`site-root ${theme?.effects?.noiseOverlay ? "site-noise" : ""}`}
        style={style}
        lang={payload.site.locale ?? "ka"}
      >
        {payload.sections.map((section) => (
          <SectionRenderer key={section.key} section={section} />
        ))}
        {productSlug ? <ProductModal slug={productSlug} /> : null}
      </div>
    </SiteProvider>
  );
}

/** Resolves the site (by slug or by host), then renders it. */
export function SitePage({ mode }: { mode: "ref" | "host" }) {
  const params = useParams<{ slug?: string; productSlug?: string }>();
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();

  const hostRef = resolveSiteHost();
  const siteRef =
    mode === "host"
      ? (hostRef ?? window.location.hostname)
      : (params.slug ?? "");
  const langParam = search.get("lang");
  const lang: SiteLanguage | undefined =
    langParam === "ka" || langParam === "en" ? langParam : undefined;

  const { data, loading, error, retry } = useSitePayload(siteRef, lang, mode);

  const basePath = mode === "host" ? "" : `/site/${params.slug ?? ""}`;

  const onLanguageChange = useCallback(
    (language: SiteLanguage) => {
      const next = new URLSearchParams(search);
      next.set("lang", language);
      setSearch(next, { replace: true });
    },
    [search, setSearch],
  );

  const onOpenProduct = useCallback(
    (slug: string) => {
      navigate({
        pathname: `${basePath}/p/${slug}`,
        search: search.toString(),
      });
    },
    [navigate, basePath, search],
  );

  const onCloseProduct = useCallback(() => {
    navigate({ pathname: basePath || "/", search: search.toString() });
  }, [navigate, basePath, search]);

  const t = stringsFor(data?.site.locale ?? lang);

  if (loading && !data) {
    return (
      <Centered>
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800"
          aria-hidden="true"
        />
        <p className="text-sm text-neutral-500">{t.loading}</p>
      </Centered>
    );
  }

  if (error || !data) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <Centered>
        <h1 className="text-2xl font-semibold">
          {notFound ? t.notFoundTitle : t.errorTitle}
        </h1>
        <p className="max-w-md text-neutral-500">
          {notFound ? t.notFoundBody : (error?.message ?? "")}
        </p>
        {notFound ? null : (
          <button
            type="button"
            onClick={retry}
            className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            {t.retry}
          </button>
        )}
      </Centered>
    );
  }

  return (
    <SiteBody
      payload={data}
      siteRef={siteRef}
      onLanguageChange={onLanguageChange}
      productSlug={params.productSlug}
      onOpenProduct={onOpenProduct}
      onCloseProduct={onCloseProduct}
    />
  );
}

export default SitePage;
