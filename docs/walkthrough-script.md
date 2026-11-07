# Walkthrough recording script

**Target: 75 seconds. No audio. Burned-in captions. One take if possible.**

Same pattern as the `atlas-dispatch` recording: silent screen capture, short caption
cards, no cursor flourishes, no zooming. The captions carry the argument; the screen
proves it.

## Before you hit record

- [ ] Run the **production** build, not dev: `npm run build && npx next start -p 3000`
      (the dev overlay badge is disabled, but production is what you are showing).
- [ ] Browser window at **1512 × 950**, zoom 100%, dark OS theme.
- [ ] Hide bookmarks bar and any extension icons. Use a clean profile if quicker.
- [ ] Open a second tab on the real <https://runware.ai/pricing> — you need it for beat 1.
- [ ] Clear the URL of any query params: start at `http://localhost:3000/`.
- [ ] Have a phone-width window ready (375px) or use responsive mode at exactly 375.

Record at 1512×950 and export at 1512×950 or 1280×800. Keep the file under ~8MB so it
attaches to a Contra message.

---

## Beat 1 — the problem, on their real page (0:00–0:14)

**Screen:** the live runware.ai/pricing tab. Scroll to the rate sheet. Open the sort
dropdown so both options are visible, then close it. Scroll one page of the table.

**Captions:**
- `0:00` — "Runware's pricing page. 416 models."
- `0:05` — "Sort offers release date, or biggest savings."
- `0:09` — "There is no way to sort by price."

> Keep this short and completely neutral. No red circles, no "❌". The point lands on
> its own and you are applying for a job with these people.

## Beat 2 — the hidden half of the bill (0:14–0:26)

**Screen:** still on their page. Find a TEXT row — search is easiest, or scroll to
`Kimi K3.1 Pro`. Point at the `$2.00 / 1M tokens` input price. Click the row expander.
Let the revealed `Output tokens $10.00` sit on screen for a full two seconds.

**Captions:**
- `0:14` — "An LLM row shows $2.00 per 1M tokens."
- `0:19` — "That is the input rate."
- `0:22` — "Output is $10.00, behind the expander. You pay both."

> This is the strongest beat in the video. Do not rush it.

## Beat 3 — the concept, first impression (0:26–0:38)

**Screen:** cut to `localhost:3000`. Let the first viewport sit still for two seconds
before touching anything — estimator, filters, table header, first rows.

**Captions:**
- `0:26` — "The same 416 rates, re-thought."
- `0:31` — "One page. No pagination. Sorted by what it costs you."

## Beat 4 — the estimator doing the work (0:38–0:52)

**Screen:** click the `100,000` volume preset. Let every row's **Your cost / mo** column
update. Then switch **Rank by** from *Per month* to *Unit price* and back, so the sheet
visibly reorders.

**Captions:**
- `0:38` — "Set your volume. Every row reprices."
- `0:44` — "Twelve different billing units, compared on one scale."
- `0:48` — "Their FAQ explains this arithmetic. This does it."

## Beat 5 — the LLM fix, closing the loop (0:52–1:02)

**Screen:** filter to **TEXT**. Pick an LLM row and point at **Your cost / mo**. Change
the **Output** tokens assumption from `4000` to something larger and let the figure move.

**Captions:**
- `0:52` — "For LLMs, input and output are priced separately."
- `0:57` — "The rate their table hides is in this number."

## Beat 6 — mobile (1:02–1:12)

**Screen:** switch to 375px width. Scroll the card list a little.

**Captions:**
- `1:02` — "At 375px their table is 1088px wide in a 327px container."
- `1:07` — "Here the price is the biggest thing on the card."

## Beat 7 — the close (1:12–1:18)

**Screen:** back to desktop. Click **Show notes** so the numbered markers appear, then
select two models so the sticky comparison bar slides in. End on that frame.

**Captions:**
- `1:12` — "Every change is annotated with what was observed."
- `1:15` — "Unaffiliated concept. All prices are Runware's own."

---

## Caption style

Match `atlas-dispatch`: bottom-left, ~28px, white on a 70%-opacity near-black plate,
2–3 second holds, no animation beyond a hard cut. Sentence case, full stops.

## What not to do

- No music, no voiceover, no stock transitions.
- Do not say or imply any conversion result — there is no analytics access, and a claimed
  uplift is the fastest way to lose credibility with the people who own the real numbers.
- Do not caption anything as a mistake, a failure, or a redesign of "bad" work. The frame
  throughout is *here is a thing their own FAQ says, done in the interface*.
- Do not show the Runware wordmark in the concept frames.
