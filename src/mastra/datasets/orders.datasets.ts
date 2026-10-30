import { labeled, unlabeled } from "./builders";
import { adminContext, customerContext, IDs } from "./fixtures";
import type { EntityDatasetSpec } from "./types";

const entity = "orders";

export const ordersDatasets: EntityDatasetSpec = {
  entity,
  description:
    "Fashion order lifecycle scenarios against real order history (three paid and three cancelled orders): checkout, filtered history, order lookup, cancellation rules, empty-cart handling, and totals in dollars.",
  tools: ["checkout-order", "list-orders", "get-order", "cancel-order"],
  labeled: [
    labeled(
      `${entity}-labeled-01`,
      "Place the order from my cart. I confirm everything.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [{ tool: "checkout-order", args: {} }],
        responseMustInclude: ["pending", "$72.95"],
        mustNotCall: ["create-payment-intent"],
        notes:
          "checkout-order freezes the cart, reserves stock, and returns a pending order. The live cart subtotal is 7295 cents.",
      },
      {
        coverage: "create",
        difficulty: "medium",
        role: "customer",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-02`,
      "Show my latest orders.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          { tool: "list-orders", args: { sort: "newest" } },
        ],
        responseMustInclude: ["order"],
        mustNotCall: ["get-order"],
        notes: "A history request is a list; get-order needs an explicit ID.",
      },
      { coverage: "list", difficulty: "easy", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-03`,
      "Show my pending orders from October 2026 between $30 and $120.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-orders",
            args: {
              status: "pending",
              createdAfter: "2026-10-01",
              createdBefore: "2026-10-31",
              minTotalCents: 3000,
              maxTotalCents: 12000,
            },
          },
        ],
        responseMustInclude: ["pending"],
        mustNotCall: [],
        notes:
          "The date range is inclusive and expressed as YYYY-MM-DD. Totals are integer USD cents. The snapshot has no pending orders, so an empty result is correct.",
      },
      { coverage: "list-filters", difficulty: "hard", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-04`,
      "Page 2 of my paid orders, 5 per page, biggest total first.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-orders",
            args: { status: "paid", sort: "total_desc", page: 2, limit: 5 },
          },
        ],
        responseMustInclude: ["paid", "page 2"],
        mustNotCall: [],
        notes: "page wins over offset; limit caps at 100.",
      },
      { coverage: "pagination", difficulty: "medium", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-05`,
      "Show me order eb21a863-4675-470b-91d8-bfabb7b13404.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          { tool: "get-order", args: { id: IDs.orders.paid } },
        ],
        responseMustInclude: ["Balaka Embroidered Tunic"],
        mustNotCall: ["list-orders"],
        notes: "A single order with line details is get-order.",
      },
      { coverage: "read", difficulty: "easy", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-06`,
      "Cancel order 2b6f9c4a-1d7e-4f3a-9c58-6e0b8d2a4f17, the size is wrong.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          { tool: "cancel-order", args: { id: IDs.orders.pending } },
        ],
        responseMustInclude: ["cancelled"],
        mustNotCall: ["checkout-order"],
        notes:
          "Cancelling a pending order releases its stock hold. The pending order is a fixture because the live snapshot only has paid and cancelled orders.",
      },
      {
        coverage: "update",
        difficulty: "medium",
        role: "customer",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-07`,
      "Cancel order eb21a863-4675-470b-91d8-bfabb7b13404.",
      customerContext,
      {
        outcome: "answer",
        expectedToolCalls: [
          {
            tool: "get-order",
            args: { id: IDs.orders.paid },
            why: "Check the status before promising a cancellation.",
          },
        ],
        responseMustInclude: ["paid", "cannot be cancelled"],
        mustNotCall: ["cancel-order"],
        notes:
          "Paid orders are not cancellable. The agent should explain the return or refund path instead of calling cancel-order and surfacing a raw error.",
      },
      { coverage: "business-rule", difficulty: "hard", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-08`,
      "My cart is empty but check it out anyway.",
      customerContext,
      {
        outcome: "answer",
        expectedToolCalls: [
          {
            tool: "get-cart",
            args: {},
            why: "Verify the cart is empty before refusing.",
          },
        ],
        responseMustInclude: ["cart", "empty"],
        mustNotCall: ["checkout-order"],
        notes:
          "An empty cart cannot be checked out. The agent should verify rather than call checkout and let it fail.",
      },
      { coverage: "edge", difficulty: "medium", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-09`,
      "Show my oldest cancelled orders, page 2 with 5 per page.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-orders",
            args: { status: "cancelled", sort: "oldest", page: 2, limit: 5 },
          },
        ],
        responseMustInclude: ["cancelled"],
        mustNotCall: [],
        notes: "status is the cancelled enum, not a search string.",
      },
      { coverage: "pagination", difficulty: "medium", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-10`,
      "What did order 497e15e7-83f3-46ad-9fcb-4ccb28132bb4 cost?",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          { tool: "get-order", args: { id: IDs.orders.paidMulti } },
        ],
        responseMustInclude: ["$76.48"],
        mustNotCall: [],
        notes:
          "The stored total is 7648 integer cents; the reply must present it as $76.48.",
      },
      { coverage: "formatting", difficulty: "easy", role: "customer" },
    ),
  ],
  unlabeled: [
    unlabeled(
      `${entity}-unlabeled-01`,
      "Where is my order eb21a863-4675-470b-91d8-bfabb7b13404?",
      customerContext,
      { coverageArea: "read", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-02`,
      "my orders",
      customerContext,
      { coverageArea: "read", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-03`,
      "Show pending ones only.",
      customerContext,
      { coverageArea: "read", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-04`,
      "Orders above $100.",
      customerContext,
      { coverageArea: "read", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-05`,
      "Cancel my last order.",
      customerContext,
      { coverageArea: "update", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-06`,
      "checkout",
      customerContext,
      { coverageArea: "create", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-07`,
      "Has order d7e804f2-589c-478d-b27e-7a7ccb959956 been cancelled already?",
      customerContext,
      { coverageArea: "read", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-08`,
      "How much have I spent on paid orders altogether?",
      customerContext,
      { coverageArea: "read", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-09`,
      "Show me order 5a1c7e9b-3f2d-4a68-b0c9-8d4e1f7a2b63. It belongs to a customer who called the shop.",
      adminContext,
      { coverageArea: "edge", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-10`,
      "Can I cancel a paid order?",
      customerContext,
      { coverageArea: "policy-question", style: "conversational", language: "en" },
    ),
  ],
};
