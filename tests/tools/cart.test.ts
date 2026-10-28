import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addCartItemTool,
  clearCartTool,
  getCartTool,
  removeCartItemTool,
  setCartItemQtyTool,
} from '../../src/mastra/tools/cart.tool';
import { cart } from '../fixtures';
import {
  TEST_BASE_URL,
  apiUrl,
  authorizationOf,
  bodyOf,
  context,
  emptyResponse,
  executeTool,
  jsonResponse,
  stubFetch,
} from '../helpers';

beforeEach(() => {
  vi.stubEnv('MALAWI_API_BASE_URL', TEST_BASE_URL);
});

describe('getCartTool', () => {
  it('gets the authenticated cart with a bearer token', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: cart }));

    const result = await executeTool(getCartTool, {}, context());

    expect(result).toEqual(cart);
    expect(calls[0].url).toBe(apiUrl('/cart'));
    expect(authorizationOf(calls[0].init)).toBe('Bearer access-token');
  });
});

describe('addCartItemTool', () => {
  it('adds a product variant to the cart', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: cart }));

    await executeTool(
      addCartItemTool,
      { productId: 'prod-1', variantId: 'var-1', qty: 2 },
      context(),
    );

    expect(calls[0].url).toBe(apiUrl('/cart/items'));
    expect(calls[0].init.method).toBe('POST');
    expect(bodyOf(calls[0].init)).toEqual({
      product_id: 'prod-1',
      variant_id: 'var-1',
      qty: 2,
    });
  });
});

describe('setCartItemQtyTool', () => {
  it('sets a cart line quantity', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: cart }));

    await executeTool(
      setCartItemQtyTool,
      { itemId: 'line-1', qty: 3 },
      context(),
    );

    expect(calls[0].url).toBe(apiUrl('/cart/items/line-1'));
    expect(calls[0].init.method).toBe('PATCH');
    expect(bodyOf(calls[0].init)).toEqual({ qty: 3 });
  });
});

describe('removeCartItemTool', () => {
  it('removes a cart line', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: cart }));

    await executeTool(removeCartItemTool, { itemId: 'line-1' }, context());

    expect(calls[0].url).toBe(apiUrl('/cart/items/line-1'));
    expect(calls[0].init.method).toBe('DELETE');
  });
});

describe('clearCartTool', () => {
  it('clears the cart and returns a success acknowledgement', async () => {
    const { calls } = stubFetch(() => emptyResponse());

    const result = await executeTool(clearCartTool, {}, context());

    expect(result).toEqual({ success: true });
    expect(calls[0].url).toBe(apiUrl('/cart'));
    expect(calls[0].init.method).toBe('DELETE');
  });
});
