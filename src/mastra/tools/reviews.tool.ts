import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { malawiContextSchema, requireAdmin } from '../lib/malawi-context';
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
  title: z.string().optional().describe('Short review title'),
  body: z.string().optional().describe('Review body'),
};

export const getProductReviewsTool = createTool({
  id: 'get-product-reviews',
  description:
    'Get the public review summary for a product: average rating, review count, and the newest reviews.',
  inputSchema: z.object({
    productId: z.string().describe('Product ID'),
  }),
  outputSchema: reviewSummarySchema,
  requestContextSchema,
  execute: async ({ productId }, { requestContext }) => {
    const store = createMalawiStore(requestContext);
    return store.reviews.summary(productId);
  },
});

export const createReviewTool = createTool({
  id: 'create-review',
  description:
    'Write a review for a product as the authenticated customer. Each customer may have one review per product.',
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
  execute: async (input, { requestContext }) => {
    const store = createMalawiStore(requestContext);
    return store.reviews.create(input.productId, {
      rating: input.rating,
      title: input.title,
      body: input.body,
    });
  },
});

export const updateReviewTool = createTool({
  id: 'update-review',
  description:
    'Edit the authenticated customer\'s own review. Use get-product-reviews or the raw review ID to find it.',
  inputSchema: z.object({
    reviewId: z.string().describe('Review ID'),
    ...reviewFields,
  }),
  outputSchema: reviewSchema,
  requestContextSchema,
  execute: async (input, { requestContext }) => {
    const store = createMalawiStore(requestContext);
    return store.reviews.update(input.reviewId, {
      rating: input.rating,
      title: input.title,
      body: input.body,
    });
  },
});

export const deleteReviewTool = createTool({
  id: 'delete-review',
  description: 'Delete the authenticated customer\'s own review.',
  inputSchema: z.object({
    reviewId: z.string().describe('Review ID'),
  }),
  outputSchema: successSchema,
  requestContextSchema,
  execute: async ({ reviewId }, { requestContext }) => {
    const store = createMalawiStore(requestContext);
    await store.reviews.delete(reviewId);
    return { success: true as const };
  },
});

export const deleteAnyReviewTool = createTool({
  id: 'delete-any-review',
  description:
    'Moderate reviews by deleting any review. Admin only. Use only for moderation requests.',
  inputSchema: z.object({
    reviewId: z.string().describe('Review ID'),
  }),
  outputSchema: successSchema,
  requestContextSchema,
  execute: async ({ reviewId }, { requestContext }) => {
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
