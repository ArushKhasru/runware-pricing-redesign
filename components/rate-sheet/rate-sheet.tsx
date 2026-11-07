"use client";

import { useCallback, useMemo } from "react";
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EstimatorBar } from "./estimator-bar";
import { FilterBar } from "./filter-bar";
import { RateTable, type RowContext } from "./rate-table";
import { RateCards } from "./rate-cards";
import { StackBar } from "./stack-bar";
import { NotesPanel } from "./annotations";
import { Announcer } from "./announcer";
import {
  applyFilters,
  modalityFacets,
  priceBounds,
  type FilterState,
  type SortKey,
} from "@/lib/pricing/filter";
import {
  DEFAULT_ASSUMPTIONS,
  type Assumptions,
  type NormaliseMode,
} from "@/lib/pricing/estimate";
import type { RateSheetEntry } from "@/lib/pricing/types";
import { cn } from "@/lib/utils";

const SORT_KEYS = [
  "price-asc",
  "price-desc",
  "latency-asc",
  "released-desc",
  "savings-desc",
  "name-asc",
] as const satisfies readonly SortKey[];

const MODE_KEYS = ["unit", "per-1k", "monthly"] as const satisfies readonly NormaliseMode[];

/**
 * Every piece of state lives in the URL, so a filtered, normalised, volume-specific view
 * is a link someone can paste to a colleague. On the live page none of this survives a
 * reload, which makes "the cheapest video model for our volume" impossible to send.
 */
const PARAMS = {
  q: parseAsString.withDefault(""),
  mod: parseAsArrayOf(parseAsString).withDefault([]),
  sort: parseAsStringLiteral(SORT_KEYS).withDefault("price-asc"),
  mode: parseAsStringLiteral(MODE_KEYS).withDefault("monthly"),
  vol: parseAsInteger.withDefault(10_000),
  min: parseAsFloat,
  max: parseAsFloat,
  sale: parseAsBoolean.withDefault(false),
  stack: parseAsArrayOf(parseAsString).withDefault([]),
  notes: parseAsBoolean.withDefault(false),
  sec: parseAsFloat.withDefault(DEFAULT_ASSUMPTIONS.videoSeconds),
  tin: parseAsInteger.withDefault(DEFAULT_ASSUMPTIONS.inputTokens),
  tout: parseAsInteger.withDefault(DEFAULT_ASSUMPTIONS.outputTokens),
  cache: parseAsFloat.withDefault(DEFAULT_ASSUMPTIONS.cacheHitRate),
};

