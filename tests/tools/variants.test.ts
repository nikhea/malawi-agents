import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createVariantTool,
  deleteVariantTool,
  listVariantsTool,
  updateVariantTool,
} from '../../src/mastra/tools/variants.tool';
import { variant } from '../fixtures';
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

describe('listVariantsTool', () => {
  it('lists variants for a product', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: [variant] }));

    const result = await executeTool(
      listVariantsTool,
      { productId: 'prod-1' },
      context(),
    );

    expect(result).toEqual([variant]);
    expectValidOutput(listVariantsTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/products/prod-1/variants'));
  });
});

describe('createVariantTool', () => {
  it('creates a variant as an admin', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: variant }));

    const result = await executeTool(
      createVariantTool,
      { productId: 'prod-1', name: '2L bottle', sku: 'OIL-2L', priceCents: 12500 },
      context({ userRole: 'admin' }),
    );

    expect(result).toEqual(variant);
    expectValidOutput(createVariantTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/products/prod-1/variants'));
    expect(calls[0].init.method).toBe('POST');
    expect(bodyOf(calls[0].init)).toEqual({
      name: '2L bottle',
      sku: 'OIL-2L',
      price_cents: 12500,
    });
  });

  it('rejects a customer before calling the API', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: variant }));

    await expect(
      executeTool(
        createVariantTool,
        { productId: 'prod-1', name: '2L', sku: 'OIL-2L' },
        context(),
      ),
    ).rejects.toThrow(/admin/i);

    expect(calls).toHaveLength(0);
  });
});

describe('updateVariantTool', () => {
  it('updates a variant as an admin', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: variant }));

    const result = await executeTool(
      updateVariantTool,
      { id: 'var-1', priceCents: 13000, isActive: false },
      context({ userRole: 'admin' }),
    );

    expectValidOutput(updateVariantTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/admin/variants/var-1'));
    expect(calls[0].init.method).toBe('PATCH');
    expect(bodyOf(calls[0].init)).toEqual({
      price_cents: 13000,
      is_active: false,
    });
  });
});

describe('deleteVariantTool', () => {
  it('deletes a variant and returns a success acknowledgement', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: null }));

    const result = await executeTool(
      deleteVariantTool,
      { id: 'var-1' },
      context({ userRole: 'admin' }),
    );

    expect(result).toEqual({ success: true });
    expectValidOutput(deleteVariantTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/admin/variants/var-1'));
    expect(calls[0].init.method).toBe('DELETE');
  });
});

describe('request context', () => {
  it('requires an authenticated context for every variant tool', async () => {
    const { calls } = stubFetch();

    const cases = [
      [listVariantsTool, { productId: 'prod-1' }],
      [createVariantTool, { productId: 'prod-1', name: '2L', sku: 'OIL-2L' }],
      [updateVariantTool, { id: 'var-1' }],
      [deleteVariantTool, { id: 'var-1' }],
    ] as const;

    for (const [tool, input] of cases) {
      await expectRequestContextRequired(tool, input);
    }

    expect(calls).toHaveLength(0);
  });
});
