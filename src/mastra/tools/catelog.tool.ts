import { createCodeMode } from "@mastra/core/tools";
import { QuickJsCodeModeTransport } from "@mastra/quickjs";
import { getProductTool, listProductsTool } from "./products.tool";
import { listVariantsTool } from "./variants.tool";
import { getProductReviewsTool } from "./reviews.tool";

export const catalogCodeMode = createCodeMode(
  {
    id: "catalog_code",
    tools: {
      listProductsTool,
      getProductTool,
      listVariantsTool,
      getProductReviewsTool,
    },
  },
  new QuickJsCodeModeTransport({ memoryLimitMb: 128 }),
);
