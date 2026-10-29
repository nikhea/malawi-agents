import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { malawiContextSchema } from '../lib/malawi-context';
import { blankToUndefined, compactPayload } from '../lib/malawi-input';
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
    "List or filter the authenticated customer's wishlist items. Filter by search query, category, sort order, and pagination. Each item includes a product snapshot and its current price in integer tambala.",
  inputSchema: z.object({
    query: z
      .preprocess(blankToUndefined, z.string().optional())
      .describe('Filter saved items by product name or slug substring'),
    categoryId: z
      .preprocess(blankToUndefined, z.string().optional())
      .describe('Filter saved items by category ID'),
    sort: z
      .enum([
        'newest',
        'oldest',
        'name_asc',
        'name_desc',
        'price_asc',
        'price_desc',
      ])
      .optional()
      .describe('Sort order for the wishlist items'),
    page: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('1-based page number; takes precedence over offset'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe('Page size. The API defaults to 12 and caps at 100.'),
    offset: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Number of rows to skip for pagination'),
  }),
  outputSchema: z.array(wishlistItemSchema),
  requestContextSchema,
  execute: async (
    { query, categoryId, sort, page, limit, offset },
    { requestContext, observe },
  ) => {
    logToolStart('list-wishlist', observe, requestContext);
    const store = createMalawiStore(requestContext);
    return store.wishlist.list(
      compactPayload({
        q: query,
        category_id: categoryId,
        sort,
        page,
        limit,
        offset,
      }),
    );
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
