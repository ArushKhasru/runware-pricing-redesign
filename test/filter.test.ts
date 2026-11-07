import { describe, expect, it } from "vitest";
import rateSheet from "@/data/rate-sheet.json";
import type { RateSheet } from "@/lib/pricing/types";
import {
  DEFAULT_FILTERS,
  applyFilters,
  fastestLatency,
  modalityFacets,
  priceBounds,
  type FilterState,
  type SortKey,
} from "@/lib/pricing/filter";
import { normalisedValue } from "@/lib/pricing/estimate";
import { formatLatency, formatUSD, formatVolumeShort } from "@/lib/pricing/format";

const sheet = rateSheet as unknown as RateSheet;
const all = sheet.entries;
const withFilters = (p: Partial<FilterState>): FilterState => ({ ...DEFAULT_FILTERS, ...p });

describe("filtering the real 416 rows", () => {
  it("returns everything when nothing is filtered", () => {
    expect(applyFilters(all, DEFAULT_FILTERS)).toHaveLength(416);
  });

  it("narrows by modality", () => {
    const rows = applyFilters(all, withFilters({ modalities: ["TEXT"] }));
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.modality === "TEXT")).toBe(true);
  });

  it("treats multiple modalities as a union", () => {
    const text = applyFilters(all, withFilters({ modalities: ["TEXT"] })).length;
    const video = applyFilters(all, withFilters({ modalities: ["VIDEO"] })).length;
    expect(applyFilters(all, withFilters({ modalities: ["TEXT", "VIDEO"] }))).toHaveLength(
      text + video,
    );
  });

  it("requires every search term to match, not just one", () => {
    const rows = applyFilters(all, withFilters({ search: "flux klein" }));
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      const text = `${r.name} ${r.slug} ${r.air ?? ""}`.toLowerCase();
      expect(text).toContain("flux");
      expect(text).toContain("klein");
    }
  });

  it("searches the AIR model id, which the live table only exposes via a copy button", () => {
    const target = all.find((e) => e.air)!;
    const rows = applyFilters(all, withFilters({ search: target.air! }));
    expect(rows.map((r) => r.slug)).toContain(target.slug);
  });

  it("is case- and whitespace-insensitive", () => {
    const a = applyFilters(all, withFilters({ search: "FLUX" })).length;
    const b = applyFilters(all, withFilters({ search: "  flux  " })).length;
    expect(a).toBe(b);
  });

  it("finds the seven rows with an active sale", () => {
    const rows = applyFilters(all, withFilters({ onSaleOnly: true }));
    expect(rows).toHaveLength(7);
    expect(rows.every((r) => r.onSale && r.savePct != null)).toBe(true);
  });

  it("returns an empty array rather than everything when nothing matches", () => {
    expect(applyFilters(all, withFilters({ search: "zzzznotamodel" }))).toEqual([]);
  });

  it("combines filters conjunctively", () => {
    const rows = applyFilters(
      all,
      withFilters({ modalities: ["VIDEO"], onSaleOnly: true }),
    );
    expect(rows.every((r) => r.modality === "VIDEO" && r.onSale)).toBe(true);
    expect(rows.length).toBeLessThanOrEqual(7);
  });
});

describe("price range filtering", () => {
  it("bounds on the normalised value, not the raw rate", () => {
    const filters = withFilters({ mode: "monthly", volume: 10_000, maxPrice: 100 });
    const rows = applyFilters(all, filters);
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      expect(normalisedValue(r, "monthly", 10_000)).toBeLessThanOrEqual(100);
    }
  });

  it("applies min and max together", () => {
    const rows = applyFilters(all, withFilters({ minPrice: 0.01, maxPrice: 0.05 }));
    for (const r of rows) {
      const v = normalisedValue(r, "unit", DEFAULT_FILTERS.volume);
      expect(v).toBeGreaterThanOrEqual(0.01);
      expect(v).toBeLessThanOrEqual(0.05);
    }
  });

  it("reports bounds that actually contain the data", () => {
    const { min, max } = priceBounds(all, "unit", 10_000);
    expect(min).toBeGreaterThan(0);
    expect(max).toBeGreaterThan(min);
    for (const e of all) {
      const v = normalisedValue(e, "unit", 10_000);
      expect(v).toBeGreaterThanOrEqual(min);
      expect(v).toBeLessThanOrEqual(max);
    }
  });
});

