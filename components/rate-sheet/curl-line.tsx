"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { announce } from "./announcer";

/**
 * The starting snippet, kept to one scrollable line.
 *
 * It was a six-line block, which pushed the rate sheet entirely below the fold — the
 * instrument this page exists for was not visible until you scrolled. A single line
 * carries the same information and gives the table back its first viewport.
 */
export function CurlLine({ snippet }: { snippet: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      announce("Request snippet copied to clipboard");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      announce("Copying was blocked by the browser.");
    }
  }

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border border-border/60 bg-background pl-3">
      {/*
        The snippet cuts mid-token at this width. A hard cut reads as broken markup, so
        the overflowing edge fades out, which reads as "there is more, scroll it".
      */}
      <code
        className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-2.5 font-mono text-[12px] text-muted-foreground"
        style={{
          maskImage: "linear-gradient(to right, #000 calc(100% - 2.5rem), transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, #000 calc(100% - 2.5rem), transparent)",
        }}
      >
        {snippet}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy the request snippet"
        className="mr-1 inline-flex size-9 shrink-0 items-center justify-center rounded text-rw-neutral-30 transition-colors hover:bg-muted hover:text-foreground"
      >
        {copied ? (
          <Check aria-hidden className="size-3.5 text-primary" />
        ) : (
          <Copy aria-hidden className="size-3.5" />
        )}
      </button>
    </div>
  );
}
