import {
  BatchPartsProcessor,
  PrefillErrorHandler,
  ProviderHistoryCompat,
  StreamErrorRetryProcessor,
} from "@mastra/core/processors";
import {
  outputPaymentGuardrail,
  outputPrivacyGuardrail,
  outputGuardrail,
} from "../classifier/store-validate.classifier";

export const storedAgentOutProcessors = [
  new BatchPartsProcessor({
    batchSize: 10,
    maxWaitTime: 100,
    emitOnNonText: true,
  }),
  outputGuardrail,
  outputPaymentGuardrail,
  outputPrivacyGuardrail,
];

export const storedAgentErrorProcessors = [
  new StreamErrorRetryProcessor(),
  new PrefillErrorHandler(),
  new ProviderHistoryCompat(),
];
