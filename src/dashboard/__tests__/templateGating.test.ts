import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../api/http";
import { describeProblem } from "../../api/problem";
import { problemStrings } from "../../api/problemStrings";
import { TEMPLATE_TIER_ORDER } from "../../api/templates";
import { parseAdChannels, formatAdChannels } from "../../api/ads";
import { adminStrings } from "../../admin/strings";
import { toForm } from "../../admin/pages/PlanEditor";
import { tryStrings } from "../../try/strings";
import { dashboardStrings } from "../strings";
import { losesOnlineOrdering, switchImpact } from "../api/templateAccess";
import type { TemplateSwitchPreview, TemplateSwitchResult } from "../api/types";

const LOCALES = ["en", "ka"] as const;

/**
 * The refusal is written as an offer rather than an error, and it can arrive
 * from two different statuses, so it is matched on the code. A missed match
 * would show "only the website's owner can do this" to someone whose only
 * problem is their plan — an accusation instead of a sale.
 */
describe("TEMPLATE_TIER_REQUIRES_PLAN", () => {
  function refusal(status: number) {
    return new ApiError("Template above plan", status, {}, {
      code: "TEMPLATE_TIER_REQUIRES_PLAN",
    });
  }

  it.each(LOCALES)("is explained the same way for 403 and 409 (%s)", (locale) => {
    const strings = problemStrings(locale);
    const expected = strings.templateTierRequiresPlan;
    expect(expected).toBeTruthy();
    expect(describeProblem(refusal(403), strings, "fallback")).toBe(expected);
    expect(describeProblem(refusal(409), strings, "fallback")).toBe(expected);
  });

  it("still degrades sanely for a code from a later backend", () => {
    const strings = problemStrings("en");
    // A 409 falls back to the server's own prose, and an unrecognised code must
    // not borrow the upgrade copy — that would offer a plan for an unrelated
    // conflict.
    const later = new ApiError("Nope", 409, {}, { code: "TEMPLATE_SOMETHING" });
    expect(describeProblem(later, strings, "fallback")).not.toBe(
      strings.templateTierRequiresPlan,
    );
    const silent = new ApiError("", 409, {}, { code: "TEMPLATE_SOMETHING" });
    expect(describeProblem(silent, strings, "fallback")).toBe("fallback");
  });

  it("does not swallow a server failure that happens to carry the code", () => {
    const strings = problemStrings("en");
    const broken = new ApiError("Boom", 500, {}, {
      code: "TEMPLATE_TIER_REQUIRES_PLAN",
    });
    expect(describeProblem(broken, strings, "fallback")).toBe(strings.server);
  });
});

describe("design copy", () => {
  it.each(LOCALES)("names every tier everywhere one is shown (%s)", (locale) => {
    const dash = dashboardStrings(locale);
    const admin = adminStrings(locale);
    const anonymous = tryStrings(locale);
    for (const tier of TEMPLATE_TIER_ORDER) {
      expect(dash.design.tiers[tier]).toBeTruthy();
      expect(admin.tiers[tier]).toBeTruthy();
      expect(anonymous.tiers[tier]).toBeTruthy();
    }
  });

  it.each(LOCALES)("names the features a switch can turn off (%s)", (locale) => {
    const t = dashboardStrings(locale);
    // The API filters the list to these three before it leaves the server.
    for (const key of ["enquiryForm", "reservations", "newsletter"]) {
      expect(t.design.featureNames[key]).toBeTruthy();
    }
    // Anything else must reach the client as a sentence, never as a key.
    expect(t.design.featureNames.someInternalKey).toBeUndefined();
    expect(t.design.featuresLostGeneric).toBeTruthy();
  });

  it.each(LOCALES)("has the confirmation in both languages (%s)", (locale) => {
    const t = dashboardStrings(locale);
    expect(t.design.ordersHeadline).toBeTruthy();
    expect(t.design.irreversible).toBeTruthy();
    expect(t.design.acknowledge).toBeTruthy();
    expect(t.design.confirmTitle("A", "B")).toContain("A");
    expect(t.design.confirmTitle("A", "B")).toContain("B");
  });
});

/**
 * The preview reports the impact at the top level and the switch nests it under
 * `impact`. Reading the wrong one yields empty lists, which render exactly like
 * "nothing was lost" — a silent reassurance given to someone who just lost a
 * section.
 */
