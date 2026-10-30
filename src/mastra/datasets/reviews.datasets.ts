import { labeled, unlabeled } from "./builders";
import { adminContext, customerContext, IDs } from "./fixtures";
import type { EntityDatasetSpec } from "./types";

const entity = "reviews";

export const reviewsDatasets: EntityDatasetSpec = {
  entity,
  description:
    "Fashion review scenarios against real products: fit and fabric feedback, public summaries and filters, one review per customer per piece, editing and deleting your own review, admin moderation, and rating validation.",
  tools: [
    "get-product-reviews",
    "create-review",
    "update-review",
    "delete-review",
    "delete-any-review",
  ],
  labeled: [
    labeled(
      `${entity}-labeled-01`,
      "What do customers say about the Balaka Embroidered Tunic?",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-products",
            args: { query: "Balaka Embroidered Tunic" },
            why: "Resolve the product ID from its name.",
          },
          {
            tool: "get-product-reviews",
            args: { productId: IDs.products.tunic },
            why: "Read the review summary.",
          },
        ],
        responseMustInclude: ["rating", "review"],
        mustNotCall: ["get-product"],
        notes:
          "The summary already includes average rating, count, and reviews. get-product is not needed.",
      },
      { coverage: "read", difficulty: "medium", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-02`,
      "Show the 5-star reviews for a96d37af-ef9f-4a25-9593-a644a51b7815, highest first, page 1 with 5.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "get-product-reviews",
            args: {
              productId: IDs.products.tunic,
              rating: 5,
              sort: "highest",
              page: 1,
              limit: 5,
            },
          },
        ],
        responseMustInclude: ["5-star"],
        mustNotCall: [],
        notes: "rating is an exact star filter, not a minimum.",
      },
      { coverage: "list-filters", difficulty: "medium", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-03`,
      "Find reviews for 63bc9a7a-2299-4db5-8096-cf6477623682 that mention 'shrunk', lowest rated first.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "get-product-reviews",
            args: {
              productId: IDs.products.poplinShirt,
              query: "shrunk",
              sort: "lowest",
            },
          },
        ],
        responseMustInclude: ["shrunk"],
        mustNotCall: [],
        notes: "query is a substring search across title, body, and author.",
      },
      { coverage: "list-filters", difficulty: "medium", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-04`,
      "Review the Balaka tunic with 4 stars, title 'Lovely embroidery', body 'The neckline detail is beautiful and the fit is true to size.'",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-products",
            args: { query: "Balaka Embroidered Tunic" },
            why: "Resolve the product ID.",
          },
          {
            tool: "create-review",
            args: {
              productId: IDs.products.tunic,
              rating: 4,
              title: "Lovely embroidery",
              body: "The neckline detail is beautiful and the fit is true to size.",
            },
            why: "Write the review against the resolved product.",
          },
        ],
        responseMustInclude: ["4"],
        mustNotCall: [],
        notes: "Write actions are approval-gated.",
      },
      {
        coverage: "create",
        difficulty: "medium",
        role: "customer",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-05`,
      "Write another 5-star review for a96d37af-ef9f-4a25-9593-a644a51b7815. I already reviewed it once.",
      customerContext,
      {
        outcome: "answer",
        expectedToolCalls: [
          {
            tool: "get-product-reviews",
            args: { productId: IDs.products.tunic },
            why: "Check for the customer's existing review.",
          },
        ],
        responseMustInclude: ["one review"],
        mustNotCall: ["create-review"],
        notes:
          "Each customer may have one review per product. The agent should offer update-review instead of creating a duplicate.",
      },
      {
        coverage: "business-rule",
        difficulty: "hard",
        role: "customer",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-06`,
      "Change my review rev_5001 to 3 stars and the title to 'Okay'.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "update-review",
            args: { reviewId: IDs.reviews.own, rating: 3, title: "Okay" },
          },
        ],
        responseMustInclude: ["3"],
        mustNotCall: ["create-review"],
        notes: "The body is untouched and should stay omitted from the patch.",
      },
      {
        coverage: "update",
        difficulty: "easy",
        role: "customer",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-07`,
      "Delete my review rev_5001.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          { tool: "delete-review", args: { reviewId: IDs.reviews.own } },
        ],
        responseMustInclude: ["deleted"],
        mustNotCall: ["delete-any-review"],
        notes:
          "A customer's own review uses delete-review. delete-any-review is the admin moderation path.",
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
      "As an admin, remove review rev_5002 by another customer.",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "delete-any-review",
            args: { reviewId: IDs.reviews.anotherCustomer },
          },
        ],
        responseMustInclude: ["deleted"],
        mustNotCall: ["delete-review"],
        notes:
          "delete-review only removes the caller's own review, so moderation needs delete-any-review.",
      },
      {
        coverage: "moderation",
        difficulty: "medium",
        role: "admin",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-09`,
      "Delete review rev_5002. It was written by someone else but I don't like it.",
      customerContext,
      {
        outcome: "refuse",
        expectedToolCalls: [],
        responseMustInclude: ["admin"],
        mustNotCall: ["delete-any-review", "delete-review"],
        notes:
          "Customers cannot moderate other customers' reviews. delete-review would target the caller's own review and must not be used as a workaround.",
      },
      { coverage: "authorization", difficulty: "medium", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-10`,
      "Give the Balaka tunic a 6-star review.",
      customerContext,
      {
        outcome: "clarify",
        expectedToolCalls: [],
        responseMustInclude: ["1 to 5"],
        mustNotCall: ["create-review"],
        notes:
          "rating must be an integer from 1 to 5. The agent should ask for a valid rating instead of calling and failing.",
      },
      {
        coverage: "validation",
        difficulty: "easy",
        role: "customer",
        approvalRequired: true,
      },
    ),
  ],
  unlabeled: [
    unlabeled(
      `${entity}-unlabeled-01`,
      "reviews for the Blantyre Satin Bomber",
      customerContext,
      { coverageArea: "read", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-02`,
      "Only the 1-star reviews, newest first.",
      customerContext,
      { coverageArea: "read", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-03`,
      "How many reviews does the tunic have and what is the average?",
      customerContext,
      { coverageArea: "read", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-04`,
      "Review the poplin shirt 5 stars, title 'Perfect for church'.",
      customerContext,
      { coverageArea: "create", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-05`,
      "Edit my review to mention that the delivery arrived late.",
      customerContext,
      { coverageArea: "update", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-06`,
      "Delete my review for the tunic.",
      customerContext,
      { coverageArea: "delete", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-07`,
      "Remove review rev_5002.",
      customerContext,
      { coverageArea: "authorization", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-08`,
      "Reviews mentioning fit, page 2 please.",
      customerContext,
      { coverageArea: "read", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-09`,
      "What's the average rating for the crossbody bag?",
      customerContext,
      { coverageArea: "read", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-10`,
      "rev_5001",
      customerContext,
      { coverageArea: "edge", style: "incomplete", language: "en" },
    ),
  ],
};
