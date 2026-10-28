import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  confirmStockTool,
  getStockTool,
  releaseStockTool,
  reserveStockTool,
  setStockTool,
} from '../../src/mastra/tools/inventory.tool';
import { stock } from '../fixtures';
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

const admin = () => context({ userRole: 'admin' });

describe('getStockTool', () => {
  it('reads stock for a variant', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: stock }));

    const result = await executeTool(
      getStockTool,
      { productId: 'prod-1', variantId: 'var-1' },
      admin(),
    );

    expect(result).toEqual(stock);
    expectValidOutput(getStockTool.outputSchema, result);
    expect(calls[0].url).toBe(
      apiUrl('/admin/inventory/stock?product_id=prod-1&variant_id=var-1'),
    );
  });

  it('rejects a customer before calling the API', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: stock }));

    await expect(
      executeTool(getStockTool, { productId: 'prod-1' }, context()),
    ).rejects.toThrow(/admin/i);

    expect(calls).toHaveLength(0);
  });
});

describe('setStockTool', () => {
  it('sets stock as an admin', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: stock }));

    const result = await executeTool(
      setStockTool,
      { productId: 'prod-1', qty: 50 },
      admin(),
    );

    expectValidOutput(setStockTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/admin/inventory/stock'));
    expect(calls[0].init.method).toBe('POST');
    expect(bodyOf(calls[0].init)).toEqual({
      product_id: 'prod-1',
      qty: 50,
    });
  });
});

describe('reserveStockTool', () => {
  it('reserves stock lines', async () => {
    const { calls } = stubFetch(() =>
      jsonResponse({ data: { status: 'reserved' } }),
    );

    const result = await executeTool(
      reserveStockTool,
      {
        orderRef: 'order-1',
        lines: [{ productId: 'prod-1', variantId: 'var-1', qty: 2 }],
        ttlSeconds: 600,
      },
      admin(),
    );

    expect(result).toEqual({ status: 'reserved' });
    expectValidOutput(reserveStockTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/admin/inventory/reserve'));
    expect(bodyOf(calls[0].init)).toEqual({
      order_ref: 'order-1',
      lines: [{ product_id: 'prod-1', variant_id: 'var-1', qty: 2 }],
      ttl_seconds: 600,
    });
  });

  it('omits blank optional fields from nested stock lines', async () => {
    const { calls } = stubFetch(() =>
      jsonResponse({ data: { status: 'reserved' } }),
    );

    await executeTool(
      reserveStockTool,
      {
        orderRef: 'order-1',
        lines: [{ productId: 'prod-1', variantId: '', qty: 1 }],
      },
      admin(),
    );

    expect(bodyOf(calls[0].init)).toEqual({
      order_ref: 'order-1',
      lines: [{ product_id: 'prod-1', qty: 1 }],
    });
  });
});

describe('releaseStockTool', () => {
  it('releases a stock hold', async () => {
    const { calls } = stubFetch(() =>
      jsonResponse({ data: { status: 'released' } }),
    );

    const result = await executeTool(
      releaseStockTool,
      { orderRef: 'order-1' },
      admin(),
    );

    expectValidOutput(releaseStockTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/admin/inventory/release'));
    expect(bodyOf(calls[0].init)).toEqual({ order_ref: 'order-1' });
  });
});

describe('confirmStockTool', () => {
  it('confirms a stock hold', async () => {
    const { calls } = stubFetch(() =>
      jsonResponse({ data: { status: 'confirmed' } }),
    );

    const result = await executeTool(
      confirmStockTool,
      { orderRef: 'order-1' },
      admin(),
    );

    expectValidOutput(confirmStockTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/admin/inventory/confirm'));
    expect(bodyOf(calls[0].init)).toEqual({ order_ref: 'order-1' });
  });
});

describe('request context', () => {
  it('requires an authenticated context for every inventory tool', async () => {
    const { calls } = stubFetch();

    const cases = [
      [getStockTool, { productId: 'prod-1' }],
      [setStockTool, { productId: 'prod-1', qty: 1 }],
      [reserveStockTool, { orderRef: 'order-1', lines: [{ productId: 'prod-1', qty: 1 }] }],
      [releaseStockTool, { orderRef: 'order-1' }],
      [confirmStockTool, { orderRef: 'order-1' }],
    ] as const;

    for (const [tool, input] of cases) {
      await expectRequestContextRequired(tool, input);
    }

    expect(calls).toHaveLength(0);
  });
});
