import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { malawiContextSchema, requireAdmin } from '../lib/malawi-context';
import { blankToUndefined, compactPayload } from '../lib/malawi-input';
import { logToolStart } from '../lib/malawi-logging';
import { createMalawiStore } from '../lib/malawi-store';
import {
  reviewSchema,
  reviewSummarySchema,
  successSchema,
} from '../lib/malawi-schemas';

const requestContextSchema = malawiContextSchema;

const reviewFields = {
  rating: z
    .number()
    .int()
    .min(1)
    .max(5)
    .optional()
    .describe('Star rating from 1 to 5'),
  title: z.preprocess(blankToUndefined, z.string().optional()).describe('Short review title'),
  body: z.preprocess(blankToUndefined, z.string().optional()).describe('Review body'),
};

export const getProductReviewsTool = createTool({
  id: 'get-product-reviews',
  description:
    'Get the public review summary for a product: average rating, review count, and reviews. Filter reviews by text search, rating, sort order, and pagination.',
  inputSchema: z.object({
    productId: z.string().describe('Product ID'),
    query: z
      .preprocess(blankToUndefined, z.string().optional())
      .describe('Filter reviews by substring matching title, body, or author'),
    rating: z
      .number()
      .int()
      .min(1)
      .max(5)
      .optional()
      .describe('Filter reviews by exact star rating (1 to 5)'),
    sort: z
      .enum(['newest', 'oldest', 'highest', 'lowest'])
      .optional()
      .describe('Sort order for the reviews'),
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
  outputSchema: reviewSummarySchema,
  requestContextSchema,
  execute: async (
    { productId, query, rating, sort, page, limit, offset },
    { requestContext, observe },
  ) => {
    logToolStart('get-product-reviews', observe, requestContext);
    const store = createMalawiStore(requestContext);
    return store.reviews.summary(
      productId,
      compactPayload({
        q: query,
        rating,
        sort,
        page,
        limit,
        offset,
      }),
    );
  },
});

export const createReviewTool = createTool({
  id: 'create-review',
  description:
    'Write a review for a product as the authenticated customer. Each customer may have one review per product.',
  requireApproval: true,
  inputSchema: z.object({
    productId: z.string().describe('Product ID to review'),
    rating: z
      .number()
      .int()
      .min(1)
      .max(5)
      .describe('Star rating from 1 to 5'),
    title: reviewFields.title,
    body: reviewFields.body,
  }),
  outputSchema: reviewSchema,
  requestContextSchema,
  execute: async (input, { requestContext, observe }) => {
    logToolStart('create-review', observe, requestContext);
    const store = createMalawiStore(requestContext);
    return store.reviews.create(
      input.productId,
      compactPayload({
        rating: input.rating,
        title: input.title,
        body: input.body,
      }),
    );
  },
});

export const updateReviewTool = createTool({
  id: 'update-review',
  description:
    'Edit the authenticated customer\'s own review. Use get-product-reviews or the raw review ID to find it.',
  requireApproval: true,
  inputSchema: z.object({
    reviewId: z.string().describe('Review ID'),
    ...reviewFields,
  }),
  outputSchema: reviewSchema,
  requestContextSchema,
  execute: async (input, { requestContext, observe }) => {
    logToolStart('update-review', observe, requestContext);
    const store = createMalawiStore(requestContext);
    return store.reviews.update(
      input.reviewId,
      compactPayload({
        rating: input.rating,
        title: input.title,
        body: input.body,
      }),
    );
  },
});

export const deleteReviewTool = createTool({
  id: 'delete-review',
  description: 'Delete the authenticated customer\'s own review.',
  requireApproval: true,
  inputSchema: z.object({
    reviewId: z.string().describe('Review ID'),
  }),
  outputSchema: successSchema,
  requestContextSchema,
  execute: async ({ reviewId }, { requestContext, observe }) => {
    logToolStart('delete-review', observe, requestContext);
    const store = createMalawiStore(requestContext);
    await store.reviews.delete(reviewId);
    return { success: true as const };
  },
});

export const deleteAnyReviewTool = createTool({
  id: 'delete-any-review',
  description:
    'Moderate reviews by deleting any review. Admin only. Use only for moderation requests.',
  requireApproval: true,
  inputSchema: z.object({
    reviewId: z.string().describe('Review ID'),
  }),
  outputSchema: successSchema,
  requestContextSchema,
  execute: async ({ reviewId }, { requestContext, observe }) => {
    logToolStart('delete-any-review', observe, requestContext);
    requireAdmin(requestContext);
    const store = createMalawiStore(requestContext);
    await store.reviews.deleteAny(reviewId);
    return { success: true as const };
  },
});

export const reviewsTools = {
  getProductReviewsTool,
  createReviewTool,
  updateReviewTool,
  deleteReviewTool,
  deleteAnyReviewTool,
};
