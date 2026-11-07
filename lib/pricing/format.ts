/**
 * Price formatting for a catalogue spanning seven orders of magnitude: a cached-input
 * token rate can be $0.01 per 1M while a training job is $13.00 flat, and a per-request
 * estimate can land at $0.000337. A single fixed precision is wrong at both ends —
 * two decimals would render most of this rate sheet as "$0.00".
 */

const trimZeros = (s: string) => (s.includes(".") ? s.replace(/\.?0+$/, "") : s);

/** Formats a dollar amount at a precision appropriate to its magnitude. */
export function formatUSD(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "$0";

  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1000) {
    return `${sign}$${Math.round(abs).toLocaleString("en-US")}`;
  }
  if (abs >= 1) {
    return `${sign}$${abs.toFixed(2)}`;
  }
  if (abs >= 0.01) {
    return `${sign}$${trimZeros(abs.toFixed(4))}`;
  }
  // Below a cent, keep three significant figures so the value stays distinguishable.
  return `${sign}$${trimZeros(abs.toPrecision(3))}`;
}

/** Compact form for the sticky total, where width is scarce. */
export function formatUSDCompact(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000) return `${sign}$${trimZeros((abs / 1_000_000).toFixed(2))}M`;
  if (abs >= 10_000) return `${sign}$${trimZeros((abs / 1000).toFixed(1))}k`;
  return formatUSD(value);
}

/** Splits a formatted price so the fractional part can be set in a quieter weight. */
export function splitPrice(value: number): { whole: string; fraction: string | null } {
  const formatted = formatUSD(value);
  const dot = formatted.indexOf(".");
  if (dot === -1) return { whole: formatted, fraction: null };
  return { whole: formatted.slice(0, dot), fraction: formatted.slice(dot + 1) };
}

/** Human latency, from Runware's measured milliseconds. */
export function formatLatency(ms: number | null): string {
  if (ms == null || !Number.isFinite(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const s = ms / 1000;
  if (s < 60) return `${trimZeros(s.toFixed(1))}s`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s % 60);
  return rem ? `${m}m ${rem}s` : `${m}m`;
}

/** Thousands-separated integer, for volumes and row counts. */
export function formatCount(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return Math.round(n).toLocaleString("en-US");
}

/** Abbreviated volume for a tight control, e.g. 50,000 -> "50k". */
export function formatVolumeShort(n: number): string {
  if (!Number.isFinite(n)) return "0";
  if (n >= 1_000_000) return `${trimZeros((n / 1_000_000).toFixed(1))}M`;
  if (n >= 1000) return `${trimZeros((n / 1000).toFixed(n % 1000 === 0 ? 0 : 1))}k`;
  return String(Math.round(n));
}