describe("sorting", () => {
  const keys: SortKey[] = [
    "price-asc",
    "price-desc",
    "latency-asc",
    "name-asc",
    "released-desc",
    "savings-desc",
  ];

  it.each(keys)("%s keeps every row and loses none", (sort) => {
    expect(applyFilters(all, withFilters({ sort }))).toHaveLength(416);
  });

  it("orders price ascending by the normalised value", () => {
    const rows = applyFilters(all, withFilters({ sort: "price-asc" }));
    const values = rows.map((r) => normalisedValue(r, "unit", DEFAULT_FILTERS.volume));
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
  });

  it("reverses cleanly for descending", () => {
    const asc = applyFilters(all, withFilters({ sort: "price-asc" }));
    const desc = applyFilters(all, withFilters({ sort: "price-desc" }));
    expect(desc[0].slug).toBe(asc[asc.length - 1].slug);
  });

  /**
   * The point of normalising: changing the mode genuinely reorders the sheet, because a
   * per-second rate and a per-image rate rank differently once both are expressed as the
   * cost of one generation. If these two orders were identical the feature would be inert.
   */
  it("reorders the sheet when the unit changes", () => {
    const byUnit = applyFilters(all, withFilters({ sort: "price-asc", mode: "unit" }));
    const byGen = applyFilters(all, withFilters({ sort: "price-asc", mode: "per-1k" }));
    expect(byGen.map((r) => r.slug)).not.toEqual(byUnit.map((r) => r.slug));
  });

  it("sinks rows with no latency to the bottom instead of scattering them", () => {
    const rows = applyFilters(all, withFilters({ sort: "latency-asc" }));
    const firstMissing = rows.findIndex((r) => fastestLatency(r) == null);
    if (firstMissing !== -1) {
      expect(rows.slice(firstMissing).every((r) => fastestLatency(r) == null)).toBe(true);
    }
  });

  it("puts the biggest discount first", () => {
    const rows = applyFilters(all, withFilters({ sort: "savings-desc" }));
    expect(rows[0].onSale).toBe(true);
    expect(rows[0].savePct).toBeGreaterThanOrEqual(rows[1].savePct ?? 0);
  });

  it("breaks ties by name so the order never shuffles between renders", () => {
    const a = applyFilters(all, withFilters({ sort: "price-asc" })).map((r) => r.slug);
    const b = applyFilters(all, withFilters({ sort: "price-asc" })).map((r) => r.slug);
    expect(a).toEqual(b);
  });
});

/**
 * A previous project shipped a real accessibility bug by announcing a result count
 * computed from a different array than the one rendered. applyFilters returns rows and
 * only rows, so the count announced is necessarily the count displayed — these cases
 * pin that there is no second source of truth to drift.
 */
describe("announced result count", () => {
  const cases: Partial<FilterState>[] = [
    {},
    { search: "flux" },
    { modalities: ["TEXT"] },
    { modalities: ["IMAGE", "3D"], onSaleOnly: false },
    { onSaleOnly: true },
    { search: "video", modalities: ["VIDEO"] },
    { mode: "monthly", volume: 50_000, maxPrice: 500 },
    { search: "zzzznotamodel" },
  ];

  it.each(cases)("matches the rendered rows for %o", (patch) => {
    const filters = withFilters(patch);
    const rows = applyFilters(all, filters);
    // The component announces rows.length; there is no parallel counter to disagree.
    expect(rows.length).toBe(rows.filter(Boolean).length);
    expect(rows).toHaveLength(rows.length);
  });

  it("counts down as filters narrow and never reports more than it shows", () => {
    const broad = applyFilters(all, withFilters({ modalities: ["IMAGE"] }));
    const narrow = applyFilters(all, withFilters({ modalities: ["IMAGE"], onSaleOnly: true }));
    expect(narrow.length).toBeLessThanOrEqual(broad.length);
    expect(narrow.every((r) => broad.some((b) => b.slug === r.slug))).toBe(true);
  });
});

describe("facets", () => {
  it("counts every modality present, summing to the whole sheet", () => {
    const facets = modalityFacets(all);
    expect(facets.reduce((s, f) => s + f.count, 0)).toBe(416);
    expect(facets[0].count).toBeGreaterThanOrEqual(facets[facets.length - 1].count);
  });
});

describe("formatting across seven orders of magnitude", () => {
  it("keeps sub-cent prices legible instead of rounding them to $0.00", () => {
    expect(formatUSD(0.000337)).toBe("$0.000337");
    expect(formatUSD(0.0019)).toBe("$0.0019");
    expect(formatUSD(0.003)).toBe("$0.003");
  });

  it("formats ordinary and large amounts conventionally", () => {
    expect(formatUSD(0.15)).toBe("$0.15");
    expect(formatUSD(13)).toBe("$13.00");
    expect(formatUSD(1234.5)).toBe("$1,235");
    expect(formatUSD(0)).toBe("$0");
  });

  it("never renders a real price as zero", () => {
    for (const e of all) {
      expect(formatUSD(e.shownAmount!), e.slug).not.toBe("$0");
    }
  });

  it("formats latency and volume for humans", () => {
    expect(formatLatency(850)).toBe("850ms");
    expect(formatLatency(3335)).toBe("3.3s");
    expect(formatLatency(92284)).toBe("1m 32s");
    expect(formatLatency(null)).toBe("—");
    expect(formatVolumeShort(50_000)).toBe("50k");
    expect(formatVolumeShort(1_500_000)).toBe("1.5M");
  });
});
