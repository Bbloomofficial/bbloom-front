import { Link } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading'
import AuthLink from '../components/AuthLink'
import FaqAccordion from '../components/FaqAccordion'
import CtaBand from '../components/CtaBand'
import { PlanCard, usePlans } from '../components/PlanCard'
import { useI18n } from '../i18n'

export default function Pricing() {
  const { t } = useI18n()
  const { plans, error } = usePlans()

  return (
    <>
      <section className="border-b border-ink-100 bg-ink-50/50 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow={t.pricingPage.eyebrow}
            title={t.pricingPage.title}
            description={t.pricingPage.description}
          />
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-ink-500">
            {t.pricingPage.freeTierIntro}
          </p>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20 xl:max-w-[86rem]">
        {error ? (
          <p className="text-center text-sm text-ink-400">{t.pricingPage.loadFailed}</p>
        ) : !plans ? (
          <p className="text-center text-sm text-ink-400">{t.pricingPage.loading}</p>
        ) : (
          // Four tiers inside the usual 6xl page were 250px wide, which turns
          // every Georgian feature into three lines and the card into a column.
          // The section gets its own wider ceiling rather than the whole site's,
          // and the grid stays two-up until there is genuinely room for four.
          <div
            className={`grid items-start gap-6 ${
              plans.length >= 4
                ? 'sm:grid-cols-2 xl:grid-cols-4'
                : 'lg:grid-cols-3'
            }`}
          >
            {plans.map((plan) => (
              <PlanCard
                key={plan.code}
                plan={plan}
                featuredLabel={t.pricingPage.mostPopular}
                periodLabel={
                  plan.billingPeriod === 'YEARLY'
                    ? t.pricingPage.perYear
                    : t.pricingPage.perMonth
                }
                action={
                  // A negotiated tier has no checkout to send anyone to, and the
                  // API refuses a subscription to it, so sign-up would be a dead
                  // end wearing a primary button.
                  plan.purchasable === false ? (
                    <Link to="/contact" className="btn-secondary w-full">
                      {plan.cta || t.pricingPage.contactUs}
                    </Link>
                  ) : (
                    <AuthLink
                      to="/register"
                      className={`w-full ${plan.featured ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {/* The plan's own call to action is written for it; ours is
                          the fallback when the backend has not supplied one. */}
                      {plan.cta || t.pricingPage.signUp}
                    </AuthLink>
                  )
                }
              />
            ))}
          </div>
        )}

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
