import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { malawiContextSchema } from '../lib/malawi-context';
import { logToolStart } from '../lib/malawi-logging';
import { createMalawiStore } from '../lib/malawi-store';
import {
  statusResponseSchema,
  wishlistItemSchema,
} from '../lib/malawi-schemas';

const requestContextSchema = malawiContextSchema;

export const listWishlistTool = createTool({
  id: 'list-wishlist',
  description:
    'List the authenticated customer\'s wishlist, newest first. Each item includes a product snapshot and its current price in integer tambala.',
  inputSchema: z.object({}),
  outputSchema: z.array(wishlistItemSchema),
  requestContextSchema,
  execute: async (_input, { requestContext, observe }) => {
    logToolStart('list-wishlist', observe, requestContext);
    const store = createMalawiStore(requestContext);
    return store.wishlist.list();
  },
});

export const addToWishlistTool = createTool({
  id: 'add-to-wishlist',
  description:
    'Add a product to the authenticated customer\'s wishlist. This is idempotent: adding the same product again succeeds.',
  requireApproval: true,
  inputSchema: z.object({
    productId: z.string().describe('Product ID to save'),
  }),
  outputSchema: wishlistItemSchema,
  requestContextSchema,
  execute: async ({ productId }, { requestContext, observe }) => {
    logToolStart('add-to-wishlist', observe, requestContext);
    const store = createMalawiStore(requestContext);
    return store.wishlist.add(productId);
  },
});

export const removeFromWishlistTool = createTool({
  id: 'remove-from-wishlist',
  description:
    'Remove a product from the authenticated customer\'s wishlist. Pass the product ID, not the wishlist row ID.',
  requireApproval: true,
  inputSchema: z.object({
    productId: z.string().describe('Product ID to remove'),
  }),
  outputSchema: statusResponseSchema,
  requestContextSchema,
  execute: async ({ productId }, { requestContext, observe }) => {
    logToolStart('remove-from-wishlist', observe, requestContext);
    const store = createMalawiStore(requestContext);
    return store.wishlist.remove(productId);
  },
});

export const wishlistTools = {
  listWishlistTool,
  addToWishlistTool,
  removeFromWishlistTool,
};
