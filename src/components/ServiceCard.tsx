import type { Service } from '../i18n/types'
import { getServiceIcon } from './icons'

export default function ServiceCard({ service }: { service: Service }) {
  const { Icon, tileClassName, tileStyle } = getServiceIcon(service.slug)

  return (
    <article className="card group flex flex-col">
      <span
        className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition group-hover:scale-110 ${tileClassName}`}
        style={tileStyle}
      >
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-5 text-lg font-bold text-ink-900">{service.title}</h3>
      <p className="mt-1 text-sm font-semibold text-bloom-600 dark:text-bloom-300">
        {service.tagline}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink-600">{service.description}</p>
      <ul className="mt-5 space-y-2 border-t border-ink-100 pt-5">
        {service.deliverables.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-ink-600">
            <svg
              viewBox="0 0 20 20"
              className="mt-0.5 h-4 w-4 shrink-0 text-bloom-500"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" />
            </svg>
            {item}
          </li>
        ))}
      </ul>
    </article>
  )
}
