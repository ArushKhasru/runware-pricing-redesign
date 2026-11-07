/**
 * Deterministic screenshots for design review.
 *
 * Captures at native CSS pixel dimensions at DPR 1, with animations settled, so the
 * files can be measured against the breakpoints the design targets. Screenshots taken
 * through a scaled preview pane cannot be: they arrive downscaled and at the host's
 * device pixel ratio, which makes 11px labels and 1px hairlines unjudgeable.
 *
 * Usage: node scripts/capture-screens.mjs [baseUrl]
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../.impeccable/review");

/** name, viewport, and where to scroll before shooting (CSS pixels from document top). */
const SHOTS = [
  { name: "desktop", width: 1512, height: 950, scrollY: 0 },
  { name: "desktop-table", width: 1512, height: 950, scrollTo: "#rate-sheet", nudge: -260 },
  { name: "desktop-notes", width: 1512, height: 950, query: "?notes=true", scrollTo: "#rate-sheet", nudge: -260 },
  {
    name: "desktop-stack",
    width: 1512,
    height: 950,
    // Two rows ticked, so the sticky comparison bar is captured in its filled state.
    query: "?stack=bfl-flux-1-schnell,bfl-flux-2-klein-4b",
    scrollTo: "#rate-sheet",
    nudge: -260,
  },
  {
    name: "desktop-stack-top",
    width: 1512,
    height: 950,
    // Readout and filled bar in one frame, to prove the combined total has one owner.
    query: "?stack=bfl-flux-1-schnell,bfl-flux-2-klein-4b",
    scrollY: 0,
  },
  { name: "mobile", width: 375, height: 812, scrollY: 0 },
  { name: "mobile-cards", width: 375, height: 812, scrollTo: "#rate-sheet", nudge: -200 },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const results = [];

  for (const shot of SHOTS) {
    const context = await browser.newContext({
      viewport: { width: shot.width, height: shot.height },
      deviceScaleFactor: 1,
      // Settle motion rather than racing it: an element mid-animation reads as missing.
      reducedMotion: "reduce",
      colorScheme: "dark",
    });
    const page = await context.newPage();

    await page.goto(`${BASE}/${shot.query ?? ""}`, { waitUntil: "networkidle" });

    // The table and the card list are both in the DOM; CSS hides one per breakpoint.
    // Waiting on a selector would pick whichever comes first and block forever when
    // that is the hidden one, so wait for *either* to actually have layout boxes.
    await page.waitForFunction(
      () => {
        const sheet = document.querySelector("#rate-sheet");
        if (!sheet) return false;
        const laidOut = (el) => Boolean(el) && el.getClientRects().length > 0;
        return laidOut(sheet.querySelector("table")) || laidOut(sheet.querySelector("ul"));
      },
      undefined,
      { timeout: 20_000 },
    );
    await page.evaluate(() => document.fonts.ready);

    if (shot.scrollTo) {
      await page.evaluate(
        ([sel, nudge]) => {
          const el = document.querySelector(sel);
          const top = el ? el.getBoundingClientRect().top + window.scrollY : 0;
          window.scrollTo(0, Math.max(0, top + nudge));
        },
        [shot.scrollTo, shot.nudge ?? 0],
      );
    } else {
      await page.evaluate((y) => window.scrollTo(0, y), shot.scrollY ?? 0);
    }

    await page.waitForTimeout(400);

    const file = resolve(OUT, `${shot.name}.png`);
    await page.screenshot({ path: file, type: "png" });

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollY: Math.round(window.scrollY),
    }));

    results.push({ file: `${shot.name}.png`, size: `${shot.width}x${shot.height}`, ...metrics });
    await context.close();
  }

  await browser.close();
  console.table(results);
  console.log(`\nWrote ${results.length} captures to ${OUT}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
