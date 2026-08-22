import type { PublicProduct } from "../api/types";
import { useSite } from "../context";
import { Icon } from "./Icon";
import { SiteImage } from "./SiteImage";

const TAG_LABELS: Record<string, { ka: string; en: string }> = {
  vegan: { ka: "ვეგანური", en: "Vegan" },
  vegetarian: { ka: "ვეგეტარიანული", en: "Vegetarian" },
  spicy: { ka: "ცხარე", en: "Spicy" },
  "gluten-free": { ka: "უგლუტენო", en: "Gluten free" },
  glutenfree: { ka: "უგლუტენო", en: "Gluten free" },
  new: { ka: "ახალი", en: "New" },
  popular: { ka: "პოპულარული", en: "Popular" },
};

export function DietaryTags({ product }: { product: PublicProduct }) {
  const { locale } = useSite();
  const tags = product.attributes?.tags;
  if (!Array.isArray(tags) || tags.length === 0) return null;
  return (
    <span className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-site-pill border border-site-border px-2 py-0.5 text-[0.68rem] font-semibold tracking-wide text-site-muted uppercase"
        >
          {TAG_LABELS[String(tag).toLowerCase()]?.[
            locale === "ka" ? "ka" : "en"
          ] ?? tag}
        </span>
      ))}
    </span>
  );
}

export function Price({
  product,
  className = "",
}: {
  product: PublicProduct;
  className?: string;
}) {
  const { money, t } = useSite();
  const price = money(product.price);
  if (!price) return null;
  const compare = money(product.compareAtPrice);

  return (
    <span className={`flex items-baseline gap-2 ${className}`}>
      <span className="site-heading text-site-text">{price}</span>
      {compare && (product.compareAtPrice ?? 0) > (product.price ?? 0) ? (
        <span className="text-sm text-site-muted line-through">{compare}</span>
      ) : null}
      {product.unit ? (
        <span className="text-xs text-site-muted">/ {product.unit}</span>
      ) : null}
      {!product.available ? (
        <span className="text-xs font-semibold text-site-muted">
          · {t.outOfStock}
        </span>
      ) : null}
    </span>
  );
}

type CardProps = {
  product: PublicProduct;
  showPrice?: boolean;
  showImage?: boolean;
  /** Flagship templates get glass surfaces and a lift on hover. */
  emphasis?: "plain" | "rich";
  ratio?: string;
};

/** The shop card. Restaurants use `MenuRow` instead. */
export function ProductCard({
  product,
  showPrice = true,
  showImage = true,
  emphasis = "plain",
  ratio = "4 / 3",
}: CardProps) {
  const { openProduct, features, effects, t } = useSite();
  const clickable = features.productDetailPage !== false;
  const rich = emphasis === "rich";

  const body = (
    <>
      {showImage ? (
        <div
          className={`relative ${effects.hoverLift || rich ? "site-zoom" : ""}`}
        >
          <SiteImage
            media={product.image}
            alt={product.name}
            seed={product.slug}
            ratio={ratio}
            className="rounded-none"
            rounded={false}
          />
          {product.badge ? (
            <span className="absolute top-3 left-3 rounded-site-pill bg-site-primary px-3 py-1 text-xs font-semibold text-site-on-primary shadow-site">
              {product.badge}
            </span>
          ) : null}
          {!product.available ? (
            <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold tracking-wide text-white uppercase">
              {t.outOfStock}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="site-heading site-h4 text-site-text">{product.name}</h3>
        {product.shortDescription ? (
          <p className="line-clamp-2 text-sm text-site-muted">
            {product.shortDescription}
          </p>
        ) : null}
        <DietaryTags product={product} />
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          {showPrice ? <Price product={product} /> : <span />}
          {clickable ? (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-site-primary">
              {t.viewDetails}
              <Icon name="arrow" size={16} />
            </span>
          ) : null}
        </div>
      </div>
    </>
  );

  const className = `group flex h-full flex-col overflow-hidden text-left ${
    rich && effects.glassCards ? "site-glass rounded-site-lg" : "site-card"
  } ${effects.hoverLift ? "site-lift" : "transition hover:shadow-site"}`;

  if (!clickable) return <article className={className}>{body}</article>;

  return (
    <article className={className}>
      <button
        type="button"
        onClick={() => openProduct(product.slug)}
        className="flex h-full w-full flex-col text-left"
        aria-label={`${product.name ?? ""} — ${t.viewDetails}`}
      >
        {body}
      </button>
    </article>
  );
}

/** A single dish line: name + dotted leader + price, the way menus read. */
export function MenuRow({
  product,
  showPrice = true,
  showImage = false,
  showTags = true,
}: {
  product: PublicProduct;
  showPrice?: boolean;
  showImage?: boolean;
  showTags?: boolean;
}) {
  const { openProduct, features, money } = useSite();
  const clickable = features.productDetailPage !== false;
  const price = money(product.price);

  const content = (
    <div className="flex w-full items-start gap-4">
      {showImage ? (
        <SiteImage
          media={product.image}
          alt={product.name}
          seed={product.slug}
          ratio="1 / 1"
          className="w-20 shrink-0 sm:w-24"
        />
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-3">
          <h3 className="site-heading site-h4 min-w-0 text-site-text">
            {product.name}
          </h3>
          <span
            className="mb-1 hidden h-px flex-1 sm:block"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, var(--site-border) 0 4px, transparent 4px 8px)",
            }}
            aria-hidden="true"
          />
          {showPrice && price ? (
            <span className="site-heading shrink-0 text-site-primary">
              {price}
            </span>
          ) : null}
        </div>
        {product.shortDescription ? (
          <p className="mt-1 text-sm text-site-muted">
            {product.shortDescription}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {showTags ? <DietaryTags product={product} /> : null}
          {product.unit ? (
            <span className="text-xs text-site-muted">{product.unit}</span>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (!clickable) return <li className="py-4">{content}</li>;

  return (
    <li className="py-4">
      <button
        type="button"
        onClick={() => openProduct(product.slug)}
        className="w-full cursor-pointer text-left transition hover:opacity-80"
      >
        {content}
      </button>
    </li>
  );
}
