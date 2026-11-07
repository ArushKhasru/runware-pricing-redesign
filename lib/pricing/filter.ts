import type { RateSheetEntry } from "./types";
import {
  DEFAULT_ASSUMPTIONS,
  normalisedValue,
  type Assumptions,
  type NormaliseMode,
} from "./estimate";

export type SortKey =
  | "price-asc"
  | "price-desc"
  | "latency-asc"
  | "name-asc"
  | "released-desc"
  | "savings-desc";

export const SORT_LABELS: Record<SortKey, string> = {
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "latency-asc": "Fastest first",
  "name-asc": "Name A–Z",
  "released-desc": "Release date",
  "savings-desc": "Biggest savings",
};

export interface FilterState {
  search: string;
  /** Empty means every modality. */
  modalities: string[];
  /** Bounds apply to the price as currently normalised, not to the raw rate. */
  minPrice: number | null;
  maxPrice: number | null;
  onSaleOnly: boolean;
  sort: SortKey;
  mode: NormaliseMode;
  /** Generations per month; drives both the estimate and the normalised sort. */
  volume: number;
}

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  modalities: [],
  minPrice: null,
  maxPrice: null,
  onSaleOnly: false,
  sort: "price-asc",
  mode: "unit",
  volume: 10_000,
};

/** Runware's fastest published example for a model, used by the latency sort. */
export function fastestLatency(entry: RateSheetEntry): number | null {
  const values = entry.examples
    .map((e) => e.latencyMs)
    .filter((v): v is number => typeof v === "number" && v > 0);
  return values.length ? Math.min(...values) : null;
}

/** Everything a search query should be able to match. */
function haystack(entry: RateSheetEntry): string {
  return [
    entry.name,
    entry.slug,
    entry.air ?? "",
    entry.provider ?? "",
    entry.modality,
    entry.configuration,
  ]
    .join(" ")
    .toLowerCase();
}

/**
 * Filters and sorts the rate sheet.
 *
 * This returns the rows and nothing else on purpose. The result count announced to
 * screen readers is `applyFilters(...).length` — there is deliberately no separate
 * count function to fall out of step with the rendered rows, which is exactly how an
 * announced count becomes a lie.
 */
export function applyFilters(
  entries: RateSheetEntry[],
  filters: FilterState,
  assumptions: Assumptions = DEFAULT_ASSUMPTIONS,
): RateSheetEntry[] {
  const { search, modalities, minPrice, maxPrice, onSaleOnly, sort, mode, volume } = filters;
  const query = search.trim().toLowerCase();
  const terms = query ? query.split(/\s+/) : [];
  const allowed = new Set(modalities);

  /**
   * Normalised values are computed once per row and cached, not recomputed inside the
   * comparator. A comparison-time call would run the estimator O(n log n) times — about
   * 3,700 evaluations per sort of this sheet — for a value that cannot change mid-sort.
   */
  const cache = new Map<string, number>();
  const value = (e: RateSheetEntry) => {
    const hit = cache.get(e.slug);
    if (hit !== undefined) return hit;
    const v = normalisedValue(e, mode, volume, assumptions);
    cache.set(e.slug, v);
    return v;
  };

  const rows = entries.filter((entry) => {
    if (allowed.size && !allowed.has(entry.modality)) return false;
    if (onSaleOnly && !entry.onSale) return false;

    if (terms.length) {
      const text = haystack(entry);
      if (!terms.every((t) => text.includes(t))) return false;
    }

    if (minPrice != null || maxPrice != null) {
      const v = value(entry);
      if (minPrice != null && v < minPrice) return false;
      if (maxPrice != null && v > maxPrice) return false;
    }

    return true;
  });

  return sortRows(rows, sort, value);
}

function sortRows(
  rows: RateSheetEntry[],
  sort: SortKey,
  value: (e: RateSheetEntry) => number,
): RateSheetEntry[] {
  // Rows missing the sort dimension sink to the bottom rather than scattering.
  const sunk = (v: number | null) => (v == null ? Number.POSITIVE_INFINITY : v);

  /**
   * Price ties are common and large: 13 models open the sheet at exactly $0.0006/image.
   * Breaking those alphabetically spends the first screen on a wall of identical figures,
   * so the tie goes to the next axis a buyer actually decides on — measured speed — with
   * the name last to keep the order stable between renders.
   */
  const byPriceThenSpeed = (a: RateSheetEntry, b: RateSheetEntry, delta: number) =>
    delta || sunk(fastestLatency(a)) - sunk(fastestLatency(b)) || a.name.localeCompare(b.name);

  const sorted = [...rows];
  switch (sort) {
    case "price-asc":
      sorted.sort((a, b) => byPriceThenSpeed(a, b, value(a) - value(b)));
      break;
    case "price-desc":
      sorted.sort((a, b) => byPriceThenSpeed(a, b, value(b) - value(a)));
      break;
    case "latency-asc":
      sorted.sort(
        (a, b) =>
          sunk(fastestLatency(a)) - sunk(fastestLatency(b)) || a.name.localeCompare(b.name),
      );
      break;
    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "released-desc":
      sorted.sort(
        (a, b) =>
          (Date.parse(b.releasedAt ?? "") || 0) - (Date.parse(a.releasedAt ?? "") || 0) ||
          a.name.localeCompare(b.name),
      );
      break;
    case "savings-desc":
      sorted.sort(
        (a, b) => (b.savePct ?? 0) - (a.savePct ?? 0) || a.name.localeCompare(b.name),
      );
      break;
  }
  return sorted;
}

/** The price range present in the data, for the range control's bounds. */
export function priceBounds(
  entries: RateSheetEntry[],
  mode: NormaliseMode,
  volume: number,
  assumptions: Assumptions = DEFAULT_ASSUMPTIONS,
): { min: number; max: number } {
  let min = Number.POSITIVE_INFINITY;
  let max = 0;
  for (const e of entries) {
    const v = normalisedValue(e, mode, volume, assumptions);
    if (!Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { min: Number.isFinite(min) ? min : 0, max };
}

/** Modalities present in the data, with counts, for the filter control. */
export function modalityFacets(
  entries: RateSheetEntry[],
): { modality: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of entries) counts.set(e.modality, (counts.get(e.modality) ?? 0) + 1);
  return [...counts.entries()]
    .map(([modality, count]) => ({ modality, count }))
    .sort((a, b) => b.count - a.count);
}
