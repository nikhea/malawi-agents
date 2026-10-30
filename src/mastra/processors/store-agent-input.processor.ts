import {
  ModerationProcessor,
  PromptInjectionDetector,
  TokenCostControl,
  TokenLimiter,
  UnicodeNormalizer,
} from "@mastra/core/processors";
import { MAX_STEPS } from "../utils/constant.utils";
import { EnsureFinalResponseProcessor } from "./ensure-final-response";
import { llmGuardrailModel } from "../lib/malawi-config";
import { inputClassifierGuardrail } from "../classifier/store-validate.classifier";
import { SQLRegexFiliter } from "./sql-prompt-injection.processor";

const tokenCostControl = new TokenCostControl({
  maxCost: 0.001,
  scope: "resource",
  window: "1h",
  strategy: "block",
  includeBreakdown: true,
  warnAtPercent: 80,
  message: "Token cost limit exceeded. Please try again later.",
});

const LLM_GUARDRAIL_MODEL = llmGuardrailModel();

const promptInjectionGuardrail = new PromptInjectionDetector({
  model: LLM_GUARDRAIL_MODEL,
  threshold: 0.8,
  strategy: "block",
  errorStrategy: "strict",
  detectionTypes: ["injection", "jailbreak", "system-override"],
});

const inputModerationGuardrail = new ModerationProcessor({
  model: LLM_GUARDRAIL_MODEL,
  threshold: 0.8,
  strategy: "block",
  errorStrategy: "strict",
  categories: ["hate", "harassment", "violence"],
});

tokenCostControl.onViolation = ({ detail }: any) => {
  console.log({ detail });
  console.log(
    `Cost ${detail.threshold} threshold for ${detail.scopeKey}: $${detail.usage}/$${detail.limit}`,
  );
  for (const entry of detail.breakdown ?? []) {
    console.log(`  ${entry.provider}/${entry.model}: $${entry.estimatedCost}`);
  }
};

export const storedAgentInputProcessors = [
  new UnicodeNormalizer({
    stripControlChars: true,
    collapseWhitespace: true,
  }),
  new TokenLimiter(127000),
  // SQLRegexFiliter,
  // inputClassifierGuardrail,
  // promptInjectionGuardrail,
  // inputModerationGuardrail,
  tokenCostControl,
  new EnsureFinalResponseProcessor(MAX_STEPS),
  // new DateInjectorProcessor(),
];
