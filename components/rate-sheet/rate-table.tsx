"use client";

import { ArrowUpRight, Info } from "lucide-react";
import { Marker } from "./annotations";
import { CopyModelId } from "./copy-model-id";
import { estimate, type Assumptions, type NormaliseMode } from "@/lib/pricing/estimate";
import { fastestLatency } from "@/lib/pricing/filter";
import { formatLatency, formatUSD, splitPrice } from "@/lib/pricing/format";
import type { RateSheetEntry } from "@/lib/pricing/types";
import { cn } from "@/lib/utils";

/**
 * Rendered as a plain semantic table rather than through a table library.
 *
 * Sorting and filtering are unit-normalisation-aware (the order changes with the chosen
 * unit, the volume and the assumptions) and are persisted in the URL, so they live in
 * tested pure functions in lib/pricing. A table library would have contributed a column
 * model and cell renderers on top of that, plus a second place for sort state to live.
 * One source of truth, no dependency doing nothing.
 */
export interface RowContext {
  mode: NormaliseMode;
  volume: number;
  assumptions: Assumptions;
  stack: string[];
  onToggleStack: (slug: string) => void;
  notes: boolean;
}

/**
 * Each column has exactly one job. "List price" is always Runware's published rate in
 * their own unit, so the page never misquotes them. "Your cost" is always the monthly
 * figure at the visitor's volume. The ranking control chooses only what the sort and the
 * price-range filter compare — it never rewrites what a column means.
 */

export function RateTable({ rows, ctx }: { rows: RateSheetEntry[]; ctx: RowContext }) {
  if (!rows.length) {
    return (
      <div className="hidden md:block">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Runware AI model rates — {rows.length} models, filtered and sorted by the controls
          above.
        </caption>
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="w-8 px-2 py-2.5">
              <span className="sr-only">Add to comparison</span>
            </th>
            <Th>
              Model
              <Marker id={6} active={ctx.notes} />
            </Th>
            <Th>Modality</Th>
            <Th>Configuration</Th>
            <Th align="right">List price</Th>
            <Th align="right">
              Your cost / mo
              <Marker id={4} active={ctx.notes} />
            </Th>
            <Th align="right">
              Speed
              <Marker id={5} active={ctx.notes} />
            </Th>
            <th scope="col" className="px-2 py-2.5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((entry) => (
            <TableRow key={entry.slug} entry={entry} ctx={ctx} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={cn(
        "text-label px-2 py-2.5 font-normal text-rw-neutral-30",
        align === "right" && "text-right",
      )}
    >
      {children}
    </th>
  );
}

function TableRow({ entry, ctx }: { entry: RateSheetEntry; ctx: RowContext }) {
  const selected = ctx.stack.includes(entry.slug);
  const price = splitPrice(entry.shownAmount ?? 0);
  const est = estimate(entry, ctx.volume, ctx.assumptions);
  const cost = splitPrice(est.monthly);
  const showSale = entry.onSale;
  const hiddenTiers = entry.rates.length - 1;

  return (
    <tr
      className={cn(
        "border-b border-border/50 transition-colors hover:bg-muted/30",
        selected && "bg-primary/[0.06]",
      )}
    >
      <td className="h-12 px-2 align-middle">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => ctx.onToggleStack(entry.slug)}
          aria-label={`Add ${entry.name} to the comparison`}
          className="size-4 cursor-pointer"
        />
      </td>

      <td className="h-12 max-w-[22rem] px-2 align-middle">
        <div className="flex min-w-0 flex-col gap-0.5">
          <a
            href={`https://runware.ai/models/${entry.slug}`}
            target="_blank"
            rel="noreferrer noopener"
            className="truncate text-sm font-medium text-foreground hover:underline"
          >
            {entry.name}
          </a>
          {entry.air && (
            <span className="flex min-w-0 items-center gap-1.5">
              <code className="truncate font-mono text-[11px] text-rw-neutral-30">
                {entry.air}
              </code>
              <CopyModelId air={entry.air} name={entry.name} />
            </span>
          )}
        </div>
      </td>

      <td className="h-12 px-2 align-middle">
        <span className="text-label text-muted-foreground">{entry.modality}</span>
      </td>

      <td className="h-12 max-w-[16rem] px-2 align-middle">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-[13px] text-muted-foreground">
            {entry.configuration}
          </span>
          {hiddenTiers > 0 && (
            <span className="font-mono text-[10px] text-rw-neutral-30">
              +{hiddenTiers} more {hiddenTiers === 1 ? "tier" : "tiers"}
            </span>
          )}
        </div>
      </td>

      {/* Price, in their own treatment: mono, with the fraction set quieter. */}
      <td className="h-12 px-2 align-middle">
        <div className="flex flex-col items-end gap-0.5 whitespace-nowrap">
          <span className="inline-flex items-baseline gap-1.5">
            {showSale && (
              <span
                data-numeric
                className="font-mono text-[13px] text-tabular-muted line-through"
              >
                {formatUSD(entry.listAmount!)}
              </span>
            )}
            <span data-numeric className="font-mono text-sm font-medium text-foreground">
              {price.whole}
              {price.fraction && (
                <span className="text-tabular-muted">.{price.fraction}</span>
              )}
            </span>
          </span>
          <span className="font-mono text-[10px] text-rw-neutral-30">
            / {entry.shownUnit}
            {showSale && entry.savePct != null && (
              <span className="ml-1.5 text-rw-yellow-base">save ~{entry.savePct}%</span>
            )}
          </span>
        </div>
      </td>

      {/* What it costs at the stated volume, with its assumption shown rather than hidden. */}
      <td className="h-12 px-2 align-middle">
        <div className="flex flex-col items-end gap-0.5 whitespace-nowrap">
          <span data-numeric className="font-mono text-sm font-medium text-primary">
            {cost.whole}
            {cost.fraction && <span className="opacity-70">.{cost.fraction}</span>}
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px] text-rw-neutral-30">
            {est.assumption ?? "exact"}
            {est.caveat && (
              <span title={est.caveat} className="text-rw-yellow-base">
                <Info aria-hidden className="size-3" />
                <span className="sr-only">{est.caveat}</span>
              </span>
            )}
          </span>
        </div>
      </td>

      <td className="h-12 px-2 align-middle">
        <span
          data-numeric
          className="block text-right font-mono text-[13px] text-muted-foreground"
        >
          {formatLatency(fastestLatency(entry))}
        </span>
      </td>

      <td className="h-12 px-2 align-middle">
        <a
          href="https://runware.ai/playground"
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Launch ${entry.name} in Playground`}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md border",
            "border-border px-2.5 text-[13px] font-medium text-muted-foreground",
            "transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary",
          )}
        >
          Playground
          <ArrowUpRight aria-hidden className="size-3.5" />
        </a>
      </td>
    </tr>
  );
}

export function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <p className="text-h4 text-foreground">No models match these filters</p>
      <p className="text-caption mx-auto mt-2 max-w-[48ch] text-muted-foreground">
        Try widening the price range, clearing a modality, or searching for a provider name
        such as <code className="font-mono text-foreground">bfl</code> or{" "}
        <code className="font-mono text-foreground">google</code>.
      </p>
    </div>
  );
}
