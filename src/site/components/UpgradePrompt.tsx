import { useCallback, useEffect, useRef, useState } from "react";
import { useSite } from "../context";

const INITIAL_DELAY_MS = 45_000;
const REPEAT_INTERVAL_MS = 120_000;

/**
 * Returns the base URL for bbloom links. Uses a relative path when already on
 * bbloom.ge to avoid cross-origin issues.
 */
function getBbloomBase(): string {
  const host = window.location.hostname;
  if (host === "bbloom.ge" || host.endsWith(".bbloom.ge")) {
    return "";
  }
  return "https://bbloom.ge";
}

/**
 * A dismissible prompt that appears on free-tier sites. Shows after ~45s, then
 * reappears every ~2min after dismissal. Respects prefers-reduced-motion.
 */
export function UpgradePrompt({ show }: { show: boolean }) {
  const { t, isDark } = useSite();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const scheduleShow = useCallback((delay: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  }, []);

  useEffect(() => {
    if (!show) return;
    scheduleShow(INITIAL_DELAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show, scheduleShow]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    scheduleShow(REPEAT_INTERVAL_MS);
  }, [scheduleShow]);

  // Keyboard: Escape to dismiss
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleDismiss();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, handleDismiss]);

  // Focus management: focus the dialog when it appears
  useEffect(() => {
    if (visible && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [visible]);

  if (!show || !visible) return null;

  const base = getBbloomBase();

  return (
    <div
      className="site-upgrade-backdrop"
      role="presentation"
      onClick={handleDismiss}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="upgrade-prompt-title"
        aria-describedby="upgrade-prompt-body"
        tabIndex={-1}
        className={`site-upgrade-prompt ${isDark ? "site-upgrade-prompt--dark" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="site-upgrade-close"
          onClick={handleDismiss}
          aria-label={t.upgradePrompt.dismiss}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="site-upgrade-content">
          <div className="site-upgrade-logo" aria-hidden="true">
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="16" cy="16" r="14" fill="currentColor" opacity="0.15" />
              <path
                d="M16 8c-2.5 4-4 7-4 10a4 4 0 108 0c0-3-1.5-6-4-10z"
                fill="currentColor"
              />
            </svg>
          </div>

          <h2 id="upgrade-prompt-title" className="site-upgrade-title">
            {t.upgradePrompt.title}
          </h2>

          <p id="upgrade-prompt-body" className="site-upgrade-body">
            {t.upgradePrompt.body}
          </p>

          <div className="site-upgrade-actions">
            <a
              href={`${base}/`}
              className="site-btn site-upgrade-cta-primary"
              data-tone="primary"
            >
              {t.upgradePrompt.createOwn}
            </a>
            <a
              href={`${base}/pricing`}
              className="site-btn site-upgrade-cta-secondary"
              data-tone="ghost"
            >
              {t.upgradePrompt.seePricing}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
