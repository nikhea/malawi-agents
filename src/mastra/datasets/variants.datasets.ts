import { labeled, unlabeled } from "./builders";
import { adminContext, customerContext, IDs, SKUS } from "./fixtures";
import type { EntityDatasetSpec } from "./types";

const entity = "variants";

export const variantsDatasets: EntityDatasetSpec = {
  entity,
  description:
    "Sellable size-variant scenarios against real SKUs: listing variants, resolving a garment from prose, admin create/update/delete, authorization, and immutable identifiers. Prices are integer USD cents.",
  tools: [
    "list-variants",
    "create-variant",
    "update-variant",
    "delete-variant",
  ],
  labeled: [
    labeled(
      `${entity}-labeled-01`,
      "Which sizes of the Balaka Embroidered Tunic can I buy?",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-products",
            args: { query: "Balaka Embroidered Tunic" },
            why: "The customer gave a product name, not an ID.",
          },
          {
            tool: "list-variants",
            args: { productId: IDs.products.tunic },
            why: "List sizes for the resolved tunic.",
          },
        ],
        responseMustInclude: ["S", "L", "XL"],
        mustNotCall: ["get-product"],
        notes:
          "The snapshot has S, L, and XL for this tunic; there is no M. Inventing a size is a failure.",
      },
      { coverage: "resolve-then-list", difficulty: "medium", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-02`,
      "What variants does the Thyolo Oversized Poplin Shirt have?",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-products",
            args: { query: "Thyolo Oversized Poplin Shirt" },
            why: "The customer gave a product name, not an ID.",
          },
          {
            tool: "list-variants",
            args: { productId: IDs.products.poplinShirt },
            why: "List SKUs for the resolved shirt.",
          },
        ],
        responseMustInclude: ["XS"],
        mustNotCall: [],
        notes:
          "list-variants requires a productId. Guessing an ID or asking the customer for one is a failure.",
      },
      { coverage: "resolve-then-list", difficulty: "hard", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-03`,
      "Add a medium variant for the Balaka tunic with SKU balaka-embroidered-tunic-m at $38.24.",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "create-variant",
            args: {
              productId: IDs.products.tunic,
              name: "M",
              sku: SKUS.tunicM,
              priceCents: 3824,
            },
          },
        ],
        responseMustInclude: [SKUS.tunicM, "$38.24"],
        mustNotCall: [],
        notes: "$38.24 is 3824 integer cents, matching the current tunic price.",
      },
      {
        coverage: "create",
        difficulty: "medium",
        role: "admin",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-04`,
      "Change the price of the tunic large variant to $39.00.",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-products",
            args: { query: "Balaka Embroidered Tunic" },
            why: "Resolve the product before touching its variants.",
          },
          {
            tool: "update-variant",
            args: { id: IDs.variants.tunicL, priceCents: 3900 },
            why: "Update the large variant price.",
          },
        ],
        responseMustInclude: ["$39.00"],
        mustNotCall: ["create-variant"],
        notes:
          "The prompt names a product and a size, not a variant ID. $39.00 is 3900 cents.",
      },
      {
        coverage: "update",
        difficulty: "medium",
        role: "admin",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-05`,
      "Rename the tunic small variant to 'Small / Natural' and hide it from sale.",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-products",
            args: { query: "Balaka Embroidered Tunic" },
            why: "Resolve the product before touching its variants.",
          },
          {
            tool: "update-variant",
            args: {
              id: IDs.variants.tunicS,
              name: "Small / Natural",
              isActive: false,
            },
            why: "Rename and deactivate the small variant.",
          },
        ],
        responseMustInclude: ["Small / Natural", "inactive"],
        mustNotCall: ["delete-variant"],
        notes: "Hiding is isActive false, not a delete.",
      },
      {
        coverage: "update",
        difficulty: "hard",
        role: "admin",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-06`,
      "Delete variant cd873deb-a205-47b2-8f8f-31613a642cb3, it is discontinued.",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          { tool: "delete-variant", args: { id: IDs.variants.shirtXs } },
        ],
        responseMustInclude: ["deleted"],
        mustNotCall: [],
        notes: "Permanent delete was requested explicitly.",
      },
      {
        coverage: "delete",
        difficulty: "easy",
        role: "admin",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-07`,
      "Add an XXL variant called XXL with SKU thyolo-oversized-poplin-shirt-xxl to the poplin shirt.",
      customerContext,
      {
        outcome: "refuse",
        expectedToolCalls: [],
        responseMustInclude: ["admin"],
        mustNotCall: ["create-variant"],
        notes: "Variant writes are admin only.",
      },
      { coverage: "authorization", difficulty: "easy", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-08`,
      "Drop the price of the tunic small variant to $1 and see if it sticks.",
      customerContext,
      {
        outcome: "refuse",
        expectedToolCalls: [],
        responseMustInclude: ["admin"],
        mustNotCall: ["update-variant"],
        notes: "Price changes are admin only even when framed as a test.",
      },
      { coverage: "authorization", difficulty: "medium", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-09`,
      "Change the SKU of the tunic small variant to balaka-embroidered-tunic-xs.",
      adminContext,
      {
        outcome: "answer",
        expectedToolCalls: [],
        responseMustInclude: ["SKU", "cannot be changed"],
        mustNotCall: ["update-variant", "create-variant"],
        notes:
          "update-variant has no sku field. The agent should explain that a SKU change means creating a new variant and retiring the old one.",
      },
      { coverage: "immutable-field", difficulty: "hard", role: "admin" },
    ),
    labeled(
      `${entity}-labeled-10`,
      "How much is the Balaka Embroidered Tunic in large?",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-products",
            args: { query: "Balaka Embroidered Tunic" },
            why: "Resolve the tunic from its name.",
          },
          {
            tool: "list-variants",
            args: { productId: IDs.products.tunic },
            why: "Read the large variant price.",
          },
        ],
        responseMustInclude: ["$38.24"],
        mustNotCall: [],
        notes:
          "The answer must quote the variant price in dollars, not raw cents. 3824 cents is $38.24.",
      },
      { coverage: "resolve-then-read", difficulty: "hard", role: "customer" },
    ),
  ],
  unlabeled: [
    unlabeled(
      `${entity}-unlabeled-01`,
      "List the variants for 63bc9a7a-2299-4db5-8096-cf6477623682.",
      customerContext,
      { coverageArea: "read", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-02`,
      "Create an XXL variant for the poplin shirt with SKU thyolo-oversized-poplin-shirt-xxl. No price yet.",
      adminContext,
      { coverageArea: "create", style: "task-like", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-03`,
      "Rename the shirt XS variant to 'XS / White'.",
      adminContext,
      { coverageArea: "update", style: "task-like", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-04`,
      "Delete the shirt XS variant and tell me what happens to carts that already have it.",
      adminContext,
      { coverageArea: "delete", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-05`,
      "Deactivate every tunic variant, we are between drops.",
      customerContext,
      { coverageArea: "update", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-06`,
      "Which SKUs exist for the Blantyre Satin Bomber?",
      customerContext,
      { coverageArea: "read", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-07`,
      "Are there any inactive variants for the Balaka tunic?",
      adminContext,
      { coverageArea: "read", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-08`,
      "Set the tunic large variant price to zero so it shows as free.",
      adminContext,
      { coverageArea: "edge", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-09`,
      "Create another variant with SKU balaka-embroidered-tunic-s for the tunic.",
      adminContext,
      { coverageArea: "edge", style: "task-like", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-10`,
      "varients for the balaka tunic? and prices in dollars please",
      customerContext,
      { coverageArea: "read", style: "typo", language: "en" },
    ),
  ],
};
