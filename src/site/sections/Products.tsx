import { useMemo, useRef, useState } from "react";
import type { PublicProduct, PublicSection } from "../api/types";
import { Band, Reveal, SectionHeading } from "../components/layout";
import { Icon } from "../components/Icon";
import { ProductCard } from "../components/ProductCard";
import { SiteImage } from "../components/SiteImage";
import { useSite } from "../context";
import { bool, num, str } from "../utils/content";

/** `source` + `limit` decide which slice of the catalog a section shows. */
function useSelection(section: PublicSection, products: PublicProduct[]) {
  const source = str(section.content, "source");
  const limit = num(section.content, "limit");

  return useMemo(() => {
    let selected = products;
    if (source === "featured") {
      const featured = products.filter((product) => product.featured);
      selected = featured.length > 0 ? featured : products;
    } else if (source === "newest") {
      selected = [...products].reverse();
    }
    return limit && limit > 0 ? selected.slice(0, limit) : selected;
  }, [products, source, limit]);
}

function EmptyState() {
  const { t } = useSite();
  return (
    <div className="site-card mt-10 p-10 text-center">
      <p className="site-heading site-h4 text-site-text">{t.noResults}</p>
      <p className="mt-1 text-sm text-site-muted">{t.noResultsHint}</p>
    </div>
  );
}

function Grid({
  products,
  columns,
  showPrices,
  emphasis = "plain",
}: {
  products: PublicProduct[];
  columns: number;
  showPrices: boolean;
  emphasis?: "plain" | "rich";
}) {
  const columnClass =
    columns >= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : columns === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`mt-10 grid gap-6 ${columnClass}`}>
      {products.map((product, index) => (
        <Reveal
          key={product.id}
          delay={Math.min(index, 6) * 60}
          className="h-full"
        >
          <ProductCard
            product={product}
            showPrice={showPrices}
            emphasis={emphasis}
          />
        </Reveal>
      ))}
    </div>
  );
}

/** Simple grids — `shop-simple` (3 up) and `shop-classic` (4 up). */
export function ProductsGrid({ section }: { section: PublicSection }) {
  const { products } = useSite();
  const selected = useSelection(section, products);
  const columns = section.variant === "grid-4" ? 4 : 3;
  const showPrices = bool(section.content, "showPrices", true);
  const showFilter = bool(section.content, "showCategoryFilter", false);

  if (showFilter) return <ProductsGridFilterable section={section} />;

  return (
    <Band id={section.key}>
      <SectionHeading
        eyebrow={str(section.content, "eyebrow")}
        title={str(section.content, "title")}
        subtitle={str(section.content, "subtitle")}
      />
      {selected.length === 0 ? (
        <EmptyState />
      ) : (
        <Grid products={selected} columns={columns} showPrices={showPrices} />
      )}
    </Band>
  );
}

