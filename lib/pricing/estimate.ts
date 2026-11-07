import type { Rate, RateSheetEntry } from "./types";

/**
 * Turning a published rate into "what this costs me per month" requires knowing how much
 * of the billed unit one generation consumes. For a per-image model that is 1 and the
 * answer is exact. For everything else it is an assumption, and the only honest way to
 * show the result is to state the assumption next to it and let the visitor change it.
 *
 * Nothing here invents a price. It multiplies Runware's published rates by quantities the
 * visitor controls.
 */
export interface Assumptions {
  /** Length of one generated video clip. */
  videoSeconds: number;
  /** Tokens in one LLM request. */
  inputTokens: number;
  outputTokens: number;
  /** Share of input tokens served from cache, 0–1. */
  cacheHitRate: number;
  /** Output size for megapixel-billed models. 1024×1024 ≈ 1.05 MP. */
  megapixels: number;
  /** Diffusion steps for step-billed models. */
  steps: number;
  /** Characters in one text-to-speech request. */
  characters: number;
  /** UTF-8 bytes in one request. */
  bytes: number;
  /** GB-seconds consumed by one job. */
  gbSeconds: number;
}

/**
 * Defaults are sourced rather than guessed where Runware gives us a figure. The
 * 32k input / 4k output pair is the exact request their own FAQ works through:
 * "at GLM-5.3-Flash's base rates of $0.15 input and $0.50 output per 1M tokens, a
 * request with 32k input + 4k output tokens costs 0.032 x $0.15 + 0.004 x $0.50".
 */
export const DEFAULT_ASSUMPTIONS: Assumptions = {
  videoSeconds: 5,
  inputTokens: 32_000,
  outputTokens: 4_000,
  cacheHitRate: 0,
  megapixels: 1.05,
  steps: 30,
  characters: 500,
  bytes: 500,
  gbSeconds: 1,
};

/** How many billed units one generation consumes, and the assumption behind it. */
export function unitsPerGeneration(
  unit: string,
  a: Assumptions,
): { quantity: number; assumption: string | null } {
  switch (unit) {
    case "second":
      return { quantity: a.videoSeconds, assumption: `${a.videoSeconds}s clip` };
    case "megapixel":
      return { quantity: a.megapixels, assumption: `${a.megapixels} MP output` };
    case "step":
      return { quantity: a.steps, assumption: `${a.steps} steps` };
    case "character":
      return { quantity: a.characters, assumption: `${a.characters} characters` };
    case "UTF-8 byte":
      return { quantity: a.bytes, assumption: `${a.bytes} bytes` };
    case "GB-second":
      return { quantity: a.gbSeconds, assumption: `${a.gbSeconds} GB-second` };
    // One generation is one billed unit; no assumption required.
    case "image":
    case "output":
    case "request":
    case "generation":
    case "video":
    case "flat":
      return { quantity: 1, assumption: null };
    default:
      return { quantity: 1, assumption: null };
  }
}

export interface CostLine {
  label: string;
  amount: number;
}

export interface Estimate {
  /** Cost of a single generation or request. */
  perGeneration: number;
  /** Cost at the visitor's stated monthly volume. */
  monthly: number;
  /** Component costs, for LLMs split by billing dimension. */
  breakdown: CostLine[];
  /** Human-readable assumption, shown next to the figure. Null when the figure is exact. */
  assumption: string | null;
  /**
   * False when the estimate rests on an assumption the visitor should see, or when the
   * model's published rates are incomplete. Drives the "approximate" affordance.
   */
  exact: boolean;
  /** Set when the rate sheet does not publish enough to price a request properly. */
  caveat: string | null;
}

const pickRate = (rates: Rate[], side: Rate["side"]) => rates.find((r) => r.side === side);

/**
 * Prices one LLM request across its separate billing dimensions.
 *
 * Runware is explicit that these must not be blended: "LLM billing separates input
 * tokens, output tokens, and cache reads. These are different billing dimensions, so
 * collapsed rows show each published rate instead of a single blended number." We
 * therefore sum real components rather than averaging a headline rate — which also
 * means the output rate, hidden behind their row expander, is finally part of the total.
 */
