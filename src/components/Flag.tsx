import { useId } from 'react'

type FlagProps = {
  code: 'en' | 'ka'
  className?: string
}

// Inline SVG rather than emoji: Windows ships no regional-indicator glyphs,
// so flag emoji fall back to bare letters ("GE").
export function Flag({ code, className = 'h-3.5 w-5' }: FlagProps) {
  const clipId = useId()
  const shared = `shrink-0 rounded-[2px] ring-1 ring-black/10 ${className}`

  if (code === 'ka') {
    return (
      <svg viewBox="0 0 60 40" aria-hidden="true" className={shared}>
        <rect width="60" height="40" fill="#ffffff" />
        <g fill="#ff0000">
          <rect x="25.5" width="9" height="40" />
          <rect y="15.5" width="60" height="9" />
          {[
            [12.75, 7.75],
            [47.25, 7.75],
            [12.75, 32.25],
            [47.25, 32.25],
          ].map(([cx, cy]) => (
            <g key={`${cx}-${cy}`}>
              <rect x={cx - 1.1} y={cy - 6} width="2.2" height="12" />
              <rect x={cx - 6} y={cy - 1.1} width="12" height="2.2" />
            </g>
          ))}
        </g>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 60 30" aria-hidden="true" className={shared}>
      <clipPath id={clipId}>
        <rect width="60" height="30" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect width="60" height="30" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#c8102e" strokeWidth="4" />
        <path d="M30,0 V30 M0,15 H60" stroke="#ffffff" strokeWidth="10" />
        <path d="M30,0 V30 M0,15 H60" stroke="#c8102e" strokeWidth="6" />
      </g>
    </svg>
  )
}
