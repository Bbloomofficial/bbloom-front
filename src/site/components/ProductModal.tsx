import { useEffect, useState } from "react";
import { useSite } from "../context";
import { useLockScroll } from "../hooks/useLockScroll";
import { EnquiryForm } from "./EnquiryForm";
import { Icon } from "./Icon";
import { DietaryTags, Price } from "./ProductCard";
import { RichText } from "./RichText";
import { SiteImage } from "./SiteImage";

/**
 * Catalog-only detail view: gallery, description and an enquiry form. Opened
 * from a card and addressable at `/site/:slug/p/:productSlug`.
 */
export function ProductModal({ slug }: { slug: string }) {
  const { productBySlug, closeProduct, t, effects } = useSite();
  const product = productBySlug(slug);
  const [active, setActive] = useState(0);
  const [asking, setAsking] = useState(false);

  useLockScroll(Boolean(product));

  useEffect(() => {
    setActive(0);
    setAsking(false);
  }, [slug]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeProduct();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeProduct]);

  if (!product) return null;

  const images = [product.image, ...(product.gallery ?? [])].filter(
    (item): item is NonNullable<typeof item> => Boolean(item?.url),
  );
  const current = images[active] ?? product.image;

  return (
    <div
      className="fixed inset-0 z-90 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={product.name ?? t.aboutProduct}
      onClick={closeProduct}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={`site-fade-up relative max-h-[92vh] w-full max-w-4xl overflow-y-auto ${
          effects.glassCards
            ? "site-glass"
            : "bg-site-surface border border-site-border"
        } rounded-t-site-lg sm:rounded-site-lg`}
        style={{
          backgroundColor: effects.glassCards
            ? undefined
            : "var(--site-surface)",
        }}
      >
        <button
          type="button"
          onClick={closeProduct}
          aria-label={t.close}
          className="absolute top-4 right-4 z-10 rounded-full border border-site-border bg-site-surface p-2 text-site-text transition hover:text-site-primary"
        >
          <Icon name="close" size={18} />
        </button>

        <div className="grid gap-0 md:grid-cols-2">
          <div className="p-4 sm:p-6">
            <SiteImage
              media={current}
              alt={product.name}
              seed={product.slug}
              ratio="1 / 1"
              priority
            />
            {images.length > 1 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto site-scrollbar-none">
                {images.map((image, index) => (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    onClick={() => setActive(index)}
                    className={`w-20 shrink-0 overflow-hidden rounded-site border transition ${
                      index === active
                        ? "border-site-primary"
                        : "border-site-border opacity-70 hover:opacity-100"
                    }`}
                    aria-label={`${product.name ?? ""} ${index + 1}`}
                  >
                    <SiteImage
                      media={image}
                      alt=""
                      ratio="1 / 1"
                      rounded={false}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 p-6 sm:p-8">
            {product.badge ? (
              <span className="site-eyebrow">{product.badge}</span>
            ) : null}
            <h2 className="site-heading site-h2 text-site-text">
              {product.name}
            </h2>
            <Price product={product} className="text-lg" />
            <DietaryTags product={product} />

            {product.shortDescription ? (
              <p className="site-lead text-site-muted">
                {product.shortDescription}
              </p>
            ) : null}
            {product.description ? (
              <RichText
                html={product.description}
                className="text-site-muted"
              />
            ) : null}

            {asking ? (
              <EnquiryForm
                type="PRODUCT"
                compact
                subject={`${t.productSubject}: ${product.name ?? product.slug}`}
                productSlug={product.slug}
                className="mt-2"
              />
            ) : (
              <button
                type="button"
                onClick={() => setAsking(true)}
                className="site-btn mt-2 self-start"
                data-tone="primary"
                data-shape="pill"
              >
                {t.enquire}
                <Icon name="arrow" size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
