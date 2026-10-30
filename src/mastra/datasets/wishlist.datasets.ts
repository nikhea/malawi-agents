import { labeled, unlabeled } from "./builders";
import { customerContext, IDs } from "./fixtures";
import type { EntityDatasetSpec } from "./types";

const entity = "wishlist";

export const wishlistDatasets: EntityDatasetSpec = {
  entity,
  description:
    "Saved fashion pieces scenarios against real products: listing and filtering a wishlist, saving idempotently, removing by product ID, resolving wishlist row IDs, missing products, and multi-save requests.",
  tools: ["list-wishlist", "add-to-wishlist", "remove-from-wishlist"],
  labeled: [
    labeled(
      `${entity}-labeled-01`,
      "Show my wishlist.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [{ tool: "list-wishlist", args: {} }],
        responseMustInclude: ["wishlist"],
        mustNotCall: ["list-products"],
        notes: "No filters means the whole saved list.",
      },
      { coverage: "read", difficulty: "easy", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-02`,
      "Show saved dresses from the Dresses category, cheapest first, page 1 with 5 items.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-wishlist",
            args: {
              query: "dresses",
              categoryId: IDs.categories.dresses,
              sort: "price_asc",
              page: 1,
              limit: 5,
            },
          },
        ],
        responseMustInclude: ["dress"],
        mustNotCall: [],
        notes:
          "query and categoryId are independent filters. Dropping either one is a failure.",
      },
      { coverage: "list-filters", difficulty: "medium", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-03`,
      "Save the Balaka Embroidered Tunic to my wishlist.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-products",
            args: { query: "Balaka Embroidered Tunic" },
            why: "Resolve the product ID from the name.",
          },
          {
            tool: "add-to-wishlist",
            args: { productId: IDs.products.tunic },
            why: "Save the resolved product.",
          },
        ],
        responseMustInclude: ["saved"],
        mustNotCall: [],
        notes: "Write actions are approval-gated.",
      },
      {
        coverage: "resolve-then-create",
        difficulty: "medium",
        role: "customer",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-04`,
      "Save a96d37af-ef9f-4a25-9593-a644a51b7815 again. I think I saved it before.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          { tool: "add-to-wishlist", args: { productId: IDs.products.tunic } },
        ],
        responseMustInclude: ["already"],
        mustNotCall: ["list-wishlist"],
        notes:
          "add-to-wishlist is idempotent, so calling it again is safe. The reply should still say the item was already saved.",
      },
      {
        coverage: "idempotent",
        difficulty: "medium",
        role: "customer",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-05`,
      "Remove a96d37af-ef9f-4a25-9593-a644a51b7815 from my wishlist.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "remove-from-wishlist",
            args: { productId: IDs.products.tunic },
          },
        ],
        responseMustInclude: ["removed"],
        mustNotCall: ["list-wishlist"],
        notes: "The customer already gave the product ID.",
      },
      {
        coverage: "delete",
        difficulty: "easy",
        role: "customer",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-06`,
      "Save 00000000-0000-4000-8000-000000000000 for later.",
      customerContext,
      {
        outcome: "answer",
        expectedToolCalls: [
          {
            tool: "get-product",
            args: { id: IDs.products.missing },
            why: "Confirm the piece exists before saving it.",
          },
        ],
        responseMustInclude: ["not found"],
        mustNotCall: ["add-to-wishlist"],
        notes:
          "A wishlist entry for a nonexistent product would fail downstream. Verify first and report it.",
      },
      {
        coverage: "not-found",
        difficulty: "medium",
        role: "customer",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-07`,
      "Remove wishlist item wl_9001 from my saved items.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-wishlist",
            args: { query: "crossbody bag" },
            why: "Resolve the saved row to its product ID.",
          },
          {
            tool: "remove-from-wishlist",
            args: { productId: IDs.products.crossbody },
            why: "The remove tool expects a product ID.",
          },
        ],
        responseMustInclude: ["removed"],
        mustNotCall: [],
        notes:
          "remove-from-wishlist takes a productId, not a wishlist row ID. Passing wl_9001 directly is the classic mistake.",
      },
      {
        coverage: "resolve-then-delete",
        difficulty: "hard",
        role: "customer",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-08`,
      "Do I have anything saved?",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [{ tool: "list-wishlist", args: {} }],
        responseMustInclude: ["saved"],
        mustNotCall: ["add-to-wishlist"],
        notes: "Answer from the returned list; do not add anything.",
      },
      { coverage: "read", difficulty: "easy", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-09`,
      "Save 63bc9a7a-2299-4db5-8096-cf6477623682 and cdd56269-0f83-45b4-9a8c-8f3be4d432a3 for later.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "add-to-wishlist",
            args: { productId: IDs.products.poplinShirt },
          },
          { tool: "add-to-wishlist", args: { productId: IDs.products.bomber } },
        ],
        responseMustInclude: ["saved"],
        mustNotCall: [],
        notes:
          "add-to-wishlist handles one product per call, so two pieces need two calls.",
      },
      {
        coverage: "multi-write",
        difficulty: "medium",
        role: "customer",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-10`,
      "Which saved piece is the most expensive right now?",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          { tool: "list-wishlist", args: { sort: "price_desc" } },
        ],
        responseMustInclude: ["$"],
        mustNotCall: [],
        notes:
          "Wishlist items carry a product snapshot and current price. Sorting server-side is cheaper than inspecting every row in prose.",
      },
      { coverage: "read", difficulty: "medium", role: "customer" },
    ),
  ],
  unlabeled: [
    unlabeled(
      `${entity}-unlabeled-01`,
      "wishlist",
      customerContext,
      { coverageArea: "read", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-02`,
      "Saved items under Accessories.",
      customerContext,
      { coverageArea: "read", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-03`,
      "Save the crossbody bag for me.",
      customerContext,
      { coverageArea: "create", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-04`,
      "Save the crossbody twice, just in case.",
      customerContext,
      { coverageArea: "edge", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-05`,
      "Take the crossbody off my wishlist.",
      customerContext,
      { coverageArea: "delete", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-06`,
      "remove wl_1234",
      customerContext,
      { coverageArea: "edge", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-07`,
      "Do I have any tunic saved?",
      customerContext,
      { coverageArea: "read", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-08`,
      "Add all the dresses to my wishlist.",
      customerContext,
      { coverageArea: "create", style: "task-like", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-09`,
      "Sort my saved items by name.",
      customerContext,
      { coverageArea: "read", style: "task-like", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-10`,
      "Is my wishlist shared with other customers?",
      customerContext,
      { coverageArea: "policy-question", style: "conversational", language: "en" },
    ),
  ],
};
