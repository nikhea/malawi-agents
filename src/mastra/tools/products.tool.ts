import { z } from "zod";
import { createLoggedTool } from "../lib/malawi-logging";
import { malawiContextSchema, requireAdmin } from "../lib/malawi-context";
import {
  blankToUndefined,
  cleanInputObject,
  cleanInputSchema,
  compactPayload,
} from "../lib/malawi-input";
import { createMalawiStore } from "../lib/malawi-store";
import {
  productDetailSchema,
  productSchema,
  successSchema,
} from "../lib/malawi-schemas";

const requestContextSchema = malawiContextSchema;

export const listProductsTool = createLoggedTool({
  id: "list-products",
  description:
    "List or search products in the Malawi Store catalog. Prices are integer tambala (12500 means K125.00). Filter by price, date, category, size, stock, rating, active status, pagination, and sort order.",
  inputSchema: cleanInputObject({
    query: z
      .preprocess(blankToUndefined, z.string().optional())
      .describe(
        'Full-text search over product name, description and slug (word prefixes, e.g. "cook" finds "cooking").',
      ),
    categoryId: z.preprocess(blankToUndefined, z.string().optional())
      .describe("Filter products by category ID"),
    categorySlug: z.preprocess(blankToUndefined, z.string().optional())
      .describe("Filter products by category slug"),
    minPriceCents: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe("Minimum price in integer USD cents"),
    maxPriceCents: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe("Maximum price in integer USD cents"),
    inStock: z
      .boolean()
      .optional()
      .describe("Set false to return only products that are out of stock"),
    size: z.preprocess(blankToUndefined, z.string().optional())
      .describe("Filter by an active variant size, for example XS, M, or XL"),
    minRating: z
      .number()
      .min(0)
      .max(5)
      .optional()
      .describe("Minimum average review rating from 0 to 5"),
    createdAfter: z.preprocess(blankToUndefined, z.string().optional())
      .describe("Created at or after, as RFC3339 or YYYY-MM-DD"),
    createdBefore: z.preprocess(blankToUndefined, z.string().optional())
      .describe("Created at or before, as RFC3339 or YYYY-MM-DD"),
    activeOnly: z
      .boolean()
      .optional()
      .describe(
        "Defaults to true on the API. Set false to include inactive products (admin catalog view).",
      ),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(5)
      .optional()
      .describe("Page size. The API defaults to 20 and caps at 100."),
    page: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe("1-based page number; takes precedence over offset"),
    offset: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe("Number of rows to skip for pagination."),
    sort: z
      .enum([
        "name_asc",
        "name_desc",
        "price_asc",
        "price_desc",
        "newest",
        "oldest",
        "rating_asc",
        "rating_desc",
        "relevance",
      ])
      .optional()
      .describe("Sort order for the results"),
  }),
  outputSchema: z.array(productSchema),
  requestContextSchema,
  execute: async (
    {
      query,
      categoryId,
      categorySlug,
      minPriceCents,
      maxPriceCents,
      inStock,
      size,
      minRating,
      createdAfter,
      createdBefore,
      activeOnly,
      page,
      limit,
      offset,
      sort,
    },
    { requestContext, observe },
  ) => {
    const store = createMalawiStore(requestContext);
    return store.products.list(
      compactPayload({
        q: query,
        category_id: categoryId,
        category_slug: categorySlug,
        min_price_cents: minPriceCents,
        max_price_cents: maxPriceCents,
        in_stock: inStock,
        size,
        min_rating: minRating,
        created_after: createdAfter,
        created_before: createdBefore,
        active_only: activeOnly,
        page,
        limit,
        offset,
        sort,
      }),
    );
  },
});

