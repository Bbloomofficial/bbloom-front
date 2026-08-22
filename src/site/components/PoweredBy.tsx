import { useSite } from "../context";

/**
 * The credit a free website carries.
 *
 * It sits in the colophon of every template rather than in each one separately,
 * so a new template cannot ship without it by omission. It is styled from the
 * site's own tokens, which means it inherits the client's colours and reads as
 * part of their footer instead of an advert stapled to it.
 *
 * `branding.hidePoweredBy` turns it off for a plan that has paid to remove it.
 * Absent means shown — the honest default while every published site is free.
 */
export function PoweredBy() {
  const { meta, t } = useSite();
  if (meta.branding?.hidePoweredBy) return null;

  return (
    <a
      href="https://bbloom.ge/"
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-site border border-site-border px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-site-muted transition hover:border-site-primary hover:text-site-primary"
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
        <path
          d="M12 3c2 0 3.4 1.6 3.4 3.4 1.8 0 3.4 1.4 3.4 3.4S17.2 13.2 15.4 13.2c0 1.8-1.4 3.4-3.4 3.4s-3.4-1.6-3.4-3.4C6.8 13.2 5.2 11.8 5.2 9.8S6.8 6.4 8.6 6.4C8.6 4.6 10 3 12 3Z"
          fill="currentColor"
        />
        <path
          d="M12 15v6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      {t.poweredBy}
    </a>
  );
}

export default PoweredBy;
