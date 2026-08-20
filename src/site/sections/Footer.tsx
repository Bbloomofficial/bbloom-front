import type { PublicSection } from "../api/types";
import { Container } from "../components/layout";
import { Icon, SOCIAL_ICONS } from "../components/Icon";
import { useSite } from "../context";
import { bool, itemStr, list, str } from "../utils/content";

type Link = { label?: string; href?: string };

function Socials() {
  const { meta } = useSite();
  const entries = Object.entries(meta.social ?? {}).filter(([, href]) =>
    Boolean(href),
  );
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {entries.map(([network, href]) => (
        <a
          key={network}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={network}
          className="rounded-full border border-site-border p-2.5 text-site-muted transition hover:border-site-primary hover:text-site-primary"
        >
          <Icon name={SOCIAL_ICONS[network] ?? "website"} size={18} />
        </a>
      ))}
    </div>
  );
}

function Colophon({
  note,
  payments = false,
}: {
  note?: string;
  payments?: boolean;
}) {
  const { meta, t } = useSite();
  return (
    <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-site-border pt-6 text-sm text-site-muted sm:flex-row">
      <p>
        © {new Date().getFullYear()} {meta.businessName}
        {note ? ` · ${note}` : ""}
      </p>
      <div className="flex items-center gap-4">
        {payments ? (
          <span className="flex items-center gap-2">
            {["Visa", "Mastercard", "Apple Pay"].map((method) => (
              <span
                key={method}
                className="rounded-site border border-site-border px-2.5 py-1 text-[0.68rem] font-semibold tracking-wide uppercase"
              >
                {method}
              </span>
            ))}
          </span>
        ) : null}
        <a href="#top" className="site-link inline-flex items-center gap-1">
          {t.backToTop}
          <span className="rotate-[-90deg]">
            <Icon name="arrow" size={14} />
          </span>
        </a>
      </div>
    </div>
  );
}

function LinkList({ links }: { links: Link[] }) {
  if (links.length === 0) return null;
  return (
    <ul className="flex flex-col gap-2.5">
      {links.map((link, index) => {
        const label = itemStr(link, "label");
        if (!label) return null;
        return (
          <li key={index}>
            <a
              href={itemStr(link, "href") ?? "#"}
              className="site-link text-sm text-site-muted"
            >
              {label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function FooterSimple({ section }: { section: PublicSection }) {
  const { meta } = useSite();
  const showSocial = bool(section.content, "showSocial", true);

  return (
    <footer
      id={section.key}
      className="border-t border-site-border bg-site-surface py-12"
    >
      <Container>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="site-heading site-h3 text-site-text">
            {meta.businessName}
          </span>
          {str(section.content, "note") ? (
            <p className="max-w-md text-site-muted">
              {str(section.content, "note")}
            </p>
          ) : null}
          {showSocial ? <Socials /> : null}
        </div>
        <Colophon />
      </Container>
    </footer>
  );
}

export function FooterColumns({ section }: { section: PublicSection }) {
  const { meta } = useSite();
  const showSocial = bool(section.content, "showSocial", true);
  const links = list<Link>(section.content, "links");

  return (
    <footer
      id={section.key}
      className="border-t border-site-border bg-site-surface py-14"
    >
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-4">
            <span className="site-heading site-h3 text-site-text">
              {meta.businessName}
            </span>
            {str(section.content, "note") ? (
              <p className="max-w-xs text-sm text-site-muted">
                {str(section.content, "note")}
              </p>
            ) : null}
            {showSocial ? <Socials /> : null}
          </div>

          <nav aria-label={meta.businessName}>
            <LinkList links={links} />
          </nav>

          <div className="flex flex-col gap-2.5 text-sm text-site-muted">
            {meta.contact?.phone ? (
              <a
                href={`tel:${meta.contact.phone.replace(/\s+/g, "")}`}
                className="site-link"
              >
                {meta.contact.phone}
              </a>
            ) : null}
            {meta.contact?.email ? (
              <a
                href={`mailto:${meta.contact.email}`}
                className="site-link break-all"
              >
                {meta.contact.email}
              </a>
            ) : null}
            {meta.contact?.address ? <p>{meta.contact.address}</p> : null}
          </div>
        </div>
        <Colophon payments={bool(section.content, "showPaymentIcons", false)} />
      </Container>
    </footer>
  );
}

/** Multi-column footer with a gradient wash — the flagship close. */
export function FooterMega({ section }: { section: PublicSection }) {
  const { meta, effects } = useSite();
  const showSocial = bool(section.content, "showSocial", true);
  const columns = list(section.content, "columns");

  return (
    <footer
      id={section.key}
      className="relative overflow-hidden border-t border-site-border bg-site-surface py-16"
    >
      {effects.gradientText ? (
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[52rem] -translate-x-1/2 opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, var(--site-gradient-from), transparent)",
          }}
          aria-hidden="true"
        />
      ) : null}

      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-4">
            <span
              className={`site-heading site-h2 ${
                effects.gradientText ? "site-gradient-text" : "text-site-text"
              }`}
            >
              {meta.businessName}
            </span>
            {str(section.content, "note") ? (
              <p className="max-w-sm text-sm text-site-muted">
                {str(section.content, "note")}
              </p>
            ) : null}
            {showSocial ? <Socials /> : null}
            {meta.contact?.email ? (
              <a
                href={`mailto:${meta.contact.email}`}
                className="site-link text-sm text-site-muted"
              >
                {meta.contact.email}
              </a>
            ) : null}
          </div>

          {columns.map((column, index) => (
            <nav
              key={index}
              aria-label={itemStr(column, "title") ?? `#${index}`}
            >
              <h3 className="site-heading mb-4 text-sm tracking-wide text-site-text uppercase">
                {itemStr(column, "title")}
              </h3>
              <LinkList links={(column as { links?: Link[] }).links ?? []} />
            </nav>
          ))}
        </div>
        <Colophon payments={bool(section.content, "showPaymentIcons", false)} />
      </Container>
    </footer>
  );
}
