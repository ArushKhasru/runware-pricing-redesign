import { describe, expect, it } from "vitest";
import rateSheet from "@/data/rate-sheet.json";
import type { RateSheet } from "@/lib/pricing/types";

const sheet = rateSheet as unknown as RateSheet;

/**
 * These are not ceremonial tests. Every claim the interface makes — sorting by price,
 * normalising units, estimating a monthly bill — assumes the fixture holds these
 * invariants. If a re-scrape breaks one, the UI would show a confidently wrong number,
 * which is the one failure mode this project cannot afford.
 */
describe("rate sheet fixture", () => {
  it("covers the whole rate sheet", () => {
    expect(sheet.entries).toHaveLength(416);
    expect(sheet.counts.rows).toBe(sheet.entries.length);
  });

  it("has one row per model, with no duplicate slugs", () => {
    const slugs = new Set(sheet.entries.map((e) => e.slug));
    expect(slugs.size).toBe(sheet.entries.length);
  });

  it("gives every row a usable visible price", () => {
    for (const e of sheet.entries) {
      expect(e.shownAmount, e.slug).toBeTypeOf("number");
      expect(e.shownAmount!, e.slug).toBeGreaterThan(0);
      expect(e.shownUnit, e.slug).toBeTruthy();
    }
  });

  it("resolves a unit for every tier, including measured ones", () => {
    // Measured tiers carry no unit in the payload and inherit it from the rendered row.
    // A null here would silently corrupt normalisation rather than fail loudly.
    const nullUnits = sheet.entries.flatMap((e) =>
      e.rates.filter((r) => !r.unit).map((r) => `${e.slug}:${r.label}`),
    );
    expect(nullUnits).toEqual([]);
  });

  it("leaves no row without its tiers", () => {
    const empty = sheet.entries.filter((e) => e.rates.length === 0).map((e) => e.slug);
    expect(empty).toEqual([]);
  });

  it("converts token rates from per-token to per-1M consistently", () => {
    const tokenRates = sheet.entries.flatMap((e) =>
      e.rates.filter((r) => r.dimension === "token").map((r) => ({ slug: e.slug, r })),
    );
    expect(tokenRates.length).toBeGreaterThan(0);

    for (const { slug, r } of tokenRates) {
      expect(r.amount, slug).toBeCloseTo(r.rawAmount * 1e6, 9);
      // A per-token figure mistakenly shown as a per-1M figure would land here.
      expect(r.amount, `${slug} ${r.label}`).toBeLessThan(1000);
    }
  });

  it("keeps sale rows internally consistent", () => {
    const sales = sheet.entries.filter((e) => e.onSale);
    expect(sales).toHaveLength(7);

    for (const e of sales) {
      expect(e.listAmount!, e.slug).toBeGreaterThan(e.shownAmount!);
      const implied = (1 - e.shownAmount! / e.listAmount!) * 100;
      // Runware rounds the badge to a whole percent and prefixes it with "~".
      expect(Math.abs(implied - e.savePct!), e.slug).toBeLessThan(1.5);
    }
  });

  it("only uses modalities the interface knows how to render", () => {
    const known = new Set(["IMAGE", "VIDEO", "TEXT", "AUDIO", "3D", "TRAINING", "OTHER"]);
    for (const e of sheet.entries) expect(known, e.slug).toContain(e.modality);
  });

  /**
   * The finding this whole redesign turns on: for an LLM, the price promoted into the
   * visible row is the *input* rate, and the output rate — which dominates a real bill —
   * is hidden behind the row expander. If this ever stops being true, the estimator's
   * framing and the README's argument both need revisiting.
   */
  it("confirms LLM visible rows quote input, not output, tokens", () => {
    const tokenPriced = sheet.entries.filter((e) => e.shownUnit === "1M tokens");
    expect(tokenPriced.length).toBe(62);

    // Every single one promotes an input rate into the visible row.
    for (const e of tokenPriced) {
      expect(e.configuration, e.slug).toMatch(/input/i);
    }

    const llms = sheet.entries.filter((e) =>
      e.rates.some((r) => r.dimension === "token"),
    );
    expect(llms.length).toBeGreaterThan(50);

    const withBothSides = llms.filter(
      (e) =>
        e.rates.some((r) => r.side === "input") && e.rates.some((r) => r.side === "output"),
    );
    expect(withBothSides.length).toBeGreaterThan(40);

    for (const e of withBothSides) {
      const input = e.rates.find((r) => r.side === "input")!.amount;
      const output = e.rates.find((r) => r.side === "output")!.amount;
      expect(output, `${e.slug} output should cost at least as much as input`)
        .toBeGreaterThanOrEqual(input);
    }
  });

  /**
   * Runware's own page gives up on the unit question in two places, and both are
   * arguments for normalising. Pinning them keeps the README honest if the data moves.
   */
  it("documents where a single price column cannot represent the billing", () => {
    // Models billed across more than one dimension at once (e.g. per second AND per image).
    const multiDimension = sheet.entries.filter(
      (e) => new Set(e.rates.map((r) => r.dimension)).size > 1,
    );
    expect(multiDimension.length).toBeGreaterThanOrEqual(10);

    // An image model billed in tokens, whose visible row falls back to a worked example
    // because "per 1M tokens" means nothing to someone counting images.
    const exemplar = sheet.entries.find((e) => e.slug === "google-nano-banana-2-lite");
    expect(exemplar).toBeDefined();
    expect(exemplar!.modality).toBe("IMAGE");
    expect(exemplar!.configuration).toMatch(/^Example:/);
    expect(exemplar!.rates.some((r) => r.dimension === "token")).toBe(true);
  });

  it("records its own provenance", () => {
    expect(sheet.source).toBe("https://runware.ai/pricing");
    expect(Date.parse(sheet.scrapedAt)).not.toBeNaN();
  });
});
