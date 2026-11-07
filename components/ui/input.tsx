import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      data-slot="input"
      className={cn(
        "h-11 min-w-0 rounded-md border border-input bg-input/30 px-3 text-sm",
        "text-foreground placeholder:text-rw-neutral-30 transition-colors outline-none",
        "hover:border-rw-neutral-50 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      data-slot="select"
      className={cn(
        "h-11 min-w-0 cursor-pointer appearance-none rounded-md border border-input",
        "bg-input/30 bg-no-repeat py-0 pl-3 pr-9 text-sm text-foreground transition-colors",
        "outline-none hover:border-rw-neutral-50",
        className,
      )}
      style={{
        // Drawn rather than borrowed: a chevron from the palette, not the platform's.
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239a9a9a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")",
        backgroundPosition: "right 0.65rem center",
      }}
      {...props}
    >
      {children}
    </select>
  );
}
