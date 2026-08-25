/**
 * Who owns `document.title`.
 *
 * `I18nProvider` sets the marketing title whenever the locale changes, and it
 * is an ancestor of every screen — so its effect runs *after* the effects of
 * whatever is mounted inside it. On a language switch inside the dashboard that
 * ordering means the provider overwrites the title the dashboard just set, and
 * the tab reads the marketing pitch while showing the website list.
 *
 * It is invisible on a cold load, because the dashboard is a lazy chunk: it
 * mounts after the provider has already run, so it gets the last word. The
 * clash only appears once both are mounted and the locale changes — which is
 * why no amount of route testing finds it.
 *
 * So a screen that owns its title says so, and the provider defers while the
 * claim is held. A counter rather than a boolean because during a React
 * re-render the new claim is taken before the old one is released.
 */
let claims = 0;

export function claimDocumentTitle(): () => void {
  claims += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    claims -= 1;
  };
}

export function documentTitleIsClaimed(): boolean {
  return claims > 0;
}
