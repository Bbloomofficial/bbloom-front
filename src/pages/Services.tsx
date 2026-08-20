import SectionHeading from '../components/SectionHeading'
import ServiceCard from '../components/ServiceCard'
import CtaBand from '../components/CtaBand'
import FaqAccordion from '../components/FaqAccordion'
import { useI18n } from '../i18n'

export default function Services() {
  const { t } = useI18n()

  return (
    <>
      <section className="border-b border-ink-100 bg-ink-50/50 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow={t.servicesPage.eyebrow}
            title={t.servicesPage.title}
            description={t.servicesPage.description}
          />
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {t.services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>

      <section className="bg-ink-50/50 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow={t.process.eyebrow} title={t.process.pageTitle} />
          <ol className="mx-auto mt-12 max-w-3xl space-y-4">
            {t.steps.map((step) => (
              <li
                key={step.number}
                className="flex gap-5 rounded-3xl border border-ink-100 bg-surface p-6"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-bloom-600 text-sm font-extrabold text-white">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink-900">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading eyebrow={t.faqSection.eyebrow} title={t.faqSection.beforeYouAsk} />
        <div className="mt-12">
          <FaqAccordion items={t.faqs} />
        </div>
      </section>

      <CtaBand />
    </>
  )
}
