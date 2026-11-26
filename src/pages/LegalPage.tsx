import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { contact } from '../data/contact'
import { useI18n } from '../i18n'
import type { Legal, LegalDoc } from '../i18n/types'

/**
 * Turns every mention of our contact address into a mailto link. The copy
 * names the address in a sentence of its own grammar in each language, so it
 * is found in the text rather than slotted into a template.
 */
function withEmailLinks(text: string): ReactNode {
  const parts = text.split(contact.email)
  if (parts.length === 1) return text
  return parts.map((part, index) => (
    <Fragment key={index}>
      {part}
      {index < parts.length - 1 && (
        <a
          href={`mailto:${contact.email}`}
          className="font-semibold text-tint-fg hover:underline"
          dir="ltr"
        >
          {contact.email}
        </a>
      )}
    </Fragment>
  ))
}

function Paragraphs({ lines }: { lines?: string[] }) {
  if (!lines?.length) return null
  return (
    <>
      {lines.map((line) => (
        <p key={line} className="text-base leading-relaxed text-ink-600">
          {withEmailLinks(line)}
        </p>
      ))}
    </>
  )
}

/**
 * A long-form legal page: the privacy policy and the data deletion
 * instructions. Plain on purpose — these are read by people looking for one
 * specific answer, and by Meta's reviewers checking the page exists.
 */
export default function LegalPage({ doc }: { doc: keyof Pick<Legal, 'privacy' | 'dataDeletion'> }) {
  const { t } = useI18n()
  const page: LegalDoc = t.legal[doc]

  return (
    <article className="container-page py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          {page.title}
        </h1>
        <p className="mt-3 text-sm text-ink-400">
          {t.legal.updatedLabel}: {t.legal.updated}
        </p>

        <div className="mt-8 space-y-5">
          <Paragraphs lines={page.intro} />
        </div>

        {page.sections.map((section) => (
          <section key={section.heading} className="mt-12">
            <h2 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">
              {section.heading}
            </h2>
            <div className="mt-4 space-y-4">
              <Paragraphs lines={section.body} />
              {section.items?.length ? (
                <ul className="list-disc space-y-2.5 pl-5 text-base leading-relaxed text-ink-600 marker:text-ink-300">
                  {section.items.map((item) => (
                    <li key={item}>{withEmailLinks(item)}</li>
                  ))}
                </ul>
              ) : null}
              <Paragraphs lines={section.after} />
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}
