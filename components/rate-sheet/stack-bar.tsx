"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { estimate, type Assumptions } from "@/lib/pricing/estimate";
import { formatCount, formatUSD } from "@/lib/pricing/format";
import type { RateSheetEntry } from "@/lib/pricing/types";

/**
 * A sticky total over the whole filtered sheet would be a meaningless number — nobody
 * buys all 416 models. So the total is a comparison basket: pick the two or three models
 * you would actually run, and see them side by side at your volume.
 *
 * The label says exactly what is being summed. A combined figure is only honest if the
 * assumption behind it is on screen.
 */
export function StackBar({
  entries,
  volume,
  assumptions,
  onRemove,
  onClear,
}: {
  entries: RateSheetEntry[];
  volume: number;
  assumptions: Assumptions;
  onRemove: (slug: string) => void;
  onClear: () => void;
}) {
  if (!entries.length) return null;

  const priced = entries.map((entry) => ({
    entry,
    monthly: estimate(entry, volume, assumptions).monthly,
  }));
  const total = priced.reduce((sum, p) => sum + p.monthly, 0);

  // The wrapper paints the ground so no sheet row shows through the gutter beneath the
  // floating card — content rendering below a pinned element reads as a layering bug,
  // which the blur cannot fix.
  return (
    <div className="pointer-events-none sticky bottom-0 z-30 -mx-4 mt-6 bg-background px-4 pb-4 sm:-mx-6 sm:px-6">
      <div className="pointer-events-auto mx-auto max-w-[var(--sheet-max)] rounded-lg border border-border bg-card/95 p-3 backdrop-blur-sm sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <p className="text-label text-rw-neutral-30">
              Comparing {entries.length} {entries.length === 1 ? "model" : "models"}, each
              at {formatCount(volume)} / month
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {priced.map(({ entry, monthly }) => (
                <li key={entry.slug}>
                  <span className="flex h-8 items-center gap-2 rounded border border-border bg-background pl-2.5 pr-1">
                    <span className="max-w-[14rem] truncate text-[13px] text-foreground">
                      {entry.name}
                    </span>
                    <span
                      data-numeric
                      className="font-mono text-[13px] font-medium text-foreground"
                    >
                      {formatUSD(monthly)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemove(entry.slug)}
                      aria-label={`Remove ${entry.name} from the comparison`}
                      className="inline-flex size-6 items-center justify-center rounded text-rw-neutral-30 transition-colors hover:text-foreground"
                    >
                      <X aria-hidden className="size-3.5" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-3 sm:border-t-0 sm:pt-0">
            <div className="text-right">
              <span className="text-label block text-rw-neutral-30">
                Combined per month
              </span>
              <span
                data-numeric
                className="animate-tick font-mono text-[1.5rem] leading-none font-medium text-primary"
                key={total}
              >
                {formatUSD(total)}
              </span>
            </div>
            <Button variant="ghost" size="touch" onClick={onClear}>
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
