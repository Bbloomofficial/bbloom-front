import { describe, expect, it } from "vitest";
import {
  TEMPLATE_TIER_ORDER,
  includedTiers,
  isTierUnlocked,
  tierRank,
} from "../templates";

/**
 * The whole feature is one comparison, made in three places. Getting it wrong
 * in the strict direction is the expensive one: a false lock hides a design a
 * client has already paid for and looks like a billing failure, while a false
 * unlock costs one refused request that the API turns into an upgrade prompt.
 * So every "we don't know" case below must answer *unlocked*.
 */
describe("tierRank", () => {
  it("orders the ladder plainest first", () => {
    expect(TEMPLATE_TIER_ORDER).toEqual(["SIMPLE", "CLASSIC", "MODERN"]);
    expect(tierRank("SIMPLE")).toBeLessThan(tierRank("CLASSIC") as number);
    expect(tierRank("CLASSIC")).toBeLessThan(tierRank("MODERN") as number);
  });

  it("refuses to guess where an unknown tier sits", () => {
    expect(tierRank("PLATINUM")).toBeNull();
  });
});

describe("isTierUnlocked", () => {
  it("is a ceiling that includes everything below it", () => {
    expect(isTierUnlocked("SIMPLE", "CLASSIC")).toBe(true);
    expect(isTierUnlocked("CLASSIC", "CLASSIC")).toBe(true);
    expect(isTierUnlocked("MODERN", "CLASSIC")).toBe(false);
  });

  it("locks nothing at the top of the ladder", () => {
    for (const tier of TEMPLATE_TIER_ORDER) {
      expect(isTierUnlocked(tier, "MODERN")).toBe(true);
    }
  });

  it("locks everything above the plainest ceiling", () => {
    expect(isTierUnlocked("SIMPLE", "SIMPLE")).toBe(true);
    expect(isTierUnlocked("CLASSIC", "SIMPLE")).toBe(false);
    expect(isTierUnlocked("MODERN", "SIMPLE")).toBe(false);
  });

  it.each([null, undefined, ""])("fails open on a ceiling of %p", (ceiling) => {
    expect(isTierUnlocked("MODERN", ceiling as null)).toBe(true);
  });

  it("fails open on a ceiling naming a tier this build has never heard of", () => {
    expect(isTierUnlocked("MODERN", "PLATINUM")).toBe(true);
  });

  it("fails open on a template whose tier this build has never heard of", () => {
    expect(isTierUnlocked("PLATINUM", "SIMPLE")).toBe(true);
  });
});

describe("includedTiers", () => {
  it("lists the ceiling and everything under it", () => {
    expect(includedTiers("CLASSIC")).toEqual(["SIMPLE", "CLASSIC"]);
    expect(includedTiers("SIMPLE")).toEqual(["SIMPLE"]);
    expect(includedTiers("MODERN")).toEqual(["SIMPLE", "CLASSIC", "MODERN"]);
  });

  it.each([null, undefined, "PLATINUM"])(
    "lists everything when the ceiling is %p",
    (ceiling) => {
      expect(includedTiers(ceiling as null)).toEqual([...TEMPLATE_TIER_ORDER]);
    },
  );

  it("hands back a copy, so a caller cannot edit the ladder", () => {
    includedTiers(null).push("PLATINUM" as never);
    expect(TEMPLATE_TIER_ORDER).toHaveLength(3);
  });
});
