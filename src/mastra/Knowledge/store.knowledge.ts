import { Knowledge } from "@mastra/core/knowledge";
import { createMastraStorage } from "../lib/malawi-runtime";
import { PgVector } from "@mastra/pg";
import { mastraDatabaseUrl } from "../lib/malawi-config";
import { ModelRouterEmbeddingModel } from "@mastra/core/llm";
import { storeKnowledgeScopes } from "./store.scopes";

const embedder = new ModelRouterEmbeddingModel({
  providerId: "ollama",
  modelId: "hf.co/unsloth/embeddinggemma-2-GGUF:Q8_0", // replace with your Ollama embedding model
  url: "http://localhost:11434/v1",
  apiKey: "not-needed", // Ollama doesn't require an API key
});

export const storeKnowledge = new Knowledge({
  id: "store-knowledge",
  name: "Malawi Store Knowledge",
  description:
    "Store-wide policies and shopping help for signed-in customers. Live prices, stock, and order state stay in the store tools.",
  storage: await createMastraStorage(),
  vector: new PgVector({
    id: "store-knowledge-vector",
    connectionString: mastraDatabaseUrl(),
  }),
  embedder: embedder,
  scopes: storeKnowledgeScopes,
  // Customers read. Writes are host-only (see seed.store-knowledge.ts).
  tools: { read: { maxTokens: 1200 } },
  pinnedContext: { maxPins: 2, maxTokens: 400 },
});
