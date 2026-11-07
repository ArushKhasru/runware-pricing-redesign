import rateSheet from "@/data/rate-sheet.json";
import type { Example, RateSheet, RateSheetEntry } from "./types";

const sheet = rateSheet as unknown as RateSheet;

/**
 * The scraped fixture is ~700KB because it keeps every measured example for every model.
 * All of that is useful on the server and almost none of it is needed in the browser, so
 * the client gets a trimmed projection: every pricing tier is kept (the interface shows
 * the ones Runware hides), while the examples collapse to the single fastest one, which
 * is all the latency column reads.
 */
function trimExamples(examples: Example[]): Example[] {
  const timed = examples.filter((e) => typeof e.latencyMs === "number" && e.latencyMs > 0);
  if (!timed.length) return [];
  return [timed.reduce((best, e) => (e.latencyMs! < best.latencyMs! ? e : best))];
}

export function getEntries(): RateSheetEntry[] {
  return sheet.entries.map((entry) => ({
    ...entry,
    overview: null,
    rates: entry.rates.map((rate) => ({
      label: rate.label,
      amount: rate.amount,
      unit: rate.unit,
      dimension: rate.dimension,
      side: rate.side,
    })),
    examples: trimExamples(entry.examples),
  }));
}

export function getMeta() {
  return {
    source: sheet.source,
    scrapedAt: sheet.scrapedAt,
    counts: sheet.counts,
  };
}
