import { Link } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading'
import FaqAccordion from '../components/FaqAccordion'
import CtaBand from '../components/CtaBand'
import { useI18n } from '../i18n'

export default function Pricing() {
  const { t } = useI18n()

  return (
    <>
      <section className="border-b border-ink-100 bg-ink-50/50 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow={t.pricingPage.eyebrow}
            title={t.pricingPage.title}
            description={t.pricingPage.description}
          />
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid items-start gap-6 lg:grid-cols-3">
          {t.plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex min-w-0 flex-col break-words rounded-[2rem] border bg-surface p-6 sm:p-8 ${
                plan.featured
                  ? 'border-bloom-200 shadow-2xl shadow-bloom-600/10 dark:border-bloom-700 lg:-mt-4 lg:pb-12'
                  : 'border-ink-100'
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 start-6 rounded-full bg-bloom-600 px-3 py-1 text-xs font-bold text-white sm:start-8">
                  {t.pricingPage.mostPopular}
                </span>
              )}
              <h2 className="text-lg font-bold text-ink-900">{plan.name}</h2>
              <p className="mt-1 text-sm text-ink-600">{plan.summary}</p>
              <p className="mt-6">
                <span className="inline-flex min-w-0 items-center gap-2 break-words rounded-full border border-dashed border-ink-200 px-3 py-1.5 text-sm font-semibold text-ink-500">
                  <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
                    <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm-1 2v4.4l3.3 2 .7-1.2-2.5-1.5V6H9Z" />
                  </svg>
                  {t.pricingPage.pricePending}
                </span>
              </p>
              <ul className="mt-7 flex-1 space-y-3 border-t border-ink-100 pt-7">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-600">
                    <svg
                      viewBox="0 0 20 20"
                      className="mt-0.5 h-4 w-4 shrink-0 text-bloom-500"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className={`mt-8 ${plan.featured ? 'btn-primary' : 'btn-secondary'}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-ink-400">{t.pricingPage.note}</p>
      </section>

      <section className="bg-ink-50/50 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow={t.faqSection.eyebrow} title={t.faqSection.pricingQuestions} />
          <div className="mt-12">
            <FaqAccordion items={t.faqs} />
          </div>
        </div>
      </section>

      <CtaBand title={t.ctaBand.pricingTitle} description={t.ctaBand.pricingDescription} />
    </>
  )
}
