---
name: Runware Rate Sheet (Unaffiliated Redesign Concept)
description: An inherited near-black instrument panel where every figure is mono and the one green marks a computed answer.
colors:
  background: "#1a1a1a"
  foreground: "#f2f2f2"
  card: "#1c1c1c"
  card-foreground: "#ebebeb"
  primary: "#afff9f"
  primary-foreground: "#1c1c1c"
  green-mid: "#90f77c"
  green-deep: "#345c2d"
  yellow-base: "#ffff7d"
  secondary: "#292929"
  secondary-foreground: "#ebebeb"
  muted: "#292929"
  muted-foreground: "#d9d9d9"
  tabular-muted: "#9a9a9a"
  icon-muted: "#9a9a9a"
  border: "#454545"
  input: "#2e2e2e"
  ring: "#afff9f"
  neutral-30: "#9a9a9a"
  neutral-40: "#6b6b6b"
  neutral-50: "#585858"
  neutral-60: "#444444"
  neutral-70: "#393939"
  neutral-100: "#1b1b1b"
typography:
  display:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.4rem + 3vw, 3.5rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
  caption:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0.075em"
  figure:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "14px"
    fontWeight: 500
    fontFeature: "tnum 1"
  figure-readout:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "2.25rem"
    fontWeight: 500
    lineHeight: 1
    fontFeature: "tnum 1"
rounded:
  sm: "4px"
  md: "7px"
  lg: "10px"
  pill: "999px"
spacing:
  hair: "2px"
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  "2xl": "24px"
  "3xl": "32px"
  section: "64px"
components:
  button-default:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "32px"
  button-default-hover:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "{colors.green-mid}"
    textColor: "{colors.primary-foreground}"
  button-subtle:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "32px"
  button-touch:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  action-accent-outline:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "0 10px"
    height: "32px"
  action-accent-outline-hover:
    backgroundColor: "{colors.green-deep}"
    textColor: "{colors.primary}"
  input-field:
    backgroundColor: "{colors.input}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "44px"
  chip-facet:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "36px"
  chip-facet-active:
    backgroundColor: "{colors.green-deep}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
  card-surface:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: Runware Rate Sheet (Unaffiliated Redesign Concept)

## Overview

> **What this document is, and what it is not.** It describes the visual world as shipped,
> derived from the code and the captures rather than from intentions. The build passed a
> design finish review at `ship`, but that verdict had stated limits and this file does not
> widen them. Reviewed: the eight scored fixes, three regressions, and the desktop, mobile
> and filled-comparison-bar compositions. **Not reviewed, and therefore unverified rather
> than approved:** the annotation overlay (`?notes=true`) in its state after three rounds
> of layout change, and every interactive state a static capture cannot carry — hover,
> focus, loading, the empty result set, and overlong content. Anyone extending this system
> should treat those as open.

**Creative North Star: "The Inherited Instrument"**

This world was not invented. Every colour, radius and semantic token below was read off
Runware's own shipped stylesheets on 2026-11-07 and carried over unchanged, so that the
work reads as a pull request that could merge rather than a rebrand. Two substitutions are
recorded as substitutions, not as choices: their heading face `coxx` (a grotesque with a
variable `GAPS` axis) is licensed, so **Figtree — their own sans — carries headings at
weight 500 with tight tracking**; and their **wordmark is not used at all**. Anyone
extending this system should treat the palette and the scale as borrowed property: faithful
inheritance outranks improvement, and the inherited oddities are not bugs to fix.