export function RateSheet({ entries }: { entries: RateSheetEntry[] }) {
  const [params, setParams] = useQueryStates(PARAMS, {
    history: "replace",
    shallow: true,
    clearOnDefault: true,
    throttleMs: 250,
  });

  const assumptions = useMemo<Assumptions>(
    () => ({
      ...DEFAULT_ASSUMPTIONS,
      videoSeconds: params.sec,
      inputTokens: params.tin,
      outputTokens: params.tout,
      cacheHitRate: params.cache,
    }),
    [params.sec, params.tin, params.tout, params.cache],
  );

  const filters = useMemo<FilterState>(
    () => ({
      search: params.q,
      modalities: params.mod,
      minPrice: params.min,
      maxPrice: params.max,
      onSaleOnly: params.sale,
      sort: params.sort,
      mode: params.mode,
      volume: params.vol,
    }),
    [params.q, params.mod, params.min, params.max, params.sale, params.sort, params.mode, params.vol],
  );

  // The single source of truth for what is on screen — and therefore for what is announced.
  const rows = useMemo(
    () => applyFilters(entries, filters, assumptions),
    [entries, filters, assumptions],
  );

  const facets = useMemo(() => modalityFacets(entries), [entries]);

  const bounds = useMemo(
    () => priceBounds(rows, params.mode, params.vol, assumptions),
    [rows, params.mode, params.vol, assumptions],
  );


  /** Only show an assumption control if rows in view actually depend on it. */
  const needs = useMemo(() => {
    let seconds = false;
    let tokens = false;
    for (const entry of rows) {
      if (entry.shownUnit === "second") seconds = true;
      if (entry.rates.some((r) => r.dimension === "token")) tokens = true;
      if (seconds && tokens) break;
    }
    return { seconds, tokens };
  }, [rows]);

  const stackEntries = useMemo(
    () => params.stack.map((slug) => entries.find((e) => e.slug === slug)).filter(Boolean) as RateSheetEntry[],
    [params.stack, entries],
  );


  const toggleStack = useCallback(
    (slug: string) => {
      setParams((prev) => ({
        stack: prev.stack.includes(slug)
          ? prev.stack.filter((s) => s !== slug)
          : [...prev.stack, slug],
      }));
    },
    [setParams],
  );

  const ctx = useMemo<RowContext>(
    () => ({
      mode: params.mode,
      volume: params.vol,
      assumptions,
      stack: params.stack,
      onToggleStack: toggleStack,
      notes: params.notes,
    }),
    [params.mode, params.vol, assumptions, params.stack, toggleStack, params.notes],
  );

  return (
    <>
      <Announcer />
      <div className="flex flex-col gap-6">
        <EstimatorBar
          volume={params.vol}
          onVolume={(vol) => setParams({ vol })}
          mode={params.mode}
          onMode={(mode) => setParams({ mode })}
          assumptions={assumptions}
          onAssumptions={(patch) =>
            setParams({
              ...(patch.videoSeconds !== undefined ? { sec: patch.videoSeconds } : {}),
              ...(patch.inputTokens !== undefined ? { tin: patch.inputTokens } : {}),
              ...(patch.outputTokens !== undefined ? { tout: patch.outputTokens } : {}),
              ...(patch.cacheHitRate !== undefined ? { cache: patch.cacheHitRate } : {}),
            })
          }
          spread={bounds}
          resultCount={rows.length}
          stackCount={stackEntries.length}
          needs={needs}
          notes={params.notes}
        />

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <FilterBar
              search={params.q}
              onSearch={(q) => setParams({ q })}
              modalities={params.mod}
              onModalities={(mod) => setParams({ mod })}
              facets={facets}
              sort={params.sort}
              onSort={(sort) => setParams({ sort })}
              onSaleOnly={params.sale}
              onOnSaleOnly={(sale) => setParams({ sale })}
              minPrice={params.min}
              maxPrice={params.max}
              onPriceRange={(min, max) => setParams({ min, max })}
              mode={params.mode}
              resultCount={rows.length}
              totalCount={entries.length}
              onReset={() =>
                setParams({ q: "", mod: [], min: null, max: null, sale: false })
              }
              notes={params.notes}
            />
          </div>

          <Button
            variant={params.notes ? "subtle" : "default"}
            size="touch"
            aria-pressed={params.notes}
            onClick={() => setParams({ notes: !params.notes })}
            className="shrink-0 gap-2"
          >
            {params.notes ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
            <span className="hidden sm:inline">
              {params.notes ? "Hide notes" : "Show notes"}
            </span>
          </Button>
        </div>

        {/*
          While the comparison bar is pinned it would otherwise cover the last row at
          rest, so the sheet reserves its height instead of overlapping content.
        */}
        <div
          id="rate-sheet"
          className={cn("scroll-mt-6", stackEntries.length > 0 && "pb-28 sm:pb-24")}
        >
          <RateTable rows={rows} ctx={ctx} />
          <RateCards rows={rows} ctx={ctx} />
        </div>
      </div>

      <StackBar
        entries={stackEntries}
        volume={params.vol}
        assumptions={assumptions}
        onRemove={toggleStack}
        onClear={() => setParams({ stack: [] })}
      />

      <NotesPanel active={params.notes} />
    </>
  );
}
