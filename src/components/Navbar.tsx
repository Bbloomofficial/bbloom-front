import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'
import { useI18n } from '../i18n'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const { t } = useI18n()

  const links = [
    { to: '/services', label: t.nav.services },
    { to: '/templates', label: t.nav.templates },
    { to: '/pricing', label: t.nav.pricing },
    { to: '/about', label: t.nav.about },
    { to: '/contact', label: t.nav.contact },
  ]

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition ${
        scrolled ? 'border-b border-ink-100 bg-canvas/85 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="container-page flex h-18 items-center justify-between gap-3 py-4">
        <Link to="/" aria-label={t.nav.home}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap transition ${
                  isActive ? 'bg-tint text-tint-fg' : 'text-ink-600 hover:text-ink-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          {/* The panel is the product now, so signing in has to be reachable
              from every marketing page, not only from a plan card. */}
          <Link
            to="/dashboard/login"
            className="hidden rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap text-ink-600 transition hover:text-ink-900 xl:inline-flex"
          >
            {t.nav.signIn}
          </Link>
          {/* Sign-up next to sign-in, because someone who has already decided
              should not have to go through the anonymous editor to find the
              form.

              It takes the CTA slot from `start` rather than joining it. The bar
              cannot hold both: `container-page` is capped at max-w-6xl, so the
              content width is 1152px on every screen -- a wider viewport buys
              nothing -- and the four controls measured 1290px. `start` is the
              one that goes because signing up and the anonymous editor both end
              at a new website, whereas dropping either auth link would leave an
              existing client with no way in. `/try` is still in the menu below,
              and on the home page's own hero. */}
          <Link
            to="/dashboard/register"
            className="btn btn-primary btn-sm hidden whitespace-nowrap xl:inline-flex"
          >
            {t.nav.register}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={open}
            className="icon-button xl:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink-100 bg-canvas xl:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-semibold ${
                    isActive ? 'bg-tint text-tint-fg' : 'text-ink-600'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link to="/try" className="btn-primary mt-2">
              {t.nav.start}
            </Link>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <Link
                to="/dashboard/login"
                className="rounded-xl border border-ink-100 bg-control px-4 py-3 text-center text-sm font-semibold text-ink-600 transition hover:border-bloom-300 hover:bg-tint hover:text-bloom-600 active:scale-95"
              >
                {t.nav.signIn}
              </Link>
              <Link
                to="/dashboard/register"
                className="rounded-xl border border-ink-100 bg-control px-4 py-3 text-center text-sm font-semibold text-ink-600 transition hover:border-bloom-300 hover:bg-tint hover:text-bloom-600 active:scale-95"
              >
                {t.nav.register}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
