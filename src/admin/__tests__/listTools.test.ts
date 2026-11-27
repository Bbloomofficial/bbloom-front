import { describe, expect, it } from "vitest";
import { matchesQuery, pageOf, sortRows } from "../listTools";

describe("matchesQuery", () => {
  it("matches every word anywhere in the fields, ignoring case", () => {
    expect(matchesQuery(["Cafe Rustaveli", "cafe.bbloom.ge"], "RUSTAVELI cafe")).toBe(true);
    expect(matchesQuery(["Cafe Rustaveli"], "cafe vake")).toBe(false);
  });

  it("matches Georgian and skips missing fields", () => {
    expect(matchesQuery([undefined, "ყვავილების მაღაზია", null], "მაღაზია")).toBe(true);
  });

  it("treats an empty query as matching everything", () => {
    expect(matchesQuery([], "  ")).toBe(true);
  });
});

describe("sortRows", () => {
  const rows = [
    { id: "a", seen: 3 },
    { id: "b", seen: null },
    { id: "c", seen: 10 },
  ];

  it("sorts numbers as numbers and puts missing values last both ways", () => {
    expect(sortRows(rows, (r) => r.seen, "asc").map((r) => r.id)).toEqual(["a", "c", "b"]);
    expect(sortRows(rows, (r) => r.seen, "desc").map((r) => r.id)).toEqual(["c", "a", "b"]);
  });

  it("orders text naturally, so site 2 comes before site 10", () => {
    const names = [{ n: "site 10" }, { n: "Site 2" }];
    expect(sortRows(names, (r) => r.n, "asc").map((r) => r.n)).toEqual(["Site 2", "site 10"]);
  });
});

describe("pageOf", () => {
  it("clamps a page past the end to the last one", () => {
    const view = pageOf([1, 2, 3, 4, 5], 9, 2);
    expect(view).toEqual({ rows: [5], page: 2, pages: 3 });
  });
});
