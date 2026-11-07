---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: []
---

Scope: the AI API pricing section of a runware.ai/pricing redesign concept — hero, estimator,
filters, 416-row rate sheet. Desktop and mobile. GPU/Serverless table out of scope.

Visitor mode: Persuade. The visitor decides and acts; the rate-sheet region itself is held to
Operate discipline (scanability, tabular alignment, state clarity) because that is where the
work happens.

Audience: an engineer mid-evaluation, two vendor tabs open, time-boxed, asking "what does this
cost me at my volume?" Secondary: a Runware reviewer who knows the real page intimately.

Action: compute a credible monthly cost, then launch Playground or copy the curl.

Proof: 416 real scraped rows, their own FAQ wording, their own token set. No invented metrics.

Constraints: inherited visual world (their palette, Figtree/JetBrains Mono, no wordmark, no
`coxx`); no fabricated figures; rows ≠ models; LLM rows carry several prices; labelled
unaffiliated.

## Direction contract

THESIS: This surface owns one idea — *the price you will actually pay is computed here, not
described.* It refuses the category-default rate sheet: a paginated table that sorts by
release date and leaves the arithmetic, the unit conversion and the volume maths to the
reader.

OWN-WORLD: The incumbent Runware system, inherited unchanged. #1a1a1a ground, #1c1c1c raised
cards, #454545 hairline rules, 7px radius, no shadows. Figtree 15/1.7 for prose; JetBrains
Mono tabular-nums for every figure without exception; 11px uppercase mono eyebrows at .075em.
Restrained colour: the full surface is neutral greys, and the one green (#afff9f) is spent
only on the computed total and the primary row action — never decoration. Recognizable with
all content removed by its mono figure columns and single green accent against near-black.

STORY: The visitor understands that cost here is a function of their own volume, not a table
cell. They believe the cheapness claim because they tested it with their own number rather
than reading it. They act by launching Playground on a specific model.

FIRST VIEWPORT: An h1 left-aligned at display scale carrying its own weight — no eyebrow or
kicker above it — with the unaffiliated label as quiet mono beside it. Directly beneath, the
estimator as one pinned instrument row:
volume input, unit-normaliser toggle, and the live monthly total set in green mono at the
largest figure size on the page. Filter row below it (search, modality, price range, sort).
Then the rate sheet, ~8 rows visible, PRICE and YOUR COST right-aligned in mono, each row
carrying a visible "Try in Playground". Primary action is per-row; the aggregate total stays
pinned as the visitor filters.

FORM: Chosen form — *computed rate sheet*: a fixed estimator instrument above a dense table
whose every row answers in the visitor's own unit. First of six considered, ahead of a split
calculator panel, per-row expandable calculators, a volume-first wizard, a comparison cart,
and modality tabs; it wins because it changes every row at once without adding a step.
seed: none (unavailable)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, DESIGN.md, and every shipping raster carrying its provenance

Unresolved: heading face substitute for `coxx` (pending — Figtree tight-tracked is the
fallback); whether the annotation overlay ships enabled on first load.
