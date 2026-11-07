# Observations — runware.ai/pricing

Captured **2026-11-07** against the live page. Everything below was verified by reading
the served HTML or the rendered DOM, not inferred. Quotes are Runware's own words from
their pricing-page FAQ.

> This is an unsolicited redesign concept. It is not affiliated with, commissioned by, or
> endorsed by Runware. No private data was used — only the public pricing page.

## How the page is built

| Fact | Evidence |
|---|---|
| Next.js App Router, RSC | `self.__next_f.push` × 73 in served HTML |
| Tailwind v4 | `bg-input/30`, `size-7`, `rounded-[min(var(--radius-md),12px)]` |
| shadcn/ui + Radix | `data-slot="table-row"`, `data-slot="select-trigger"`, `data-slot="tooltip-trigger"` |
| lucide icons | `class="lucide lucide-chevron-right"` |
| Fonts | `figtree` (sans), `jetbrainsmono` (mono), `coxx` (headings, licensed) |
| Pagination is URL-driven | clicking Next → `?page=2`, and that URL is server-rendered |

Matching this stack is therefore faithful to their codebase, not an imposition.

## Scale of the table

- **416 rows** across **9 pages** at 50/page (8 × 50 + 16 = 416 — confirmed by counting
  `data-slot="table-row"` per page).
- Rows are **not** models. Their FAQ: *"This page lists models with published pay-as-you-go
  rates in the Runware content API (currently 300+)."* A model can occupy several rows
  because it has several published tiers.
- Each row has an expander: `aria-label="See all pricing tiers for <model>"`, so there is a
  third level of pricing data below the 416 rows.
- The registry itself is far larger: *"The Runware registry supports 400K+ models overall."*

## Confirmed problems

1. **No price sort.** The sort control offers only *Release date* and *Biggest savings*.
   There is no price ascending/descending and no price-range filter — on the pricing page of
   a company whose positioning is being the cheapest.

2. **Price is invisible on mobile.** At a 375px viewport the table measures 1088px wide
   inside a 327px container (`scrollWidth` vs `clientWidth`). Columns are MODEL, MODALITY,
   CONFIGURATION, PRICE, ACTIONS — only MODEL is visible, and there is no scroll affordance
   indicating the rest exists.

3. **No cost estimator where cost is evaluated.** Their FAQ answers *"How do I get the exact
   cost for my request?"* with: *"Open the model in Playground. Playground estimates cost
   from your selected parameters."* The buyer is told to leave the pricing page to learn
   what pricing means for them.

4. **Unit comparison is left to the reader.** Their own FAQ lists the units: *"images per
   image, video per generated clip, LLMs per 1M input/output/cache tokens, audio per request,
   and 3D per generation task"* — plus per-second rates for some video tiers. Sorting a
   single PRICE column across those units is not a meaningful operation.

5. **LLM rows carry several prices at once.** *"LLM billing separates input tokens, output
   tokens, and cache reads. These are different billing dimensions, so collapsed rows show
   each published rate instead of a single blended number."* A single-value PRICE column
   cannot represent this, and does not.

6. **The arithmetic is documented in prose instead of being done for you.** The FAQ spells
   out the formula by hand: *"Divide the tokens your request uses by 1,000,000, multiply by
   the model's per-1M rate, and add the input and output parts together."* It then works a
   numeric example. This is a calculator described in words.

7. **Playground is the activation step and it is an unlabelled icon.** Each row's ACTIONS
   cell holds two icon-only buttons (`aria-label="Copy Model ID for …"`,
   launch-in-Playground). At a glance the column reads as empty.

8. **Volume is captured for sales, not answered for the buyer.** The page has a
   `<select name="generationsPerDay">` with bands from *"Less than 1,000"* to *"500,000+"* —
   but it lives inside the contact-sales form (alongside firstName, company, jobTitle). The
   page asks you to self-report your volume in order to talk to someone, and never tells you
   what that volume would cost.

## Corrections to earlier assumptions

Three things I expected to find were wrong, and the record should say so:

- **The strikethrough is not a competitor comparison.** It is Runware discounting itself.
  Their FAQ: *"When shown, it reflects an active Runware sale on that tier. You will see the
  original price struck through, the discounted price, and Save ~N% next to it."* Only
  **7 of 416** rows carry one. There is therefore no market-rate baseline anywhere on the
  page to build a "vs market" column from.
- **A trust strip already exists** on the pricing page: ISO 27001, SOC 2, GDPR, Data
  residency, SSO + SAML, MFA. Adding one would be duplicating their work.
- **"Zero Data Retention" appears nowhere** on the page and must not be claimed. What *is*
  supported is narrower and should be quoted as such: *"Custom models and content you upload
  remain private and are not shared or used for training."*

## Facts safe to state in the concept

Sourced, so the rebuild never has to invent a number:

- *"New users who sign up with a business email receive $2 in free credits."*
- *"You are only charged for successful API requests that generate outputs."*
- *"High-usage customers can contact sales for custom pricing."* — so every figure we show is
  a list price, and the UI should say so.
- 300+ models with published rates; 400K+ in the registry.

## What is deliberately not claimed

No conversion metrics, no engagement figures, no A/B results. We have no access to Runware's
analytics, so every improvement here is a **hypothesis with a stated way to measure it**, not
a verdict. See the "What I'd measure" section of the README.
