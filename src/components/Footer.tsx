import { Link } from 'react-router-dom'
import Logo from './Logo'
import { contact } from '../data/contact'
import { FacebookIcon, InstagramIcon } from './icons'
import { useI18n } from '../i18n'

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-ink-100 bg-ink-50/60">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-600">{t.footer.blurb}</p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink-900">{t.footer.servicesTitle}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-600">
            {t.services.slice(0, 4).map((service) => (
              <li key={service.slug}>
                <Link to="/services" className="hover:text-tint-fg">
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink-900">{t.footer.companyTitle}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-600">
            <li>
              <Link to="/about" className="hover:text-tint-fg">
                {t.footer.about}
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:text-tint-fg">
                {t.footer.pricing}
              </Link>
            </li>
            <li>
              <Link to="/templates" className="hover:text-tint-fg">
                {t.footer.templates}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-tint-fg">
                {t.footer.contact}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink-900">{t.footer.contactTitle}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-600">
            <li>
              <a href={`mailto:${contact.email}`} className="hover:text-tint-fg" dir="ltr">
                {contact.email}
              </a>
            </li>
            <li>
              <a href={`tel:${contact.phoneHref}`} className="hover:text-tint-fg" dir="ltr">
                {contact.phone}
              </a>
            </li>
          </ul>
          <div className="mt-4 flex gap-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="icon-button"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="icon-button"
            >
              <FacebookIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-ink-100">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-ink-400 sm:flex-row">
          <p>
            © {new Date().getFullYear()} bbloom. {t.footer.rights}
          </p>
          <p>{t.footer.tagline}</p>
        </div>
      </div>
    </footer>
  )
}