On top of that borrowed skin sits one original move: the surface behaves like an
instrument, not a catalogue. A near-black ground (#1a1a1a) holds a single raised card
(#1c1c1c) for the estimator, hairline rules (#454545) for everything else, and no shadows
anywhere. Every number on the page — idle or computed, 10px or 36px — is JetBrains Mono
with tabular figures, so columns of 416 rows never drift and no figure reflows as it ticks.
The dial at the top is the only element set at display scale in mono, and it is green.

Colour is rationed. The surface is overwhelmingly neutral grey, and the green (#afff9f) is
spent on exactly two things: the **computed answer** and the **primary row action**. A
second inherited hue, the brand yellow (#ffff7d), appears only as a sourced-caveat and
sale signal — the direction contract described a single-accent world, and the shipped build
is a two-signal world; the build is the record. Nothing else is coloured. Density is high
and deliberate: 48px table rows, 11px mono column headers, a 1440px measure wide enough for
eight columns of figures without the digits pulling apart.

**Key Characteristics:**
- Inherited near-black ground with one raised card tone and hairline rules — no shadows at all
- Every numeral in JetBrains Mono with `tabular-nums`, without exception
- One green, spent only on computed answers, primary row actions, and selection state
- 11px uppercase mono at 0.075em as the universal label and column-header voice
- Type scale keyed to semantic role rather than size order, inherited verbatim
- Browser chrome (selection, caret, `accent-color`, scrollbars, focus ring) themed from the palette

## Colors

Near-black greys carrying a single high-chroma green, with one yellow held in reserve for
caveats; all values are Runware's own ramp.

### Primary
- **Signal Green** (`{colors.primary}`): The computed answer and the primary action. It
  appears on the estimator readout, the comparison-basket total and each basket chip's
  figure; on the "Try in Playground" row action as a tinted outline; on selection state
  (ticked rows, active facets, pressed volume presets) and on the focus ring. Nowhere else.
- **Green Mid** (`{colors.green-mid}`): Hover state of a filled green button, and the
  transient colour of the `settle` keyframe as a figure changes.
- **Green Deep** (`{colors.green-deep}`): The tinted ground behind an active chip or row —
  effectively green at ~10% over the background.

### Secondary
- **Caveat Yellow** (`{colors.yellow-base}`): The sourced-exception signal only — a
  `save ~N%` sale badge (7 of 416 rows), the "On sale" filter when active, and the small
  info glyph that discloses an estimate caveat. It is never used for emphasis or decoration.

### Neutral
- **Ground** (`{colors.background}`): The page. Every surface sits on it.
- **Raised Card** (`{colors.card}`): The single elevated tone — estimator panel, mobile
  rate cards, the pinned comparison bar. One step, never stacked.
- **Field Ground** (`{colors.input}`): Inputs, selects and the segmented control, applied
  at 30% so the field reads as a recess rather than a block.
- **Hairline** (`{colors.border}`): Every rule, divider, field stroke and card edge. Table
  row dividers run it at 50%, secondary dividers at 60%.
- **Prose Grey** (`{colors.muted-foreground}`): Body copy, captions and secondary cells.
- **Tabular Grey** (`{colors.tabular-muted}` / `{colors.neutral-30}`): The decimal fraction
  of a figure, column headers, unit suffixes, model IDs and icon buttons at rest. This is
  the quietest colour that still carries text.
- **Text Foreground** (`{colors.foreground}`): Headings, model names, and every row figure
  in the List price and Your cost columns.

### Named Rules

**The Answer-Only Green Rule.** Green marks a computed answer or a primary action, never a
data cell. Per-row cost figures are set in the foreground grey: a column of 416 identical
green values makes green a column colour instead of the mark of an answer. Selection keeps
green because selection is state, matching the browser `accent-color`.

**The Tinted-Not-Filled Rule.** The per-row primary action is a green outline on a
transparent ground with a 10% tint on hover — never a solid fill. 416 filled green bars
would spend the accent on furniture and drown the figure above them.

**The 40-Is-Not-Text Rule.** `{colors.neutral-40}` is a ramp step, not a text colour: it
measures 3.27:1 on the ground. The quietest permitted text colour is
`{colors.tabular-muted}`. Worst measured text contrast on the shipped surface is 6.19:1,
with zero elements below the WCAG AA floor for their size.

> The rule has teeth because it was broken. Documentation of this build found three places
> still carrying `neutral-40` as text — a separator, an `aria-hidden` placeholder, and
> `+N tiers`, which is genuinely informative — introduced *after* the 6.19:1 figure was
> first measured, which made that published figure briefly untrue. All three were moved to
> `{colors.tabular-muted}` and the measurement re-run. The lesson is that a contrast number
> is only true as of its last measurement: re-measure after any change that adds text.

## Typography

**Display Font:** Figtree (with `ui-sans-serif`, `system-ui`, sans-serif) — a substitute for
Runware's licensed `coxx`, used at weight 500 with tight tracking rather than importing an
unrelated display face into their identity.
**Body Font:** Figtree, 15px/1.7.
**Label/Mono Font:** JetBrains Mono (with `ui-monospace`, monospace).

**Character:** A geometric humanist sans doing all the talking and a monospace doing all the
counting. The pairing is utilitarian rather than expressive: the sans is tracked tight and
weighted medium so headings carry without a display face, and the mono's tabular figures
give the page its recognisable silhouette — right-aligned columns of digits that hold their
grid as values change.

### Hierarchy
- **Display** (500, `clamp(2.25rem, 1.4rem + 3vw, 3.5rem)`, line-height 1, -0.03em,
  balanced wrap): The page h1 only, left-aligned, carrying its own weight with nothing
  above it.
- **Headline** (500, 1.875rem/1.15, -0.015em): Section headings. In the inherited scale this
  role sits *above* the next one in size and *below* it in semantic rank — the scale is keyed
  to role, not to size order. Inheriting it faithfully means not correcting that.
- **Title** (500, 1.125rem/1.2, -0.01em): Panel and empty-state headings.
- **Body** (400, 15px/1.7): Prose, held to a 62–68ch measure.
- **Caption** (400, 13px/1.45): Secondary prose, sublabels, assumption fields.
- **Label** (400, 11px/1.1, 0.075em, uppercase, mono): The column-header and field-label
  voice. Every table header, every control label, every definition term.
- **Figure** (500, 14px mono, `tabular-nums`): Every number in a row.
- **Figure Readout** (500, 2.25rem mono, line-height 1, `tabular-nums`): The estimator's
  answer. Secondary readouts step down to 1.875rem (the idle spread), 2rem (mobile card
  cost) and 1.75rem (the pinned basket total).

### Named Rules

**The Every-Figure-Is-Mono Rule.** Every numeral on the surface is JetBrains Mono with
`font-variant-numeric: tabular-nums` and `font-feature-settings: "tnum" 1` — idle and
filled, 10px footnote and 36px readout alike. Enforced globally on `.font-mono` and
`[data-numeric]`. There is no exception.

**The Quiet-Fraction Rule.** A currency figure splits: the whole part in the foreground, the
decimal fraction in `{colors.tabular-muted}`. The eye lands on the magnitude; the cents stay
legible without competing.

**The No-Kicker Rule.** No eyebrow, kicker or label sits above a heading. The 11px mono
label voice is for column headers and field labels — things that name a control or a column
— never for decorating a headline.

## Layout

A single centred column capped at 1440px (`--sheet-max`), with 16px gutters rising to 24px
at 640px. The page runs top to bottom as one argument: header, provenance line, estimator
instrument, filters, sheet, footer.

**Rhythm.** Spacing is a 4px-based scale used sparsely — 6/8/12/16/20/24/32 inside
components, 24px between the estimator, filters and sheet, 28px from the filters to the
sheet, and 64px before the footer and the notes panel. Internal card padding is 16px rising
to 20px at 640px.

**Breakpoints.** 640px (`sm`) relaxes gutters and lets control groups go horizontal; 768px
(`md`) is the structural switch between the table and the card list; 1024px (`lg`) puts the
header, the getting-started line and the estimator into their side-by-side arrangement.

**First viewport.** The h1 takes the full measure with the unaffiliated label as quiet mono
to its right, rather than leaving the hero's right half empty; the estimator card follows
immediately, then the filter row, then the sheet header and first rows in frame.

**Density.** Table rows are a fixed 48px with 8px horizontal cell padding. The model cell is
capped at 22rem and the configuration cell at 16rem, both truncating, so the right-hand
figure columns never shift position between rows.

**The mobile layout inverts nothing.** Below 768px each row becomes a card whose largest
element is the *computed* cost (2rem mono); the list price is demoted beside it as
provenance for that number. Reproducing the rate sheet's own hierarchy — published unit
rate largest — would undo the point of the page.

**The pinned comparison bar** sticks to the bottom at 10px radius over a 95% card
background with a light backdrop blur, and the sheet reserves its height (112px, 96px at
640px) rather than overlapping the last row.

## Elevation & Depth

**This system has no shadows.** Not one `box-shadow` is declared anywhere in the build.
Depth is tonal and linear: the ground is #1a1a1a, a raised surface is #1c1c1c — a two-point
lift that reads as a plane change without a gradient — and everything is separated by a
1px hairline at #454545, run at 50–60% opacity where a divider should be quieter than a
container edge. Fields recess by taking the input tone at 30% rather than by lifting.

The only exception to flatness is the pinned comparison bar, which uses a light
`backdrop-filter` blur over a 95%-opaque card so the rows scrolling beneath it stay
legible as motion rather than as clutter.

### Named Rules

**The No-Shadow Rule.** There are no shadows in this world, at rest or on hover. If an
element needs to separate from what is behind it, give it the card tone and a hairline, not
a drop shadow. A hard offset shadow would be foreign to this skin entirely.

**The One-Step Rule.** There is exactly one raised tone. Surfaces do not stack: a card
inside a card gets a hairline and the ground, never a third tone.

## Shapes

Softly squared corners throughout, at Runware's own scale: 7px (`{rounded.md}`) is the
default for every control — buttons, inputs, selects, chips, the segmented control, the
curl line; 10px (`{rounded.lg}`) for containers — the estimator panel, mobile cards, the
pinned bar, the empty state; 4px (`{rounded.sm}`) for small inline affordances and the focus
ring's own corner; fully round only for the two circular annotation markers.

Borders are the structural material. Nearly every element in this world is defined by a 1px
stroke rather than by a fill: cards, fields, chips and the primary row action are all
outlines on the ground. The empty state keeps the same 10px container shape but switches its
stroke to dashed — the one place the border style changes.

Icons are inline SVG at 12–16px, stroked at 2px to match the hairline weight, carried in the
icon grey. There are no icon fonts and no glyph characters standing in for icons.

### Named Rules

**The Stroke-Over-Fill Rule.** Define an element with a 1px hairline before you define it
with a fill. The only filled controls in this world are the segmented control's selected
segment and the single solid-green button variant.

## Components

### Buttons
- **Shape:** Softly squared (7px) with a 1px stroke on every variant, including the
  borderless ones, so heights never shift between variants.
- **Sizes:** 28px (`sm`), 32px (default), 44px (`touch`, used wherever a control is primary
  on mobile), plus 32px and 44px square icon sizes.
- **Default:** Ground fill, hairline stroke, foreground text; hovers to the muted tone.
- **Primary (solid green):** `{colors.primary}` on `{colors.primary-foreground}` at weight
  600, hovering to `{colors.green-mid}`. Rare — reserved for the skip link and anything
  that must be unmissable. The per-row action does **not** use it.
- **Accent outline (the row action):** Transparent ground, green text, a 40%-opacity green
  stroke tightening to 70% and taking a 10% green tint on hover. This is the shape the
  primary action takes 416 times.
- **Subtle / Ghost:** Secondary tone or nothing at rest, muted tone on hover.
- **Focus:** Never a custom treatment — the global 2px `{colors.ring}` outline at 2px offset.

### Chips
- **Modality facets:** 36px tall, 11px uppercase mono, hairline stroke, muted text; on
  hover the stroke lightens to `{colors.neutral-50}` and the text goes foreground. Each
  carries its count in 10px mono at 60% opacity.
- **Selected:** 50% green stroke over a 10% green ground, green text, `aria-pressed`.
- **Sale variant:** the same shape in Caveat Yellow, the only chip that is not grey or green.
- **Volume presets:** the same language at 44px on mobile, dropping to 28px from 640px, in
  11px mono.

### Cards / Containers
- **Corner Style:** 10px.
- **Background:** The one raised tone (`{colors.card}`), or 95% of it with a backdrop blur
  for the pinned bar.
- **Shadow Strategy:** None. See Elevation & Depth.
- **Border:** 1px hairline; internal dividers at 60% opacity.
- **Internal Padding:** 16px, rising to 20px from 640px. A selected card takes a 40% green
  stroke and a 6%-green ground.

### Inputs / Fields
- **Style:** 44px tall, 7px radius, 1px `{colors.input}` stroke over that tone at 30%, 12px
  horizontal padding, 14px text with placeholders in `{colors.neutral-30}`. Compact
  assumption fields drop to 32px and 13px.
- **Numeric fields are mono.** Any input that holds a number takes the mono face, so the
  value the visitor types is set in the same face as the figure it produces.
- **Select:** the same field, with its chevron drawn as an inline SVG data-URI in the icon
  grey rather than left to the platform.
- **Focus:** The global ring only; the native outline is never removed.
- **Segmented control:** a 7px hairline tray at 2px padding holding 5px-radius segments; the
  selected segment takes the secondary fill and foreground text, the rest sit in
  `{colors.neutral-30}`. Built on native radios, so the focus ring lands on the real input.

### Navigation
This surface ships no site navigation. Its only global control is a skip link, hidden until
focused, which then appears fixed at top-left as the solid-green primary button.

### The Estimator Readout (signature component)
The instrument's dial, and the one place the system permits display-scale mono. It sits in
the estimator card's right-hand third, separated by a vertical hairline at 1024px and a
horizontal one below that. An 11px mono label names what is being shown; beneath it the
figure in green mono at 2.25rem (basket total) or 1.875rem (idle spread, with its en-dash
separator in a quieter grey); beneath that a 13px caption naming the basis — how many
models, at what volume.

The readout always carries a figure: idle, it shows the cheapest-to-dearest spread across
the filtered set at the visitor's volume, which is true of the whole set and duplicates no
row. The moment anything is ticked for comparison it becomes the basket total.

**Motion.** There is exactly one authored motion moment in this world: the `settle`
keyframe, 420ms on `cubic-bezier(0.16, 1, 0.3, 1)`, applied to a computed figure when its
value changes. It eases from 55% opacity and -0.12em in Green Mid to a settled green — an
ease-out from an already-visible default, so nothing animates in from nothing and no value
is unreadable mid-transition. A global `prefers-reduced-motion` rule neutralises it along
with every other animation and transition.

### Row figures (signature pattern)
Each row's List price and Your cost cells are a right-aligned stack: the figure in 14px mono
with its fraction quieted, and beneath it a 10px mono sublabel. The sublabel appears only
when it has something to say — a unit, a disclosed assumption, a sale percentage. A constant
string under every row is noise and is not rendered.

## Do's and Don'ts

### Do:
- **Do** treat the palette, the 7px radius scale and the semantic token names as inherited
  property read from Runware's shipped stylesheets on 2026-11-07, not as original work.
- **Do** set every numeral in JetBrains Mono with `tabular-nums`, at every size, in every
  state.
- **Do** spend green only on a computed answer, a primary action, or selection state.
- **Do** render the per-row primary action as a tinted green outline, never a solid fill.
- **Do** keep the quietest text at `{colors.tabular-muted}` (#9a9a9a) and hold new text to
  the measured 6.19:1 floor.
- **Do** give every interactive control a 44px minimum touch target, except links inside
  running prose.
- **Do** give a column exactly one job: a list price is always the published rate in its own
  unit; a computed cost is always the computed cost. A ranking control chooses what is
  compared, never what a column means.
- **Do** render an absent value as an em dash, and never echo the data's own placeholder
  string ("Default") as if it were content.
- **Do** theme the browser's own surfaces — selection, caret, `accent-color`, scrollbars —
  from this palette.
- **Do** keep the focus ring visible everywhere: 2px `{colors.ring}` at 2px offset, with a
  4px corner.

### Don't:
- **Don't** add a shadow. This world has none, and a hard offset shadow would be foreign to
  it entirely.
- **Don't** colour a per-row data figure green. Green on 416 rows becomes a column colour and
  stops meaning "answer".
- **Don't** "correct" the inherited type scale because a smaller size carries a higher
  semantic rank. The scale is keyed to role, and faithfulness is the point.
- **Don't** use `{colors.neutral-40}` (#6b6b6b) for text; it measures 3.27:1.
- **Don't** place an eyebrow, kicker or mono label above a heading. The h1 carries itself.
- **Don't** use Runware's wordmark, or their licensed `coxx` heading face, anywhere.
- **Don't** introduce a third accent hue. Green answers, yellow flags a sourced exception,
  everything else is grey.
- **Don't** stack a third surface tone. One raised tone, then hairlines.
- **Don't** use glyph characters or an icon font in place of an icon; icons are inline SVG
  at 12–16px with a 2px stroke.
- **Don't** add a second animation. One authored motion moment, reduced-motion safe.
- **Don't** attach a live region per row. One shared announcer serves the whole sheet; the
  shipped page has exactly two.
