import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createProductTool,
  deleteProductTool,
  getProductTool,
  listProductsTool,
  updateProductTool,
} from '../../src/mastra/tools/products.tool';
import { product, productDetail } from '../fixtures';
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

describe('listProductsTool', () => {
  it('lists products with filters and the caller token', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: [product] }));

    const result = await executeTool(
      listProductsTool,
      { categoryId: 'cat-1', activeOnly: false, limit: 10, offset: 5 },
      context(),
    );

    expect(result).toEqual([product]);
    expectValidOutput(listProductsTool.outputSchema, result);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(
      apiUrl('/products?category_id=cat-1&active_only=false&limit=10&offset=5'),
    );
    expect(calls[0].init.method).toBe('GET');
  });

  it('omits blank optional filters from the request', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: [] }));

    const result = await executeTool(
      listProductsTool,
      { categoryId: '', activeOnly: true },
      context(),
    );

    expect(result).toEqual([]);
    expectValidOutput(listProductsTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/products?active_only=true'));
  });
});

describe('getProductTool', () => {
  it('gets a product by ID', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: productDetail }));

    const result = await executeTool(getProductTool, { id: 'prod-1' }, context());

    expect(result).toEqual(productDetail);
    expectValidOutput(getProductTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/products/prod-1'));
  });

  it('gets a product by slug', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: productDetail }));

    const result = await executeTool(
      getProductTool,
      { slug: 'sunseed-cooking-oil-2l' },
      context(),
    );

    expectValidOutput(getProductTool.outputSchema, result);
    expect(calls[0].url).toBe(
      apiUrl('/products/slug/sunseed-cooking-oil-2l'),
    );
  });
});

describe('createProductTool', () => {
  it('creates a product as an admin', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: product }));

    const result = await executeTool(
      createProductTool,
      {
        name: product.name,
        categoryId: product.category_id,
        priceCents: product.price_cents,
      },
      context({ userRole: 'admin' }),
    );

    expect(result).toEqual(product);
    expectValidOutput(createProductTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/admin/products'));
    expect(calls[0].init.method).toBe('POST');
    expect(bodyOf(calls[0].init)).toEqual({
      name: product.name,
      category_id: product.category_id,
      price_cents: product.price_cents,
    });
  });

  it('omits blank optional fields from the request body', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: product }));

    const result = await executeTool(
      createProductTool,
      {
        name: 'Test product',
        categoryId: '',
        slug: '   ',
        description: '',
        imageUrl: '',
      },
      context({ userRole: 'admin' }),
    );

    expectValidOutput(createProductTool.outputSchema, result);
    expect(bodyOf(calls[0].init)).toEqual({ name: 'Test product' });
  });

  it('rejects a customer before calling the API', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: product }));

    await expect(
      executeTool(createProductTool, { name: 'Test' }, context()),
    ).rejects.toThrow(/admin/i);

    expect(calls).toHaveLength(0);
  });
});

describe('updateProductTool', () => {
  it('updates a product as an admin', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: product }));

    const result = await executeTool(
      updateProductTool,
      { id: 'prod-1', priceCents: 13000, isActive: false },
      context({ userRole: 'admin' }),
    );

    expectValidOutput(updateProductTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/admin/products/prod-1'));
    expect(calls[0].init.method).toBe('PATCH');
    expect(bodyOf(calls[0].init)).toEqual({
      price_cents: 13000,
      is_active: false,
    });
  });
});

describe('deleteProductTool', () => {
  it('deletes a product and returns a success acknowledgement', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: null }));

    const result = await executeTool(
      deleteProductTool,
      { id: 'prod-1' },
      context({ userRole: 'admin' }),
    );

    expect(result).toEqual({ success: true });
    expectValidOutput(deleteProductTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/admin/products/prod-1'));
    expect(calls[0].init.method).toBe('DELETE');
  });
});

describe('request context', () => {
  it('requires an authenticated context for every product tool', async () => {
    const { calls } = stubFetch();

    const cases = [
      [listProductsTool, {}],
      [getProductTool, { id: 'prod-1' }],
      [createProductTool, { name: 'Test' }],
      [updateProductTool, { id: 'prod-1' }],
      [deleteProductTool, { id: 'prod-1' }],
    ] as const;

    for (const [tool, input] of cases) {
      await expectRequestContextRequired(tool, input);
    }

    expect(calls).toHaveLength(0);
  });
});
