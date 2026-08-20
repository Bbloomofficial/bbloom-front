import { useEffect, useRef, useState } from 'react'
import { locales, useI18n } from '../i18n'
import type { Locale } from '../i18n'
import { Flag } from './Flag'

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const active = locales.find((item) => item.code === locale) ?? locales[0]

  function choose(code: Locale) {
    setLocale(code)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t.language.label}
        title={t.language.label}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-ink-100 bg-surface px-2.5 text-ink-600 transition hover:border-bloom-300 hover:text-bloom-600 sm:px-3"
      >
        <Flag code={active.code} />
        <span className="text-xs font-semibold tracking-wide">{active.short}</span>
        <svg
          viewBox="0 0 24 24"
          className={`hidden h-3.5 w-3.5 transition-transform sm:block ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t.language.label}
          className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-ink-100 bg-surface p-1 shadow-lg shadow-black/5"
        >
          {locales.map((item) => (
            <li key={item.code}>
              <button
                type="button"
                role="option"
                aria-selected={item.code === locale}
                onClick={() => choose(item.code)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition ${
                  item.code === locale
                    ? 'bg-tint text-tint-fg'
                    : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                }`}
              >
                <Flag code={item.code} />
                <span className="flex-1">{item.label}</span>
                {item.code === locale && (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
