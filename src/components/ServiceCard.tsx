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
    </article>
  )
}
