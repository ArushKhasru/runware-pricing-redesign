"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToggleOption<T extends string> {
  value: T;
  label: string;
  /** Optional longer description, announced to assistive tech. */
  hint?: string;
}

/**
 * A segmented control built on native radio semantics.
 *
 * Arrow keys move between options and change the value — the behaviour a radio group
 * already has, rather than a div listening for clicks. The visible selection is drawn on
 * the label, so the real input stays focusable and the focus ring lands where it should.
 */
export function ToggleGroup<T extends string>({
  name,
  value,
  options,
  onChange,
  label,
  className,
}: {
  name: string;
  value: T;
  options: readonly ToggleOption<T>[];
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="sr-only">{label}</legend>
      <div
        role="radiogroup"
        aria-label={label}
        className="inline-flex rounded-md border border-border bg-input/30 p-0.5"
      >
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={cn(
                "relative flex h-11 cursor-pointer items-center justify-center rounded-[5px] sm:h-10",
                "px-3 text-[13px] font-medium whitespace-nowrap transition-colors",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2",
                "has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                selected
                  ? "bg-secondary text-foreground"
                  : "text-rw-neutral-30 hover:text-foreground",
              )}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
                aria-describedby={option.hint ? `${id}-hint` : undefined}
              />
              {option.label}
              {option.hint && (
                <span id={`${id}-hint`} className="sr-only">
                  {option.hint}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
