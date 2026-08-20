import type { SVGProps } from "react";

/**
 * Templates reference icons by name in their content (`items[].icon`), so this is
 * a small named set with a neutral fallback for anything unknown.
 */

type IconProps = SVGProps<SVGSVGElement> & {
  name?: string;
  size?: number;
  filled?: boolean;
};

const paths: Record<string, string> = {
  star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z",
  fire: "M12 3c.5 3 3 4 3 7a3 3 0 11-6 0c0-1 .4-1.8 1-2.5C9 9 7 10.5 7 13.5a5 5 0 0010 0C17 9 14 7 12 3z",
  leaf: "M20 4C10 4 4 8.5 4 15c0 2 .7 3.7 1.8 5M20 4c0 9-5.5 14-14 16M20 4c-1 6-5 9-11 10",
  wine: "M8 3h8l-.7 6a3.3 3.3 0 01-6.6 0zM12 15v6M8.5 21h7",
  music:
    "M9 18V6l11-2v12M9 18a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm11-2a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
  clock: "M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  truck:
    "M3 7h11v9H3zM14 10h4l3 3v3h-7zM7.5 19a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm10 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z",
  shield: "M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z",
  heart: "M12 20s-7-4.3-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.7-7 9-7 9z",
  phone:
    "M5 4h4l2 5-2.5 1.5a12 12 0 005 5L15 13l5 2v4a2 2 0 01-2.2 2A16 16 0 013 6.2 2 2 0 015 4z",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  map: "M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11zm0-8.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z",
  search: "M11 18a7 7 0 110-14 7 7 0 010 14zm10 3l-5.2-5.2",
  close: "M6 6l12 12M18 6L6 18",
  check: "M4 12.5l5 5L20 6.5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  arrowLeft: "M19 12H5M11 18l-6-6 6-6",
  chevronDown: "M6 9l6 6 6-6",
  chevronLeft: "M15 6l-6 6 6 6",
  chevronRight: "M9 6l6 6-6 6",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  sparkles:
    "M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8zM18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z",
  gift: "M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7S9.5 3 7.5 4.2 9 7 12 7zm0 0s2.5-4 4.5-2.8S15 7 12 7z",
  box: "M21 8l-9-5-9 5 9 5zM3 8v8l9 5 9-5V8M12 13v8",
  tag: "M3 12l9-9h8v8l-9 9zM16.5 7.5h.01",
  award: "M12 15a5 5 0 100-10 5 5 0 000 10zm-3 .8L8 22l4-2 4 2-1-6.2",
  users:
    "M16 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M9.5 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM21 20v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8",
  chat: "M21 12a8 8 0 01-11.6 7.1L3 21l1.9-6.4A8 8 0 1121 12z",
  calendar: "M3 8h18M7 3v4m10-4v4M4 6h16v15H4z",
  utensils:
    "M5 3v8a2 2 0 004 0V3M7 11v10M17 3c-1.5 1-2.5 3-2.5 5.5S16 13 17 13v8",
  coffee: "M4 8h13v6a5 5 0 01-10 0zM17 9h2a2.5 2.5 0 010 5h-2M4 21h14",
  instagram:
    "M4 8a4 4 0 014-4h8a4 4 0 014 4v8a4 4 0 01-4 4H8a4 4 0 01-4-4zm8 8a4 4 0 100-8 4 4 0 000 8zm5-8.5h.01",
  facebook:
    "M14 8h3V4h-3a4 4 0 00-4 4v2H8v4h2v7h4v-7h3l1-4h-4V8.8c0-.5.4-.8 1-.8z",
  tiktok:
    "M15 4c.5 2.5 2 3.8 4.5 4v3.2c-1.7 0-3.2-.5-4.5-1.4V16a5.5 5.5 0 11-5.5-5.5c.4 0 .7 0 1 .1v3.3a2.3 2.3 0 101.6 2.2V4z",
  whatsapp:
    "M3.5 20.5l1.4-4.2A8 8 0 1120.5 12a8 8 0 01-11.9 7l-5.1 1.5zM9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1.2-.4 1.2-1l-.2-1-1.8-.6-.8.9a5.7 5.7 0 01-2-2l.9-.8-.6-1.8-1-.2c-.6 0-1.2.5-1.2 1.2z",
  telegram: "M21 4L3 11l5 2 2 6 3-3.5 4 3z",
  globe:
    "M12 21a9 9 0 100-18 9 9 0 000 18zm0-18c-3 3-3 15 0 18M3.6 9h16.8M3.6 15h16.8",
};

export function Icon({
  name = "sparkles",
  size = 22,
  filled = false,
  ...rest
}: IconProps) {
  const d = paths[name] ?? paths[name?.toLowerCase() ?? ""] ?? paths.sparkles;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}

export function hasIcon(name: string | undefined): boolean {
  return Boolean(name && paths[name.toLowerCase()]);
}

/** Social links come back as a `{network: url}` map on the site metadata. */
export const SOCIAL_ICONS: Record<string, string> = {
  instagram: "instagram",
  facebook: "facebook",
  tiktok: "tiktok",
  whatsapp: "whatsapp",
  telegram: "telegram",
  youtube: "globe",
  x: "globe",
  twitter: "globe",
  website: "globe",
};
