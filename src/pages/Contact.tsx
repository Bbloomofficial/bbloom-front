import SectionHeading from '../components/SectionHeading'
import { contact } from '../data/contact'
import { useI18n } from '../i18n'

export default function Contact() {
  const { t } = useI18n()
  const c = t.contactPage

  return (
    <>
      <section className="border-b border-ink-100 bg-ink-50/50 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow={c.eyebrow} title={c.title} description={c.description} />
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-ink-100 bg-surface p-6 sm:p-8">
            <h2 className="text-lg font-bold text-ink-900">{c.detailsTitle}</h2>

            <dl className="mt-6 space-y-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
                <dt className="w-32 shrink-0 text-sm font-semibold text-ink-400">{c.emailLabel}</dt>
                <dd className="min-w-0">
                  <a
                    href={`mailto:${contact.email}`}
                    dir="ltr"
                    className="break-words text-base font-semibold text-ink-900 hover:text-tint-fg"
                  >
                    {contact.email}
                  </a>
                </dd>
              </div>

              <div className="flex flex-col gap-1 border-t border-ink-100 pt-5 sm:flex-row sm:items-baseline sm:gap-6">
                <dt className="w-32 shrink-0 text-sm font-semibold text-ink-400">{c.phoneLabel}</dt>
                <dd className="min-w-0">
                  <a
                    href={`tel:${contact.phoneHref}`}
                    dir="ltr"
                    className="break-words text-base font-semibold text-ink-900 hover:text-tint-fg"
                  >
                    {contact.phone}
                  </a>
                </dd>
              </div>

              <div className="flex flex-col gap-1 border-t border-ink-100 pt-5 sm:flex-row sm:items-baseline sm:gap-6">
                <dt className="w-32 shrink-0 text-sm font-semibold text-ink-400">{c.hoursLabel}</dt>
                <dd className="min-w-0 text-base text-ink-600">{c.hours}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </>
  )
}