function estimateTokenRequest(entry: RateSheetEntry, a: Assumptions): Estimate | null {
  const input = pickRate(entry.rates, "input");
  const output = pickRate(entry.rates, "output");
  const cacheRead = pickRate(entry.rates, "cache-read");
  if (!input && !output) return null;

  const hit = Math.min(Math.max(a.cacheHitRate, 0), 1);
  const cachedTokens = a.inputTokens * hit;
  const freshTokens = a.inputTokens - cachedTokens;

  const breakdown: CostLine[] = [];
  let total = 0;

  if (input) {
    const cost = (freshTokens / 1e6) * input.amount;
    breakdown.push({ label: `Input · ${fmtTokens(freshTokens)}`, amount: cost });
    total += cost;
  }
  if (cachedTokens > 0) {
    // Falls back to the standard input rate when no cached rate is published.
    const rate = cacheRead ?? input;
    if (rate) {
      const cost = (cachedTokens / 1e6) * rate.amount;
      breakdown.push({
        label: `${cacheRead ? "Cache read" : "Cache read (at input rate)"} · ${fmtTokens(cachedTokens)}`,
        amount: cost,
      });
      total += cost;
    }
  }
  if (output) {
    const cost = (a.outputTokens / 1e6) * output.amount;
    breakdown.push({ label: `Output · ${fmtTokens(a.outputTokens)}`, amount: cost });
    total += cost;
  }

  return {
    perGeneration: total,
    monthly: 0, // filled in by estimate()
    breakdown,
    assumption: `${fmtTokens(a.inputTokens)} in · ${fmtTokens(a.outputTokens)} out`,
    exact: false,
    caveat: output
      ? null
      : "No output-token rate published, so this counts input only and understates a real request.",
  };
}

const fmtTokens = (n: number) =>
  n >= 1000 ? `${Number((n / 1000).toFixed(1))}k tokens` : `${Math.round(n)} tokens`;

/**
 * The effective price of the visible tier — the discounted figure when a sale is active,
 * since that is what the visitor would actually be billed.
 */
export function effectiveAmount(entry: RateSheetEntry): number {
  return entry.shownAmount ?? 0;
}

/** Estimates what one model costs at a stated monthly volume. */
export function estimate(
  entry: RateSheetEntry,
  generationsPerMonth: number,
  a: Assumptions = DEFAULT_ASSUMPTIONS,
): Estimate {
  const volume = Number.isFinite(generationsPerMonth) ? Math.max(generationsPerMonth, 0) : 0;

  // Token-billed models are priced per request across their separate dimensions.
  if (entry.rates.some((r) => r.dimension === "token")) {
    const token = estimateTokenRequest(entry, a);
    if (token) return { ...token, monthly: token.perGeneration * volume };
  }

  const unit = entry.shownUnit;
  const { quantity, assumption } = unitsPerGeneration(unit, a);
  const perGeneration = effectiveAmount(entry) * quantity;

  return {
    perGeneration,
    monthly: perGeneration * volume,
    breakdown: [
      {
        label: assumption ? `${entry.configuration} · ${assumption}` : entry.configuration,
        amount: perGeneration,
      },
    ],
    assumption,
    exact: assumption === null,
    caveat: null,
  };
}

/** The three ways the rate sheet can express a price. */
export type NormaliseMode = "unit" | "per-1k" | "monthly";

/**
 * Restates a price in the visitor's chosen terms. "per unit" is Runware's own figure;
 * the other two are the comparisons the published table makes impossible, because a
 * per-second rate and a per-1M-token rate cannot be ranked against each other as given.
 */
export function normalisedValue(
  entry: RateSheetEntry,
  mode: NormaliseMode,
  generationsPerMonth: number,
  a: Assumptions = DEFAULT_ASSUMPTIONS,
): number {
  const est = estimate(entry, generationsPerMonth, a);
  switch (mode) {
    case "unit":
      return effectiveAmount(entry);
    case "per-1k":
      return est.perGeneration * 1000;
    case "monthly":
      return est.monthly;
  }
}

/** Sums a set of rows at a stated volume — the sticky total. */
export function totalMonthly(
  entries: RateSheetEntry[],
  generationsPerMonth: number,
  a: Assumptions = DEFAULT_ASSUMPTIONS,
): number {
  return entries.reduce((sum, e) => sum + estimate(e, generationsPerMonth, a).monthly, 0);
}
