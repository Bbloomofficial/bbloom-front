import { describe, expect, it } from "vitest";
import { adminStrings } from "../../admin/strings";
import {
  TEMPLATE_CATEGORY_ORDER,
  groupByCategory,
  orderCategories,
} from "../../api/templates";
import { en } from "../../i18n/en";
import { ka } from "../../i18n/ka";
import { tryStrings } from "../../try/strings";
import { dashboardStrings } from "../strings";
import type { OrderingBlockedReason } from "../api/types";

const LOCALES = ["en", "ka"] as const;

/**
 * A template whose category has no copy shows the client a raw `LAWYER` in the
 * middle of a Georgian page, which is the exact failure the nine new templates
 * would have caused. Cheap to pin, so pin it in every surface that labels one.
 */
describe("template category labels", () => {
  it.each(LOCALES)("covers every category on the marketing site (%s)", (locale) => {
    const dict = locale === "en" ? en : ka;
    for (const category of TEMPLATE_CATEGORY_ORDER) {
      expect(dict.templatesPage.categories[category]).toBeTruthy();
    }
  });

  it.each(LOCALES)("covers every category in the try flow (%s)", (locale) => {
    const t = tryStrings(locale);
    for (const category of TEMPLATE_CATEGORY_ORDER) {
      expect(t.categories[category]).toBeTruthy();
    }
  });

  it.each(LOCALES)("covers every category in the dashboard (%s)", (locale) => {
    const t = dashboardStrings(locale);
    for (const category of TEMPLATE_CATEGORY_ORDER) {
      expect(t.newSite.categories[category]).toBeTruthy();
    }
  });

  it.each(LOCALES)("covers every category in admin (%s)", (locale) => {
    const t = adminStrings(locale);
    for (const category of TEMPLATE_CATEGORY_ORDER) {
      expect(t.categories[category]).toBeTruthy();
    }
  });
});

describe("orderCategories", () => {
  it("puts businesses before the personal categories", () => {
    expect(orderCategories(["CREATIVE", "SHOP", "TEACHER", "RESTAURANT"])).toEqual(
      ["SHOP", "RESTAURANT", "TEACHER", "CREATIVE"],
    );
  });

  it("keeps a category this build has never heard of, at the end", () => {
    expect(orderCategories(["CLINIC", "SHOP"])).toEqual(["SHOP", "CLINIC"]);
  });

  it("collapses duplicates", () => {
    expect(orderCategories(["SHOP", "SHOP"])).toEqual(["SHOP"]);
  });
});

describe("groupByCategory", () => {
  it("never produces an empty group", () => {
    const groups = groupByCategory([
      { category: "TEACHER", code: "teacher-simple" },
      { category: "SHOP", code: "shop-simple" },
      { category: "TEACHER", code: "teacher-modern" },
    ]);

    expect(groups.map((group) => group.category)).toEqual(["SHOP", "TEACHER"]);
    expect(groups[1].templates).toHaveLength(2);
  });
});

/**
 * The backend gained a `TEMPLATE_CATEGORY` reason when the personal templates
 * landed: those categories cannot take online orders at all, so the dashboard
 * has to explain why the orders page is empty rather than looking broken.
 */
describe("ordering blocked reasons", () => {
  const reasons: OrderingBlockedReason[] = [
    "TEMPLATE_TIER",
    "TEMPLATE_CATEGORY",
    "FEATURE_OFF",
    "NO_PAYMENT_ACCOUNT",
  ];

  it.each(LOCALES)("explains every reason the backend can send (%s)", (locale) => {
    const t = dashboardStrings(locale);
    for (const reason of reasons) {
      expect(t.orders.blocked[reason]).toBeTruthy();
    }
  });

  it.each(LOCALES)("has a fallback for a reason it does not know (%s)", (locale) => {
    const t = dashboardStrings(locale);
    expect("SOMETHING_NEW" in t.orders.blocked).toBe(false);
    expect(t.orders.blockedUnknown).toBeTruthy();
  });
});
