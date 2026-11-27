/**
 * Line icons for the staff sidebar. Drawn on a 24-unit grid with a 1.75 stroke
 * in `currentColor`, so they take the link's colour in either theme and in its
 * active state without a second set of rules.
 *
 * Always decorative: the label beside each one is the accessible name.
 */

type IconProps = { className?: string };

function Svg({ className = "h-5 w-5", children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** A browser window: client websites. */
export function SitesIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9h18" />
      <path d="M6.5 6.5h.01M9 6.5h.01" />
    </Svg>
  );
}

/** Two people: staff and client accounts. */
export function AccountsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3 19.5c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <path d="M15.5 4.9a3.25 3.25 0 0 1 0 6.2" />
      <path d="M17.5 14.3c2.1.6 3.5 2.5 3.5 5.2" />
    </Svg>
  );
}

/** A price tag: plans, discounts and the new-customer offer. */
export function PricingIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 12.6V5a1.5 1.5 0 0 1 1.5-1.5h7.6a1.5 1.5 0 0 1 1.06.44l6.9 6.9a1.5 1.5 0 0 1 0 2.12l-7.6 7.6a1.5 1.5 0 0 1-2.12 0l-6.9-6.9a1.5 1.5 0 0 1-.44-1.06Z" />
      <circle cx="8.25" cy="8.25" r="1.5" />
    </Svg>
  );
}

/** A megaphone: advertising. */
export function AdsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 10v4a1 1 0 0 0 1 1h2l8 4.5V4.5L7 9H5a1 1 0 0 0-1 1Z" />
      <path d="M7.5 15l1.2 4.2a1 1 0 0 0 1 .8h.8a1 1 0 0 0 1-1.2L10.6 16" />
      <path d="M18.5 9a4 4 0 0 1 0 6" />
    </Svg>
  );
}

/** A pulse line: system health. */
export function SystemIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />
    </Svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export function SignOutIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 16l-4-4 4-4M6 12h10" />
    </Svg>
  );
}
