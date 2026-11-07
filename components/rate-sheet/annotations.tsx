"use client";

import { cn } from "@/lib/utils";

/**
 * The reasoning layer. Every note points at something verified on the live page and
 * recorded in docs/observations.md — no note asserts a result we did not observe.
 *
 * Off by default: the page should stand as a product first, and be explainable second.
 */
export interface Note {
  id: number;
  title: string;
  body: string;
}

export const NOTES: readonly Note[] = [
  {
    id: 1,
    title: "There is no price sort",
    body:
      "The live page's sort control offers only Release date and Biggest savings. A company " +
      "whose entire positioning is price does not let you sort its rate sheet by price.",
  },
  {
    id: 2,
    title: "The arithmetic was documented, not performed",
    body:
      "Their FAQ answers “How do I get the exact cost for my request?” with “Open the " +
      "model in Playground.” It also spells out the token formula by hand and works a " +
      "numeric example. This control does that calculation where the prices are.",
  },
  {
    id: 3,
    title: "Twelve units cannot share one column",
    body:
      "Rates arrive per second, per image, per megapixel, per character, per step, per 1M " +
      "tokens and more. Ranking those against each other is not a meaningful operation " +
      "until they are expressed in common terms, so the unit is a control, not a label.",
  },
  {
    id: 4,
    title: "The visible LLM price is the cheaper half",
    body:
      "For every one of the 62 token-priced rows, the price shown is the input rate. The " +
      "output rate — $10.00 against $2.00 for Kimi K3.1 Pro — sits behind the row " +
      "expander. A real request pays both, so both are in this estimate.",
  },
  {
    id: 5,
    title: "Measured speed was already in the payload",
    body:
      "365 of the 416 rows carry Runware's own measured latency per configuration. None of " +
      "it appears in the rendered table, though speed decides as many purchases as price.",
  },
  {
    id: 6,
    title: "The model ID was behind an icon",
    body:
      "The live ACTIONS column holds two unlabelled icon buttons, so the cell reads as " +
      "empty. One of them copies the AIR model id — the string you actually paste into " +
      "code. It is text, so it is shown as text and is searchable.",
  },
  {
    id: 7,
    title: "On mobile the price was not on screen",
    body:
      "At a 375px viewport the live table measures 1088px inside a 327px container. Only " +
      "the model name is visible, with no affordance suggesting anything else exists. " +
      "Below 768px this becomes cards with the price as the largest element.",
  },
  {
    id: 8,
    title: "Save ~N% is Runware discounting itself",
    body:
      "It is not a competitor comparison. Their FAQ: “it reflects an active Runware sale " +
      "on that tier.” Seven of 416 rows have one. A planned “vs market rate” column was " +
      "cut for exactly this reason — there is no market baseline on the page to use.",
  },
  {
    id: 9,
    title: "Nine pages became one list",
    body:
      "The live sheet paginates 416 rows across 9 pages of 50, which makes “the cheapest " +
      "model for my job” unanswerable by browsing. All 416 are here at once, filtered.",
  },
];

export const NOTES_BY_ID = new Map(NOTES.map((n) => [n.id, n]));

/**
 * An inline marker. Rendered as a real button so it is reachable by keyboard and
 * announced with the note it refers to, rather than as a decorative superscript.
 */
export function Marker({
  id,
  active,
  className,
}: {
  id: number;
  active: boolean;
  className?: string;
}) {
  if (!active) return null;
  const note = NOTES_BY_ID.get(id);
  if (!note) return null;

  return (
    <a
      href={`#note-${id}`}
      aria-label={`Note ${id}: ${note.title}`}
      className={cn(
        "ml-1.5 inline-flex size-[18px] shrink-0 translate-y-[-1px] items-center justify-center",
        "rounded-full border border-primary/40 bg-primary/10 font-mono text-[10px]",
        "font-medium text-primary tabular-nums transition-colors hover:bg-primary/25",
        className,
      )}
    >
      {id}
    </a>
  );
}

/** The list of notes, rendered below the sheet when annotations are on. */
export function NotesPanel({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <section
      aria-label="Design notes"
      className="mt-16 border-t border-border/60 pt-10"
    >
      <h2 className="text-h4 text-foreground">
        What changed, and what was observed to justify it
      </h2>
      <p className="mt-2 max-w-[68ch] text-caption text-muted-foreground">
        Each note points at something measured on the live page on 7 November 2026. None of
        them claims a conversion result — there is no access to Runware&apos;s analytics, so
        these are hypotheses with a stated way to measure them, not verdicts.
      </p>

      <ol className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2">
        {NOTES.map((note) => (
          <li key={note.id} id={`note-${note.id}`} className="flex gap-3 scroll-mt-24">
            <span
              aria-hidden
              className="mt-0.5 inline-flex size-[22px] shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-mono text-[11px] font-medium text-primary tabular-nums"
            >
              {note.id}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-foreground">{note.title}</h3>
              <p className="mt-1 text-caption text-muted-foreground">{note.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
