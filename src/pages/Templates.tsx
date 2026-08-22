import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading'
import CtaBand from '../components/CtaBand'
import { fetchTemplates, templateThumbnail } from '../api/templates'
import type { SiteTemplate } from '../api/templates'
import { useI18n } from '../i18n'

type Status = 'loading' | 'ready' | 'error'

function TemplateCard({ template }: { template: SiteTemplate }) {
  const { t } = useI18n()
  const copy = t.templateCopy[template.code]
  const name = copy?.name ?? template.name
  const tagline = copy?.tagline ?? template.tagline
  const description = copy?.description ?? template.description
  const tier = t.templatesPage.tiers[template.tier] ?? template.tier

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[1.75rem] border border-ink-100 bg-surface transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-bloom-600/10">
      <div className="relative aspect-16/10 overflow-hidden bg-ink-50">
        <img
          src={templateThumbnail(template)}
          alt={t.templatesPage.previewAlt.replace('{name}', name)}
          loading="lazy"
          className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
        />
        {template.flagship && (
          <span className="absolute start-4 top-4 rounded-full bg-bloom-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
            {t.templatesPage.flagship}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-tint px-2.5 py-1 text-xs font-bold text-tint-fg">
            {tier}
          </span>
          <span className="text-xs font-semibold text-ink-400">
            {t.templatesPage.categories[template.category] ?? template.category}
          </span>
        </div>

        <h2 className="mt-3 text-lg font-bold text-ink-900">{name}</h2>
        <p className="mt-1 text-sm font-semibold text-tint-fg">{tagline}</p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">{description}</p>

        {template.demoSlug ? (
          <div className="mt-6 flex flex-col gap-2">
            <Link to={`/try/${template.code}`} className="btn-primary">
              {t.templatesPage.useTemplate}
            </Link>
            <Link
              to={`/site/${template.demoSlug}`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
            >
            {t.templatesPage.viewDemo}
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4 shrink-0"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 3a1 1 0 0 0 0 2h1.6l-5.3 5.3a1 1 0 0 0 1.4 1.4L15 6.4V8a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-4ZM5 5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a1 1 0 1 0-2 0v3H5V7h3a1 1 0 0 0 0-2H5Z" />
            </svg>
            </Link>
          </div>
        ) : (
          <span className="mt-6 inline-flex items-center justify-center rounded-full border border-dashed border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-400">
            {t.templatesPage.demoPending}
          </span>
        )}
      </div>
    </article>
  )
}

export default function Templates() {
  const { t } = useI18n()
  const [templates, setTemplates] = useState<SiteTemplate[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [attempt, setAttempt] = useState(0)
  const [category, setCategory] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    fetchTemplates()
      .then((items) => {
        if (cancelled) return
        setTemplates(items)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  // Categories come from the payload so a new one appears without a code change.
  const categories = useMemo(
    () => [...new Set(templates.map((template) => template.category))],
    [templates],
  )

  const visible = category
    ? templates.filter((template) => template.category === category)
    : templates

  return (
    <>
      <section className="border-b border-ink-100 bg-ink-50/50 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow={t.templatesPage.eyebrow}
            title={t.templatesPage.title}
            description={t.templatesPage.description}
          />
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        {status === 'loading' && (
          <p className="text-center text-sm text-ink-400">{t.templatesPage.loading}</p>
        )}

        {status === 'error' && (
          <div className="mx-auto max-w-md text-center">
            <p className="text-sm text-ink-600">{t.templatesPage.error}</p>
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
              className="btn-secondary mt-4"
            >
              {t.templatesPage.retry}
            </button>
          </div>
        )}

        {status === 'ready' && (
          <>
            {categories.length > 1 && (
              <div className="mb-10 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCategory(null)}
                  aria-pressed={category === null}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    category === null
                      ? 'bg-bloom-600 text-white'
                      : 'border border-ink-100 text-ink-600 hover:text-ink-900'
                  }`}
                >
                  {t.templatesPage.filterAll}
                </button>
                {categories.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategory(value)}
                    aria-pressed={category === value}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      category === value
                        ? 'bg-bloom-600 text-white'
                        : 'border border-ink-100 text-ink-600 hover:text-ink-900'
                    }`}
                  >
                    {t.templatesPage.categories[value] ?? value}
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((template) => (
                <TemplateCard key={template.code} template={template} />
              ))}
            </div>

            <p className="mt-10 text-center text-sm text-ink-400">{t.templatesPage.note}</p>
          </>
        )}
      </section>

      <CtaBand />
    </>
  )
}
