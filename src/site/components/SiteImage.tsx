import type { MediaRef } from "../api/types";

/**
 * Client sites frequently launch before the owner has uploaded photos, so a
 * missing image must still look deliberate: a tinted gradient panel with the
 * item's initial, seeded from its name so a grid does not look monotonous.
 */

function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) % 360;
  }
  return result;
}

type Props = {
  media?: MediaRef | null;
  alt?: string | null;
  className?: string;
  imgClassName?: string;
  ratio?: string;
  seed?: string;
  rounded?: boolean;
  sizes?: string;
  priority?: boolean;
};

export function SiteImage({
  media,
  alt,
  className = "",
  imgClassName = "",
  ratio = "4 / 3",
  seed,
  rounded = true,
  sizes,
  priority = false,
}: Props) {
  const label = alt ?? media?.alt ?? "";
  const radius = rounded ? "rounded-site-lg" : "";

  if (!media?.url) {
    const tone = hash(seed ?? label ?? "bbloom");
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden ${radius} ${className}`}
        style={{
          aspectRatio: ratio,
          backgroundImage: `linear-gradient(135deg,
            color-mix(in srgb, var(--site-primary) 22%, var(--site-surface)),
            color-mix(in srgb, var(--site-accent) 26%, var(--site-surface-alt)))`,
          filter: `hue-rotate(${tone % 24}deg)`,
        }}
        aria-hidden="true"
      >
        <span
          className="site-heading select-none text-4xl opacity-30"
          style={{ color: "var(--site-text)" }}
        >
          {(label || "·").trim().charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${radius} ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <img
        src={media.url}
        alt={label}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        className={`h-full w-full object-cover ${imgClassName}`}
      />
    </div>
  );
}
