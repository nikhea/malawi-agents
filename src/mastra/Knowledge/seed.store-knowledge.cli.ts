/**
 * CLI entrypoint for seeding store Knowledge.
 *
 *   bun run src/mastra/Knowledge/seed.store-knowledge.cli.ts
 */
import { seedStoreKnowledge } from "./seed.store-knowledge";
import { storeKnowledge } from "./store.knowledge";

const results = await seedStoreKnowledge(storeKnowledge);

for (const { path, status } of results) {
  console.log(`${status.padEnd(9)} ${path}`);
}

const created = results.filter((result) => result.status === "created").length;
const updated = results.filter((result) => result.status === "updated").length;
console.log(
  `\n${created} created, ${updated} updated, ${results.length - created - updated} unchanged`,
);
