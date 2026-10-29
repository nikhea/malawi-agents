import {
  BatchPartsProcessor,
  PrefillErrorHandler,
  ProviderHistoryCompat,
  StreamErrorRetryProcessor,
} from "@mastra/core/processors";

export const storedAgentOutProcessors = [
  new BatchPartsProcessor({
    batchSize: 10,
    maxWaitTime: 100,
    emitOnNonText: true,
  }),
];

export const storedAgentErrorProcessors = [
  new StreamErrorRetryProcessor(),
  new PrefillErrorHandler(),
  new ProviderHistoryCompat(),
];
