import { z } from "zod";

/**
 * Shared shapes for Malawi Store evaluation datasets.
 *
 * Two datasets exist per entity:
 * - `<entity>-labeled`: prompt + request context + ground truth. Used for
 *   scoring tool selection, tool arguments, and response content.
 * - `<entity>-unlabeled`: prompt + request context only. Used to capture live
 *   behaviour, triage failures, and grow ground truth over time.
 *
 * Both splits share the same input schema so an unlabeled item can be promoted
 * into the labeled split without reshaping it.
 */

export const datasetRequestContextSchema = z.object({
  userId: z.string().describe("Authenticated Malawi Store user ID"),
  userEmail: z.string().describe("Authenticated user email address"),
  userName: z.string().describe("Authenticated user display name"),
  userRole: z.enum(["admin", "customer"]).describe("Authenticated user role"),
  accessToken: z.string().describe("Bearer token used for Malawi Store API calls"),
});

export const datasetInputSchema = z.object({
  prompt: z.string().describe("Message the customer or admin sends to the store agent"),
  requestContext: datasetRequestContextSchema,
});

export const datasetExpectedToolCallSchema = z.object({
  tool: z.string().describe("Registered Mastra tool ID, for example list-products"),
  args: z
    .record(z.string(), z.unknown())
    .describe("Exact arguments the model should send. Omit optional args that should stay unset."),
  why: z.string().optional().describe("Short justification shown to reviewers in Studio"),
});

export const datasetGroundTruthSchema = z.object({
  outcome: z
    .enum(["tool-call", "answer", "clarify", "refuse"])
    .describe(
      "tool-call: the listed calls should run. answer: reply from data already returned. clarify: ask the user before acting. refuse: decline on policy or authorization grounds.",
    ),
  expectedToolCalls: z
    .array(datasetExpectedToolCallSchema)
    .describe("Ordered tool calls. Empty when no tool should run."),
  responseMustInclude: z
    .array(z.string())
    .describe("Case-insensitive facts, IDs, or policy phrases the final reply must contain"),
  mustNotCall: z
    .array(z.string())
    .describe("Tool IDs that must never be invoked for this prompt"),
  notes: z.string().optional().describe("Reviewer guidance for edge cases and partial credit"),
});

export const datasetItemMetadataSchema = z
  .record(z.string(), z.unknown())
  .describe("Free-form review metadata: coverage area, difficulty, role, approval requirement");

export type DatasetRequestContext = z.infer<typeof datasetRequestContextSchema>;
export type DatasetInput = z.infer<typeof datasetInputSchema>;
export type DatasetExpectedToolCall = z.infer<typeof datasetExpectedToolCallSchema>;
export type DatasetGroundTruth = z.infer<typeof datasetGroundTruthSchema>;
export type DatasetItemMetadata = z.infer<typeof datasetItemMetadataSchema>;

export type LabeledItemSpec = {
  externalId: string;
  input: DatasetInput;
  groundTruth: DatasetGroundTruth;
  metadata: DatasetItemMetadata;
};

export type UnlabeledItemSpec = {
  externalId: string;
  input: DatasetInput;
  metadata: DatasetItemMetadata;
};

export type EntityDatasetSpec = {
  /** Entity slug used for dataset names and external IDs. */
  entity: string;
  /** Human-readable description stored on both datasets. */
  description: string;
  /** Tool IDs owned by this entity. */
  tools: string[];
  labeled: LabeledItemSpec[];
  unlabeled: UnlabeledItemSpec[];
};
