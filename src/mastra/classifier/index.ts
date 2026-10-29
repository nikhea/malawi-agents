import { createTypeSafeAi } from "@ai-sdk/typesafe-ai";

/**
 * Ollama exposes the TypeSafe-compatible decision API at /v1/systemone.
 * The provider appends /systemone itself, so baseURL must stop at /v1.
 */
const ollamaBaseUrl = (
  process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1"
).replace(/\/systemone\/?$/, "");

const typeSafe = createTypeSafeAi({
  baseURL: ollamaBaseUrl,
  apiKey: process.env.OLLAMA_API_KEY ?? "ollama",
});

export const decisionModel = typeSafe.decisionModel(
  process.env.OLLAMA_DECISION_MODEL ??
    "hf.co/LiquidAI/d1-omni-600M-GGUF:BF16",
);
