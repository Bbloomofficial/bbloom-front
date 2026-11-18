import { describe, expect, it } from "vitest";
import {
  credentialsSection,
  ratesSection,
} from "../../site/sections/__tests__/fixtures";
import { deriveFields, sectionLabel } from "../schema";

/**
 * The try-editor has no schema from the backend, so it reads the demo content
 * itself. The new sections therefore need no wiring — only labels, and a check
 * that the generic walk actually reaches their fields.
 */
describe("deriveFields on the personal sections", () => {
  it("offers every credential line for editing, in Georgian", () => {
    const fields = deriveFields(credentialsSection(), "ka");
    const paths = fields.map((field) => field.path);

    expect(paths).toContain("title");
    expect(paths).toContain("items.0.period");
    expect(paths).toContain("items.0.organisation");
    expect(paths).toContain("items.0.detail");
    // `icon` is template wiring, not something a client should be handed.
    expect(paths).not.toContain("items.0.icon");

    const period = fields.find((field) => field.path === "items.0.period");
    expect(period?.label).toBe("პერიოდი");
  });

  it("offers a rate card's price, unit and bullet rows", () => {
    const fields = deriveFields(ratesSection(), "ka");
    const paths = fields.map((field) => field.path);

    expect(paths).toContain("items.0.price");
    expect(paths).toContain("items.0.unit");
    expect(paths).toContain("items.0.bullets.0.text");
    expect(paths).toContain("items.0.ctaLabel");

    const unit = fields.find((field) => field.path === "items.0.unit");
    expect(unit?.label).toBe("ერთეული");
  });

  it("names both sections rather than falling back to the raw key", () => {
    expect(sectionLabel(credentialsSection(), "ka")).toBe(
      "კვალიფიკაცია და გამოცდილება",
    );
    expect(sectionLabel(credentialsSection(), "en")).toBe("Qualifications");
    expect(sectionLabel(ratesSection(), "ka")).toBe("ფასები");
    expect(sectionLabel(ratesSection(), "en")).toBe("Rates");
  });
});
