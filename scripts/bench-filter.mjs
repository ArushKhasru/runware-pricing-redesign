import { readFile } from "node:fs/promises";
const { applyFilters, DEFAULT_FILTERS } = await import("../lib/pricing/filter.ts");

const sheet = JSON.parse(await readFile(new URL("../data/rate-sheet.json", import.meta.url), "utf8"));
const rows = sheet.entries;

function bench(name, filters, runs = 200) {
  applyFilters(rows, filters); // warm
  const t0 = performance.now();
  for (let i = 0; i < runs; i++) applyFilters(rows, filters);
  const per = (performance.now() - t0) / runs;
  console.log(`  ${per.toFixed(2)}ms  ${name}`);
}

console.log(`filter+sort over ${rows.length} rows, mean of 200 runs:`);
bench("sort by monthly cost (default)", { ...DEFAULT_FILTERS, mode: "monthly" });
bench("sort by unit price", { ...DEFAULT_FILTERS, mode: "unit" });
bench("search 'flux' + monthly sort", { ...DEFAULT_FILTERS, mode: "monthly", search: "flux" });
bench("modality + range + sort", {
  ...DEFAULT_FILTERS,
  mode: "monthly",
  modalities: ["IMAGE", "VIDEO"],
  minPrice: 1,
  maxPrice: 500,
});
