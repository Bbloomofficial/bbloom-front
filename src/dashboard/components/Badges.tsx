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

/**
 * `DRAFT` and `SUSPENDED` both mean "not visible", but they are not the same
 * thing to a client — one has never been published, the other was taken down
 * for non-payment — so they never share a colour.
 */
const SITE_STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-success-soft text-success border border-success-border",
  DRAFT: "bg-ink-100 text-ink-600",
  SUSPENDED: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  ARCHIVED: "bg-ink-100 text-ink-400",
};

const SITE_STATUS_DOTS: Record<string, string> = {
  PUBLISHED: "bg-success",
  DRAFT: "bg-ink-400",
  SUSPENDED: "bg-amber-500",
  ARCHIVED: "bg-ink-400",
};

export function SiteStatusBadge({ status }: { status: string }) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  return (
    <span
      className={`${base} gap-2 ${SITE_STATUS_STYLES[status] ?? "bg-ink-100 text-ink-600"}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${SITE_STATUS_DOTS[status] ?? "bg-ink-400"}`}
      />
      {t.siteStatuses[status] ?? status.toLowerCase()}
    </span>
  );
}

const SUBSCRIPTION_STYLES: Record<string, string> = {
  ACTIVE: "bg-success-soft text-success border border-success-border",
  TRIALING: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  GRACE: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  EXPIRED: "bg-ink-100 text-ink-600",
  CANCELLED: "bg-ink-100 text-ink-600",
};

export function SubscriptionBadge({ status }: { status: string }) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  return (
    <span className={`${base} ${SUBSCRIPTION_STYLES[status] ?? "bg-ink-100 text-ink-600"}`}>
      {t.subscriptionStatuses[status] ?? status.toLowerCase()}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  return (
    <span className={`${base} bg-tint text-tint-fg`}>
      {t.roles[role] ?? role}
    </span>
  );
}

/**
 * Where the money is. Only the bank moves this, so the colours describe the
 * bank's answer and nothing the shop did.
 *
 * `AWAITING_PAYMENT` is amber rather than grey on purpose: it is the one status
 * that is still moving, and it is the one a shop must not act on.
 */
const ORDER_STATUS_STYLES: Record<string, string> = {
  AWAITING_PAYMENT:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  PAID: "bg-success-soft text-success border border-success-border",
  FAILED: "bg-ink-100 text-ink-600",
  EXPIRED: "bg-ink-100 text-ink-600",
  CANCELLED: "bg-ink-100 text-ink-600",
  REFUNDED:
    "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
};

export function OrderStatusBadge({ status }: { status: string }) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  return (
    <span
      className={`${base} ${ORDER_STATUS_STYLES[status] ?? "bg-ink-100 text-ink-600"}`}
    >
      {t.orderStatuses[status] ?? status}
    </span>
  );
}

/**
 * How far the shop has got. A separate badge from the one above rather than a
 * combined state, because "paid" and "cancelled" are both true of a refund
 * waiting to be made and one badge would have to drop one of them.
 */
const FULFILMENT_STYLES: Record<string, string> = {
  NEW: "bg-bloom-100 text-bloom-800 dark:bg-bloom-900/50 dark:text-bloom-200",
  IN_PROGRESS: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  COMPLETED: "bg-success-soft text-success border border-success-border",
  CANCELLED: "bg-ink-100 text-ink-600",
};

export function FulfilmentBadge({ fulfilment }: { fulfilment: string }) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  return (
    <span
      className={`${base} ${FULFILMENT_STYLES[fulfilment] ?? "bg-ink-100 text-ink-600"}`}
    >
      {t.fulfilments[fulfilment] ?? fulfilment}
    </span>
  );
}
