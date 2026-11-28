import { Link } from 'react-router-dom'
import Logo from './Logo'
import AuthLink from './AuthLink'
import { contact, whatsappHref } from '../data/contact'
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from './icons'
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
                <Link to="/services" className="hover:text-ink-900 hover:underline">
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
              <Link to="/about" className="hover:text-ink-900 hover:underline">
                {t.footer.about}
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:text-ink-900 hover:underline">
                {t.footer.pricing}
              </Link>
            </li>
            <li>
              <Link to="/templates" className="hover:text-ink-900 hover:underline">
                {t.footer.templates}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-ink-900 hover:underline">
                {t.footer.contact}
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-ink-900 hover:underline">
                {t.footer.privacy}
              </Link>
            </li>
            <li>
              <Link to="/data-deletion" className="hover:text-ink-900 hover:underline">
                {t.footer.dataDeletion}
              </Link>
            </li>
            <li>
              <AuthLink to="/login" className="hover:text-ink-900 hover:underline">
                {t.nav.signIn}
              </AuthLink>
            </li>
            <li>
              <AuthLink to="/register" className="hover:text-ink-900 hover:underline">
                {t.nav.register}
              </AuthLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink-900">{t.footer.contactTitle}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-600">
            <li>
              <a href={`mailto:${contact.email}`} className="hover:text-ink-900 hover:underline" dir="ltr">
                {contact.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <a href={`tel:${contact.phoneHref}`} className="hover:text-ink-900 hover:underline" dir="ltr">
                {contact.phone}
              </a>
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noreferrer"
                aria-label={t.whatsapp.label}
                className="inline-flex h-6 w-6 items-center justify-center rounded-lg hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900"
              >
                <WhatsAppIcon className="h-4 w-4" />
              </a>
            </li>
          </ul>
          <div className="mt-4 flex gap-2">
            <a
              href={contact.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="icon-button"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a
              href={contact.facebook}
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
