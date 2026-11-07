"use client";

import { useId } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Marker } from "./annotations";
import { SORT_LABELS, type SortKey } from "@/lib/pricing/filter";
import { formatCount } from "@/lib/pricing/format";
import type { NormaliseMode } from "@/lib/pricing/estimate";

const SORTS: SortKey[] = [
  "price-asc",
  "price-desc",
  "latency-asc",
  "released-desc",
  "savings-desc",
  "name-asc",
];

/** The range filter and the sort both work on whatever basis the ranking control chose. */
const UNIT_WORD: Record<NormaliseMode, string> = {
  unit: "unit price",
  "per-1k": "per 1,000",
  monthly: "per month",
};

export function FilterBar({
  search,
  onSearch,
  modalities,
  onModalities,
  facets,
  sort,
  onSort,
  onSaleOnly,
  onOnSaleOnly,
  minPrice,
  maxPrice,
  onPriceRange,
  mode,
  resultCount,
  totalCount,
  onReset,
  notes,
}: {
  search: string;
  onSearch: (v: string) => void;
  modalities: string[];
  onModalities: (v: string[]) => void;
  facets: { modality: string; count: number }[];
  sort: SortKey;
  onSort: (v: SortKey) => void;
  onSaleOnly: boolean;
  onOnSaleOnly: (v: boolean) => void;
  minPrice: number | null;
  maxPrice: number | null;
  onPriceRange: (min: number | null, max: number | null) => void;
  mode: NormaliseMode;
  resultCount: number;
  totalCount: number;
  onReset: () => void;
  notes: boolean;
}) {
  const searchId = useId();
  const minId = useId();
  const maxId = useId();

  const toggleModality = (modality: string) => {
    onModalities(
      modalities.includes(modality)
        ? modalities.filter((m) => m !== modality)
        : [...modalities, modality],
    );
  };

  const filtered =
    Boolean(search) ||
    modalities.length > 0 ||
    onSaleOnly ||
    minPrice != null ||
    maxPrice != null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        {/* Search */}
        <div className="relative min-w-0 flex-1">
          <label htmlFor={searchId} className="sr-only">
            Search models by name, provider or model ID
          </label>
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-rw-neutral-30"
          />
          <Input
            id={searchId}
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search 416 models by name, provider or model ID"
            className="w-full pl-9"
          />
        </div>

        {/* Price range, in whatever unit is selected */}
        <fieldset className="flex shrink-0 items-center gap-2">
          <legend className="sr-only">Price range, {UNIT_WORD[mode]}</legend>
          <span className="text-label whitespace-nowrap text-muted-foreground">
            Price
            <Marker id={1} active={notes} />
          </span>
          <label htmlFor={minId} className="sr-only">
            Minimum price {UNIT_WORD[mode]}
          </label>
          <Input
            id={minId}
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            placeholder="min"
            value={minPrice ?? ""}
            onChange={(e) =>
              onPriceRange(e.target.value === "" ? null : Number(e.target.value), maxPrice)
            }
            className="w-[6.5rem] font-mono text-[13px]"
          />
          <span aria-hidden className="text-rw-neutral-30">
            –
          </span>
          <label htmlFor={maxId} className="sr-only">
            Maximum price {UNIT_WORD[mode]}
          </label>
          <Input
            id={maxId}
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            placeholder="max"
            value={maxPrice ?? ""}
            onChange={(e) =>
              onPriceRange(minPrice, e.target.value === "" ? null : Number(e.target.value))
            }
            className="w-[6.5rem] font-mono text-[13px]"
          />
        </fieldset>

        {/* Sort */}
        <label className="flex shrink-0 items-center gap-2">
          <span className="text-label whitespace-nowrap text-muted-foreground">Sort</span>
          <Select value={sort} onChange={(e) => onSort(e.target.value as SortKey)}>
            {SORTS.map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </Select>
        </label>
      </div>

      {/* Modality facets and the sale filter */}
      <div className="flex flex-wrap items-center gap-2">
        {facets.map(({ modality, count }) => {
          const active = modalities.includes(modality);
          return (
            <button
              key={modality}
              type="button"
              onClick={() => toggleModality(modality)}
              aria-pressed={active}
              className={
                "text-label flex h-9 items-center gap-1.5 rounded-md border px-3 transition-colors " +
                (active
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-rw-neutral-50 hover:text-foreground")
              }
            >
              {modality}
              <span className="font-mono text-[10px] tabular-nums opacity-60">{count}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onOnSaleOnly(!onSaleOnly)}
          aria-pressed={onSaleOnly}
          className={
            "text-label flex h-9 items-center gap-1.5 rounded-md border px-3 transition-colors " +
            (onSaleOnly
              ? "border-rw-yellow-base/50 bg-rw-yellow-base/10 text-rw-yellow-base"
              : "border-border text-muted-foreground hover:border-rw-neutral-50 hover:text-foreground")
          }
        >
          On sale
          <span className="font-mono text-[10px] tabular-nums opacity-60">7</span>
          <Marker id={8} active={notes} />
        </button>

        {filtered && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-9 gap-1.5">
            <X aria-hidden />
            Clear filters
          </Button>
        )}
      </div>

      {/* Result count. Derived from the rendered rows, never counted separately. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p aria-live="polite" className="text-caption text-muted-foreground">
          <span data-numeric className="font-mono text-foreground">
            {formatCount(resultCount)}
          </span>{" "}
          {resultCount === 1 ? "model" : "models"}
          {resultCount !== totalCount && <> of {formatCount(totalCount)}</>}
          {resultCount === 0 && <> — nothing matches these filters</>}
        </p>
        {resultCount > 0 && (
          /* The spread itself is the estimator's headline figure; this only says the basis. */
          <p className="text-caption text-rw-neutral-30">ranked by {UNIT_WORD[mode]}</p>
        )}
      </div>
    </div>
  );
}
