import { describe, expect, it } from "vitest";
import {
  DEFAULT_ASSUMPTIONS,
  estimate,
  normalisedValue,
  totalMonthly,
  unitsPerGeneration,
  type Assumptions,
} from "@/lib/pricing/estimate";
import type { Rate, RateSheetEntry } from "@/lib/pricing/types";

const rate = (p: Partial<Rate>): Rate => ({
  label: "",
  amount: 0,
  rawAmount: 0,
  rawUnit: null,
  unit: "image",
  dimension: "count",
  side: null,
  latencyMs: null,
  ...p,
});

const entry = (p: Partial<RateSheetEntry>): RateSheetEntry => ({
  slug: "test-model",
  name: "Test Model",
  air: null,
  provider: null,
  modality: "IMAGE",
  status: "live",
  releasedAt: null,
  pricingBasis: "published",
  overview: null,
  configuration: "1024×1024",
  shownAmount: 0.003,
  shownUnit: "image",
  onSale: false,
  listAmount: null,
  savePct: null,
  rates: [],
  examples: [],
  page: 1,
  ...p,
});

describe("per-unit models", () => {
  it("prices a per-image model exactly, with no assumption", () => {
    const e = entry({ shownAmount: 0.003, shownUnit: "image" });
    const result = estimate(e, 10_000);

    expect(result.perGeneration).toBeCloseTo(0.003, 10);
    expect(result.monthly).toBeCloseTo(30, 10);
    expect(result.exact).toBe(true);
    expect(result.assumption).toBeNull();
  });

  it("multiplies a per-second rate by the assumed clip length and says so", () => {
    const e = entry({ modality: "VIDEO", shownAmount: 0.02, shownUnit: "second" });
    const result = estimate(e, 1_000);

    // $0.02/s × 5s = $0.10 per clip
    expect(result.perGeneration).toBeCloseTo(0.1, 10);
    expect(result.monthly).toBeCloseTo(100, 10);
    expect(result.exact).toBe(false);
    expect(result.assumption).toBe("5s clip");
  });

  it("respects a changed clip length", () => {
    const e = entry({ shownAmount: 0.02, shownUnit: "second" });
    const a: Assumptions = { ...DEFAULT_ASSUMPTIONS, videoSeconds: 12 };
    expect(estimate(e, 1, a).perGeneration).toBeCloseTo(0.24, 10);
  });

  it("scales megapixel-billed models by output size", () => {
    const e = entry({ shownAmount: 0.025, shownUnit: "megapixel" });
    // default 1.05 MP ≈ 1024×1024
    expect(estimate(e, 1).perGeneration).toBeCloseTo(0.02625, 10);
  });

  it("uses the discounted price when a sale is active, since that is what is billed", () => {
    const e = entry({ shownAmount: 0.0125, listAmount: 0.025, onSale: true, savePct: 50 });
    expect(estimate(e, 1_000).monthly).toBeCloseTo(12.5, 10);
  });
});

