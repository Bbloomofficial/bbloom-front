import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { useSite } from "../context";

type Tone = "primary" | "outline" | "ghost" | "gradient";

type CommonProps = {
  children: ReactNode;
  tone?: Tone;
  className?: string;
};

/**
 * Shape follows the template's `buttonStyle` token; tone is chosen by the
 * section. A primary button becomes a gradient one when the template enables
 * gradient effects, which is what makes the flagships feel different.
 */
function useButtonAttrs(tone: Tone) {
  const { buttonStyle, effects } = useSite();
  const resolvedTone: Tone =
    tone === "primary" && effects.gradientText && buttonStyle === "pill"
      ? "gradient"
      : tone;
  const shape =
    tone === "primary" || tone === "gradient"
      ? buttonStyle
      : buttonStyle === "pill"
        ? "pill"
        : buttonStyle;
  return { "data-tone": resolvedTone, "data-shape": shape };
}

export function SiteButton({
  children,
  tone = "primary",
  className = "",
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  const attrs = useButtonAttrs(tone);
  return (
    <button
      type="button"
      className={`site-btn ${className}`}
      {...attrs}
      {...rest}
    >
      {children}
    </button>
  );
}

export function SiteLinkButton({
  children,
  tone = "primary",
  className = "",
  href,
  ...rest
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const attrs = useButtonAttrs(tone);
  if (!href) return null;
  const external = /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      className={`site-btn ${className}`}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      {...attrs}
      {...rest}
    >
      {children}
    </a>
  );
}

/** Renders a CTA only when the client actually filled in a label. */
export function Cta({
  label,
  href,
  tone = "primary",
  className,
}: {
  label?: string;
  href?: string;
  tone?: Tone;
  className?: string;
}) {
  if (!label) return null;
  return (
    <SiteLinkButton href={href ?? "#contact"} tone={tone} className={className}>
      {label}
    </SiteLinkButton>
  );
}
