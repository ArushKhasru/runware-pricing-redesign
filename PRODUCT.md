# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · TanStack Table v9 ·
`nuqs` for URL state · Vitest for unit tests · deployed on Vercel.

Not delegated — this stack was fixed by the brief this work answers, which requires
hands-on Next.js, Tailwind, shadcn and React and states explicitly that it is *not* a Framer
or Webflow project. Independently, it is also the stack Runware's own pricing page is built
on (see `docs/observations.md`), so matching it is faithful rather than imposed.

## Users

**Primary — the evaluating engineer.** A developer or technical founder partway through
choosing an AI inference provider. They have arrived at a pricing page carrying 416 rows
with one question: *what will this cost me at my volume, and is it cheaper than what I pay
today?* They are comparing two or three vendors in adjacent tabs, often on a second screen
or a phone, and they are time-boxed. They are not browsing a catalogue; they are trying to
close a decision.

**Secondary — the reviewer at Runware.** This artifact is a job-application deliverable, so
a hiring reviewer is a real audience. They will read the diff and the git history as closely
as the page, and they know the real page better than anyone. Anything inaccurate about their
own product costs more than a weak design would.

## Product Purpose

An unsolicited redesign concept of the **AI API pricing section** of runware.ai/pricing,
built as a job-application artifact for a Website Redesign Contractor contract.

Its job is to let the evaluating engineer answer the cost question **on the pricing page
itself**, without arithmetic and without leaving for the Playground. Success is a reviewer
who can see, in under a minute, that the person who built it understood their buyer's
problem, their stack, and their constraints.

## Positioning

Runware's page already contains the answer in prose. Their FAQ states the formula by hand —
*"Divide the tokens your request uses by 1,000,000, multiply by the model's per-1M rate, and
add the input and output parts together"* — and then works a numeric example. It also tells
the buyer to leave: *"Open the model in Playground. Playground estimates cost from your
selected parameters."*

This concept's position is narrow and defensible: **do the arithmetic the current page
describes.** It is not a reskin and does not argue their design is ugly. It argues that a
calculation documented in words should be performed by the interface.

## Operating Context

- The real page is the benchmark; it is live and the reviewer knows it intimately.
- Data is a **static local fixture** scraped from the public pricing page on 2026-11-07 by a
  committed, re-runnable script. 416 real rows. No placeholder data — staying fast at 416
  real rows is itself part of the demonstration.
- Deliverable is three artifacts, not one: a deployed URL, a public repo whose history and
  PRs are themselves part of the submission, and a 60–90s captioned, no-audio walkthrough.
- Scope is the AI API pricing section only — hero, filters, table, estimator. Desktop and
  mobile. Not the whole site. The GPU/Serverless compute table on the same page is out of
  scope.
- US-timezone overlap hours are available; the contract is 2 months.

## Capabilities and Constraints

**Confirmed functionality**, in the brief's priority order:

1. Sort and filter by price, including a range control.
2. An inline cost estimator pinned above the table — volume input, a live per-row monthly
   cost, and a sticky total.
3. A unit normaliser (per unit / per 1,000 outputs / per month at my volume).
4. ~~A "vs market rate" column~~ — **cut.** See *Constraints* below.
5. A mobile card layout below 768px with price as the largest element.
6. "Try in Playground" promoted to a visible row button.
7. URL-persisted filter/sort/search state, so a link is shareable.
8. A line above the table on free credits, plus the curl snippet.
9. ~~A trust strip~~ — **cut.** One already exists on their page.

**Constraints that cannot be traded away:**

- **No fabricated figures.** No conversion metrics, no engagement numbers, no A/B results.
  We have no access to Runware's analytics. Every improvement is framed as a *hypothesis
  with a stated way to measure it*, never a verdict.
- **The "vs market rate" column is cut.** The strikethrough on their page is Runware
  discounting *itself*, not a competitor baseline, and only 7 of 416 rows carry one. There is
  no market-rate source on the page, so the column would have required inventing one.
  Replaced by: making the 7 genuinely discounted tiers findable, and explaining the
  `Save ~N%` semantics inline instead of in a FAQ accordion.
- **No "Zero Data Retention" claim.** It appears nowhere on their page. The narrower, sourced
  claim may be quoted instead: *"Custom models and content you upload remain private and are
  not shared or used for training."*
- **Rows are not models.** 416 rows represent 300+ models; a model occupies several rows when
  it has several published tiers. Any count shown in the UI must say which it is counting.
- **LLM rows carry several prices at once** (input, output, cache read). A single blended
  number would misrepresent their billing, by their own explanation.
- **Clearly labelled as unaffiliated**, on the page and in the repo.

**Terminology** — use Runware's own: *rate sheet*, *tier*, *modality*, *configuration*,
*Playground*, *AIR / Model ID*, *pay-as-you-go*.

## Brand Commitments

Confirmed in this session: use Runware's exact colour tokens and their freely-licensed faces
(Figtree, JetBrains Mono), but **not their wordmark** and not `coxx`, their licensed heading
font. The concept should read as their product without placing their trademark on a page we
host. A neutral wordmark and a free heading face stand in.

Design posture is **stay in their skin** — match their palette, type and shadcn tokens so the
work reads as a pull request that could merge, not as a rebrand. Credibility over flair; the
UX changes do the talking.

## Evidence on Hand

- `docs/observations.md` — every claim about the live page, with the evidence for it, captured
  2026-11-07. Includes three corrections to assumptions that turned out to be wrong.
- Their full design token set, read from their own stylesheets: `--rw-*` palette, shadcn
  semantic tokens, a typographic scale, `--radius: 7px`.
- Measured mobile failure: 1088px table inside a 327px container at 375px viewport.
- Direct quotes from their pricing FAQ for every factual claim the concept makes.

**Absences future work must not fill in:** no analytics, no user research, no competitor
price data, no relationship with Runware, no knowledge of their roadmap or why the current
page is as it is.

## Product Principles

1. **Proof beats claims.** The brief stresses production execution; the artifact must be the
   argument. Real data, real performance, clean history.
2. **Do the arithmetic, don't describe it.** Every place the current page explains a
   calculation in prose is a place the interface should perform it.
3. **Accuracy about their product outranks ambition in ours.** The reviewer knows this
   product. One wrong claim costs more than one missing feature.
4. **Hypotheses, not verdicts.** We say what we expect to improve and how we would measure
   it. We never report a result we did not observe.
5. **Respect the incumbent.** This is a focused argument about one section, not a referendum
   on their taste.

## Accessibility & Inclusion

Keyboard-operable table controls, visible focus states, 44px minimum touch targets,
`aria-live` on result counts, and `prefers-reduced-motion` respected.

One specific, learned-the-hard-way requirement: **the announced result count must derive from
the actual filtered row array**, not a parallel count. A previous project shipped a real
accessibility bug by computing an announced count from the wrong array, and a test should pin
this.
