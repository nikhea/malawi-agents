import type {
  DatasetGroundTruth,
  DatasetInput,
  DatasetItemMetadata,
  DatasetRequestContext,
  LabeledItemSpec,
  UnlabeledItemSpec,
} from "./types";

function buildInput(prompt: string, requestContext: DatasetRequestContext): DatasetInput {
  return { prompt, requestContext };
}

/** Build a labeled item: prompt + context + scored ground truth. */
export function labeled(
  externalId: string,
  prompt: string,
  requestContext: DatasetRequestContext,
  groundTruth: DatasetGroundTruth,
  metadata: DatasetItemMetadata,
): LabeledItemSpec {
  return {
    externalId,
    input: buildInput(prompt, requestContext),
    groundTruth,
    metadata: { split: "labeled", ...metadata },
  };
}

/** Build an unlabeled item: prompt + context, no ground truth. */
export function unlabeled(
  externalId: string,
  prompt: string,
  requestContext: DatasetRequestContext,
  metadata: DatasetItemMetadata,
): UnlabeledItemSpec {
  return {
    externalId,
    input: buildInput(prompt, requestContext),
    metadata: { split: "unlabeled", ...metadata },
  };
}
