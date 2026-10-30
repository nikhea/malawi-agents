/**
 * Seed the Malawi Store evaluation datasets.
 *
 * Usage:
 *   bun src/mastra/datasets/seed.ts                 # create or top up all datasets
 *   bun src/mastra/datasets/seed.ts --reset         # delete and recreate everything
 *   bun src/mastra/datasets/seed.ts --entity=cart   # one entity (repeatable)
 *
 * Requires the same Postgres and Redis configuration as `bun run dev`.
 */
import { mastra } from "../index";
import { seedDatasets } from "./index";

const args = process.argv.slice(2);
const reset = args.includes("--reset");
const entities = args
  .filter((arg) => arg.startsWith("--entity="))
  .map((arg) => arg.slice("--entity=".length))
  .filter(Boolean);

const report = await seedDatasets(mastra, { reset, entities });

for (const row of report) {
  const action = row.created ? "created" : "updated";
  console.log(
    `${action.padEnd(8)} ${row.name.padEnd(28)} ${String(row.items).padStart(3)} items  ${row.datasetId}`,
  );
}

console.log(
  `\n${report.length} datasets ready (${report.filter((row) => row.split === "labeled").length} labeled, ${
    report.filter((row) => row.split === "unlabeled").length
  } unlabeled).`,
);
