import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { useI18n } from "../i18n";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Extra classes on the wrapper, not the input. */
  wrapperClassName?: string;
};

/**
 * A password field with a reveal toggle.
 *
 * Three things here are deliberate and easy to undo by accident:
 *
 * 1. **The input is never remounted.** Only its `type` attribute changes.
 *    Replacing the node — rendering two inputs and swapping, or keying it on
 *    the revealed state — makes iOS Safari drop autofill and iCloud Keychain
 *    suggestions, so the toggle would quietly cost more than it gives.
 * 2. **The button is a full 44px square** and sits outside the text's padding.
 *    This field is full width on a phone directly above a submit button, and
 *    a cramped icon at the edge is a mis-tap into "create account".
 * 3. **The accessible name states what the button will do and changes with
 *    the state**, in both languages. An unlabelled eye is not a control.
 *
 * The revealed state is local and unpersisted: a password left visible across
 * a page load is a shoulder-surfing hazard nobody asked for.
 */
export default function PasswordField({ wrapperClassName, ...props }: Props) {
  const { t } = useI18n();
  const [revealed, setRevealed] = useState(false);
  const label = revealed ? t.password.hide : t.password.show;

  return (
    // `flex` rather than a plain block: an inline-block input leaves descender
    // space under it, which would offset the button's centre from the field's
    // by a couple of pixels.
    <div className={`relative flex ${wrapperClassName ?? ""}`}>
      <input
        {...props}
        type={revealed ? "text" : "password"}
        // Room for the button. Logical padding, so it follows the writing
        // direction rather than assuming the button is on the right.
        className={`${props.className ?? "field"} pe-14`}
      />
      <button
        type="button"
        onClick={() => setRevealed((current) => !current)}
        aria-label={label}
        aria-pressed={revealed}
        title={label}
        // The wrapper holds only the input, so `top-1/2` is the field's own
        // centre. Centring on translate rather than `inset-y-0` keeps the
        // 44px target honest on the shorter fields in the editor's save
        // dialog, where the button is taller than the input it sits in.
        className="absolute end-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-ink-400 transition hover:text-bloom-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-tint-strong"
      >
        {revealed ? (
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              d="M3 3l18 18M10.6 10.7a2 2 0 002.8 2.8"
            />
            <path
              strokeLinecap="round"
              d="M6.6 6.8C4.6 8.1 3.2 9.9 2.5 12c1.3 3.6 5 6.5 9.5 6.5 1.7 0 3.3-.4 4.7-1.1M9.8 5.7A10 10 0 0112 5.5c4.5 0 8.2 2.9 9.5 6.5-.5 1.4-1.3 2.7-2.4 3.8"
            />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden="true"
          >
            <path d="M2.5 12C3.8 8.4 7.5 5.5 12 5.5s8.2 2.9 9.5 6.5c-1.3 3.6-5 6.5-9.5 6.5S3.8 15.6 2.5 12Z" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>
        )}
      </button>
    </div>
  );
}
