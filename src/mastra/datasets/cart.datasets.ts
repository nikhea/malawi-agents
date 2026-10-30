import { labeled, unlabeled } from "./builders";
import { customerContext, IDs } from "./fixtures";
import type { EntityDatasetSpec } from "./types";

const entity = "cart";

export const cartDatasets: EntityDatasetSpec = {
  entity,
  description:
    "Authenticated cart scenarios against the real cart snapshot (Balaka tunic S and Thyolo poplin shirt XS, $72.95): reading and filtering lines, adding garments and size variants, quantity updates including zero, line removal, clearing, and cart line versus product ID confusion.",
  tools: [
    "get-cart",
    "add-cart-item",
    "set-cart-item-qty",
    "remove-cart-item",
    "clear-cart",
  ],
  labeled: [
    labeled(
      `${entity}-labeled-01`,
      "What's in my cart?",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [{ tool: "get-cart", args: {} }],
        responseMustInclude: ["Balaka Embroidered Tunic", "$72.95"],
        mustNotCall: ["list-products"],
        notes:
          "An empty filter object returns the whole active cart. The live subtotal is 7295 cents, shown as $72.95.",
      },
      { coverage: "read", difficulty: "easy", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-02`,
      "Show only the cart lines for the Balaka tunic, most expensive first, page 1 with 5 lines.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "get-cart",
            args: {
              productId: IDs.products.tunic,
              sort: "price_desc",
              page: 1,
              limit: 5,
            },
          },
        ],
        responseMustInclude: ["tunic"],
        mustNotCall: [],
        notes: "Filtering happens server-side; do not list the whole cart and eyeball it.",
      },
      { coverage: "list-filters", difficulty: "medium", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-03`,
      "Add the Blantyre Mini Crossbody Bag to my cart.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "add-cart-item",
            args: { productId: IDs.products.crossbody, qty: 1 },
          },
        ],
        responseMustInclude: ["crossbody"],
        mustNotCall: [],
        notes:
          "qty is required and must be at least 1; defaulting an unspecified quantity to 1 is correct.",
      },
      {
        coverage: "create",
        difficulty: "easy",
        role: "customer",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-04`,
      "Add 3 of the tunic in XL.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-products",
            args: { query: "Balaka Embroidered Tunic" },
            why: "Resolve the tunic product ID.",
          },
          {
            tool: "add-cart-item",
            args: {
              productId: IDs.products.tunic,
              variantId: IDs.variants.tunicXl,
              qty: 3,
            },
            why: "Add the resolved XL variant.",
          },
        ],
        responseMustInclude: ["XL", "3"],
        mustNotCall: [],
        notes:
          "add-cart-item needs a productId and a variantId. The prompt gives neither ID, so both must be resolved.",
      },
      {
        coverage: "resolve-then-add",
        difficulty: "hard",
        role: "customer",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-05`,
      "Change the tunic small cart line to 2.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "get-cart",
            args: { productId: IDs.products.tunic },
            why: "Find the tunic cart line.",
          },
          {
            tool: "set-cart-item-qty",
            args: { itemId: IDs.cart.tunicSLine, qty: 2 },
            why: "Set the resolved line quantity.",
          },
        ],
        responseMustInclude: ["2"],
        mustNotCall: ["add-cart-item"],
        notes:
          "set-cart-item-qty takes a cart line ID, not a product ID. The line ID is 3c60fce9-3c54-48e1-8fcf-3355b8cce6ac.",
      },
      {
        coverage: "update",
        difficulty: "medium",
        role: "customer",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-06`,
      "Remove the poplin shirt cart line by setting it to zero.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "set-cart-item-qty",
            args: { itemId: IDs.cart.shirtXsLine, qty: 0 },
          },
        ],
        responseMustInclude: ["removed"],
        mustNotCall: ["remove-cart-item"],
        notes:
          "qty 0 is a documented removal path. Either set-cart-item-qty with 0 or remove-cart-item is defensible, but the customer named the zero path.",
      },
      {
        coverage: "delete",
        difficulty: "medium",
        role: "customer",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-07`,
      "Remove line 6f76ad1b-a218-4451-9514-20db065e0e56 from my cart.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          { tool: "remove-cart-item", args: { itemId: IDs.cart.shirtXsLine } },
        ],
        responseMustInclude: ["removed"],
        mustNotCall: ["set-cart-item-qty"],
        notes: "A direct line removal was requested with a line ID.",
      },
      {
        coverage: "delete",
        difficulty: "easy",
        role: "customer",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-08`,
      "Empty my whole cart.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [{ tool: "clear-cart", args: {} }],
        responseMustInclude: ["empty"],
        mustNotCall: ["remove-cart-item"],
        notes: "One clear-cart call replaces per-line removals.",
      },
      {
        coverage: "delete",
        difficulty: "easy",
        role: "customer",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-09`,
      "Change the quantity of the Balaka tunic to 4 in my cart.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "get-cart",
            args: { productId: IDs.products.tunic },
            why: "Find the cart line that belongs to the tunic.",
          },
          {
            tool: "set-cart-item-qty",
            args: { itemId: IDs.cart.tunicSLine, qty: 4 },
            why: "Update the resolved cart line.",
          },
        ],
        responseMustInclude: ["4"],
        mustNotCall: [],
        notes:
          "set-cart-item-qty takes a cart line ID, not a product ID. Passing the product ID must fail.",
      },
      {
        coverage: "resolve-then-update",
        difficulty: "hard",
        role: "customer",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-10`,
      "Add zero units of the crossbody bag, I'm just checking.",
      customerContext,
      {
        outcome: "clarify",
        expectedToolCalls: [],
        responseMustInclude: ["at least 1"],
        mustNotCall: ["add-cart-item"],
        notes:
          "add-cart-item requires qty >= 1. The agent should push back rather than call with 0 or silently use 1.",
      },
      {
        coverage: "validation",
        difficulty: "medium",
        role: "customer",
        approvalRequired: true,
      },
    ),
  ],
  unlabeled: [
    unlabeled(
      `${entity}-unlabeled-01`,
      "cart please",
      customerContext,
      { coverageArea: "read", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-02`,
      "Show my cart lines sorted cheapest first.",
      customerContext,
      { coverageArea: "read", style: "task-like", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-03`,
      "Add the poplin shirt to my basket.",
      customerContext,
      { coverageArea: "create", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-04`,
      "Add 2 of the tunic in small please.",
      customerContext,
      { coverageArea: "create", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-05`,
      "Update the tunic cart line to qty 10.",
      customerContext,
      { coverageArea: "update", style: "task-like", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-06`,
      "Remove the tunic from my basket.",
      customerContext,
      { coverageArea: "delete", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-07`,
      "Clear my cart and then add two crossbody bags.",
      customerContext,
      { coverageArea: "edge", style: "task-like", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-08`,
      "Is my cart empty?",
      customerContext,
      { coverageArea: "read", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-09`,
      "Add -1 crossbody, remove one I mean.",
      customerContext,
      { coverageArea: "edge", style: "typo", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-10`,
      "What's my subtotal so far?",
      customerContext,
      { coverageArea: "read", style: "conversational", language: "en" },
    ),
  ],
};
