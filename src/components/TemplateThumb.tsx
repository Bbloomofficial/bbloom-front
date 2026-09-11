import { useEffect, useState } from 'react'
import { templateThumbnail } from '../api/templates'
import type { SiteTemplate } from '../api/templates'

/**
 * A template's wireframe thumbnail, with somewhere to land when there isn't one.
 *
 * The backend draws these per template and serves them from its own origin, so
 * a thumbnail can be missing for reasons that have nothing to do with this app:
 * a template added before its preview was painted, a cold cache, a blocked
 * request. A bare `<img>` answers all of those with the browser's broken-image
 * glyph, which in a grid of designs reads as "this design is broken" rather than
 * "the picture didn't load".
 *
 * The staff picker has had this treatment since it was written
 * (`admin/components/TemplatePreview`). This is the same idea for the three
 * client-facing grids, which did not.
 */
export default function TemplateThumb({
  template,
  alt,
  className = 'h-full w-full object-cover object-top',
}: {
  template: SiteTemplate
  alt: string
  className?: string
}) {
  const source = template.previewUrl ? templateThumbnail(template) : null
  const [failed, setFailed] = useState(false)

  // A different template may be rendered into this same slot when the catalogue
  // is filtered, and a failure belongs to the image, not the position.
  useEffect(() => setFailed(false), [source])

  if (!source || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="flex h-full w-full items-center justify-center bg-gradient-to-br from-tint to-tint-strong"
      >
        <span aria-hidden className="text-2xl font-extrabold uppercase text-tint-fg/60" dir="ltr">
          {template.code.slice(0, 2)}
        </span>
      </div>
    )
  }

  return (
    <img
      src={source}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