/** Search, category chips and sorting — the flagship catalogue. */
export function ProductsGridFilterable({
  section,
}: {
  section: PublicSection;
}) {
  const { products, categories, t, features } = useSite();
  const selected = useSelection(section, products);

  const showPrices = bool(section.content, "showPrices", true);
  const showSearch =
    bool(section.content, "showSearch", false) &&
    features.productSearch !== false;
  const showCategoryFilter =
    bool(section.content, "showCategoryFilter", true) && categories.length > 1;
  const showSorting = bool(section.content, "showSorting", false);
  const columns = num(section.content, "columns", 3) ?? 3;

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState("default");

  const visible = useMemo(() => {
    let result = selected;
    if (category)
      result = result.filter((product) => product.categoryId === category);
    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      result = result.filter((product) =>
        [product.name, product.shortDescription, product.description]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(needle)),
      );
    }
    if (sort === "priceAsc")
      result = [...result].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sort === "priceDesc")
      result = [...result].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    if (sort === "nameAsc")
      result = [...result].sort((a, b) =>
        (a.name ?? "").localeCompare(b.name ?? ""),
      );
    return result;
  }, [selected, category, query, sort]);

  return (
    <Band id={section.key}>
      <SectionHeading
        eyebrow={str(section.content, "eyebrow")}
        title={str(section.content, "title")}
        subtitle={str(section.content, "subtitle")}
      />

      {showSearch || showCategoryFilter || showSorting ? (
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {showCategoryFilter ? (
            <div className="site-scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              <button
                type="button"
                onClick={() => setCategory(null)}
                aria-pressed={category === null}
                className={`shrink-0 rounded-site-pill border px-4 py-2 text-sm font-semibold transition ${
                  category === null
                    ? "border-transparent bg-site-primary text-site-on-primary"
                    : "border-site-border text-site-muted hover:text-site-text"
                }`}
              >
                {t.all}
              </button>
              {categories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  aria-pressed={category === item.id}
                  className={`shrink-0 rounded-site-pill border px-4 py-2 text-sm font-semibold transition ${
                    category === item.id
                      ? "border-transparent bg-site-primary text-site-on-primary"
                      : "border-site-border text-site-muted hover:text-site-text"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          ) : (
            <span />
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {showSearch ? (
              <label className="relative block">
                <span className="site-hide">{t.search}</span>
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-site-muted">
                  <Icon name="search" size={16} />
                </span>
                <input
                  className="site-field pl-9 sm:w-64"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t.searchPlaceholder}
                  type="search"
                />
              </label>
            ) : null}

            {showSorting ? (
              <label className="block">
                <span className="site-hide">{t.sortBy}</span>
                <select
                  className="site-field sm:w-52"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="default">{t.sortDefault}</option>
                  <option value="priceAsc">{t.sortPriceAsc}</option>
                  <option value="priceDesc">{t.sortPriceDesc}</option>
                  <option value="nameAsc">{t.sortNameAsc}</option>
                </select>
              </label>
            ) : null}
          </div>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState />
      ) : (
        <Grid
          products={visible}
          columns={columns}
          showPrices={showPrices}
          emphasis="rich"
        />
      )}
    </Band>
  );
}

/** Swipeable row of highlights with arrow controls — the flagship features. */
export function ProductsFeaturedCarousel({
  section,
}: {
  section: PublicSection;
}) {
  const { products } = useSite();
  const selected = useSelection(section, products);
  const trackRef = useRef<HTMLDivElement>(null);
  const showPrices = bool(section.content, "showPrices", true);

  if (selected.length === 0) return null;

  const scrollBy = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * (track.clientWidth * 0.8),
      behavior: "smooth",
    });
  };

  return (
    <Band id={section.key} tone="alt">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow={str(section.content, "eyebrow")}
          title={str(section.content, "title")}
          subtitle={str(section.content, "subtitle")}
          align="left"
          className="max-w-xl"
        />
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            className="rounded-full border border-site-border p-2.5 text-site-text transition hover:border-site-primary hover:text-site-primary"
            aria-label="←"
          >
            <Icon name="chevronLeft" size={18} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            className="rounded-full border border-site-border p-2.5 text-site-text transition hover:border-site-primary hover:text-site-primary"
            aria-label="→"
          >
            <Icon name="chevronRight" size={18} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="site-scrollbar-none mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2"
      >
        {selected.map((product) => (
          <div
            key={product.id}
            className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[31%] xl:w-[24%]"
          >
            <ProductCard
              product={product}
              showPrice={showPrices}
              emphasis="rich"
              ratio="1 / 1"
            />
          </div>
        ))}
      </div>
    </Band>
  );
}

/** Editorial row of chef's picks — `restaurant-classic`. */
export function ProductsHighlightRow({ section }: { section: PublicSection }) {
  const { products, money, openProduct, effects } = useSite();
  const selected = useSelection(section, products).slice(0, 4);
  if (selected.length === 0) return null;

  return (
    <Band id={section.key} tone="surface">
      <SectionHeading
        eyebrow={str(section.content, "eyebrow")}
        title={str(section.content, "title")}
        subtitle={str(section.content, "subtitle")}
      />
      {effects.goldDividers ? (
        <div className="site-divider mx-auto mt-6 w-40" />
      ) : null}

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {selected.map((product, index) => (
          <Reveal key={product.id} delay={index * 80}>
            <button
              type="button"
              onClick={() => openProduct(product.slug)}
              className="group block w-full text-center"
            >
              <div className="site-zoom overflow-hidden rounded-full border border-site-border p-1">
                <SiteImage
                  media={product.image}
                  alt={product.name}
                  seed={product.slug}
                  ratio="1 / 1"
                  className="rounded-full"
                  rounded={false}
                />
              </div>
              <h3 className="site-heading site-h4 mt-5 text-site-text">
                {product.name}
              </h3>
              {product.shortDescription ? (
                <p className="mt-1 line-clamp-2 text-sm text-site-muted">
                  {product.shortDescription}
                </p>
              ) : null}
              {money(product.price) ? (
                <p className="site-heading mt-2 text-site-primary">
                  {money(product.price)}
                </p>
              ) : null}
            </button>
          </Reveal>
        ))}
      </div>
    </Band>
  );
}
