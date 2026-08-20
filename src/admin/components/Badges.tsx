import type { ReactNode } from "react";

/** Small pill labels shared by the sites list and the site detail header. */

function Pill({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  const published = status === "PUBLISHED";
  return (
    <Pill
      className={
        published
          ? "border border-success-border bg-success-soft text-success"
          : "border border-ink-100 bg-ink-50 text-ink-600"
      }
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${published ? "bg-success" : "bg-ink-400"}`}
      />
      {label}
    </Pill>
  );
}

export function TierBadge({ label }: { label: string }) {
  return <Pill className="bg-tint text-tint-fg">{label}</Pill>;
}

export function MutedBadge({ label }: { label: string }) {
  return (
    <Pill className="border border-ink-100 bg-surface text-ink-600">
      {label}
    </Pill>
  );
}
