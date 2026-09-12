import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";
import TemplateThumb from "../components/TemplateThumb";
import { fetchTemplates, groupByCategory } from "../api/templates";
import type { SiteTemplate } from "../api/templates";
import { clearDraft, hasEdits, readDraft } from "../try/draft";
import { tryStrings } from "../try/strings";

/**
 * The front door of the build-it-first flow: pick a design and start editing,
 * with no account and no commitment. Templates without a published demo are
 * hidden, because the demo *is* the starting content — there is nothing to edit
 * without one.
 */
export default function TryStart() {
  const { locale } = useI18n();
  const t = tryStrings(locale);
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<SiteTemplate[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [draft, setDraft] = useState(() => readDraft());

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    fetchTemplates()
      .then((list) => {
        if (!cancelled) setTemplates(list);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const usable = useMemo(
    () => (templates ?? []).filter((template) => template.demoSlug),
    [templates],
  );

  // Fifteen designs in one flat grid is a wall. Grouped by who they are for, a
  // visitor can skip four fifths of it on the heading alone.
  const groups = useMemo(() => groupByCategory(usable), [usable]);

  const resumable = hasEdits(draft) ? draft : null;

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          {t.galleryTitle}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-600">
          {t.gallerySubtitle}
        </p>
        <p className="mt-3 text-sm text-ink-500">{t.galleryHint}</p>
        {/* Advisory, not a gate. There is no account here to measure a design
            against, so every design stays usable and the badges below only say
            which level each one is — the plan decision happens later, when
            there is something worth keeping. */}
        <p className="mt-2 text-sm text-ink-500">
          {t.planHint}{" "}
          <Link to="/pricing" className="font-semibold text-bloom-600 hover:underline">
            {t.planHintLink}
          </Link>
        </p>
      </div>

      {resumable ? (
        <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-2xl border border-tint-strong bg-tint p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-ink-900">{t.resume}</p>
            <p className="mt-1 text-sm text-ink-600">{t.resumeBody}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                clearDraft();
                setDraft(null);
              }}
            >
              {t.startOver}
            </button>
            <Link
              to={`/try/${resumable.templateCode}`}
              className="btn-primary"
            >
              {t.resumeCta}
            </Link>
          </div>
        </div>
      ) : null}

      {failed ? (
        <div className="mx-auto mt-12 max-w-md text-center">
          <p className="text-sm text-ink-600">{t.loadFailed}</p>
          <button
            type="button"
            className="btn-secondary mt-4"
            onClick={() => setAttempt((value) => value + 1)}
          >
            {t.retry}
          </button>
        </div>
      ) : null}

      {!templates && !failed ? (
        <p className="mt-12 text-center text-sm text-ink-500">{t.loading}</p>
      ) : null}

      {groups.map(({ category, templates: group }) => (
        <section key={category} className="mt-12">
          {groups.length > 1 ? (
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-400">
              {t.categories[category] ?? category}
            </h2>
          ) : null}
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {group.map((template) => (
              <article key={template.code} className="card overflow-hidden">
                <div className="aspect-[4/3] w-full overflow-hidden bg-ink-50">
                  <TemplateThumb template={template} alt={template.name} />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-ink-900">
                      {template.name}
                    </h3>
                    {t.tiers[template.tier] && (
                      <span className="shrink-0 rounded-full bg-ink-50 px-2.5 py-1 text-[11px] font-bold text-ink-600">
                        {t.tiers[template.tier]}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-600">{template.tagline}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => navigate(`/try/${template.code}`)}
                    >
                      {t.choose}
                    </button>
                    <Link
                      to={`/site/${template.demoSlug}`}
                      className="rounded-full px-3 py-2 text-sm font-semibold text-ink-500 hover:text-ink-900"
                    >
                      {t.preview}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
