"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { announce } from "./announcer";

/**
 * The live page hides the model id behind an unlabelled icon button. Here the id is
 * visible text and this only copies it, so the button is a convenience rather than the
 * sole route to the value.
 *
 * Success is announced through the sheet's single shared live region, not a per-row one.
 * The icon is 20px to sit on the id's baseline, but a pseudo-element extends the hit
 * area past 44px so the small glyph is not a small target.
 */
export function CopyModelId({ air, name }: { air: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(air);
      setCopied(true);
      announce(`${air} copied to clipboard`);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard denied (insecure context or refused permission). The id is on screen,
      // so there is nothing to recover from and nothing to apologise for.
      announce("Copying was blocked by the browser. The model ID is shown next to this button.");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy model ID for ${name}`}
      className={
        "relative inline-flex size-5 shrink-0 items-center justify-center rounded " +
        "text-rw-neutral-30 transition-colors hover:text-foreground " +
        "after:absolute after:-inset-3 after:content-['']"
      }
    >
      {copied ? (
        <Check aria-hidden className="size-3 text-primary" />
      ) : (
        <Copy aria-hidden className="size-3" />
      )}
    </button>
  );
}
