"use client";

import { ArrowUpRight, Check, Info, Plus } from "lucide-react";
import { CopyModelId } from "./copy-model-id";
import { EmptyState } from "./rate-table";
import type { RowContext } from "./rate-table";
import { estimate } from "@/lib/pricing/estimate";
import { fastestLatency } from "@/lib/pricing/filter";
import { formatLatency, formatUSD, splitPrice } from "@/lib/pricing/format";
import type { RateSheetEntry } from "@/lib/pricing/types";
import { cn } from "@/lib/utils";

/**
 * Below 768px the live table is 1088px wide inside a 327px container, so the price —
 * the reason the page exists — is off screen with no hint that it is there.
 *
 * Here each row becomes a card whose largest element is the price, and every control
 * is at least 44px.
 */
export function RateCards({ rows, ctx }: { rows: RateSheetEntry[]; ctx: RowContext }) {
  if (!rows.length) {
    return (
      <div className="md:hidden">
        <EmptyState />
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3 md:hidden">
      {rows.map((entry) => (
        <RateCard key={entry.slug} entry={entry} ctx={ctx} />
      ))}
    </ul>
  );
}

function RateCard({ entry, ctx }: { entry: RateSheetEntry; ctx: RowContext }) {
  const { whole, fraction } = splitPrice(entry.shownAmount ?? 0);
  const est = estimate(entry, ctx.volume, ctx.assumptions);
  const selected = ctx.stack.includes(entry.slug);
  const hidden = entry.rates.length - 1;
  const latency = fastestLatency(entry);
  const unitSuffix = `/ ${entry.shownUnit}`;

  return (
    <li
      className={cn(
        "rounded-lg border border-border bg-card p-4",
        selected && "border-primary/40 bg-primary/[0.06]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <a
            href={`https://runware.ai/models/${entry.slug}`}
            target="_blank"
            rel="noreferrer noopener"
            className="block truncate text-sm font-medium text-foreground"
          >
            {entry.name}
          </a>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-label text-rw-neutral-30">{entry.modality}</span>
            <span className="truncate text-[13px] text-muted-foreground">
              {entry.configuration}
            </span>
          </p>
        </div>
        {entry.onSale && entry.savePct != null && (
          <span className="text-label shrink-0 rounded border border-rw-yellow-base/40 bg-rw-yellow-base/10 px-1.5 py-1 text-rw-yellow-base">
            save ~{entry.savePct}%
          </span>
        )}
      </div>

      {/* The price, as the largest thing on the card */}
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="min-w-0">
          <span className="flex items-baseline gap-2">
            {entry.onSale && (
              <span
                data-numeric
                className="font-mono text-sm text-tabular-muted line-through"
              >
                {formatUSD(entry.listAmount!)}
              </span>
            )}
            <span
              data-numeric
              className="font-mono text-[2rem] leading-none font-medium text-foreground"
            >
              {whole}
              {fraction && <span className="text-tabular-muted">.{fraction}</span>}
            </span>
          </span>
          <span className="mt-1 block font-mono text-[11px] text-rw-neutral-30">
            {unitSuffix}
          </span>
        </p>

        <p className="shrink-0 text-right">
          <span className="text-label block text-rw-neutral-30">Your cost</span>
          <span data-numeric className="font-mono text-base font-medium text-primary">
            {formatUSD(est.monthly)}
          </span>
          <span className="mt-0.5 flex items-center justify-end gap-1 font-mono text-[10px] text-rw-neutral-30">
            {est.assumption ?? "exact"}
            {est.caveat && (
              <span title={est.caveat} className="text-rw-yellow-base">
                <Info aria-hidden className="size-3" />
                <span className="sr-only">{est.caveat}</span>
              </span>
            )}
          </span>
        </p>
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 border-t border-border/60 pt-3">
        {latency != null && (
          <div className="flex items-center gap-1.5">
            <dt className="text-label text-rw-neutral-30">Speed</dt>
            <dd data-numeric className="font-mono text-[13px] text-muted-foreground">
              {formatLatency(latency)}
            </dd>
          </div>
        )}
        {hidden > 0 && (
          <div className="flex items-center gap-1.5">
            <dt className="text-label text-rw-neutral-30">Tiers</dt>
            <dd className="font-mono text-[13px] text-muted-foreground">
              +{hidden} more
            </dd>
          </div>
        )}
        {entry.air && (
          <div className="flex min-w-0 items-center gap-1.5">
            <dt className="sr-only">Model ID</dt>
            <dd className="flex min-w-0 items-center gap-1.5">
              <code className="truncate font-mono text-[11px] text-rw-neutral-30">
                {entry.air}
              </code>
              <CopyModelId air={entry.air} name={entry.name} />
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-4 flex gap-2">
        <a
          href="https://runware.ai/playground"
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Launch ${entry.name} in Playground`}
          /*
            Deliberately not the solid accent. Repeated down 416 cards, a filled green
            button would spend the one accent colour on furniture and leave it competing
            with the computed cost, which is the figure this page exists to show.
          */
          className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
        >
          Try in Playground
          <ArrowUpRight aria-hidden className="size-4" />
        </a>
        <button
          type="button"
          onClick={() => ctx.onToggleStack(entry.slug)}
          aria-pressed={selected}
          aria-label={
            selected
              ? `Remove ${entry.name} from the comparison`
              : `Add ${entry.name} to the comparison`
          }
          className={cn(
            "inline-flex size-11 shrink-0 items-center justify-center rounded-md border transition-colors",
            selected
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border text-muted-foreground",
          )}
        >
          {selected ? <Check aria-hidden /> : <Plus aria-hidden />}
        </button>
      </div>
    </li>
  );
}
