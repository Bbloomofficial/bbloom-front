import { describe, expect, it } from "vitest";
import {
  CredentialsCards,
  CredentialsTimeline,
  RatesCards,
  RatesTable,
} from "../Professional";
import { resolveSection } from "../registry";
import { credentialsSection, ratesSection } from "./fixtures";

/**
 * The registry is the only thing standing between a backend that invents a
 * variant name and a client's website rendering nothing at all, so the fallback
 * behaviour matters as much as the happy path.
 */
describe("resolveSection", () => {
  it("resolves every variant the personal templates use", () => {
    expect(resolveSection(credentialsSection({ variant: "timeline" }))).toBe(
      CredentialsTimeline,
    );
    expect(resolveSection(credentialsSection({ variant: "cards" }))).toBe(
      CredentialsCards,
    );
    expect(resolveSection(ratesSection({ variant: "cards" }))).toBe(RatesCards);
    expect(resolveSection(ratesSection({ variant: "table" }))).toBe(RatesTable);
  });

  it("falls back to the type's default on an unknown variant", () => {
    expect(resolveSection(credentialsSection({ variant: "spiral" }))).toBe(
      CredentialsTimeline,
    );
    expect(resolveSection(ratesSection({ variant: "spiral" }))).toBe(RatesCards);
  });

  it("falls back when the payload carries no variant at all", () => {
    expect(resolveSection(credentialsSection({ variant: null }))).toBe(
      CredentialsTimeline,
    );
    expect(resolveSection(ratesSection({ variant: null }))).toBe(RatesCards);
  });

  it("returns nothing for a section type it has never heard of", () => {
    expect(resolveSection(credentialsSection({ type: "horoscope" }))).toBeNull();
  });
});
