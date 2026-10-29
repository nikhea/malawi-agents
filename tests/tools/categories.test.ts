import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createCategoryTool,
  deleteCategoryTool,
  getCategoryTool,
  listCategoriesTool,
  updateCategoryTool,
} from '../../src/mastra/tools/categories.tool';
import { category } from '../fixtures';
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

describe('listCategoriesTool', () => {
  it('lists categories', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: [category] }));

    const result = await executeTool(listCategoriesTool, {}, context());

    expect(result).toEqual([category]);
    expectValidOutput(listCategoriesTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/categories'));
    expect(calls[0].init.method).toBe('GET');
  });

  it('forwards filter and pagination parameters to the categories query', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: [category] }));

    const result = await executeTool(
      listCategoriesTool,
      {
        query: 'oil',
        parentId: 'parent-1',
        rootOnly: false,
        hasProducts: true,
        sort: 'name_desc',
        page: 2,
        limit: 12,
        offset: 12,
      },
      context(),
    );

    expect(result).toEqual([category]);
    expectValidOutput(listCategoriesTool.outputSchema, result);
    expect(calls[0].url).toBe(
      apiUrl(
        '/categories?q=oil&parent_id=parent-1&root_only=false&has_products=true&sort=name_desc&page=2&limit=12&offset=12',
      ),
    );
  });
});

describe('getCategoryTool', () => {
  it('gets a category by ID', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: category }));

    const result = await executeTool(getCategoryTool, { id: 'cat-1' }, context());

    expect(result).toEqual(category);
    expectValidOutput(getCategoryTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/categories/cat-1'));
  });

  it('gets a category by slug', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: category }));

    const result = await executeTool(
      getCategoryTool,
      { slug: 'cooking-oil' },
      context(),
    );

    expectValidOutput(getCategoryTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/categories/slug/cooking-oil'));
  });
});

describe('createCategoryTool', () => {
  it('creates a category as an admin', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: category }));

    const result = await executeTool(
      createCategoryTool,
      { name: category.name, parentId: 'cat-root' },
      context({ userRole: 'admin' }),
    );

    expect(result).toEqual(category);
    expectValidOutput(createCategoryTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/admin/categories'));
    expect(calls[0].init.method).toBe('POST');
    expect(bodyOf(calls[0].init)).toEqual({
      name: category.name,
      parent_id: 'cat-root',
    });
  });

  it('rejects a customer before calling the API', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: category }));

    await expect(
      executeTool(createCategoryTool, { name: 'Test' }, context()),
    ).rejects.toThrow(/admin/i);

    expect(calls).toHaveLength(0);
  });
});

describe('updateCategoryTool', () => {
  it('updates a category as an admin', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: category }));

    const result = await executeTool(
      updateCategoryTool,
      { id: 'cat-1', name: 'Oils', clearParent: true },
      context({ userRole: 'admin' }),
    );

    expectValidOutput(updateCategoryTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/admin/categories/cat-1'));
    expect(calls[0].init.method).toBe('PATCH');
    expect(bodyOf(calls[0].init)).toEqual({
      name: 'Oils',
      clear_parent: true,
    });
  });
});

describe('deleteCategoryTool', () => {
  it('deletes a category and returns a success acknowledgement', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: null }));

    const result = await executeTool(
      deleteCategoryTool,
      { id: 'cat-1' },
      context({ userRole: 'admin' }),
    );

    expect(result).toEqual({ success: true });
    expectValidOutput(deleteCategoryTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/admin/categories/cat-1'));
    expect(calls[0].init.method).toBe('DELETE');
  });
});

describe('request context', () => {
  it('requires an authenticated context for every category tool', async () => {
    const { calls } = stubFetch();

    const cases = [
      [listCategoriesTool, {}],
      [getCategoryTool, { id: 'cat-1' }],
      [createCategoryTool, { name: 'Test' }],
      [updateCategoryTool, { id: 'cat-1' }],
      [deleteCategoryTool, { id: 'cat-1' }],
    ] as const;

    for (const [tool, input] of cases) {
      await expectRequestContextRequired(tool, input);
    }

    expect(calls).toHaveLength(0);
  });
});
