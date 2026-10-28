import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createReviewTool,
  deleteAnyReviewTool,
  deleteReviewTool,
  getProductReviewsTool,
  updateReviewTool,
} from '../../src/mastra/tools/reviews.tool';
import { review, reviewSummary } from '../fixtures';
import {
  TEST_BASE_URL,
  apiUrl,
  bodyOf,
  context,
  executeTool,
  expectRequestContextRequired,
  expectValidOutput,
  jsonResponse,
  stubFetch,
} from '../helpers';

beforeEach(() => {
  vi.stubEnv('MALAWI_API_BASE_URL', TEST_BASE_URL);
});

describe('getProductReviewsTool', () => {
  it('gets the public review summary', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: reviewSummary }));

    const result = await executeTool(
      getProductReviewsTool,
      { productId: 'prod-1' },
      context(),
    );

    expect(result).toEqual(reviewSummary);
    expectValidOutput(getProductReviewsTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/products/prod-1/reviews'));
  });
});

describe('createReviewTool', () => {
  it('creates a review', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: review }));

    const result = await executeTool(
      createReviewTool,
      { productId: 'prod-1', rating: 5, title: 'Great oil' },
      context(),
    );

    expect(result).toEqual(review);
    expectValidOutput(createReviewTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/products/prod-1/reviews'));
    expect(calls[0].init.method).toBe('POST');
    expect(bodyOf(calls[0].init)).toEqual({
      rating: 5,
      title: 'Great oil',
    });
  });
});

describe('updateReviewTool', () => {
  it('updates a review', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: review }));

    const result = await executeTool(
      updateReviewTool,
      { reviewId: 'review-1', rating: 4 },
      context(),
    );

    expectValidOutput(updateReviewTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/reviews/review-1'));
    expect(calls[0].init.method).toBe('PATCH');
    expect(bodyOf(calls[0].init)).toEqual({ rating: 4 });
  });
});

describe('deleteReviewTool', () => {
  it('deletes the caller review', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: null }));

    const result = await executeTool(
      deleteReviewTool,
      { reviewId: 'review-1' },
      context(),
    );

    expect(result).toEqual({ success: true });
    expectValidOutput(deleteReviewTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/reviews/review-1'));
    expect(calls[0].init.method).toBe('DELETE');
  });
});

describe('deleteAnyReviewTool', () => {
  it('moderates any review as an admin', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: null }));

    const result = await executeTool(
      deleteAnyReviewTool,
      { reviewId: 'review-1' },
      context({ userRole: 'admin' }),
    );

    expect(result).toEqual({ success: true });
    expectValidOutput(deleteAnyReviewTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/admin/reviews/review-1'));
    expect(calls[0].init.method).toBe('DELETE');
  });

  it('rejects a customer before calling the API', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: null }));

    await expect(
      executeTool(deleteAnyReviewTool, { reviewId: 'review-1' }, context()),
    ).rejects.toThrow(/admin/i);

    expect(calls).toHaveLength(0);
  });
});

describe('request context', () => {
  it('requires an authenticated context for every review tool', async () => {
    const { calls } = stubFetch();

    const cases = [
      [getProductReviewsTool, { productId: 'prod-1' }],
      [createReviewTool, { productId: 'prod-1', rating: 5 }],
      [updateReviewTool, { reviewId: 'review-1' }],
      [deleteReviewTool, { reviewId: 'review-1' }],
      [deleteAnyReviewTool, { reviewId: 'review-1' }],
    ] as const;

    for (const [tool, input] of cases) {
      await expectRequestContextRequired(tool, input);
    }

    expect(calls).toHaveLength(0);
  });
});
