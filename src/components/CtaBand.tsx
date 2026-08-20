import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'

export default function CtaBand({
  title,
  description,
}: {
  title?: string
  description?: string
}) {
  const { t } = useI18n()

  return (
    <section className="container-page py-16 sm:py-20">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-contrast px-6 py-12 text-center sm:rounded-[2rem] sm:px-14 sm:py-14">
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-bloom-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-bloom-400/20 blur-3xl" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            {title ?? t.ctaBand.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            {description ?? t.ctaBand.description}
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link to="/contact" className="btn-primary w-full sm:w-auto">
              {t.ctaBand.primary}
            </Link>
            <Link
              to="/pricing"
              className="btn w-full border border-white/20 text-white hover:bg-white/10 sm:w-auto"
            >
              {t.ctaBand.secondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
