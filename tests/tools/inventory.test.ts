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

    await executeTool(
      setStockTool,
      { productId: 'prod-1', qty: 50 },
      admin(),
    );

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
    expect(calls[0].url).toBe(apiUrl('/admin/inventory/reserve'));
    expect(bodyOf(calls[0].init)).toEqual({
      order_ref: 'order-1',
      lines: [{ product_id: 'prod-1', variant_id: 'var-1', qty: 2 }],
      ttl_seconds: 600,
    });
  });
});

describe('releaseStockTool', () => {
  it('releases a stock hold', async () => {
    const { calls } = stubFetch(() =>
      jsonResponse({ data: { status: 'released' } }),
    );

    await executeTool(releaseStockTool, { orderRef: 'order-1' }, admin());

    expect(calls[0].url).toBe(apiUrl('/admin/inventory/release'));
    expect(bodyOf(calls[0].init)).toEqual({ order_ref: 'order-1' });
  });
});

describe('confirmStockTool', () => {
  it('confirms a stock hold', async () => {
    const { calls } = stubFetch(() =>
      jsonResponse({ data: { status: 'confirmed' } }),
    );

    await executeTool(confirmStockTool, { orderRef: 'order-1' }, admin());

    expect(calls[0].url).toBe(apiUrl('/admin/inventory/confirm'));
    expect(bodyOf(calls[0].init)).toEqual({ order_ref: 'order-1' });
  });
});
