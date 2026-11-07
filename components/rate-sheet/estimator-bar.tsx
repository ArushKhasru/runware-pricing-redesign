"use client";

import { useId } from "react";
import { Input, Select } from "@/components/ui/input";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { Marker } from "./annotations";
import { formatCount, formatUSD } from "@/lib/pricing/format";
import type { Assumptions, NormaliseMode } from "@/lib/pricing/estimate";
import type { RateSheetEntry } from "@/lib/pricing/types";

const MODES = [
  {
    value: "monthly" as const,
    label: "Per month",
    hint: "Rank by what each model costs at your stated monthly volume",
  },
  {
    value: "per-1k" as const,
    label: "Per 1,000",
    hint: "Rank by the cost of one thousand generations",
  },
  {
    value: "unit" as const,
    label: "Unit price",
    hint:
      "Rank by the published rate as listed. Units differ between models, so this is the " +
      "ordering the live rate sheet gives you",
  },
] satisfies readonly { value: NormaliseMode; label: string; hint: string }[];

/** Runware's own volume bands, taken from the contact-sales field on their pricing page. */
const VOLUME_PRESETS = [1_000, 10_000, 50_000, 100_000, 500_000];

export function EstimatorBar({
  volume,
  onVolume,
  mode,
  onMode,
  assumptions,
  onAssumptions,
  cheapest,
  needs,
  notes,
}: {
  volume: number;
  onVolume: (v: number) => void;
  mode: NormaliseMode;
  onMode: (m: NormaliseMode) => void;
  assumptions: Assumptions;
  onAssumptions: (patch: Partial<Assumptions>) => void;
  cheapest: { entry: RateSheetEntry; monthly: number } | null;
  /** Which assumption controls are relevant to the rows currently in view. */
  needs: { seconds: boolean; tokens: boolean };
  notes: boolean;
}) {
  const volumeId = useId();

  return (
    <section
      aria-label="Cost estimator"
      className="rounded-lg border border-border bg-card"
    >
      <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        {/* The inputs */}
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          <div className="min-w-0">
            <label htmlFor={volumeId} className="text-label block text-muted-foreground">
              Generations per month
              <Marker id={2} active={notes} />
            </label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                id={volumeId}
                type="number"
                inputMode="numeric"
                min={0}
                step={1000}
                value={volume}
                onChange={(e) => onVolume(Math.max(0, Number(e.target.value) || 0))}
                className="w-[9.5rem] font-mono"
                aria-describedby={`${volumeId}-help`}
              />
            </div>
            <p id={`${volumeId}-help`} className="sr-only">
              Per model. Changing this updates every price in the table.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {VOLUME_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onVolume(preset)}
                  aria-pressed={volume === preset}
                  className={
                    "h-11 rounded border px-3 font-mono text-[11px] tabular-nums transition-colors sm:h-7 sm:px-2 " +
                    (volume === preset
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border text-rw-neutral-30 hover:border-rw-neutral-50 hover:text-foreground")
                  }
                >
                  {formatCount(preset)}
                </button>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <span className="text-label block text-muted-foreground">
              Rank by
              <Marker id={3} active={notes} />
            </span>
            <ToggleGroup
              name="mode"
              className="mt-2"
              label="What the price ranking and range filter compare"
              value={mode}
              options={MODES}
              onChange={onMode}
            />
          </div>
        </div>

        {/* The output, adjacent to the inputs that produce it */}
        <div className="min-w-0 border-t border-border/60 pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <span className="text-label block text-muted-foreground">
            Cheapest in view, per month
          </span>
          {cheapest ? (
            <>
              <p
                key={cheapest.monthly}
                data-numeric
                className="animate-tick mt-1.5 font-mono text-[2.25rem] leading-none font-medium text-primary"
              >
                {formatUSD(cheapest.monthly)}
              </p>
              <p className="mt-1.5 truncate text-caption text-muted-foreground">
                {cheapest.entry.name}
                <span className="text-rw-neutral-30">
                  {" · "}
                  {formatCount(volume)} × {cheapest.entry.configuration}
                </span>
              </p>
            </>
          ) : (
            <p className="mt-1.5 font-mono text-[2.25rem] leading-none font-medium text-rw-neutral-30">
              —
            </p>
          )}
        </div>
      </div>

      {/* Assumptions, stated rather than hidden */}
      {(needs.seconds || needs.tokens) && (
        <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:gap-5 sm:px-5">
          <span className="text-label shrink-0 text-rw-neutral-30">Assuming</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            {needs.seconds && (
              <AssumptionField
                label="Clip length"
                suffix="sec"
                value={assumptions.videoSeconds}
                min={1}
                step={1}
                onChange={(v) => onAssumptions({ videoSeconds: v })}
              />
            )}
            {needs.tokens && (
              <>
                <AssumptionField
                  label="Input"
                  suffix="tokens"
                  value={assumptions.inputTokens}
                  min={0}
                  step={1000}
                  onChange={(v) => onAssumptions({ inputTokens: v })}
                />
                <AssumptionField
                  label="Output"
                  suffix="tokens"
                  value={assumptions.outputTokens}
                  min={0}
                  step={500}
                  onChange={(v) => onAssumptions({ outputTokens: v })}
                  markerId={4}
                  notes={notes}
                />
                <label className="flex items-center gap-2">
                  <span className="text-caption text-muted-foreground">Cache hits</span>
                  <Select
                    value={String(assumptions.cacheHitRate)}
                    onChange={(e) => onAssumptions({ cacheHitRate: Number(e.target.value) })}
                    className="h-8 py-0 text-[13px]"
                    aria-label="Share of input tokens served from cache"
                  >
                    {[0, 0.25, 0.5, 0.75, 0.9].map((v) => (
                      <option key={v} value={v}>
                        {Math.round(v * 100)}%
                      </option>
                    ))}
                  </Select>
                </label>
              </>
            )}
          </div>
          <p className="text-caption text-rw-neutral-30 sm:ml-auto">
            Defaults are Runware&apos;s own worked example
          </p>
        </div>
      )}
    </section>
  );
}

function AssumptionField({
  label,
  suffix,
  value,
  min,
  step,
  onChange,
  markerId,
  notes,
}: {
  label: string;
  suffix: string;
  value: number;
  min: number;
  step: number;
  onChange: (v: number) => void;
  markerId?: number;
  notes?: boolean;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex items-center gap-2">
      <span className="text-caption whitespace-nowrap text-muted-foreground">
        {label}
        {markerId && <Marker id={markerId} active={Boolean(notes)} />}
      </span>
      <span className="flex items-center gap-1.5">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          className="h-8 w-[5.5rem] px-2 font-mono text-[13px]"
        />
        <span className="text-caption whitespace-nowrap text-rw-neutral-30">{suffix}</span>
      </span>
    </label>
  );
}
