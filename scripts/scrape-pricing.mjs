/**
 * Scrapes the public AI-model rate sheet from runware.ai/pricing into a local fixture.
 *
 * Why two sources are joined:
 *
 *   1. The RSC flight payload carries the real data model —
 *      { model, air, name, status, releasedAt, pricingRates[], pricingExamples[], category[] }
 *      with exact numeric amounts and typed units. Critically it includes EVERY pricing
 *      tier, including the LLM output-token and cache rates that the collapsed table row
 *      hides behind its expander.
 *
 *   2. The rendered <table> carries what a visitor actually sees: which single tier is
 *      promoted to the visible row, and whether an active sale is discounting it. Sale
 *      prices are applied at render and are NOT present in pricingRates, so they can only
 *      be read from the markup — where the digits are split across spans
 *      ($0 · . · 0799), which is why a contiguous "0.0799" never appears in the HTML.
 *
 * Run: npm run scrape
 *
 * This reads only the public pricing page. No authentication, no private endpoints.
 */

import * as cheerio from "cheerio";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../data/rate-sheet.json");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";
const PAGES = 9;
const DELAY_MS = 350; // be a polite guest on someone else's server

/**
 * Maps Runware's internal unit identifiers onto a display unit and the multiplier
 * needed to turn a raw `amount` into the price of one displayed unit.
 *
 * Token amounts are quoted PER TOKEN in the payload (0.000002) but shown per 1M
 * tokens ($2.00), hence the 1e6 factor.
 */
