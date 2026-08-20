import { useEffect, useMemo, useRef, useState } from "react";
import type { PublicSection } from "../api/types";
import { Band, Reveal, SectionHeading } from "../components/layout";
import { Icon } from "../components/Icon";
import { MenuRow } from "../components/ProductCard";
import { useSite } from "../context";
import { bool, str } from "../utils/content";

type MenuFlags = {
  showPrices: boolean;
  showImages: boolean;
  showTags: boolean;
};

function flagsOf(section: PublicSection): MenuFlags {
  return {
    showPrices: bool(section.content, "showPrices", true),
    showImages: bool(section.content, "showImages", false),
    showTags: bool(section.content, "showDietaryTags", true),
  };
}

function useMenuGroups(query: string) {
  const { categories, products } = useSite();

  return useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = (name?: string | null, description?: string | null) =>
      !needle ||
      [name, description]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(needle));

    const groups = categories.map((category) => ({
      category,
      items: products.filter(
        (product) =>
          product.categoryId === category.id &&
          matches(
            product.name,
            product.shortDescription ?? product.description,
          ),
      ),
    }));

    const uncategorised = products.filter(
      (product) =>
        !product.categoryId &&
        matches(product.name, product.shortDescription ?? product.description),
    );
    if (uncategorised.length > 0) {
      groups.push({
        category: {
          id: "__other",
          slug: "__other",
          name: "",
          description: null,
          image: null,
          productCount: uncategorised.length,
          sortOrder: 999,
        },
        items: uncategorised,
      });
    }

    return groups.filter((group) => group.items.length > 0);
  }, [categories, products, query]);
}

function MenuSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const { t } = useSite();
  return (
    <label className="relative mx-auto mt-8 block max-w-md">
      <span className="site-hide">{t.search}</span>
      <span className="absolute top-1/2 left-3 -translate-y-1/2 text-site-muted">
        <Icon name="search" size={16} />
      </span>
      <input
        type="search"
        className="site-field pl-9"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t.searchPlaceholder}
      />
    </label>
  );
}

function Note({ section }: { section: PublicSection }) {
  const note = str(section.content, "note");
  if (!note) return null;
  return (
    <p className="mt-10 text-center text-sm text-site-muted italic">{note}</p>
  );
}

