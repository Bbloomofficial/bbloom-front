import { useMemo } from "react";
import type { TemplateCeiling } from "../../api/templates";
import { isTierUnlocked } from "../../api/templates";
import { useSession } from "../auth";
import type {
  OrderingStatus,
  SiteDetail,
  TemplateSwitchImpact,
  TemplateSwitchPreview,
  TemplateSwitchResult,
} from "./types";

/**
 * What the account is allowed to build with, and what a design change would
 * cost them.
 *
 * One module rather than a field read in four places, because both questions
 * have a wrong answer that is expensive and silent: a ceiling misread locks a
 * paying client out of the design they bought, and a missed impact flag lets a
 * restaurant lose its checkout without being told.
 */

/**
 * The account's design ceiling.
 *
 * Account-scoped, so it is the same number everywhere: one paid website lifts
 * the ceiling for the account's other websites too. It rides along on the
 * profile the dashboard already loads, so this costs no request.
 *
 * `undefined` is a real answer — an older backend that does not report it — and
 * every caller treats it as "no limit known", never as "no designs allowed".
 */
export function useTemplateCeiling(): TemplateCeiling {
  const { user } = useSession();
  return user?.maxTemplateTier;
}

/**
 * The ceiling to use inside a site.
 *
 * Prefers the site payload's mirror and falls back to the profile, so a screen
 * that has loaded the site does not wait on anything, and one that has not
 * still has an answer. They are the same fact from the same account, so which
 * one wins only matters for freshness.
 */
export function ceilingOf(
  detail: Pick<SiteDetail, "maxTemplateTier"> | null | undefined,
  profile: TemplateCeiling,
): TemplateCeiling {
  return detail?.maxTemplateTier !== undefined
    ? detail.maxTemplateTier
    : profile;
}

/** Convenience for the common "is this card locked" question in a picker. */
export function useTemplateLock(ceiling: TemplateCeiling) {
  return useMemo(
    () => (tier: string) => !isTierUnlocked(tier, ceiling),
    [ceiling],
  );
}

/**
 * The impact of a switch, from either call.
 *
 * The two responses do not agree on shape: the preview reports the impact at
 * the top level, while the switch nests it under `impact` because it also has
 * to carry the updated site. That asymmetry is real and is handled here once,
 * rather than at each of the several places that render it — the failure mode
 * of getting it wrong is an empty list, which reads exactly like "nothing was
 * lost" and would quietly reassure a client who just lost a section.
 */
export function switchImpact(
  response: TemplateSwitchPreview | TemplateSwitchResult,
): TemplateSwitchImpact {
  const source: Partial<TemplateSwitchImpact> =
    "impact" in response && response.impact ? response.impact : response;
  return {
    carriedOver: source.carriedOver ?? [],
    added: source.added ?? [],
    removed: source.removed ?? [],
    droppedFields: source.droppedFields ?? {},
    losesOnlineOrdering: source.losesOnlineOrdering,
    losesFeatures: source.losesFeatures ?? [],
  };
}

/**
 * Whether this switch stops the website taking orders and payments.
 *
 * The server's `losesOnlineOrdering` is preferred whenever it is **present**,
 * including when it is present and `false` — it knows things this side cannot,
 * and second-guessing a deliberate `false` would warn a client about something
 * that is not going to happen.
 *
 * When the key is absent the answer is derived instead, from the ordering gate
 * and the tiers: ordering needs a MODERN design, so leaving one turns checkout
 * off. That path is kept **permanently**, not as a stopgap. If the field is
 * ever renamed, the warning has to survive the rename — the alternative is the
 * single most consequential sentence in this feature disappearing with nothing
 * failing loudly. It over-warns rather than under-warns, which is the right way
 * round: a warning nobody needed costs a sentence, a missing one costs a shop
 * its checkout.
 */
export function losesOnlineOrdering(
  impact: TemplateSwitchImpact,
  ordering: Pick<OrderingStatus, "enabled"> | null | undefined,
  currentTier: string | null | undefined,
  targetTier: string | null | undefined,
): boolean {
  if (impact.losesOnlineOrdering !== undefined) {
    return impact.losesOnlineOrdering;
  }

  const derived =
    ordering?.enabled === true &&
    currentTier === "MODERN" &&
    targetTier !== undefined &&
    targetTier !== null &&
    targetTier !== "MODERN";

  if (derived && import.meta.env.DEV) {
    // Noisy in development, protective in production. Reaching this means the
    // API stopped sending the flag under the name we read, which is a contract
    // drift worth someone's attention long before a client meets it.
    console.warn(
      "[template switch] losesOnlineOrdering was absent from the payload; " +
        "warning derived locally instead. Check the field name against the API.",
    );
  }

  return derived;
}
