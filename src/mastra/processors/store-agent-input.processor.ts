import {
  RegexFilterProcessor,
  RegexRule,
  ModerationProcessor,
  PromptInjectionDetector,
  TokenCostControl,
  TokenLimiter,
  UnicodeNormalizer,
} from "@mastra/core/processors";
import { MAX_STEPS } from "../utils/constant.utils";
import { EnsureFinalResponseProcessor } from "./ensure-final-response";
import { llmGuardrailModel } from "../lib/malawi-config";
import {
  inputAccessGuardrail,
  inputClassifierGuardrail,
} from "../classifier/store-validate.classifier";

const rules: RegexRule[] | undefined = [
  {
    name: "env-style-secrets",
    pattern:
      /[A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL|API_KEY|URL)[A-Z0-9_]*\s*=\s*\S+/gi,
  },
  {
    name: "sql-query",
    pattern:
      /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION)\b[\s\S]*/gi,
    replacement: "[SQL_REDACTED]",
  },
  // 1. Classic tautology-based injection
  {
    name: "sql-tautology",
    pattern: /('|\")\s*(or|and)\s+('|\")?\s*\d+\s*=\s*\d+/gi,
  },

  // 2. Always-true conditions (admin bypass style)
  {
    name: "sql-always-true-condition",
    pattern: /(\bor\b|\band\b)\s+(\d+\s*=\s*\d+|'[^']*'\s*=\s*'[^']*')/gi,
  },

  // 3. Comment injection attempts
  {
    name: "sql-comment-bypass",
    pattern: /(--|#|\/\*)/g,
  },

  // 4. UNION-based injection (data extraction attempts)
  {
    name: "sql-union-injection",
    pattern: /\bunion\b\s+(all\s+)?\bselect\b/gi,
  },

  // 5. Stacked queries (multiple statements)
  {
    name: "sql-stacked-queries",
    pattern: /;\s*(select|insert|update|delete|drop|alter)\b/gi,
  },

  // 6. Dangerous schema operations
  {
    name: "sql-destructive-commands",
    pattern: /\b(drop|truncate|alter|create)\b\s+(table|database|schema)/gi,
  },

  // 7. Time-based blind injection hints
  {
    name: "sql-time-based-injection",
    pattern: /\b(sleep|benchmark|pg_sleep)\s*\(/gi,
  },
  {
    name: "sql-encoded-attack",
    pattern: /(%27|%22|%3D|%2D%2D)/gi,
  },
  {
    name: "sql-in-url-params",
    pattern:
      /(\?|&)(id|user|query|search)=.*(select|union|drop|insert|delete)/gi,
  },
  {
    name: "openai-api-key",
    pattern: /[A-Z_]*API_KEY\s*=\s*[a-zA-Z0-9_\-]+/g,
    replacement: "[REDACTED_API_KEY]",
  },
];

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
  promptInjectionGuardrail,
  inputModerationGuardrail,
  inputClassifierGuardrail,
  inputAccessGuardrail,
  //   new RegexFilterProcessor({
  //     presets: [
  //       // "pii",
  //       "secrets",
  //       "urls",
  //     ],
  //     strategy: "block",
  //     phase: "input",
  //     rules,
  //   }),
  tokenCostControl,
  new EnsureFinalResponseProcessor(MAX_STEPS),
  // new DateInjectorProcessor(),
];
