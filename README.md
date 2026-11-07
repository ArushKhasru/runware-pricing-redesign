# Runware pricing — a redesign concept

An unsolicited redesign of the **AI API pricing section** of
[runware.ai/pricing](https://runware.ai/pricing), built from the 416 rates published on
the live page.

> **Not affiliated with Runware.** This is a speculative concept, not commissioned or
> endorsed. It uses Runware's public prices and their published colour tokens, but not
> their wordmark and not `coxx`, their licensed heading typeface. The deployed page is
> `noindex` so it can never compete with their own pricing page in search.

**Live:** <https://runware-pricing-redesign.vercel.app> · **Stack:** Next.js 16 · TypeScript · Tailwind v4 · shadcn
conventions · `nuqs` · Vitest

---

## The one-sentence argument

Runware's pricing FAQ explains, in prose, how to work out what a request costs — and then
tells you to go somewhere else to do it:

> "Divide the tokens your request uses by 1,000,000, multiply by the model's per-1M rate,
> and add the input and output parts together."

> "How do I get the exact cost for my request?" — "Open the model in Playground."

This concept does that arithmetic where the prices are. It is not a reskin, and it does
not argue their page is ugly.

---

## What I found

Captured 7 November 2026 against the live page. Every claim below has its evidence in
[`docs/observations.md`](docs/observations.md).

**1. There is no price sort.** The sort control offers *Release date* and *Biggest
savings*. A company whose entire positioning is price does not let you sort its rate sheet
by price.

**2. The visible LLM price is the cheaper half of the bill.** This is the big one. All
**62** token-priced rows promote the *input* rate into the visible column. Kimi K3.1 Pro
shows `$2.00/1M`; behind the row expander sit `Output tokens $10.00/1M` — five times
higher — and `Cached input $0.20/1M`. A real request pays both, so sorting that column for
a TEXT model ranks by a number nobody is billed. A test pins this.

**3. Twelve units share one column.** Rates arrive per second, per image, per megapixel,
per character, per step, per 1M tokens and more. Ranking those against each other is not a
meaningful operation. Runware's own page gives up on it in two places: `nano-banana-2-lite`
is an IMAGE model billed in tokens whose visible row falls back to *"Example: 1K image
output — $0.033603/image"*, and 11 models are billed on two dimensions at once.

**4. Measured latency already exists and is never shown.** 365 of 416 rows carry Runware's
own `latencyMs` per configuration in the page payload. Speed decides as many purchases as
price, and none of it reaches the rendered table.

**5. On mobile the price is not on screen.** At 375px the live table measures **1088px
inside a 327px container**. Only the model name is visible, with no affordance suggesting
anything else exists.

**6. The activation step is an unlabelled icon.** The ACTIONS cell holds two icon-only
buttons, so the column reads as empty. One copies the AIR model id — the exact string you
paste into the `model` field of an API call.

**7. Volume is captured for sales, not answered for the buyer.** The page has a
`<select name="generationsPerDay">` running from *"Less than 1,000"* to *"500,000+"* — but
it lives inside the contact-sales form, beside `company` and `jobTitle`. The page asks what
your volume is in order to talk to you, and never tells you what that volume would cost.

**8. Nine pages of 50.** Browsing 416 rows cannot answer "what is the cheapest model for my
job".

### Three things I expected and got wrong

Worth stating, because they changed the brief:

- **The strikethrough is not a competitor comparison.** It is Runware discounting itself —
  their FAQ: *"it reflects an active Runware sale on that tier"* — on 7 of 416 rows. A
  planned "vs market rate" column was **cut** for this reason: there is no market baseline
  anywhere on the page, so the column would have meant inventing competitor prices.
- **A trust strip already exists** (ISO 27001, SOC 2, GDPR, data residency, SSO + SAML,
  MFA), so adding one was dropped as duplicated work.
- **"Zero Data Retention" appears nowhere** on their page and is not claimed here. The
  narrower sourced claim is: *"Custom models and content you upload remain private and are
  not shared or used for training."*

---

## What changed

| Change | Why |
|---|---|
| Sort and filter by price, with a range control | #1 |
| Cost estimator pinned above the table, with a per-row **Your cost / mo** column | #7, and the FAQ's hand-worked formula |
| Ranking control: per month · per 1,000 · unit price | #3 — changing it genuinely reorders the sheet |
| LLM requests priced across input, output and cache separately | #2 — the hidden rate finally counts |
| **Speed** column from their own measured latency | #4 |
| Cards below 768px with the price as the largest element | #5 |
| Model ID as visible, searchable text with a copy affordance | #6 |
| Visible "Try in Playground" on every row | activation |
| All 416 rows, unpaginated, filtered | #8 |
| Every state in the URL | a filtered view becomes a link you can send |
| `$2 free credits` line and a real curl snippet | sourced from their FAQ and docs |
| Toggleable design notes | the reasoning, without permanent furniture |

### Decisions worth defending

**The total is a comparison basket, not a sum of the sheet.** A sticky total over all 416
filtered rows would be meaningless — nobody buys every model. Instead you select the two or
three you would actually run, and the bar totals those, labelled with the assumption it
rests on.

**The headline figure is the spread, not a single price.** At rest the estimator reads
`$6.00 – $130,000 per month at 10,000`, computed across whatever is in view. A single
"cheapest" number would just restate the first row; the spread duplicates nothing and says
the actual thing: what you pay is a function of your volume *and* your choice. It becomes
your basket total the moment you tick a row.

**Every assumption is on screen and adjustable.** Only per-image-style units are exact. A
per-second rate needs a clip length; a token rate needs a request shape. Each estimate
shows its assumption or the word `exact`, and the defaults are Runware's own worked example
(32k input / 4k output). Where a model publishes no output rate, the row says the figure
understates a real request.

**Each column does one job.** *List price* is always Runware's published rate in their own
unit, so the page never misquotes them. *Your cost / mo* is always the computed monthly
figure. The ranking control changes only what the sort and range filter compare — it never
rewrites what a column means.

**No table library.** Sorting is unit-aware (the order changes with the unit, the volume and
the assumptions) and URL-persisted, so it lives in tested pure functions in `lib/pricing`.
TanStack Table was installed, used, and then removed: it would have contributed cell
renderers while adding a second home for sort state. A dependency doing nothing is worse
than no dependency.

---

## Accessibility

Fixed during the build, each found by measuring rather than assuming:

- Text contrast raised off a ramp step that measured **3.27:1** — the page's worst is now
  **6.19:1** against the 4.5:1 floor.
- A per-row copy button produced **833 aria-live regions**. One shared announcer replaced
  them; the page now has **2**.
- Touch targets at 375px: everything interactive is ≥44px except one inline link inside
  prose.
- The announced result count is `rows.length` of the array that is rendered. There is
  deliberately **no separate count function** that could drift from what is on screen, and
  tests assert it across eight filter combinations.
- Keyboard: the ranking control is a real radio group, the skip link reaches the sheet, and
  focus is never removed — one ring, themed from the palette.
- `prefers-reduced-motion` neutralises the single authored animation.

## Performance

416 rows render unpaginated. Filter + sort over the whole sheet measures **0.41ms** (mean
of 200 runs, `npm run bench`). Normalised values are cached per row rather than recomputed
inside the sort comparator, which would have run the estimator ~3,700 times per sort.

## What I'd measure

No conversion claims are made anywhere in this repo or on the page — there is no access to
Runware's analytics, so each change is a hypothesis with a way to test it:

| Hypothesis | Metric |
|---|---|
| Doing the arithmetic on-page moves more buyers to activation | Share of pricing sessions reaching Playground, before/after |
| The estimator is used, not decorative | Share of sessions changing volume or an assumption; distribution of volumes entered |
| Price sort is the missing primitive | Share of sessions that sort or filter by price at all |
| Mobile buyers currently never see a price | Scroll depth past the table and Playground rate on <768px, split from desktop |
| Hiding the output rate costs trust with LLM buyers | Playground rate for TEXT models specifically |
| Shareable URLs matter in a team decision | Inbound sessions carrying filter parameters |

The honest version of this section: I would want a week of baseline before changing
anything, and I would expect #1 and #4 to move most.

---

## Running it

```bash
npm install
npm run dev
```

```bash
npm test          # 68 unit tests
npm run bench     # filter/sort timing over 416 rows
npm run scrape    # re-scrape the live rate sheet into data/rate-sheet.json
```

### The data

`data/rate-sheet.json` is real, scraped by [`scripts/scrape-pricing.mjs`](scripts/scrape-pricing.mjs)
from the public pricing page. No placeholder rows — staying fast at 416 real ones is part
of the demonstration.

The scraper joins two sources because neither is sufficient alone. The RSC payload carries
typed amounts and **every** tier, including the output-token rates hidden behind the row
expander; the rendered table carries which tier is promoted and whether a sale is active,
because sale prices are applied at render and never appear in the payload. It handles both
of Runware's pricing shapes (`pricingRates`, 320 models; `pricingMeasured`, 96) and throws
on an unmapped unit rather than passing it through — which is how `gigabyteSecond` was
caught instead of being silently normalised into a wrong number.

### Tests

68 tests, in three groups that earn their place:

- **Estimator maths** — checked against Runware's own worked example. Their FAQ computes a
  32k-in/4k-out request at `$0.0068`; so do we. If our arithmetic disagrees with theirs,
  ours is wrong.
- **Filter and sort** over the real 416 rows, including that changing the unit genuinely
  reorders the sheet (otherwise the feature is inert) and that announced counts match
  rendered rows.
- **Fixture integrity** — unit conversions, sale consistency, and the finding in #2, so a
  re-scrape that changes it fails loudly instead of quietly making the README wrong.

## Repository

```
app/                 route, layout, inherited tokens
components/
  rate-sheet/        estimator, filters, table, cards, sticky comparison, notes
  ui/                primitives in shadcn's idiom
lib/pricing/         estimate · filter · format · types · load
scripts/             scraper, benchmark
test/                estimator, filter, fixture integrity
docs/observations.md every claim, with its evidence
PRODUCT.md           product truth and constraints
```

---

Built by [Arush Khasru](https://arushkhasru.me) · [GitHub](https://github.com/ArushKhasru)
