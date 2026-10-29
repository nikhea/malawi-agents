import { ModelWithRetries } from "@mastra/core/agent";

export const storedAgentModels: ModelWithRetries[] = [
  {
    model: "ollama-cloud/gpt-oss:120b",
    maxRetries: 3,
  },
  {
    model: "nvidia/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
    maxRetries: 2,
  },
  {
    model: "openrouter/google/gemma-4-31b-it:free",
    maxRetries: 3,
  },
  {
    model: "groq/openai/gpt-oss-120b",
    maxRetries: 2,
    modelSettings: {
      timeout: {
        totalMs: 30000, // fail the run if it takes longer than 30s
        stepMs: 10000, // fail an individual model call after 10s
        firstChunkMs: 3000, // fail if no content chunk within 3s
      },
    },
  },
  {
    model: "google/gemini-2.5-pro",
    maxRetries: 2,
  },
];
