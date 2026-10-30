import { z } from 'zod';
import { createLoggedTool } from '../lib/malawi-logging';
import { malawiContextSchema, requireAdmin } from '../lib/malawi-context';
import {
  blankToUndefined,
  cleanInputObject,
  cleanInputSchema,
  compactPayload,
  listRows,
} from '../lib/malawi-input';
import { createMalawiStore } from '../lib/malawi-store';
import { categorySchema, successSchema } from '../lib/malawi-schemas';

const requestContextSchema = malawiContextSchema;

function categoryModelOutput(
  result: unknown,
) {
  const categories = listRows<z.infer<typeof categorySchema>>(
    result,
    'categories',
  );
  return {
    type: 'content' as const,
    value: [
      { type: 'json' as const, value: categories },
      ...categories.flatMap((category) =>
        category.image_url
          ? [{ type: 'image-url' as const, url: category.image_url }]
          : [],
      ),
    ],
  };
}

function singleCategoryModelOutput(category: z.infer<typeof categorySchema>) {
  return categoryModelOutput([category]);
}

export const listCategoriesTool = createLoggedTool({
  id: 'list-categories',
  description:
    'List or filter product categories in the Malawi Store. Filter by search query, parent category, root-only flag, product presence, sort order, and pagination.',
  inputSchema: cleanInputObject({
    query: z
      .preprocess(blankToUndefined, z.string().optional())
      .describe('Filter categories by name, description, or slug substring'),
    parentId: z
      .preprocess(blankToUndefined, z.string().optional())
      .describe('Filter categories by parent category ID'),
    rootOnly: z
      .boolean()
      .optional()
      .describe('Set true to return only root (top-level) categories'),
    hasProducts: z
      .boolean()
      .optional()
      .describe(
        'Filter categories: true for categories with active products, false for empty categories only',
      ),
    sort: z
      .enum([
        'name_asc',
        'name_desc',
        'newest',
        'oldest',
        'product_count_asc',
        'product_count_desc',
      ])
      .optional()
      .describe('Sort order for the categories'),
    page: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('1-based page number; takes precedence over offset'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe('Page size. The API defaults to 12 and caps at 100.'),
    offset: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Number of rows to skip for pagination'),
  }),
  outputSchema: z.array(categorySchema),
  requestContextSchema,
  toModelOutput: categoryModelOutput,
  execute: async (
    { query, parentId, rootOnly, hasProducts, sort, page, limit, offset },
    { requestContext, observe },
  ) => {
    const store = createMalawiStore(requestContext);
    const result = await store.categories.listPage(
      compactPayload({
        q: query,
        parent_id: parentId,
        root_only: rootOnly,
        has_products: hasProducts,
        sort,
        page,
        limit,
        offset,
      }),
    );
    return listRows(result, 'categories');
  },
});

export const getCategoryTool = createLoggedTool({
  id: 'get-category',
  description:
    'Get one product category by its ID or slug. Use list-categories first when you only know the category name.',
  inputSchema: cleanInputSchema(z.union([
    z.object({
      id: z.string().describe('Category ID'),
    }),
    z.object({
      slug: z.string().describe('Category slug, for example cooking-oil'),
    }),
  ])),
  outputSchema: categorySchema,
  requestContextSchema,
  toModelOutput: singleCategoryModelOutput,
  execute: async (input, { requestContext, observe }) => {
    const store = createMalawiStore(requestContext);
    if ('id' in input) return store.categories.get(input.id);
    return store.categories.getBySlug(input.slug);
  },
});

export const createCategoryTool = createLoggedTool({
  id: 'create-category',
  description:
    'Create a product category. Admin only. Use this only when an administrator explicitly asks to add a category.',
  requireApproval: true,
  inputSchema: cleanInputObject({
    name: z.string().min(1).describe('Category name'),
    slug: z.preprocess(blankToUndefined, z.string().optional())
      .describe('URL slug. Generated from the name when omitted.'),
    description: z.preprocess(blankToUndefined, z.string().optional()).describe('Category description'),
    parentId: z.preprocess(blankToUndefined, z.string().optional())
      .describe('Parent category ID. Omit for a root category.'),
    imageUrl: z.preprocess(blankToUndefined, z.string().optional()).describe('Category image URL'),
  }),
  outputSchema: categorySchema,
  requestContextSchema,
  execute: async (input, { requestContext, observe }) => {
    requireAdmin(requestContext);
    const store = createMalawiStore(requestContext);
    return store.categories.create(
      compactPayload({
        name: input.name,
        slug: input.slug,
        description: input.description,
        parent_id: input.parentId,
        image_url: input.imageUrl,
      }),
    );
  },
});

export const updateCategoryTool = createLoggedTool({
  id: 'update-category',
  description:
    'Update a product category. Admin only. Slugs cannot be changed. Set clearParent true to move the category back to the root.',
  requireApproval: true,
  inputSchema: cleanInputObject({
    id: z.string().describe('Category ID'),
    name: z.preprocess(blankToUndefined, z.string().optional()).describe('New category name'),
    description: z.preprocess(blankToUndefined, z.string().optional()).describe('New description'),
    parentId: z.preprocess(blankToUndefined, z.string().optional()).describe('New parent category ID'),
    clearParent: z
      .boolean()
      .optional()
      .describe('Set true to detach the category from its parent'),
  }),
  outputSchema: categorySchema,
  requestContextSchema,
  execute: async (input, { requestContext, observe }) => {
    requireAdmin(requestContext);
    const store = createMalawiStore(requestContext);
    return store.categories.update(
      input.id,
      compactPayload({
        name: input.name,
        description: input.description,
        parent_id: input.parentId,
        clear_parent: input.clearParent,
      }),
    );
  },
});

export const deleteCategoryTool = createLoggedTool({
  id: 'delete-category',
  description:
    'Delete a product category. Admin only. Child categories become root categories; they are not deleted.',
  requireApproval: true,
  inputSchema: cleanInputObject({
    id: z.string().describe('Category ID'),
  }),
  outputSchema: successSchema,
  requestContextSchema,
  execute: async ({ id }, { requestContext, observe }) => {
    requireAdmin(requestContext);
    const store = createMalawiStore(requestContext);
    await store.categories.delete(id);
    return { success: true as const };
  },
});

export const categoriesTools = {
  listCategoriesTool,
  getCategoryTool,
  createCategoryTool,
  updateCategoryTool,
  deleteCategoryTool,
};
