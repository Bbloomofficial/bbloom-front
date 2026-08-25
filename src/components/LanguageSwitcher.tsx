import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { locales, useI18n } from '../i18n'
import type { Locale } from '../i18n'
import { Flag } from './Flag'

/** Room needed below the button before the list is allowed to open downwards. */
const LIST_HEIGHT = 96
/** Matches `w-44` on the list; used to tell whether it would clear an edge. */
const LIST_WIDTH = 176

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()
  const [open, setOpen] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const [alignLeft, setAlignLeft] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  /*
    Which way the list opens is decided per-open from the space actually
    available, not from where this happens to be used.

    It always dropped downwards, which is right in the marketing header and
    wrong in the dashboard, where this sits at the bottom of a `h-screen` rail:
    the list rendered at y=716 in a 720px viewport, 78px past the fold, with no
    scroll anywhere to reach it. It was reported as "the dropdown doesn't
    appear when clicked", and that is exactly what it looks like -- the button
    responds, React renders the list, and the client sees nothing happen.

    Measured rather than assumed, because both readings predict a list that
    cannot be seen and only one of them is about the click handler.
  */
  useLayoutEffect(() => {
    if (!open) return
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return
    const below = window.innerHeight - rect.bottom
    // Only flip when going up is genuinely better, so a switcher with room for
    // neither still opens downwards rather than off the top of the window.
    setDropUp(below < LIST_HEIGHT && rect.top > below)

    /*
      The same decision horizontally, and it is the one the vertical fix
      uncovered rather than caused. The list is right-aligned to the button,
      which is correct in the marketing header, where the switcher sits near the
      right edge. In the dashboard rail the button starts at x=16 and is about
      86px wide, so a 176px list hung off its right edge begins at -74: the
      panel ran off the left of the screen and only its last few characters were
      readable. While the list was still opening 78px below the fold this was
      invisible, because nothing was on screen to be clipped.

      Reported as a camera would see it -- "the list is cut off by the left edge
      of the screen" -- which is consistent with right-alignment, a negative
      offset, a transform or the wrong positioning container. Measuring the
      button told us which: nothing is offset, the button is simply too close to
      the left edge for a panel wider than itself to hang leftward.
    */
    const clearsLeft = rect.right - LIST_WIDTH >= 0
    const clearsRight = rect.left + LIST_WIDTH <= window.innerWidth
    // Right-alignment stays the default so the header is untouched, and the
    // flip needs somewhere better to go rather than merely somewhere else.
    setAlignLeft(!clearsLeft && clearsRight)
  }, [open])

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
        ref={buttonRef}
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
          className={`absolute z-50 w-44 overflow-hidden rounded-xl border border-ink-100 bg-surface p-1 shadow-lg shadow-black/5 ${
            dropUp ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${alignLeft ? 'left-0' : 'right-0'}`}
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
