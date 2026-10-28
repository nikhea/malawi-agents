import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addToWishlistTool,
  listWishlistTool,
  removeFromWishlistTool,
} from '../../src/mastra/tools/wishlist.tool';
import { wishlistItem } from '../fixtures';
import {
  TEST_BASE_URL,
  apiUrl,
  authorizationOf,
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

describe('listWishlistTool', () => {
  it('lists the authenticated customer wishlist', async () => {
    const { calls } = stubFetch(() =>
      jsonResponse({ data: [wishlistItem] }),
    );

    const result = await executeTool(listWishlistTool, {}, context());

    expect(result).toEqual([wishlistItem]);
    expectValidOutput(listWishlistTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/wishlist'));
    expect(authorizationOf(calls[0].init)).toBe('Bearer access-token');
  });
});

describe('addToWishlistTool', () => {
  it('adds a product to the wishlist', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: wishlistItem }));

    const result = await executeTool(
      addToWishlistTool,
      { productId: 'prod-1' },
      context(),
    );

    expectValidOutput(addToWishlistTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/wishlist'));
    expect(calls[0].init.method).toBe('POST');
    expect(bodyOf(calls[0].init)).toEqual({ product_id: 'prod-1' });
  });
});

describe('removeFromWishlistTool', () => {
  it('removes a product from the wishlist', async () => {
    const { calls } = stubFetch(() =>
      jsonResponse({ data: { status: 'removed' } }),
    );

    const result = await executeTool(
      removeFromWishlistTool,
      { productId: 'prod-1' },
      context(),
    );

    expect(result).toEqual({ status: 'removed' });
    expectValidOutput(removeFromWishlistTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/wishlist/prod-1'));
    expect(calls[0].init.method).toBe('DELETE');
  });
});

describe('request context', () => {
  it('requires an authenticated context for every wishlist tool', async () => {
    const { calls } = stubFetch();

    const cases = [
      [listWishlistTool, {}],
      [addToWishlistTool, { productId: 'prod-1' }],
      [removeFromWishlistTool, { productId: 'prod-1' }],
    ] as const;

    for (const [tool, input] of cases) {
      await expectRequestContextRequired(tool, input);
    }

    expect(calls).toHaveLength(0);
  });
});
