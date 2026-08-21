import type { PublicSection } from "../api/types";
import { Band, Reveal } from "../components/layout";
import { Icon } from "../components/Icon";
import { useSite } from "../context";
import { itemStr, list } from "../utils/content";

type Item = { icon?: string; title?: string; text?: string };

/** Three reassurance cards — the classic shop's value props. */
export function FeaturesThreeColumns({ section }: { section: PublicSection }) {
  const items = list<Item>(section.content, "items");
  if (items.length === 0) return null;

  return (
    <Band id={section.key} tone="surface">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <Reveal key={index} delay={index * 80}>
            <div className="site-card flex h-full flex-col gap-3 p-6">
              <span className="text-site-primary">
                <Icon name={itemStr(item, "icon") ?? "sparkles"} size={26} />
              </span>
              <h3 className="site-heading site-h4 text-site-text">
                {itemStr(item, "title")}
              </h3>
              <p className="text-sm text-site-muted">{itemStr(item, "text")}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Band>
  );
}

/** Horizontal strip of short guarantees — the flagship trust bars. */
export function FeaturesIconStrip({ section }: { section: PublicSection }) {
  const { effects } = useSite();
  const items = list<Item>(section.content, "items");
  if (items.length === 0) return null;

  return (
    <section
      id={section.key}
      className="border-y border-site-border bg-site-surface/40 py-8"
    >
      <div className="site-container">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <Reveal as="li" key={index} delay={index * 70}>
              <div
                className={`flex h-full items-start gap-3 ${
                  effects.glassCards ? "site-glass rounded-site-lg p-4" : ""
                }`}
              >
                <span className="mt-0.5 shrink-0 text-site-accent">
                  <Icon name={itemStr(item, "icon") ?? "check"} size={22} />
                </span>
                <div>
                  <p className="site-heading text-base text-site-text">
                    {itemStr(item, "title")}
                  </p>
                  <p className="text-sm text-site-muted">
                    {itemStr(item, "text")}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
