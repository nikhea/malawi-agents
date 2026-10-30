import {
  BatchPartsProcessor,
  PIIDetector,
  PrefillErrorHandler,
  ProviderHistoryCompat,
  StreamErrorRetryProcessor,
  SystemPromptScrubber,
} from "@mastra/core/processors";
import { llmGuardrailModel } from "../lib/malawi-config";
import { outputGuardrail } from "../classifier/store-validate.classifier";

const LLM_GUARDRAIL_MODEL = llmGuardrailModel();

export const storedAgentOutProcessors = [
  new BatchPartsProcessor({
    batchSize: 10,
    maxWaitTime: 100,
    emitOnNonText: true,
  }),
  outputGuardrail,
  // new PIIDetector({
  //   model: LLM_GUARDRAIL_MODEL,
  //   threshold: 0.8,
  //   strategy: "redact",
  //   errorStrategy: "warn",
  //   redactionMethod: "mask",
  //   detectionTypes: ["email", "phone", "credit-card"],
  // }),
  // new SystemPromptScrubber({
  //   model: LLM_GUARDRAIL_MODEL,
  //   strategy: "redact",
  //   errorStrategy: "warn",
  //   customPatterns: ["system prompt", "internal instructions", "tool schema"],
  //   placeholderText: "[REDACTED]",
  // }),
];

export const storedAgentErrorProcessors = [
  new StreamErrorRetryProcessor(),
  new PrefillErrorHandler(),
  new ProviderHistoryCompat(),
];
