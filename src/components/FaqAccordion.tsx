import { useState } from 'react'
import type { Faq } from '../i18n/types'

export default function FaqAccordion({ items }: { items: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="mx-auto max-w-3xl divide-y divide-ink-100 rounded-3xl border border-ink-100 bg-surface">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
            >
              <span className="text-base font-semibold text-ink-900">{item.question}</span>
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-tint text-tint-fg transition ${
                  isOpen ? 'rotate-45' : ''
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            {isOpen && (
              <p className="animate-rise px-6 pb-6 text-sm leading-relaxed text-ink-600">
                {item.answer}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
