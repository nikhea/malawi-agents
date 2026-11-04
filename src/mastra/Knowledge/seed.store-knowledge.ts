/**
 * Seeds the store-wide Knowledge pages in `store.pages.ts`.
 *
 * Run from the repository root:
 *
 *   bun run src/mastra/Knowledge/seed.store-knowledge.cli.ts
 *
 * Safe to re-run: `upsertPage` reports unchanged pages without writing a new
 * version.
 */
import type {
  KnowledgeUpsertPageInput,
  KnowledgeUpsertPageResult,
} from "@mastra/core/knowledge";
import { storeKnowledgePages } from "./store.pages";
import { STORE_KNOWLEDGE_SCOPE } from "./store.scopes";

export interface StoreKnowledgeWriter {
  upsertPage(
    input: KnowledgeUpsertPageInput,
  ): Promise<KnowledgeUpsertPageResult>;
}

export type StoreKnowledgeSeedResult = {
  path: string;
  status: KnowledgeUpsertPageResult["status"];
};

export async function seedStoreKnowledge(
  writer: StoreKnowledgeWriter,
): Promise<StoreKnowledgeSeedResult[]> {
  const results: StoreKnowledgeSeedResult[] = [];

  for (const page of storeKnowledgePages) {
    const result = await writer.upsertPage({
      scope: STORE_KNOWLEDGE_SCOPE,
      path: page.path,
      name: page.name,
      description: page.description,
      body: page.body,
      author: "host",
    });

    results.push({ path: page.path, status: result.status });
  }

  return results;
}
