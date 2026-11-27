import { describe, expect, it } from "vitest";
import {
  NO_FILTERS,
  addDecimals,
  campaignsToCsv,
  filterCampaigns,
  formatDecimal,
  parseDecimal,
  sortCampaigns,
  totalCampaigns,
} from "../campaignAnalytics";
import type { AdCampaignDto } from "../api/types";

function campaign(overrides: Partial<AdCampaignDto>): AdCampaignDto {
  return {
    id: "c1",
    siteId: "s1",
    siteName: "Cafe",
    name: "Spring",
    objective: "TRAFFIC",
    status: "ACTIVE",
    channels: ["FACEBOOK"],
    dailyBudgetMinor: 500,
    currency: "USD",
    test: false,
    createdAt: "2026-11-01T10:00:00Z",
    ...overrides,
  };
}

describe("exact decimals", () => {
  it("adds Meta's spend strings without float drift", () => {
    const sum = addDecimals(parseDecimal("0.1")!, parseDecimal("0.2")!);
    expect(formatDecimal(sum)).toBe("0.30");
  });

  it("refuses what is not a decimal rather than reading it as zero", () => {
    expect(parseDecimal("")).toBeNull();
    expect(parseDecimal("1,5")).toBeNull();
    expect(parseDecimal(null)).toBeNull();
  });
});

describe("sortCampaigns", () => {
  const rows = [
    campaign({ id: "a", spend: "9.50" }),
    campaign({ id: "b", spend: "10.00" }),
    campaign({ id: "c" }), // not reported yet
  ];

  it("compares spend as a number, not as text", () => {
    expect(sortCampaigns(rows, "spend", "desc").map((r) => r.id)).toEqual([
      "b",
      "a",
      "c",
    ]);
  });

  it("puts unreported campaigns last in both directions", () => {
    expect(sortCampaigns(rows, "spend", "asc").map((r) => r.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });
});

describe("filterCampaigns", () => {
  const rows = [
    campaign({ id: "live" }),
    campaign({ id: "paused", status: "PAUSED", channels: ["INSTAGRAM"] }),
    // Failed after reaching Meta: still possibly spending.
    campaign({ id: "half", status: "FAILED", metaCampaignId: "m1" }),
    campaign({ id: "gone", status: "DELETED", deletedAt: "2026-11-02T00:00:00Z" }),
  ];

  it("keeps a half-failed launch under 'spending only'", () => {
    const result = filterCampaigns(rows, { ...NO_FILTERS, spendingOnly: true });
    expect(result.map((r) => r.id)).toEqual(["live", "half"]);
  });

  it("filters by channel and status together", () => {
    const result = filterCampaigns(rows, {
      ...NO_FILTERS,
      statuses: ["PAUSED", "ACTIVE"],
      channel: "INSTAGRAM",
    });
    expect(result.map((r) => r.id)).toEqual(["paused"]);
  });
});

describe("totalCampaigns", () => {
  it("keeps currencies apart and leaves unreported campaigns out of the figures", () => {
    const totals = totalCampaigns([
      campaign({ id: "a", spend: "1.25", impressions: "100", clicks: "4", insightsReadAt: "x" }),
      campaign({ id: "b", spend: "2.10", impressions: "300", clicks: "4", insightsReadAt: "x" }),
      campaign({ id: "c", currency: "GEL", spend: "5", insightsReadAt: "x" }),
      campaign({ id: "d", status: "PAUSED", test: true }),
    ]);
    expect(formatDecimal(totals.spend.USD)).toBe("3.35");
    expect(formatDecimal(totals.spend.GEL)).toBe("5.00");
    expect(totals.impressions).toBe(400);
    expect(totals.ctr).toBe(2);
    expect(totals.live).toBe(3);
    expect(totals.liveDailyBudgetMinor).toEqual({ USD: 1000, GEL: 500 });
    expect(totals.unreported).toBe(1);
    expect(totals.test).toBe(1);
  });
});

describe("campaignsToCsv", () => {
  it("quotes cells that contain commas or quotes", () => {
    const csv = campaignsToCsv([campaign({ name: 'Sale, "big"' })], ["h"]);
    expect(csv.split("\r\n")[1].startsWith('"Sale, ""big"""')).toBe(true);
  });
});
