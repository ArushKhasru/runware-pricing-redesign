/**
 * Shape of data/rate-sheet.json, scraped from the public runware.ai/pricing page.
 * See scripts/scrape-pricing.mjs for how each field is sourced.
 */

/** A pricing unit as displayed, after per-token amounts are converted to per-1M. */
export type DisplayUnit =
  | "second"
  | "1M tokens"
  | "image"
  | "output"
  | "request"
  | "megapixel"
  | "character"
  | "generation"
  | "step"
  | "video"
  | "UTF-8 byte"
  | "GB-second"
  | "flat";

/** What kind of quantity the price is charged against. */
export type Dimension = "time" | "token" | "count" | "area" | "unknown";

/** Which side of an LLM's billing a token rate belongs to. */
export type TokenSide = "input" | "output" | "cache-read" | "cache-write";

/**
 * One published pricing tier. For most models these are the rows hidden behind the
 * table's row expander; only one of them is promoted into the visible table row.
 */
export interface Rate {
  /** Tier label, e.g. "720p", "Input tokens", "1024×1024 · steps 16". */
  label: string;
  /** Price for one displayed unit. Token rates are already per 1M tokens. */
  amount: number;
  unit: DisplayUnit | string;
  dimension: Dimension;
  /** Set only for LLM token rates. */
  side: TokenSide | null;
  /** Raw payload amount before unit conversion. Server-side fixture only. */
  rawAmount?: number;
  /** Runware's internal unit id, e.g. "inputToken". Server-side fixture only. */
  rawUnit?: string | null;
  /** Measured latency for this tier, where Runware publishes one. */
  latencyMs?: number | null;
}

/** A measured example request, with Runware's own observed latency. */
export interface Example {
  configuration: string;
  price: number | null;
  latencyMs: number | null;
}

/** One row of the rate sheet as a visitor sees it, plus everything behind its expander. */
export interface RateSheetEntry {
  slug: string;
  name: string;
  /** Runware's AIR model identifier, e.g. "google:gemini@omni-flash-1.2". */
  air: string | null;
  provider: string | null;
  modality: string;
  status: string | null;
  releasedAt: string | null;
  /** "published" = a rate card; "measured" = prices observed per configuration. */
  pricingBasis: "published" | "measured" | "unknown";
  overview: string | null;

  /** The single tier Runware promotes into the visible row. */
  configuration: string;
  shownAmount: number | null;
  shownUnit: DisplayUnit | string;

  /** Active Runware sale on this tier (7 of 416 rows at time of scrape). */
  onSale: boolean;
  listAmount: number | null;
  savePct: number | null;

  /** Every published tier, including those the collapsed row hides. */
  rates: Rate[];
  examples: Example[];

  /** Which of Runware's 9 pages this row appeared on. */
  page: number;
}

export interface RateSheet {
  source: string;
  scrapedAt: string;
  note: string;
  counts: {
    rows: number;
    models: number;
    onSale: number;
    withHiddenTiers: number;
    published: number;
    measured: number;
    noRates: number;
    withLatency: number;
  };
  entries: RateSheetEntry[];
}
