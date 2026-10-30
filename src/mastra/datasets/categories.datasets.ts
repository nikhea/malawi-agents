import { labeled, unlabeled } from "./builders";
import { adminContext, customerContext, IDs, SLUGS } from "./fixtures";
import type { EntityDatasetSpec } from "./types";

const entity = "categories";

export const categoriesDatasets: EntityDatasetSpec = {
  entity,
  description:
    "Fashion category tree scenarios against real storefront categories: filtered listing, root and empty-category filters, lookup by id and slug, admin create/update/delete, parent moves, and authorization.",
  tools: [
    "list-categories",
    "get-category",
    "create-category",
    "update-category",
    "delete-category",
  ],
  labeled: [
    labeled(
      `${entity}-labeled-01`,
      "Show me the subcategories under Outerwear, sorted by name.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-categories",
            args: { parentId: IDs.categories.outerwear, sort: "name_asc" },
          },
        ],
        responseMustInclude: ["outerwear"],
        mustNotCall: ["get-category"],
        notes: "parentId scopes the list; sort is name_asc, not relevance.",
      },
      { coverage: "list-filters", difficulty: "easy", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-02`,
      "Which top-level categories actually have products in them?",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-categories",
            args: { rootOnly: true, hasProducts: true },
          },
        ],
        responseMustInclude: ["categories"],
        mustNotCall: [],
        notes: "rootOnly and hasProducts are independent boolean filters.",
      },
      { coverage: "list-filters", difficulty: "medium", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-03`,
      "Which categories are completely empty?",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          { tool: "list-categories", args: { hasProducts: false } },
        ],
        responseMustInclude: ["empty"],
        mustNotCall: [],
        notes:
          "hasProducts false means categories without active products, not a falsy search term.",
      },
      { coverage: "list-filters", difficulty: "easy", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-04`,
      "Open category 2f11dedb-ec0d-4cbf-9a77-fc601e84b316.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          { tool: "get-category", args: { id: IDs.categories.dresses } },
        ],
        responseMustInclude: ["Dresses"],
        mustNotCall: ["list-categories"],
        notes: "The customer supplied a category ID directly.",
      },
      { coverage: "read", difficulty: "easy", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-05`,
      "Show the outerwear category by its slug, outerwear.",
      customerContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          { tool: "get-category", args: { slug: SLUGS.outerwearCategory } },
        ],
        responseMustInclude: ["Outerwear"],
        mustNotCall: ["list-categories"],
        notes:
          "get-category accepts exactly one of id or slug; a slug lookup needs no prior list.",
      },
      { coverage: "read", difficulty: "easy", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-06`,
      "Create a category called Resort Wear under 0bbfb033-0407-4d3e-97b8-535d91d28ad3 with the description 'Beach and holiday pieces'.",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "create-category",
            args: {
              name: "Resort Wear",
              parentId: IDs.categories.outerwear,
              description: "Beach and holiday pieces",
            },
          },
        ],
        responseMustInclude: ["Resort Wear"],
        mustNotCall: [],
        notes:
          "The slug is omitted on purpose so the tool generates it from the name.",
      },
      {
        coverage: "create",
        difficulty: "medium",
        role: "admin",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-07`,
      "Rename the Accessories category to Bags & Accessories and make sure it sits at the top level.",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "update-category",
            args: {
              id: IDs.categories.accessories,
              name: "Bags & Accessories",
              clearParent: true,
            },
          },
        ],
        responseMustInclude: ["Bags & Accessories"],
        mustNotCall: ["delete-category"],
        notes:
          "clearParent true detaches the category; sending parentId null would be the wrong shape.",
      },
      {
        coverage: "update",
        difficulty: "medium",
        role: "admin",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-08`,
      "Delete category edc87af0-a359-4f4d-9f88-fba59495252d. Its child categories should stay in the store.",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          { tool: "delete-category", args: { id: IDs.categories.bottoms } },
        ],
        responseMustInclude: ["root"],
        mustNotCall: [],
        notes:
          "Deleting a category promotes its children to root rather than cascading the delete. The reply should say so.",
      },
      {
        coverage: "delete",
        difficulty: "medium",
        role: "admin",
        approvalRequired: true,
      },
    ),
    labeled(
      `${entity}-labeled-09`,
      "Please create a category called Clearance for me. I am a customer.",
      customerContext,
      {
        outcome: "refuse",
        expectedToolCalls: [],
        responseMustInclude: ["admin"],
        mustNotCall: ["create-category"],
        notes: "Category writes are admin only.",
      },
      { coverage: "authorization", difficulty: "easy", role: "customer" },
    ),
    labeled(
      `${entity}-labeled-10`,
      "Delete the outerwear category.",
      adminContext,
      {
        outcome: "tool-call",
        expectedToolCalls: [
          {
            tool: "list-categories",
            args: { query: "outerwear" },
            why: "Resolve the category name to its ID first.",
          },
          {
            tool: "delete-category",
            args: { id: IDs.categories.outerwear },
            why: "Delete the resolved category.",
          },
        ],
        responseMustInclude: ["deleted"],
        mustNotCall: [],
        notes:
          "The prompt names the category but does not give an ID. Passing a name into delete-category would fail.",
      },
      {
        coverage: "resolve-then-delete",
        difficulty: "hard",
        role: "admin",
        approvalRequired: true,
      },
    ),
  ],
  unlabeled: [
    unlabeled(
      `${entity}-unlabeled-01`,
      "list all categories",
      customerContext,
      { coverageArea: "read", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-02`,
      "Page 2 of categories sorted by product count, highest first, 5 per page.",
      customerContext,
      { coverageArea: "read", style: "task-like", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-03`,
      "Open the dresses category. I only know it as dresses.",
      customerContext,
      { coverageArea: "read", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-04`,
      "Delete edc87af0-a359-4f4d-9f88-fba59495252d for me.",
      adminContext,
      { coverageArea: "delete", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-05`,
      "Move Accessories under Outerwear.",
      adminContext,
      { coverageArea: "update", style: "task-like", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-06`,
      "Create a category called Bridal. No parent, no description.",
      adminContext,
      { coverageArea: "create", style: "task-like", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-07`,
      "I want to rename the dresses category to Dresses & Gowns.",
      customerContext,
      { coverageArea: "update", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-08`,
      "Which root categories have no pieces at all?",
      customerContext,
      { coverageArea: "read", style: "conversational", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-09`,
      "What slug should I use for the dresses category?",
      customerContext,
      { coverageArea: "read", style: "terse", language: "en" },
    ),
    unlabeled(
      `${entity}-unlabeled-10`,
      "Add a category 'Festive 2026' under Accessories with image https://cdn.malawistore.mw/festive-2026.jpg",
      adminContext,
      { coverageArea: "create", style: "task-like", language: "en" },
    ),
  ],
};
