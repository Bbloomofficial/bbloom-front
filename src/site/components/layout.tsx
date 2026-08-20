import type { ReactNode } from "react";
import { useSite } from "../context";
import { useReveal } from "../hooks/useReveal";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`site-container ${className}`}>{children}</div>;
}

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Backdrop for the band. `alt` uses the template's alternate surface. */
  tone?: "default" | "surface" | "alt" | "gradient";
  container?: boolean;
};

export function Band({
  id,
  children,
  className = "",
  tone = "default",
  container = true,
}: SectionProps) {
  const background =
    tone === "surface"
      ? "bg-site-surface"
      : tone === "alt"
        ? "bg-site-surface-alt"
        : tone === "gradient"
          ? "site-gradient-bg"
          : "";

  return (
    <section
      id={id}
      className={`site-section relative ${background} ${className}`}
    >
      {container ? <Container>{children}</Container> : children}
    </section>
  );
}

/** Wraps children in a scroll-reveal, but only when the template asks for it. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article" | "section";
}) {
  const { effects } = useSite();
  const enabled = Boolean(effects.scrollReveal);
  const { ref, visible } = useReveal<HTMLDivElement>(enabled);

  if (!enabled) return <Tag className={className}>{children}</Tag>;

  return (
    <Tag
      ref={ref as never}
      className={`site-reveal ${className}`}
      data-visible={visible ? "true" : "false"}
      style={{ ["--site-reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

type HeadingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  align?: "left" | "center";
  /** Renders the trailing highlight word with the template's gradient. */
  highlight?: string;
  className?: string;
  level?: 1 | 2;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  highlight,
  className = "",
  level = 2,
}: HeadingProps) {
  const { effects } = useSite();
  if (!eyebrow && !title && !subtitle) return null;

  const Tag = level === 1 ? "h1" : "h2";
  const alignment =
    align === "center"
      ? "text-center mx-auto items-center"
      : "text-left items-start";

  return (
    <div
      className={`flex flex-col gap-3 ${alignment} ${align === "center" ? "max-w-2xl" : ""} ${className}`}
    >
      {eyebrow ? <span className="site-eyebrow">{eyebrow}</span> : null}
      {title ? (
        <Tag className={`site-heading ${level === 1 ? "site-h1" : "site-h2"}`}>
          {title}
          {highlight ? (
            <>
              {" "}
              <span
                className={
                  effects.gradientText
                    ? "site-gradient-text"
                    : "text-site-primary"
                }
              >
                {highlight}
              </span>
            </>
          ) : null}
        </Tag>
      ) : null}
      {subtitle ? (
        <p className="site-lead text-site-muted">{subtitle}</p>
      ) : null}
    </div>
  );
}
