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

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
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
            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-ink-600 transition hover:text-ink-900 lg:inline-flex"
          >
            {t.nav.signIn}
          </Link>
          <Link to="/try" className="btn-primary hidden lg:inline-flex">
            {t.nav.start}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={open}
            className="icon-button lg:hidden"
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
        <div className="border-t border-ink-100 bg-canvas lg:hidden">
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
            <Link
              to="/dashboard/login"
              className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-ink-600"
            >
              {t.nav.signIn}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
