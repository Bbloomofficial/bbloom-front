import SectionHeading from '../components/SectionHeading'
import CtaBand from '../components/CtaBand'
import { useI18n } from '../i18n'

export default function About() {
  const { t } = useI18n()

  return (
    <>
      <section className="border-b border-ink-100 bg-ink-50/50 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow={t.aboutPage.eyebrow}
            title={t.aboutPage.title}
            description={t.aboutPage.description}
          />
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {t.aboutPage.storyTitle}
          </h2>
          <div className="mt-6 space-y-5">
            {t.aboutPage.story.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed text-ink-600">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-50/50 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow={t.aboutPage.valuesEyebrow}
            title={t.aboutPage.valuesTitle}
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {t.aboutPage.values.map((value) => (
              <div key={value.title} className="card p-6">
                <h3 className="text-base font-bold text-ink-900">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title={t.ctaBand.aboutTitle} />
    </>
  )
}