const UNITS = {
  durationSecond:   { display: "second",     per: 1,   dimension: "time"  },
  inputToken:       { display: "1M tokens",  per: 1e6, dimension: "token", side: "input"  },
  outputToken:      { display: "1M tokens",  per: 1e6, dimension: "token", side: "output" },
  cachedInputToken: { display: "1M tokens",  per: 1e6, dimension: "token", side: "cache-read"  },
  cacheWriteToken:  { display: "1M tokens",  per: 1e6, dimension: "token", side: "cache-write" },
  output:           { display: "output",     per: 1,   dimension: "count" },
  inputImage:       { display: "image",      per: 1,   dimension: "count" },
  outputImage:      { display: "image",      per: 1,   dimension: "count" },
  character:        { display: "character",  per: 1,   dimension: "count" },
  outputMegapixel:  { display: "megapixel",  per: 1,   dimension: "area" },
  inputMegapixel:   { display: "megapixel",  per: 1,   dimension: "area" },
  megapixel:        { display: "megapixel",  per: 1,   dimension: "area" },
  step:             { display: "step",       per: 1,   dimension: "count" },
  request:          { display: "request",    per: 1,   dimension: "count" },
  generation:       { display: "generation", per: 1,   dimension: "count" },
  video:            { display: "video",      per: 1,   dimension: "count" },
  utf8Byte:         { display: "UTF-8 byte", per: 1,   dimension: "count" },
  gigabyteSecond:   { display: "GB-second",  per: 1,   dimension: "time"  },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchPage(page) {
  const url = `https://runware.ai/pricing?page=${page}`;
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

/**
 * Decodes the RSC flight payload into plain text.
 *
 * The payload arrives as JS string literals inside `self.__next_f.push([1,"..."])`.
 * Naively doing `html.replace(/\\"/g, '"')` looks equivalent and is not: it also rewrites
 * *nested* escaping inside prose fields such as pricingOverview, which corrupts those
 * objects and silently drops them. Letting JSON.parse unescape each literal is correct,
 * and recovered the last 15 models that a global replace was losing.
 */
function flightText(html) {
  const chunks = [];
  for (const m of html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)) {
    try {
      chunks.push(JSON.parse(m[1]));
    } catch {
      // a literal we cannot decode contributes nothing; the table join still covers the row
    }
  }
  return chunks.join("");
}

/** Walks outward from an index to capture the enclosing balanced {...} object. */
function objectAround(source, index) {
  let depth = 0;
  let start = -1;
  for (let i = index; i >= 0; i--) {
    const c = source[i];
    if (c === "}") depth++;
    else if (c === "{") {
      if (depth === 0) { start = i; break; }
      depth--;
    }
  }
  if (start < 0) return null;
  depth = 0;
  for (let i = start; i < source.length; i++) {
    const c = source[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * Pulls the structured model records out of the RSC flight payload.
 *
 * Runware publishes prices in two different shapes, and both must be handled or a
 * quarter of the catalogue silently loses its tiers:
 *
 *   pricingRates    — a published rate card: { amount, unit, label }, typed units.
 *   pricingMeasured — measured pricing: { configuration, price, latencyMs }, a plain
 *                     number whose unit is implied by the modality. Their own FAQ says
 *                     the page lists "models with published rates *or measured pricing*".
 *
 * A model may also carry pricingOverview (prose summary) and pricingExamples.
 */
function extractModels(html, unknownUnits) {
  const flat = flightText(html);
  const out = new Map();

  for (const match of flat.matchAll(/\{"model":"/g)) {
    const raw = objectAround(flat, match.index);
    if (!raw) continue;

    let record;
    try {
      record = JSON.parse(raw);
    } catch {
      continue; // nested escaping we do not need; the table join still covers the row
    }
    if (!record?.model) continue;

    const published = Array.isArray(record.pricingRates)
      ? record.pricingRates.map((rate) => {
          const unit = UNITS[rate.unit];
          if (!unit) unknownUnits.add(rate.unit);
          return {
            label: rate.label ?? "",
            rawAmount: rate.amount,
            rawUnit: rate.unit,
            // price of one *displayed* unit, e.g. per 1M tokens rather than per token
            amount: unit ? rate.amount * unit.per : rate.amount,
            unit: unit?.display ?? rate.unit,
            dimension: unit?.dimension ?? "unknown",
            side: unit?.side ?? null,
            latencyMs: null,
          };
        })
      : null;

    // Measured tiers carry no unit of their own; the rendered row supplies it at join time.
    const measured = Array.isArray(record.pricingMeasured)
      ? record.pricingMeasured.map((tier) => ({
          label: tier.configuration ?? "",
          rawAmount: tier.price,
          rawUnit: null,
          amount: tier.price,
          unit: null,
          dimension: "count",
          side: null,
          latencyMs: tier.latencyMs ?? null,
        }))
      : null;

    out.set(record.model, {
      slug: record.model,
      air: record.air ?? null,
      name: record.name ?? record.model,
      status: record.status ?? null,
      releasedAt: record.releasedAt ?? null,
      modality: (record.category?.[0] ?? "other").toUpperCase(),
      pricingBasis: published ? "published" : measured ? "measured" : "unknown",
      overview: record.pricingOverview ?? null,
      rates: published ?? measured ?? [],
      examples: (record.pricingExamples ?? []).map((ex) => ({
        configuration: ex.configuration,
        // their own payload double-prefixes the sigil: "$$0.423"
        price: Number(String(ex.price ?? "").replace(/\$/g, "")) || null,
        latencyMs: ex.latencyMs ?? null,
      })),
    });
  }
  return out;
}

/** Reads the rendered rate-sheet table: which tier is visible, and any active sale. */
function extractVisibleRows($) {
  const table = $("table")
    .filter((_, t) => $(t).find("thead").text().toLowerCase().includes("modality"))
    .first();

  return table
    .find("tbody tr")
    .toArray()
    .map((tr) => {
      const tds = $(tr).find("td");
      if (tds.length < 4) return null;

      const link = $(tds[0]).find('a[href^="/models/"]').first();
      const slug = (link.attr("href") ?? "").replace("/models/", "");
      if (!slug) return null;

      const cell = $(tds[3]);
      const listed = cell.find(".line-through").first().text().trim(); // "$0.094" when on sale
      let text = cell.text().replace(/\s+/g, " ").trim();
      if (listed) text = text.replace(listed, "");

      const effective = Number(text.match(/\$([\d.]+)/)?.[1] ?? NaN);
      const savePct = Number(text.match(/Save ~(\d+)\s*%/)?.[1] ?? NaN);
      const unit = text.match(/\/\s*([^·]+?)(?:\s*·|$)/)?.[1]?.trim() ?? "flat";

      return {
        slug,
        provider: $(tds[0]).find("img").first().attr("alt") || null,
        modality: $(tds[1]).text().trim(),
        configuration: $(tds[2]).text().replace(/\s+/g, " ").trim(),
        shownAmount: Number.isFinite(effective) ? effective : null,
        shownUnit: unit,
        onSale: Boolean(listed),
        listAmount: listed ? Number(listed.replace("$", "")) : null,
        savePct: Number.isFinite(savePct) ? savePct : null,
      };
    })
    .filter(Boolean);
}

async function main() {
  const models = new Map();
  const rows = [];
  const unknownUnits = new Set();

  for (let page = 1; page <= PAGES; page++) {
    const html = await fetchPage(page);
    const $ = cheerio.load(html);

    for (const [slug, model] of extractModels(html, unknownUnits)) {
      if (!models.has(slug)) models.set(slug, model);
    }
    for (const row of extractVisibleRows($)) rows.push({ ...row, page });

    process.stdout.write(`  page ${page}/${PAGES} — ${rows.length} rows\n`);
    if (page < PAGES) await sleep(DELAY_MS);
  }

  // Join: every visible row gets the full tier list its expander would reveal.
  let missingModel = 0;
  const entries = rows.map((row) => {
    const model = models.get(row.slug);
    if (!model) missingModel++;

    // Measured tiers have no unit in the payload; the rendered row is the only source.
    const rates = (model?.rates ?? []).map((rate) => ({
      ...rate,
      unit: rate.unit ?? row.shownUnit,
    }));

    return {
      ...row,
      air: model?.air ?? null,
      name: model?.name ?? row.slug,
      releasedAt: model?.releasedAt ?? null,
      status: model?.status ?? null,
      pricingBasis: model?.pricingBasis ?? "unknown",
      overview: model?.overview ?? null,
      // every published tier, including the ones hidden behind the row expander
      rates,
      examples: model?.examples ?? [],
    };
  });

  if (unknownUnits.size) {
    throw new Error(
      `Unmapped pricing units: ${[...unknownUnits].join(", ")}. ` +
        `Add them to UNITS in scripts/scrape-pricing.mjs — silently passing an unknown ` +
        `unit through would corrupt every normalised price.`,
    );
  }

  const fixture = {
    source: "https://runware.ai/pricing",
    scrapedAt: new Date().toISOString(),
    note:
      "Public pricing page only. Unaffiliated redesign concept. Amounts are list prices " +
      "per displayed unit; token rates are converted from per-token to per-1M-tokens.",
    counts: {
      rows: entries.length,
      models: new Set(entries.map((e) => e.slug)).size,
      onSale: entries.filter((e) => e.onSale).length,
      withHiddenTiers: entries.filter((e) => e.rates.length > 1).length,
      published: entries.filter((e) => e.pricingBasis === "published").length,
      measured: entries.filter((e) => e.pricingBasis === "measured").length,
      noRates: entries.filter((e) => e.rates.length === 0).length,
      withLatency: entries.filter((e) => e.examples.some((x) => x.latencyMs)).length,
    },
    entries,
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(fixture, null, 2) + "\n", "utf8");

  console.log(`\nWrote ${OUT}`);
  console.table(fixture.counts);
  if (missingModel) console.warn(`  ${missingModel} rows had no payload match`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
