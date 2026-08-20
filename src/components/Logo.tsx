export default function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-bloom-500 to-bloom-700 text-white shadow-lg shadow-bloom-600/25">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M12 3c2 0 3.4 1.6 3.4 3.4 1.8 0 3.4 1.4 3.4 3.4S17.2 13.2 15.4 13.2c0 1.8-1.4 3.4-3.4 3.4s-3.4-1.6-3.4-3.4C6.8 13.2 5.2 11.8 5.2 9.8S6.8 6.4 8.6 6.4C8.6 4.6 10 3 12 3Z"
            fill="currentColor"
            opacity=".95"
          />
          <path d="M12 15v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-xl font-extrabold tracking-tight text-ink-900">bbloom</span>
    </span>
  )
}
