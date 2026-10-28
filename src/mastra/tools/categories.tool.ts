import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { malawiContextSchema, requireAdmin } from '../lib/malawi-context';
import { compactPayload } from '../lib/malawi-input';
import { logToolStart } from '../lib/malawi-logging';
import { createMalawiStore } from '../lib/malawi-store';
import { categorySchema, successSchema } from '../lib/malawi-schemas';

const requestContextSchema = malawiContextSchema;

export const listCategoriesTool = createTool({
  id: 'list-categories',
  description:
    'List all product categories in the Malawi Store. Categories are returned flat and ordered by name.',
  inputSchema: z.object({}),
  outputSchema: z.array(categorySchema),
  requestContextSchema,
  execute: async (_input, { requestContext, observe }) => {
    logToolStart('list-categories', observe, requestContext);
    const store = createMalawiStore(requestContext);
    return store.categories.list();
  },
});

export const getCategoryTool = createTool({
  id: 'get-category',
  description:
    'Get one product category by its ID or slug. Use list-categories first when you only know the category name.',
  inputSchema: z.union([
    z.object({
      id: z.string().describe('Category ID'),
    }),
    z.object({
      slug: z.string().describe('Category slug, for example cooking-oil'),
    }),
  ]),
  outputSchema: categorySchema,
  requestContextSchema,
  execute: async (input, { requestContext, observe }) => {
    logToolStart('get-category', observe, requestContext);
    const store = createMalawiStore(requestContext);
    if ('id' in input) return store.categories.get(input.id);
    return store.categories.getBySlug(input.slug);
  },
});

export const createCategoryTool = createTool({
  id: 'create-category',
  description:
    'Create a product category. Admin only. Use this only when an administrator explicitly asks to add a category.',
  requireApproval: true,
  inputSchema: z.object({
    name: z.string().min(1).describe('Category name'),
    slug: z
      .string()
      .optional()
      .describe('URL slug. Generated from the name when omitted.'),
    description: z.string().optional().describe('Category description'),
    parentId: z
      .string()
      .optional()
      .describe('Parent category ID. Omit for a root category.'),
    imageUrl: z.string().optional().describe('Category image URL'),
  }),
  outputSchema: categorySchema,
  requestContextSchema,
  execute: async (input, { requestContext, observe }) => {
    logToolStart('create-category', observe, requestContext);
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

export const updateCategoryTool = createTool({
  id: 'update-category',
  description:
    'Update a product category. Admin only. Slugs cannot be changed. Set clearParent true to move the category back to the root.',
  requireApproval: true,
  inputSchema: z.object({
    id: z.string().describe('Category ID'),
    name: z.string().optional().describe('New category name'),
    description: z.string().optional().describe('New description'),
    parentId: z.string().optional().describe('New parent category ID'),
    clearParent: z
      .boolean()
      .optional()
      .describe('Set true to detach the category from its parent'),
  }),
  outputSchema: categorySchema,
  requestContextSchema,
  execute: async (input, { requestContext, observe }) => {
    logToolStart('update-category', observe, requestContext);
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

export const deleteCategoryTool = createTool({
  id: 'delete-category',
  description:
    'Delete a product category. Admin only. Child categories become root categories; they are not deleted.',
  requireApproval: true,
  inputSchema: z.object({
    id: z.string().describe('Category ID'),
  }),
  outputSchema: successSchema,
  requestContextSchema,
  execute: async ({ id }, { requestContext, observe }) => {
    logToolStart('delete-category', observe, requestContext);
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
