import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type {
  PublicCategory,
  PublicProduct,
  PublicSection,
  SiteEffects,
  SiteFeatures,
  SiteLanguage,
  SiteMeta,
  SitePayload,
} from "./api/types";
import { formatMoney } from "./utils/money";
import { stringsFor, withLabels } from "./utils/strings";
import type { SiteStrings } from "./utils/strings";

type SiteContextValue = {
  /** The ref the payload was fetched with — slug or hostname. */
  ref: string;
  meta: SiteMeta;
  sections: PublicSection[];
  categories: PublicCategory[];
  products: PublicProduct[];
  locale: SiteLanguage;
  t: SiteStrings;
  features: SiteFeatures;
  effects: SiteEffects;
  isDark: boolean;
  buttonStyle: "solid" | "outline" | "pill";
  money: (amount: number | null | undefined) => string | undefined;
  productBySlug: (slug: string) => PublicProduct | undefined;
  productsIn: (categoryId: string | null) => PublicProduct[];
  featured: PublicProduct[];
  setLanguage: (language: SiteLanguage) => void;
  openProduct: (slug: string) => void;
  closeProduct: () => void;
};

const SiteContext = createContext<SiteContextValue | null>(null);

type ProviderProps = {
  payload: SitePayload;
  siteRef: string;
  onLanguageChange: (language: SiteLanguage) => void;
  onOpenProduct: (slug: string) => void;
  onCloseProduct: () => void;
  children: ReactNode;
};

export function SiteProvider({
  payload,
  siteRef,
  onLanguageChange,
  onOpenProduct,
  onCloseProduct,
  children,
}: ProviderProps) {
  const value = useMemo<SiteContextValue>(() => {
    const meta = payload.site;
    const locale = meta.locale ?? meta.defaultLanguage ?? "ka";
    const products = payload.products ?? [];

    const bySlug = new Map(products.map((product) => [product.slug, product]));

    return {
      ref: siteRef,
      meta,
      sections: [...(payload.sections ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder,
      ),
      categories: payload.categories ?? [],
      products,
      locale,
      t: withLabels(stringsFor(locale), meta.labels, locale),
      features: meta.features ?? {},
      effects: meta.theme?.effects ?? {},
      isDark: meta.theme?.mode === "dark",
      buttonStyle: meta.theme?.buttonStyle ?? "solid",
      money: (amount) => formatMoney(amount, meta.currency, locale),
      productBySlug: (slug) => bySlug.get(slug),
      productsIn: (categoryId) =>
        categoryId
          ? products.filter((product) => product.categoryId === categoryId)
          : products,
      featured: products.filter((product) => product.featured),
      setLanguage: onLanguageChange,
      openProduct: onOpenProduct,
      closeProduct: onCloseProduct,
    };
  }, [payload, siteRef, onLanguageChange, onOpenProduct, onCloseProduct]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error("useSite must be used inside a SiteProvider");
  return context;
}
