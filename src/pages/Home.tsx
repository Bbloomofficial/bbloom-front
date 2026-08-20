import { Link } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading'
import ServiceCard from '../components/ServiceCard'
import CtaBand from '../components/CtaBand'
import FaqAccordion from '../components/FaqAccordion'
import { useI18n } from '../i18n'

function HeroShowcase() {
  const { t } = useI18n()
  const { showcase } = t.hero

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-bloom-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-bloom-600/20 blur-3xl" />

      {/* Social post card */}
      <div className="relative rounded-3xl border border-ink-100 bg-surface p-4 shadow-xl shadow-black/5 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-bloom-400 to-bloom-600" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink-900">{showcase.handle}</p>
            <p className="text-[11px] text-ink-400">{showcase.adLabel}</p>
          </div>
        </div>

        <div className="mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-bloom-100 to-ink-50">
          <div className="flex h-full w-full items-center justify-center">
            <div className="grid w-2/3 gap-2">
              <span className="h-2.5 rounded-full bg-bloom-400/60" />
              <span className="h-2.5 w-4/5 rounded-full bg-bloom-400/40" />
              <span className="h-2.5 w-3/5 rounded-full bg-bloom-400/30" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 text-ink-400">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M12 21s-7.5-4.6-9.4-8.6A5.3 5.3 0 0 1 12 6.6a5.3 5.3 0 0 1 9.4 5.8C19.5 16.4 12 21 12 21Z" />
          </svg>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M12 3c5 0 9 3.4 9 7.6 0 4.2-4 7.6-9 7.6-.9 0-1.7-.1-2.5-.3L4 21l1.3-3.6C3.9 16 3 13.4 3 10.6 3 6.4 7 3 12 3Z" />
          </svg>
          <span className="ml-auto h-2 w-16 rounded-full bg-ink-100" />
        </div>
      </div>

      {/* Website wireframe card */}
      <div className="relative mt-5 rounded-3xl border border-ink-100 bg-surface p-4 shadow-xl shadow-black/5 sm:ml-10 sm:p-5">
        <div className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-ink-100" />
          <span className="h-2 w-2 rounded-full bg-ink-100" />
          <span className="h-2 w-2 rounded-full bg-ink-100" />
          <span className="ml-2 truncate text-[11px] text-ink-400">{showcase.siteUrl}</span>
        </div>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          {showcase.siteLabel}
        </p>
        <div className="mt-3 space-y-2">
          <span className="block h-3 w-3/4 rounded-full bg-ink-100" />
          <span className="block h-2 w-full rounded-full bg-ink-50" />
          <span className="block h-2 w-5/6 rounded-full bg-ink-50" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <span className="h-10 rounded-xl bg-ink-50" />
          <span className="h-10 rounded-xl bg-ink-50" />
          <span className="h-10 rounded-xl bg-ink-50" />
        </div>
        <span className="mt-4 block h-8 w-28 rounded-full bg-bloom-600" />
      </div>
    </div>
  )
}

export default function Home() {
  const { t } = useI18n()

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink-100 bg-ink-50/40">
        <div className="container-page grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
          <div className="animate-rise">
            <span className="eyebrow">{t.hero.eyebrow}</span>
            <h1 className="mt-5 text-[2rem] font-extrabold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
              {t.hero.titleLine1}
              <br />
              <span className="text-bloom-600">{t.hero.titleLine2}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-600 sm:mt-6 sm:text-lg">
              {t.hero.subtitle}
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link to="/contact" className="btn-primary w-full sm:w-auto">
                {t.hero.primaryCta}
              </Link>
              <Link to="/services" className="btn-secondary w-full sm:w-auto">
                {t.hero.secondaryCta}
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
              {t.hero.badges.map((badge) => (
                <li key={badge} className="flex items-center gap-2 text-sm text-ink-600">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0 text-emerald-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                  {badge}
                </li>
              ))}
            </ul>
          </div>

          <HeroShowcase />
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow={t.problem.eyebrow}
          title={t.problem.title}
          description={t.problem.description}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {t.problem.items.map((item) => (
            <div key={item.title} className="card p-6">
              <h3 className="text-base font-bold text-ink-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink-50/50 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow={t.servicesSection.eyebrow}
            title={t.servicesSection.title}
            description={t.servicesSection.description}
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {t.services.slice(0, 3).map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/services" className="btn-secondary w-full sm:w-auto">
              {t.servicesSection.seeAll}
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading eyebrow={t.process.eyebrow} title={t.process.title} />
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.steps.map((step) => (
            <li key={step.number} className="card p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-tint text-sm font-extrabold text-tint-fg">
                {step.number}
              </span>
              <h3 className="mt-4 text-base font-bold text-ink-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-contrast py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-bloom-300">
              {t.whyUs.eyebrow}
            </span>
            <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              {t.whyUs.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
              {t.whyUs.description}
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {t.whyUs.items.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/contact" className="btn-primary w-full sm:w-auto">
              {t.whyUs.cta}
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading eyebrow={t.faqSection.eyebrow} title={t.faqSection.title} />
        <div className="mt-12">
          <FaqAccordion items={t.faqs} />
        </div>
      </section>

      <CtaBand />
    </>
  )
}
