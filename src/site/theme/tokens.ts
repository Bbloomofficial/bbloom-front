import type { CSSProperties } from "react";
import type { SiteTheme } from "../api/types";

/**
 * Turns the backend's theme tokens into the `--site-*` custom properties the
 * templates render from. Everything is scoped to the site wrapper, so the
 * marketing site's own palette and dark-mode class are never involved.
 */

type Ramp = {
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  lead: string;
  tracking: string;
  headingLineHeight: string;
};

const RAMPS: Record<NonNullable<SiteTheme["fonts"]>["scale"] & string, Ramp> = {
  compact: {
    h1: "clamp(2rem, 1.4rem + 2.4vw, 3.1rem)",
    h2: "clamp(1.5rem, 1.2rem + 1.3vw, 2.1rem)",
    h3: "clamp(1.15rem, 1.05rem + 0.5vw, 1.4rem)",
    h4: "1.05rem",
    lead: "clamp(1rem, 0.97rem + 0.15vw, 1.1rem)",
    tracking: "-0.01em",
    headingLineHeight: "1.2",
  },
  comfortable: {
    h1: "clamp(2.25rem, 1.5rem + 3vw, 3.75rem)",
    h2: "clamp(1.65rem, 1.25rem + 1.7vw, 2.5rem)",
    h3: "clamp(1.2rem, 1.08rem + 0.6vw, 1.55rem)",
    h4: "1.1rem",
    lead: "clamp(1.05rem, 1rem + 0.25vw, 1.2rem)",
    tracking: "-0.015em",
    headingLineHeight: "1.15",
  },
  elegant: {
    h1: "clamp(2.5rem, 1.5rem + 4vw, 4.5rem)",
    h2: "clamp(1.8rem, 1.3rem + 2.2vw, 3rem)",
    h3: "clamp(1.25rem, 1.1rem + 0.8vw, 1.7rem)",
    h4: "1.15rem",
    lead: "clamp(1.05rem, 1rem + 0.35vw, 1.3rem)",
    tracking: "0.005em",
    headingLineHeight: "1.1",
  },
  expressive: {
    h1: "clamp(2.6rem, 1.4rem + 5vw, 5.25rem)",
    h2: "clamp(1.9rem, 1.3rem + 2.8vw, 3.5rem)",
    h3: "clamp(1.3rem, 1.1rem + 1vw, 1.9rem)",
    h4: "1.2rem",
    lead: "clamp(1.05rem, 1rem + 0.4vw, 1.35rem)",
    tracking: "-0.03em",
    headingLineHeight: "1.03",
  },
};

const RADII: Record<string, { base: string; lg: string; pill: string }> = {
  sm: { base: "4px", lg: "8px", pill: "4px" },
  md: { base: "10px", lg: "16px", pill: "999px" },
  lg: { base: "18px", lg: "28px", pill: "999px" },
};

const DENSITY: Record<string, { sectionY: string; gap: string }> = {
  comfortable: {
    sectionY: "clamp(3.5rem, 2.5rem + 3vw, 5.5rem)",
    gap: "1.5rem",
  },
  spacious: { sectionY: "clamp(4.5rem, 3rem + 5vw, 8rem)", gap: "2rem" },
};

/** Georgian glyphs are taller, so every stack keeps a Georgian fallback. */
function withGeorgian(stack: string | undefined, serif: boolean): string {
  const fallback = serif
    ? "'Noto Serif Georgian', Georgia, serif"
    : "'Noto Sans Georgian', ui-sans-serif, system-ui, sans-serif";
  return stack ? `${stack}, ${fallback}` : fallback;
}

function alpha(
  color: string | undefined,
  amount: number,
  fallback: string,
): string {
  if (!color) return fallback;
  const hex = color.trim();
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return color;
  const value = parseInt(match[1], 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${amount})`;
}

export function themeToCssVars(
  theme: SiteTheme | null | undefined,
): CSSProperties {
  const colors = theme?.colors ?? {};
  const fonts = theme?.fonts ?? {};
  const ramp = RAMPS[fonts.scale ?? "comfortable"] ?? RAMPS.comfortable;
  const radius = RADII[theme?.radius ?? "md"] ?? RADII.md;
  const density =
    DENSITY[theme?.density ?? "comfortable"] ?? DENSITY.comfortable;
  const dark = theme?.mode === "dark";

  const primary = colors.primary ?? "#111827";
  const surface = colors.surface ?? (dark ? "#141821" : "#f7f7f8");
  const surfaceAlt = colors.surfaceAlt ?? surface;
  const serifHeading =
    /serif/i.test(fonts.heading ?? "") &&
    !/sans-serif/i.test(fonts.heading ?? "");

  const glow =
    theme?.shadow === "glow"
      ? `0 24px 60px -24px ${alpha(primary, 0.55, "rgba(0,0,0,0.45)")}`
      : dark
        ? "0 12px 32px -16px rgba(0,0,0,0.7)"
        : "0 10px 30px -18px rgba(15,23,42,0.35)";

  const glowLg =
    theme?.shadow === "glow"
      ? `0 45px 120px -40px ${alpha(primary, 0.65, "rgba(0,0,0,0.55)")}`
      : dark
        ? "0 24px 70px -28px rgba(0,0,0,0.75)"
        : "0 24px 60px -30px rgba(15,23,42,0.28)";

  return {
    "--site-bg": colors.background ?? (dark ? "#0b0d12" : "#ffffff"),
    "--site-surface": surface,
    "--site-surface-alt": surfaceAlt,
    "--site-text": colors.text ?? (dark ? "#f5f7fa" : "#16181d"),
    "--site-muted": colors.muted ?? (dark ? "#9aa4b8" : "#6b7280"),
    "--site-primary": primary,
    "--site-primary-contrast": colors.primaryContrast ?? "#ffffff",
    "--site-accent": colors.accent ?? primary,
    "--site-border":
      colors.border ?? (dark ? "rgba(255,255,255,0.08)" : "#e5e7eb"),
    "--site-gradient-from": colors.gradientFrom ?? primary,
    "--site-gradient-to": colors.gradientTo ?? colors.accent ?? primary,
    "--site-primary-soft": alpha(
      primary,
      dark ? 0.18 : 0.1,
      "rgba(0,0,0,0.06)",
    ),
    "--site-overlay": dark ? "rgba(0,0,0,0.55)" : "rgba(15,23,42,0.45)",

    "--site-font-heading": withGeorgian(fonts.heading, serifHeading),
    "--site-font-body": withGeorgian(fonts.body, false),
    "--site-heading-weight": String(fonts.headingWeight ?? 600),
    "--site-heading-tracking": ramp.tracking,
    "--site-heading-leading": ramp.headingLineHeight,
    "--site-h1": ramp.h1,
    "--site-h2": ramp.h2,
    "--site-h3": ramp.h3,
    "--site-h4": ramp.h4,
    "--site-lead": ramp.lead,

    "--site-radius": radius.base,
    "--site-radius-lg": radius.lg,
    "--site-radius-pill": radius.pill,
    "--site-shadow": glow,
    "--site-shadow-lg": glowLg,
    "--site-section-y": density.sectionY,
    "--site-gap": density.gap,
    "--site-container": theme?.containerWidth ?? "1180px",

    colorScheme: dark ? "dark" : "light",
  } as CSSProperties;
}
