import { z } from "zod";
import { createLoggedTool } from "../lib/malawi-logging";
import { malawiContextSchema } from "../lib/malawi-context";
import {
  blankToUndefined,
  cleanInputObject,
  compactPayload,
} from "../lib/malawi-input";
import { createMalawiStore } from "../lib/malawi-store";
import { cartSchema, successSchema } from "../lib/malawi-schemas";

const requestContextSchema = malawiContextSchema;

export const getCartTool = createLoggedTool({
  id: "get-cart",
  description:
    "Get the authenticated customer's active cart, including line items and the subtotal in integer tambala. Filter items by search query, product, variant, sort order, or pagination.",
  inputSchema: cleanInputObject({
    query: z
      .preprocess(blankToUndefined, z.string().optional())
      .describe("Filter cart items by product title or variant name substring"),
    productId: z
      .preprocess(blankToUndefined, z.string().optional())
      .describe("Filter cart items by product ID"),
    variantId: z
      .preprocess(blankToUndefined, z.string().optional())
      .describe("Filter cart items by variant ID"),
    sort: z
      .enum([
        "newest",
        "oldest",
        "price_asc",
        "price_desc",
        "qty_asc",
        "qty_desc",
      ])
      .optional()
      .describe("Sort order for the cart line items"),
    page: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe("1-based page number; takes precedence over offset"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Number of items per page. Defaults to 12, max 100."),
    offset: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe("Number of items to skip for pagination"),
  }),
  outputSchema: cartSchema,
  requestContextSchema,
  execute: async (
    { query, productId, variantId, sort, page, limit, offset },
    { requestContext, observe },
  ) => {
    const store = createMalawiStore(requestContext);
    return store.cart.get(
      compactPayload({
        q: query,
        product_id: productId,
        variant_id: variantId,
        sort,
        page,
        limit,
        offset,
      }),
    );
  },
});

export const addCartItemTool = createLoggedTool({
  id: "add-cart-item",
  description:
    "Add a product or product variant to the authenticated customer's cart. Use get-product or list-variants first to find IDs.",
  requireApproval: true,
  inputSchema: cleanInputObject({
    productId: z.string().describe("Product ID to add"),
    variantId: z
      .string()
      .optional()
      .describe("Variant ID. Omit to use the base product price."),
    qty: z
      .number()
      .int()
      .min(1)
      .describe("Quantity to add. Must be at least 1."),
  }),
  outputSchema: cartSchema,
  requestContextSchema,
  execute: async ({ productId, variantId, qty }, { requestContext, observe }) => {
    const store = createMalawiStore(requestContext);
    return store.cart.addItem(
      compactPayload({
        product_id: productId,
        variant_id: variantId,
        qty,
      }),
    );
  },
});

export const setCartItemQtyTool = createLoggedTool({
  id: "set-cart-item-qty",
  description:
    "Set the quantity of a cart line. The cart line ID comes from get-cart, not the product ID. A quantity of 0 removes the line.",
  requireApproval: true,
  inputSchema: cleanInputObject({
    itemId: z.string().describe("Cart line ID from get-cart"),
    qty: z
      .number()
      .int()
      .min(0)
      .describe("New quantity. Use 0 to remove the line."),
  }),
  outputSchema: cartSchema,
  requestContextSchema,
  execute: async ({ itemId, qty }, { requestContext, observe }) => {
    const store = createMalawiStore(requestContext);
    return store.cart.setQty(itemId, qty);
  },
});

export const removeCartItemTool = createLoggedTool({
  id: "remove-cart-item",
  description:
    "Remove one line from the authenticated customer's cart. Use the cart line ID from get-cart.",
  inputSchema: cleanInputObject({
    itemId: z.string().describe("Cart line ID from get-cart"),
  }),
  outputSchema: cartSchema,
  requestContextSchema,
  requireApproval: true,
  execute: async ({ itemId }, { requestContext, observe }) => {
    const store = createMalawiStore(requestContext);
    return store.cart.removeItem(itemId);
  },
});

export const clearCartTool = createLoggedTool({
  id: "clear-cart",
  description:
    "Remove every line from the authenticated customer's cart. A successful checkout already clears the cart.",
  inputSchema: cleanInputObject({}),
  outputSchema: successSchema,
  requestContextSchema,
  requireApproval: true,
  execute: async (_input, { requestContext, observe }) => {
    const store = createMalawiStore(requestContext);
    await store.cart.clear();
    return { success: true as const };
  },
});

export const cartTools = {
  getCartTool,
  addCartItemTool,
  setCartItemQtyTool,
  removeCartItemTool,
  clearCartTool,
};
