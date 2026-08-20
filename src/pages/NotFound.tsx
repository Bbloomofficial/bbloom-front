import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'

export default function NotFound() {
  const { t } = useI18n()

  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center sm:py-24">
      <span className="eyebrow">{t.notFound.eyebrow}</span>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
        {t.notFound.title}
      </h1>
      <p className="mt-3 max-w-md text-sm text-ink-600 sm:text-base">{t.notFound.body}</p>
      <Link to="/" className="btn-primary mt-8">
        {t.notFound.cta}
      </Link>
    </section>
  )
}