describe("token-billed models", () => {
  /**
   * The oracle is Runware's own FAQ, which works this exact request by hand:
   * "at GLM-5.3-Flash's base rates of $0.15 input and $0.50 output per 1M tokens, a
   * request with 32k input + 4k output tokens costs 0.032 x $0.15 + 0.004 x $0.50
   * = $0.0068". If our arithmetic disagrees with theirs, ours is wrong.
   */
  const glm = entry({
    modality: "TEXT",
    configuration: "Input tokens",
    shownAmount: 0.15,
    shownUnit: "1M tokens",
    rates: [
      rate({ label: "Input tokens", amount: 0.15, unit: "1M tokens", dimension: "token", side: "input" }),
      rate({ label: "Output tokens", amount: 0.5, unit: "1M tokens", dimension: "token", side: "output" }),
    ],
  });

  it("reproduces the worked example from Runware's own FAQ", () => {
    expect(estimate(glm, 1).perGeneration).toBeCloseTo(0.0068, 12);
  });

  it("counts the output rate that their collapsed row hides", () => {
    const result = estimate(glm, 1);
    const output = result.breakdown.find((b) => b.label.startsWith("Output"));

    expect(output).toBeDefined();
    expect(output!.amount).toBeCloseTo(0.002, 12);
    // Output is 29% of this request's cost and is absent from the visible table.
    expect(output!.amount / result.perGeneration).toBeGreaterThan(0.25);
  });

  it("never blends the dimensions into a single rate", () => {
    const result = estimate(glm, 1);
    expect(result.breakdown.map((b) => b.label.split(" ·")[0])).toEqual(["Input", "Output"]);
  });

  it("bills cache hits at the cached rate when one is published", () => {
    const cached = entry({
      ...glm,
      rates: [
        ...glm.rates,
        rate({ label: "Cached", amount: 0.02, unit: "1M tokens", dimension: "token", side: "cache-read" }),
      ],
    });
    // 50% of 32k from cache: 16k × $0.15 + 16k × $0.02 + 4k × $0.50, per 1M
    const result = estimate(cached, 1, { ...DEFAULT_ASSUMPTIONS, cacheHitRate: 0.5 });
    const expected = (16_000 / 1e6) * 0.15 + (16_000 / 1e6) * 0.02 + (4_000 / 1e6) * 0.5;

    expect(result.perGeneration).toBeCloseTo(expected, 12);
    expect(result.breakdown.some((b) => b.label.startsWith("Cache read ·"))).toBe(true);
  });

  it("falls back to the input rate for cache hits when none is published, and says so", () => {
    const result = estimate(glm, 1, { ...DEFAULT_ASSUMPTIONS, cacheHitRate: 1 });
    expect(result.breakdown.some((b) => b.label.includes("at input rate"))).toBe(true);
  });

  it("warns when a model publishes no output rate at all", () => {
    const inputOnly = entry({
      ...glm,
      rates: [rate({ amount: 0.15, unit: "1M tokens", dimension: "token", side: "input" })],
    });
    expect(estimate(inputOnly, 1).caveat).toMatch(/understates/);
  });
});

describe("normalisation", () => {
  const video = entry({ shownAmount: 0.02, shownUnit: "second" });

  it("restates the same model three ways without changing the underlying rate", () => {
    expect(normalisedValue(video, "unit", 1_000)).toBeCloseTo(0.02, 10);
    expect(normalisedValue(video, "per-1k", 1_000)).toBeCloseTo(100, 10);
    expect(normalisedValue(video, "monthly", 1_000)).toBeCloseTo(100, 10);
  });

  it("makes two differently-billed models comparable", () => {
    // A per-second video and a per-image model cannot be ranked as published.
    const image = entry({ shownAmount: 0.05, shownUnit: "image" });
    expect(normalisedValue(video, "unit", 1_000)).toBeLessThan(
      normalisedValue(image, "unit", 1_000),
    );
    // Normalised to one generation, the ranking reverses — which is the real answer.
    expect(normalisedValue(video, "per-1k", 1_000)).toBeGreaterThan(
      normalisedValue(image, "per-1k", 1_000),
    );
  });

  it("names an assumption for every unit that needs one", () => {
    for (const u of ["second", "megapixel", "step", "character", "UTF-8 byte", "GB-second"]) {
      expect(unitsPerGeneration(u, DEFAULT_ASSUMPTIONS).assumption, u).not.toBeNull();
    }
    for (const u of ["image", "output", "request", "generation", "video", "flat"]) {
      expect(unitsPerGeneration(u, DEFAULT_ASSUMPTIONS).assumption, u).toBeNull();
      expect(unitsPerGeneration(u, DEFAULT_ASSUMPTIONS).quantity, u).toBe(1);
    }
  });
});

describe("totals and hostile input", () => {
  it("sums the rows it is given", () => {
    const rows = [
      entry({ slug: "a", shownAmount: 0.001, shownUnit: "image" }),
      entry({ slug: "b", shownAmount: 0.002, shownUnit: "image" }),
    ];
    expect(totalMonthly(rows, 1_000)).toBeCloseTo(3, 10);
  });

  it("treats an empty selection as zero rather than NaN", () => {
    expect(totalMonthly([], 1_000)).toBe(0);
  });

  it.each([NaN, -5, Infinity])("never returns a negative or NaN total for volume %s", (v) => {
    const result = estimate(entry({}), v as number);
    expect(Number.isFinite(result.monthly)).toBe(true);
    expect(result.monthly).toBeGreaterThanOrEqual(0);
  });
});
