import { labeled, unlabeled } from "./builders";
import { adminContext, customerContext, IDs } from "./fixtures";
import type { EntityDatasetSpec } from "./types";

const entity = "inventory";

export const inventoryDatasets: EntityDatasetSpec = {
  entity,
  description:
    "Fashion stock scenarios against real products and size variants: on-hand/reserved/available reads, restocking, variant holds with TTL, idempotent release and confirm, admin authorization, and insufficient stock.",
  tools: [
    "get-stock",
    "set-stock",
    "reserve-stock",
    "release-stock",
    "confirm-stock",
  ],
  labeled: [
    labeled(
      `${entity}-labeled-01`,
      "How much Balaka tunic stock is available?",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-products",
            args: { query: "Balaka Embroidered Tunic" },
            why: "Resolve the product ID from its name.",
          },
          {
            tool: "get-stock",
            args: { productId: IDs.products.tunic },
            why: "Read stock for the resolved product.",
          },
        ],
        responseMustInclude: ["available"],
        mustNotCall: [],
        notes:
          "get-stock returns on-hand, reserved, and available. Report available as the sellable figure.",
      },
      { coverage: "read", difficulty: "medium", role: "admin" },
    ),
    labeled(
      `${entity}-labeled-02`,
      "Check stock for variant cd873deb-a205-47b2-8f8f-31613a642cb3.",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "get-stock",
            args: {
              productId: IDs.products.poplinShirt,
              variantId: IDs.variants.shirtXs,
            },
          },
        ],
        responseMustInclude: ["available"],
        mustNotCall: [],
        notes:
          "Variant stock needs both productId and variantId. A product-only read would return the rolled-up number.",
      },
      { coverage: "read", difficulty: "medium", role: "admin" },
    ),
    labeled(
      `${entity}-labeled-03`,
      "Restock the Blantyre Mini Crossbody Bag to 120 units.",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-products",
            args: { query: "Blantyre Mini Crossbody Bag" },
            why: "Resolve the product ID from its name.",
          },
          {
            tool: "set-stock",
            args: { productId: IDs.products.crossbody, qty: 120 },
            why: "Set on-hand stock for the resolved product.",
          },
        ],
        responseMustInclude: ["120"],
        mustNotCall: [],
        notes:
          "set-stock sets the on-hand quantity; it is not an increment. Approval is required.",
      },
      {
        coverage: "update",
        difficulty: "medium",
        role: "admin",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-04`,
      "Mark the tunic large variant as sold out by setting its stock to zero.",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-products",
            args: { query: "Balaka Embroidered Tunic" },
            why: "Resolve the product ID.",
          },
          {
            tool: "set-stock",
            args: {
              productId: IDs.products.tunic,
              variantId: IDs.variants.tunicL,
              qty: 0,
            },
            why: "Zero the large variant stock.",
          },
        ],
        responseMustInclude: ["sold out"],
        mustNotCall: ["update-variant"],
        notes:
          "Zero is valid for set-stock. Deactivating the variant is a different action that the admin did not request.",
      },
      {
        coverage: "update",
        difficulty: "hard",
        role: "admin",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-05`,
      "Reserve stock for order 2b6f9c4a-1d7e-4f3a-9c58-6e0b8d2a4f17: 2 of the Balaka tunic and 1 of the shirt XS variant. Hold it for 15 minutes.",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "reserve-stock",
            args: {
              orderRef: "2b6f9c4a-1d7e-4f3a-9c58-6e0b8d2a4f17",
              lines: [
                { productId: IDs.products.tunic, qty: 2 },
                {
                  productId: IDs.products.poplinShirt,
                  variantId: IDs.variants.shirtXs,
                  qty: 1,
                },
              ],
              ttlSeconds: 900,
            },
          },
        ],
        responseMustInclude: ["reserved"],
        mustNotCall: [],
        notes:
          "15 minutes is 900 seconds. The reservation is atomic, so both lines belong in one call rather than two.",
      },
      {
        coverage: "reserve",
        difficulty: "hard",
        role: "admin",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-06`,
      "Release the stock hold for order 2b6f9c4a-1d7e-4f3a-9c58-6e0b8d2a4f17.",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "release-stock",
            args: { orderRef: "2b6f9c4a-1d7e-4f3a-9c58-6e0b8d2a4f17" },
          },
        ],
        responseMustInclude: ["released"],
        mustNotCall: ["confirm-stock"],
        notes: "release-stock is idempotent and takes only the order reference.",
      },
      {
        coverage: "release",
        difficulty: "easy",
        role: "admin",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-07`,
      "Confirm the hold for order 2b6f9c4a-1d7e-4f3a-9c58-6e0b8d2a4f17 so it counts as sales.",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "confirm-stock",
            args: { orderRef: "2b6f9c4a-1d7e-4f3a-9c58-6e0b8d2a4f17" },
          },
        ],
        responseMustInclude: ["confirmed"],
        mustNotCall: ["release-stock"],
        notes:
          "Confirm converts the hold to a sale. It is idempotent, so a retry is safe.",
      },
      {
        coverage: "confirm",
        difficulty: "easy",
        role: "admin",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-08`,
      "How many Balaka tunics do you have in stock?",
      customerContext,
      {
        outcome: "refuse",
        expectedToolCalls: [],
        responseMustInclude: ["admin"],
        mustNotCall: ["get-stock", "set-stock"],
        notes:
          "Inventory reads are admin only. Customers should be pointed at product stock badges instead.",
      },
      { coverage: "authorization", difficulty: "medium", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-09`,
      "Reserve 500 units of the Balaka tunic for order 2b6f9c4a-1d7e-4f3a-9c58-6e0b8d2a4f17.",
      adminContext,
      {
        outcome: "answer",
        expectedToolCalls: [
          {
            tool: "list-products",
            args: { query: "Balaka Embroidered Tunic" },
            why: "Resolve the product ID.",
          },
          {
            tool: "get-stock",
            args: { productId: IDs.products.tunic },
            why: "Check available stock before attempting the hold.",
          },
        ],
        responseMustInclude: ["available"],
        mustNotCall: ["reserve-stock"],
        notes:
          "500 units exceed on-hand. Check first and explain the shortfall instead of triggering an atomic reservation failure.",
      },
      {
        coverage: "insufficient-stock",
        difficulty: "hard",
        role: "admin",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-10`,
      "Reserve stock for order 2b6f9c4a-1d7e-4f3a-9c58-6e0b8d2a4f17: two tunics and one poplin shirt. I don't have the product IDs handy.",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-products",
            args: { query: "Balaka Embroidered Tunic" },
            why: "Resolve the tunic product ID.",
          },
          {
            tool: "list-products",
            args: { query: "Thyolo Oversized Poplin Shirt" },
            why: "Resolve the shirt product ID.",
          },
          {
            tool: "reserve-stock",
            args: {
              orderRef: "2b6f9c4a-1d7e-4f3a-9c58-6e0b8d2a4f17",
              lines: [
                { productId: IDs.products.tunic, qty: 2 },
                { productId: IDs.products.poplinShirt, qty: 1 },
              ],
            },
            why: "Reserve both lines atomically once the IDs are known.",
          },
        ],
        responseMustInclude: ["reserved"],
        mustNotCall: [],
        notes:
          "A reservation needs product IDs. Guessing or inventing IDs is a failure.",
      },
      {
        coverage: "resolve-then-reserve",
        difficulty: "hard",
        role: "admin",
        approvalRequired: true,
      },
    ),
  ],
  unlabeled: [
    unlabeled(
      `${entity}-unlabeled-01`,
      "stock for a96d37af-ef9f-4a25-9593-a644a51b7815",
      adminContext,
      { coverageArea: "read", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-02`,
      "How many are reserved versus available for the tunic small variant?",
      adminContext,
      { coverageArea: "read", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-03`,
      "Add 50 to the crossbody bag stock.",
      adminContext,
      { coverageArea: "update", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-04`,
      "Set the Balaka tunic stock to -5.",
      adminContext,
      { coverageArea: "edge", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-05`,
      "Hold 3 satin bombers for order REF-77.",
      adminContext,
      { coverageArea: "reserve", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-06`,
      "Release REF-77.",
      adminContext,
      { coverageArea: "release", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-07`,
      "Confirm REF-77 twice, I want to be sure.",
      adminContext,
      { coverageArea: "confirm", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-08`,
      "Is the Balaka tunic in stock?",
      customerContext,
      { coverageArea: "authorization", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-09`,
      "Restock everything to 100 units.",
      adminContext,
      { coverageArea: "capability-boundary", style: "task-like", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-10`,
      "What is the default hold time if I don't pass a TTL?",
      adminContext,
      { coverageArea: "policy-question", style: "conversational", language: "en" },
    ),
  ],
};
