import { labeled, unlabeled } from "./builders";
import { adminContext, customerContext, IDs, SLUGS } from "./fixtures";
import type { EntityDatasetSpec } from "./types";

const entity = "products";

export const productsDatasets: EntityDatasetSpec = {
  entity,
  description:
    "Fashion catalog scenarios against real storefront records: filtered listing, lookup by id and slug, admin create/update/delete, authorization, and argument validation. Prices are integer USD cents.",
  tools: [
    "list-products",
    "get-product",
    "create-product",
    "update-product",
    "delete-product",
  ],
  labeled: [
    labeled(
      `${entity}-labeled-01`,
      "Do you have any dresses between $30 and $80? Show the cheapest first.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-products",
            args: {
              query: "dresses",
              minPriceCents: 3000,
              maxPriceCents: 8000,
              sort: "price_asc",
            },
            why: "Text search plus a price window, sorted low to high.",
          },
        ],
        responseMustInclude: ["dress", "$"],
        mustNotCall: ["get-product"],
        notes:
          "Prices are integer USD cents. $30.00 is 3000 and $80.00 is 8000. Answering in kwacha or raw cents is a failure.",
      },
      { coverage: "list-filters", difficulty: "medium", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-02`,
      "I need a small that is actually in stock and rated at least 4 stars.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-products",
            args: { inStock: true, size: "S", minRating: 4 },
            why: "Stock, size, and rating filters combine in one catalog query.",
          },
        ],
        responseMustInclude: ["in stock"],
        mustNotCall: [],
        notes:
          "The customer says 'small' in prose; the tool expects the size code S.",
      },
      { coverage: "list-filters", difficulty: "medium", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-03`,
      "Show page 2 of the newest dresses in the dresses category, 10 per page.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-products",
            args: {
              categorySlug: "dresses",
              sort: "newest",
              page: 2,
              limit: 10,
            },
          },
        ],
        responseMustInclude: ["page 2"],
        mustNotCall: [],
        notes:
          "categorySlug is preferred because the customer gave a slug-like category name. page beats offset.",
      },
      { coverage: "pagination", difficulty: "easy", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-04`,
      "Open product a96d37af-ef9f-4a25-9593-a644a51b7815 and tell me its sizes.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          { tool: "get-product", args: { id: IDs.products.tunic } },
        ],
        responseMustInclude: ["Balaka Embroidered Tunic", "S"],
        mustNotCall: [],
        notes:
          "get-product already returns sellable variants, so list-variants is unnecessary.",
      },
      { coverage: "read", difficulty: "easy", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-05`,
      "What is in balaka-embroidered-tunic?",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          { tool: "get-product", args: { slug: SLUGS.tunic } },
        ],
        responseMustInclude: ["Balaka Embroidered Tunic"],
        mustNotCall: ["list-products"],
        notes: "The slug is a direct lookup key; no search round trip is needed.",
      },
      { coverage: "read", difficulty: "easy", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-06`,
      "Look up a96d37af-ef9f-4a25-9593-a644a51b7815 but also by the slug balaka-embroidered-tunic, use both.",
      customerContext,
      {
        outcome: "clarify",
        expectedToolCalls: [],
        responseMustInclude: ["one"],
        mustNotCall: ["get-product"],
        notes:
          "get-product accepts exactly one of id, productId, or slug. The agent should ask which identifier to use instead of tripping the refinement error.",
      },
      { coverage: "validation", difficulty: "hard", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-07`,
      "Add a new product called Lilongwe Linen Wide-Leg Trousers to category edc87af0-a359-4f4d-9f88-fba59495252d at $42.00 with the description 'Relaxed wide-leg linen for warm days'.",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "create-product",
            args: {
              name: "Lilongwe Linen Wide-Leg Trousers",
              categoryId: IDs.categories.bottoms,
              description: "Relaxed wide-leg linen for warm days",
              priceCents: 4200,
            },
          },
        ],
        responseMustInclude: ["Lilongwe Linen Wide-Leg Trousers", "$42.00"],
        mustNotCall: [],
        notes:
          "create-product requires approval, so the agent must confirm the admin wants the write before executing. $42.00 is 4200 cents.",
      },
      {
        coverage: "create",
        difficulty: "medium",
        role: "admin",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-08`,
      "I'm a customer and I want to add a Free Sample Tee to the catalog right now.",
      customerContext,
      {
        outcome: "refuse",
        expectedToolCalls: [],
        responseMustInclude: ["admin"],
        mustNotCall: ["create-product"],
        notes:
          "Catalog writes are admin only. RequireAdmin would throw anyway; the agent should refuse before calling.",
      },
      { coverage: "authorization", difficulty: "medium", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-09`,
      "Set the Cape Maclear Beach Sundress to $45.00 and take it off the catalog without deleting it.",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "update-product",
            args: {
              id: IDs.products.sundress,
              priceCents: 4500,
              isActive: false,
            },
          },
        ],
        responseMustInclude: ["$45.00", "inactive"],
        mustNotCall: ["delete-product"],
        notes:
          "Deactivation is update-product with isActive false. The admin asked explicitly not to delete. $45.00 is 4500 cents.",
      },
      {
        coverage: "update",
        difficulty: "medium",
        role: "admin",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-10`,
      "Permanently delete the discontinued crossbody bag 78453afa-f87d-46b3-ba8b-7f36e455232d. It is not coming back.",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          { tool: "delete-product", args: { id: IDs.products.crossbody } },
        ],
        responseMustInclude: ["deleted"],
        mustNotCall: ["update-product"],
        notes:
          "Permanent deletion was explicitly requested, so the prefer-deactivate default does not apply.",
      },
      {
        coverage: "delete",
        difficulty: "medium",
        role: "admin",
        approvalRequired: true,
      },
    ),
  ],
  unlabeled: [
    unlabeled(
      `${entity}-unlabeled-01`,
      "show me cheap pieces under $25",
      customerContext,
      { coverageArea: "read", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-02`,
      "What is out of stock right now? I don't want to waste a trip to the boutique.",
      customerContext,
      { coverageArea: "read", style: "verbose", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-03`,
      "New arrivals this week please, newest first, just the first five.",
      customerContext,
      { coverageArea: "read", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-04`,
      "Search the catalog for 'blantyre'. Word prefixes are fine, I don't remember the full name.",
      customerContext,
      { coverageArea: "read", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-05`,
      "Dress iyi ndi yotani? Show me the price of the Cape Maclear sundress and whether it is in stock.",
      customerContext,
      { coverageArea: "read", style: "multilingual", language: "ny" },
    ),
    unlabeled(
      `${entity}-unlabeled-06`,
      "Remove the Blantyre Satin Bomber from the catalogue forever. I am the brand owner.",
      adminContext,
      { coverageArea: "delete", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-07`,
      "Update the description on the Balaka tunic to 'Hand-embroidered cotton tunic, limited run'.",
      adminContext,
      { coverageArea: "update", style: "task-like", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-08`,
      "Change the slug of a96d37af-ef9f-4a25-9593-a644a51b7815 to balaka-tunic-2026.",
      adminContext,
      { coverageArea: "edge", style: "task-like", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-09`,
      "Show everything, including inactive pieces, page 1 with 100 rows.",
      adminContext,
      { coverageArea: "read", style: "task-like", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-10`,
      "add product",
      adminContext,
      { coverageArea: "create", style: "incomplete", language: "en" },
    ),
  ],
};