export const getProductTool = createLoggedTool({
  id: "get-product",
  description:
    "Get one product with its sellable variants by id, productId, or slug. Provide exactly one lookup value: id, productId, or slug.",
  inputSchema: cleanInputSchema(
    z.object({
      id: z
        .preprocess(blankToUndefined, z.string().optional())
        .describe("Product ID"),
      productId: z
        .preprocess(blankToUndefined, z.string().optional())
        .describe("Product ID alias"),
      slug: z
        .preprocess(blankToUndefined, z.string().optional())
        .describe("Product slug, for example sunseed-cooking-oil-2l"),
    })
    .refine(
      ({ id, productId, slug }) => [id, productId, slug].filter(Boolean).length === 1,
      "Provide exactly one of id, productId, or slug",
    ),
  ),
  outputSchema: productDetailSchema,
  requestContextSchema,
  execute: async (input, { requestContext, observe }) => {
    const store = createMalawiStore(requestContext);
    if (input.id) return store.products.get(input.id);
    if (input.productId) return store.products.get(input.productId);
    return store.products.getBySlug(input.slug!);
  },
});

export const createProductTool = createLoggedTool({
  id: "create-product",
  description:
    "Create a product in the Malawi Store catalog. Admin only. Prices are integer tambala. Use this only when an administrator explicitly asks to add a product.",
  requireApproval: true,
  inputSchema: cleanInputObject({
    name: z.string().min(1).describe("Product name"),
    categoryId: z.preprocess(blankToUndefined, z.string().optional())
      .describe("Category ID to file the product under"),
    slug: z.preprocess(blankToUndefined, z.string().optional())
      .describe("URL slug. Generated from the name when omitted."),
    description: z.preprocess(blankToUndefined, z.string().optional()).describe("Product description"),
    priceCents: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe("Price in integer tambala, for example 12500 for K125.00"),
    currency: z.preprocess(blankToUndefined, z.string().optional()).describe("Currency code. Defaults to USD."),
    imageUrl: z.preprocess(blankToUndefined, z.string().optional()).describe("Product image URL"),
  }),
  outputSchema: productSchema,
  requestContextSchema,
  execute: async (input, { requestContext, observe }) => {
    requireAdmin(requestContext);
    const store = createMalawiStore(requestContext);
    return store.products.create(
      compactPayload({
        name: input.name,
        category_id: input.categoryId,
        slug: input.slug,
        description: input.description,
        price_cents: input.priceCents,
        currency: input.currency,
        image_url: input.imageUrl,
      }),
    );
  },
});

export const updateProductTool = createLoggedTool({
  id: "update-product",
  description:
    "Update an existing product. Admin only. Slugs cannot be changed; use isActive false to deactivate a product instead of deleting it.",
  requireApproval: true,
  inputSchema: cleanInputObject({
    id: z.string().describe("Product ID"),
    categoryId: z.preprocess(blankToUndefined, z.string().optional()).describe("New category ID"),
    name: z.preprocess(blankToUndefined, z.string().optional()).describe("New product name"),
    description: z.preprocess(blankToUndefined, z.string().optional()).describe("New description"),
    priceCents: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe("New price in integer tambala"),
    currency: z.preprocess(blankToUndefined, z.string().optional()).describe("New currency code"),
    isActive: z.boolean().optional().describe("Whether the product is active"),
    clearCategory: z
      .boolean()
      .optional()
      .describe("Set true to remove the product from its category"),
  }),
  outputSchema: productSchema,
  requestContextSchema,
  execute: async (input, { requestContext, observe }) => {
    requireAdmin(requestContext);
    const store = createMalawiStore(requestContext);
    return store.products.update(
      input.id,
      compactPayload({
        category_id: input.categoryId,
        name: input.name,
        description: input.description,
        price_cents: input.priceCents,
        currency: input.currency,
        is_active: input.isActive,
        clear_category: input.clearCategory,
      }),
    );
  },
});

export const deleteProductTool = createLoggedTool({
  id: "delete-product",
  description:
    "Permanently delete a product and its variants. Admin only. Prefer deactivating a product with update-product unless permanent deletion is explicitly requested.",
  requireApproval: true,
  inputSchema: cleanInputObject({
    id: z.string().describe("Product ID"),
  }),
  outputSchema: successSchema,
  requestContextSchema,
  execute: async ({ id }, { requestContext, observe }) => {
    requireAdmin(requestContext);
    const store = createMalawiStore(requestContext);
    await store.products.delete(id);
    return { success: true as const };
  },
});

export const productsTools = {
  listProductsTool,
  getProductTool,
  createProductTool,
  updateProductTool,
  deleteProductTool,
};