describe("switchImpact", () => {
  const impact = {
    carriedOver: ["hero"],
    added: ["gallery"],
    removed: ["products"],
    droppedFields: { hero: ["image"] },
    losesOnlineOrdering: true,
    losesFeatures: ["reservations"],
  };

  it("reads the preview's flat shape", () => {
    const preview = {
      ...impact,
      templateCode: "shop-simple",
      currentTemplateCode: "shop-modern",
      published: true,
      allowed: true,
    } as TemplateSwitchPreview;
    expect(switchImpact(preview)).toEqual(impact);
  });

  it("reads the switch's nested shape", () => {
    const result = { site: {}, impact } as unknown as TemplateSwitchResult;
    expect(switchImpact(result)).toEqual(impact);
  });

  it("defaults every list rather than rendering undefined", () => {
    const empty = switchImpact({ site: {} } as unknown as TemplateSwitchResult);
    expect(empty.carriedOver).toEqual([]);
    expect(empty.removed).toEqual([]);
    expect(empty.droppedFields).toEqual({});
    expect(empty.losesFeatures).toEqual([]);
    // Absent, not false: "we were not told" must stay distinguishable from
    // "the server says ordering survives", because only one of them derives.
    expect(empty.losesOnlineOrdering).toBeUndefined();
  });
});

describe("losesOnlineOrdering", () => {
  const base = {
    carriedOver: [],
    added: [],
    removed: [],
    droppedFields: {},
    losesFeatures: [],
  };

  it("trusts the server's flag, including a deliberate false", () => {
    expect(
      losesOnlineOrdering(
        { ...base, losesOnlineOrdering: false },
        { enabled: true },
        "MODERN",
        "SIMPLE",
      ),
    ).toBe(false);
  });

  it("derives the warning when the flag is absent", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(
      losesOnlineOrdering(base, { enabled: true }, "MODERN", "CLASSIC"),
    ).toBe(true);
    warn.mockRestore();
  });

  it("does not warn a shop that was never selling", () => {
    expect(
      losesOnlineOrdering(base, { enabled: false }, "MODERN", "SIMPLE"),
    ).toBe(false);
    expect(losesOnlineOrdering(base, null, "MODERN", "SIMPLE")).toBe(false);
  });

  it("does not warn when the design stays able to sell", () => {
    expect(
      losesOnlineOrdering(base, { enabled: true }, "MODERN", "MODERN"),
    ).toBe(false);
  });
});

/**
 * The admin plan editor writes whole records. A field it forgets is a field the
 * backend sets to its default — which for these two means an unmetered advert
 * allowance and an unrestricted design ceiling, both given away silently.
 */
describe("admin plan form", () => {
  it("carries every entitlement field into the form", () => {
    const form = toForm({
      code: "PRO",
      translations: [],
      nameEn: "Standard",
      maxTemplateTier: "CLASSIC",
      adImpressionLimit: 1000,
      adChannels: "FACEBOOK,INSTAGRAM",
    } as never);
    expect(form.maxTemplateTier).toBe("CLASSIC");
    expect(form.adImpressionLimit).toBe(1000);
    expect(form.adChannels).toBe("FACEBOOK,INSTAGRAM");
  });

  it("keeps null meaning unrestricted and unmetered, not zero", () => {
    const form = toForm({
      code: "PRO",
      translations: [],
      maxTemplateTier: null,
      adImpressionLimit: null,
      adChannels: "",
    } as never);
    expect(form.maxTemplateTier).toBeNull();
    expect(form.adImpressionLimit).toBeNull();
    expect(form.adChannels).toBe("");
  });

  it("fills in an older payload without inventing an allowance", () => {
    const form = toForm({ code: "PRO", translations: [] } as never);
    expect(form.maxTemplateTier).toBeNull();
    expect(form.adImpressionLimit).toBeNull();
    // Present and empty, not missing: the field is `@NotNull` on create, so an
    // absent one fails the request outright.
    expect(form.adChannels).toBe("");
  });
});

/** `adChannels` travels as a comma-separated string, not as a JSON array. */
describe("ad channels on the wire", () => {
  it("round-trips a selection", () => {
    expect(formatAdChannels(parseAdChannels("FACEBOOK,INSTAGRAM"))).toBe(
      "FACEBOOK,INSTAGRAM",
    );
  });

  it("reads nothing as nothing", () => {
    expect(parseAdChannels("")).toEqual([]);
    expect(parseAdChannels(null)).toEqual([]);
    expect(formatAdChannels([])).toBe("");
  });

  it("tolerates spacing and case from a hand-edited record", () => {
    expect(parseAdChannels(" facebook , instagram ")).toEqual([
      "FACEBOOK",
      "INSTAGRAM",
    ]);
  });

  it("keeps a channel this build has never heard of", () => {
    expect(parseAdChannels("FACEBOOK,TIKTOK")).toContain("TIKTOK");
  });
});
