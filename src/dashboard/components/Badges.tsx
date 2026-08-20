import { useI18n } from "../../i18n";
import { dashboardStrings } from "../strings";

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-bloom-100 text-bloom-800 dark:bg-bloom-900/50 dark:text-bloom-200",
  CONTACTED: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  HANDLED: "bg-success-soft text-success border border-success-border",
  SPAM: "bg-ink-100 text-ink-600",
  ARCHIVED: "bg-ink-100 text-ink-600",
};

const TYPE_STYLES: Record<string, string> = {
  GENERAL: "bg-ink-100 text-ink-800",
  PRODUCT: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  RESERVATION:
    "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  NEWSLETTER:
    "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200",
};

const base =
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap";

export function StatusBadge({ status }: { status: string }) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  return (
    <span className={`${base} ${STATUS_STYLES[status] ?? "bg-ink-100 text-ink-600"}`}>
      {t.statuses[status] ?? status}
    </span>
  );
}

export function TypeBadge({ type }: { type: string }) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  return (
    <span className={`${base} ${TYPE_STYLES[type] ?? "bg-ink-100 text-ink-600"}`}>
      {t.types[type] ?? type}
    </span>
  );
}
