import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cancelOrderTool,
  checkoutOrderTool,
  getOrderTool,
  listOrdersTool,
} from '../../src/mastra/tools/orders.tool';
import { order } from '../fixtures';
import {
  TEST_BASE_URL,
  apiUrl,
  authorizationOf,
  context,
  executeTool,
  jsonResponse,
  stubFetch,
} from '../helpers';

beforeEach(() => {
  vi.stubEnv('MALAWI_API_BASE_URL', TEST_BASE_URL);
});

describe('checkoutOrderTool', () => {
  it('checks out the authenticated cart', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: order }));

    const result = await executeTool(checkoutOrderTool, {}, context());

    expect(result).toEqual(order);
    expect(calls[0].url).toBe(apiUrl('/orders/checkout'));
    expect(calls[0].init.method).toBe('POST');
    expect(authorizationOf(calls[0].init)).toBe('Bearer access-token');
  });
});

describe('listOrdersTool', () => {
  it('lists the authenticated customer orders', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: [order] }));

    const result = await executeTool(listOrdersTool, {}, context());

    expect(result).toEqual([order]);
    expect(calls[0].url).toBe(apiUrl('/orders'));
    expect(calls[0].init.method).toBe('GET');
  });
});

describe('getOrderTool', () => {
  it('gets an order by ID', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: order }));

    const result = await executeTool(getOrderTool, { id: 'order-1' }, context());

    expect(result).toEqual(order);
    expect(calls[0].url).toBe(apiUrl('/orders/order-1'));
  });
});

describe('cancelOrderTool', () => {
  it('cancels a pending order', async () => {
    const cancelled = { ...order, status: 'cancelled' as const };
    const { calls } = stubFetch(() => jsonResponse({ data: cancelled }));

    const result = await executeTool(
      cancelOrderTool,
      { id: 'order-1' },
      context(),
    );

    expect(result).toEqual(cancelled);
    expect(calls[0].url).toBe(apiUrl('/orders/order-1/cancel'));
    expect(calls[0].init.method).toBe('POST');
  });
});
