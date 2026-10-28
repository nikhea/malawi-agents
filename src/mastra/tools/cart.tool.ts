import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { malawiContextSchema } from '../lib/malawi-context';
import { createMalawiStore } from '../lib/malawi-store';
import { cartSchema, successSchema } from '../lib/malawi-schemas';

const requestContextSchema = malawiContextSchema;

export const getCartTool = createTool({
  id: 'get-cart',
  description:
    'Get the authenticated customer\'s active cart, including line items and the subtotal in integer tambala.',
  inputSchema: z.object({}),
  outputSchema: cartSchema,
  requestContextSchema,
  execute: async (_input, { requestContext }) => {
    const store = createMalawiStore(requestContext);
    return store.cart.get();
  },
});

export const addCartItemTool = createTool({
  id: 'add-cart-item',
  description:
    'Add a product or product variant to the authenticated customer\'s cart. Use get-product or list-variants first to find IDs.',
  inputSchema: z.object({
    productId: z.string().describe('Product ID to add'),
    variantId: z
      .string()
      .optional()
      .describe('Variant ID. Omit to use the base product price.'),
    qty: z
      .number()
      .int()
      .min(1)
      .describe('Quantity to add. Must be at least 1.'),
  }),
  outputSchema: cartSchema,
  requestContextSchema,
  execute: async ({ productId, variantId, qty }, { requestContext }) => {
    const store = createMalawiStore(requestContext);
    return store.cart.addItem({
      product_id: productId,
      variant_id: variantId,
      qty,
    });
  },
});

export const setCartItemQtyTool = createTool({
  id: 'set-cart-item-qty',
  description:
    'Set the quantity of a cart line. The cart line ID comes from get-cart, not the product ID. A quantity of 0 removes the line.',
  inputSchema: z.object({
    itemId: z.string().describe('Cart line ID from get-cart'),
    qty: z
      .number()
      .int()
      .min(0)
      .describe('New quantity. Use 0 to remove the line.'),
  }),
  outputSchema: cartSchema,
  requestContextSchema,
  execute: async ({ itemId, qty }, { requestContext }) => {
    const store = createMalawiStore(requestContext);
    return store.cart.setQty(itemId, qty);
  },
});

export const removeCartItemTool = createTool({
  id: 'remove-cart-item',
  description:
    'Remove one line from the authenticated customer\'s cart. Use the cart line ID from get-cart.',
  inputSchema: z.object({
    itemId: z.string().describe('Cart line ID from get-cart'),
  }),
  outputSchema: cartSchema,
  requestContextSchema,
  execute: async ({ itemId }, { requestContext }) => {
    const store = createMalawiStore(requestContext);
    return store.cart.removeItem(itemId);
  },
});

export const clearCartTool = createTool({
  id: 'clear-cart',
  description:
    'Remove every line from the authenticated customer\'s cart. A successful checkout already clears the cart.',
  inputSchema: z.object({}),
  outputSchema: successSchema,
  requestContextSchema,
  execute: async (_input, { requestContext }) => {
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