/** One long list, category after category — `restaurant-simple`. */
export function MenuListByCategory({ section }: { section: PublicSection }) {
  const { showPrices, showImages, showTags } = flagsOf(section);
  const [query, setQuery] = useState("");
  const groups = useMenuGroups(query);
  const { t, effects } = useSite();

  return (
    <Band id={section.key}>
      <SectionHeading
        eyebrow={str(section.content, "eyebrow")}
        title={str(section.content, "title")}
        subtitle={str(section.content, "subtitle")}
      />
      {bool(section.content, "showSearch", false) ? (
        <MenuSearch value={query} onChange={setQuery} />
      ) : null}

      {groups.length === 0 ? (
        <p className="mt-10 text-center text-site-muted">{t.noResults}</p>
      ) : (
        <div className="mx-auto mt-10 max-w-3xl space-y-12">
          {groups.map((group) => (
            <Reveal key={group.category.id}>
              {group.category.name ? (
                <header className="mb-2">
                  <h3 className="site-heading site-h3 text-site-text">
                    {group.category.name}
                  </h3>
                  {group.category.description ? (
                    <p className="mt-1 text-sm text-site-muted">
                      {group.category.description}
                    </p>
                  ) : null}
                  {effects.goldDividers ? (
                    <div className="site-divider mt-4 w-24" />
                  ) : null}
                </header>
              ) : null}
              <ul className="divide-y divide-site-border">
                {group.items.map((product) => (
                  <MenuRow
                    key={product.id}
                    product={product}
                    showPrice={showPrices}
                    showImage={showImages}
                    showTags={showTags}
                  />
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      )}
      <Note section={section} />
    </Band>
  );
}

/** Two editorial columns — `restaurant-classic`. */
export function MenuColumnsByCategory({ section }: { section: PublicSection }) {
  const { showPrices, showImages, showTags } = flagsOf(section);
  const [query, setQuery] = useState("");
  const groups = useMenuGroups(query);
  const { t, effects } = useSite();

  return (
    <Band id={section.key} tone="alt">
      <SectionHeading
        eyebrow={str(section.content, "eyebrow")}
        title={str(section.content, "title")}
        subtitle={str(section.content, "subtitle")}
      />
      {bool(section.content, "showSearch", false) ? (
        <MenuSearch value={query} onChange={setQuery} />
      ) : null}

      {groups.length === 0 ? (
        <p className="mt-10 text-center text-site-muted">{t.noResults}</p>
      ) : (
        <div className="mt-12 gap-x-14 lg:columns-2 [&>*]:mb-12">
          {groups.map((group) => (
            <section key={group.category.id} className="break-inside-avoid">
              {group.category.name ? (
                <header className="mb-3 text-center">
                  <h3 className="site-heading site-h3 text-site-text">
                    {group.category.name}
                  </h3>
                  {effects.goldDividers ? (
                    <div className="site-divider mx-auto mt-3 w-20" />
                  ) : null}
                </header>
              ) : null}
              <ul className="divide-y divide-site-border">
                {group.items.map((product) => (
                  <MenuRow
                    key={product.id}
                    product={product}
                    showPrice={showPrices}
                    showImage={showImages}
                    showTags={showTags}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
      <Note section={section} />
    </Band>
  );
}

/** Sticky tab bar with scroll-spy — the `restaurant-modern` flagship menu. */
export function MenuTabsByCategory({ section }: { section: PublicSection }) {
  const { showPrices, showImages, showTags } = flagsOf(section);
  const [query, setQuery] = useState("");
  const groups = useMenuGroups(query);
  const { t, effects } = useSite();
  const sticky = bool(section.content, "stickyTabs", false);

  const [active, setActive] = useState<string | null>(null);
  const panelRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (groups.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
        if (
          visible?.target instanceof HTMLElement &&
          visible.target.dataset.groupId
        ) {
          setActive(visible.target.dataset.groupId);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    );
    Object.values(panelRefs.current).forEach(
      (node) => node && observer.observe(node),
    );
    return () => observer.disconnect();
  }, [groups]);

  const current = active ?? groups[0]?.category.id ?? null;

  return (
    <Band id={section.key}>
      <SectionHeading
        eyebrow={str(section.content, "eyebrow")}
        title={str(section.content, "title")}
        subtitle={str(section.content, "subtitle")}
      />
      {bool(section.content, "showSearch", false) ? (
        <MenuSearch value={query} onChange={setQuery} />
      ) : null}

      {groups.length === 0 ? (
        <p className="mt-10 text-center text-site-muted">{t.noResults}</p>
      ) : (
        <>
          <div
            className={`z-30 mt-8 -mx-4 px-4 py-3 ${
              sticky ? "sticky top-[var(--site-header-offset,0px)]" : ""
            }`}
          >
            <div
              className={`site-scrollbar-none flex gap-2 overflow-x-auto ${
                sticky && effects.glassCards
                  ? "site-glass rounded-site-pill px-2 py-2"
                  : ""
              }`}
            >
              {groups.map((group) => (
                <button
                  key={group.category.id}
                  type="button"
                  aria-current={current === group.category.id}
                  onClick={() => {
                    panelRefs.current[group.category.id]?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                  className={`shrink-0 rounded-site-pill px-4 py-2 text-sm font-semibold transition ${
                    current === group.category.id
                      ? "bg-site-primary text-site-on-primary"
                      : "text-site-muted hover:text-site-text"
                  }`}
                >
                  {group.category.name || t.all}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-14">
            {groups.map((group) => (
              <section
                key={group.category.id}
                data-group-id={group.category.id}
                ref={(node) => {
                  panelRefs.current[group.category.id] = node;
                }}
                className="scroll-mt-32"
              >
                {group.category.name ? (
                  <header className="mb-3 flex items-baseline gap-4">
                    <h3 className="site-heading site-h3 text-site-text">
                      {group.category.name}
                    </h3>
                    <span
                      className="h-px flex-1 bg-site-border"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-site-muted">
                      {group.items.length}
                    </span>
                  </header>
                ) : null}
                <ul className="divide-y divide-site-border">
                  {group.items.map((product) => (
                    <MenuRow
                      key={product.id}
                      product={product}
                      showPrice={showPrices}
                      showImage={showImages}
                      showTags={showTags}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
      <Note section={section} />
    </Band>
  );
}
