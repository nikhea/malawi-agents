import type { Mastra } from "@mastra/core/mastra";
import type { DatasetItemPayload } from "@mastra/core/storage";
import { cartDatasets } from "./cart.datasets";
import { categoriesDatasets } from "./categories.datasets";
import { inventoryDatasets } from "./inventory.datasets";
import { ordersDatasets } from "./orders.datasets";
import { paymentsDatasets } from "./payments.datasets";
import { productsDatasets } from "./products.datasets";
import { reviewsDatasets } from "./reviews.datasets";
import { usersDatasets } from "./users.datasets";
import { variantsDatasets } from "./variants.datasets";
import { wishlistDatasets } from "./wishlist.datasets";
import {
  datasetGroundTruthSchema,
  datasetInputSchema,
  type EntityDatasetSpec,
} from "./types";

export * from "./types";
export * from "./fixtures";
export { labeled, unlabeled } from "./builders";

/**
 * One spec per registered tool entity. Each spec produces two datasets:
 * a labeled split with ground truth and an unlabeled split without it.
 */
export const entityDatasets: EntityDatasetSpec[] = [
  productsDatasets,
  categoriesDatasets,
  variantsDatasets,
  cartDatasets,
  ordersDatasets,
  paymentsDatasets,
  wishlistDatasets,
  reviewsDatasets,
  usersDatasets,
  inventoryDatasets,
];

export type DatasetSplit = "labeled" | "unlabeled";

export function datasetName(entity: string, split: DatasetSplit): string {
  return `store-${entity}-${split}`;
}

export type SeedReportRow = {
  entity: string;
  name: string;
  split: DatasetSplit;
  datasetId: string;
  items: number;
  created: boolean;
};

async function findDatasetByName(mastra: Mastra, name: string) {
  const { datasets } = await mastra.datasets.list({
    perPage: false,
    filters: { name },
  });

  return datasets.find((dataset) => dataset.name === name) ?? null;
}

function toPayload(spec: EntityDatasetSpec, split: DatasetSplit): DatasetItemPayload[] {
  if (split === "labeled") {
    return spec.labeled.map((item) => ({
      externalId: item.externalId,
      input: item.input,
      groundTruth: item.groundTruth,
      requestContext: item.input.requestContext,
      metadata: item.metadata,
    }));
  }

  return spec.unlabeled.map((item) => ({
    externalId: item.externalId,
    input: item.input,
    requestContext: item.input.requestContext,
    metadata: item.metadata,
  }));
}

/**
 * Creates the labeled and unlabeled dataset for every entity.
 *
 * Safe to run repeatedly: datasets are matched by name and items use stable
 * `externalId` values. Pass `reset: true` to delete and recreate a dataset so
 * edited prompts and ground truth replace the stored version.
 */
export async function seedDatasets(
  mastra: Mastra,
  options: { reset?: boolean; entities?: string[] } = {},
): Promise<SeedReportRow[]> {
  const specs = options.entities?.length
    ? entityDatasets.filter((spec) => options.entities!.includes(spec.entity))
    : entityDatasets;

  if (specs.length === 0) {
    throw new Error(
      `No dataset spec matched: ${options.entities?.join(", ") ?? "(none)"}. Known entities: ${entityDatasets
        .map((spec) => spec.entity)
        .join(", ")}`,
    );
  }

  const withoutToken = specs.flatMap((spec) =>
    [...spec.labeled, ...spec.unlabeled].filter(
      (item) => !item.input.requestContext.accessToken,
    ),
  );
  if (withoutToken.length > 0) {
    throw new Error(
      `MALAWI_TOKEN is not set. It is required to seed ${withoutToken.length} items with a live access token.`,
    );
  }

  const report: SeedReportRow[] = [];

  for (const spec of specs) {
    for (const split of ["labeled", "unlabeled"] as const) {
      const name = datasetName(spec.entity, split);
      const existing = await findDatasetByName(mastra, name);

      if (existing && options.reset) {
        await mastra.datasets.delete({ id: existing.id });
      }

      const dataset =
        existing && !options.reset
          ? await mastra.datasets.get({ id: existing.id })
          : await mastra.datasets.create({
              name,
              description: `${spec.description} Split: ${split}.`,
              inputSchema: datasetInputSchema,
              groundTruthSchema:
                split === "labeled" ? datasetGroundTruthSchema : undefined,
              targetType: "agent",
              targetIds: ["store-agent"],
              metadata: {
                entity: spec.entity,
                split,
                tools: spec.tools,
                source: "src/mastra/datasets",
              },
            });

      const items = toPayload(spec, split);
      await dataset.addItems({ items });

      report.push({
        entity: spec.entity,
        name,
        split,
        datasetId: dataset.id,
        items: items.length,
        created: !existing || Boolean(options.reset),
      });
    }
  }

  return report;
}
