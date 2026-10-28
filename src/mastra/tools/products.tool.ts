import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { malawiContextSchema, requireAdmin } from '../lib/malawi-context';
import { compactPayload } from '../lib/malawi-input';
import { logToolStart } from '../lib/malawi-logging';
import { createMalawiStore } from '../lib/malawi-store';
import {
  productDetailSchema,
  productSchema,
  successSchema,
} from '../lib/malawi-schemas';

const requestContextSchema = malawiContextSchema;

export const listProductsTool = createTool({
  id: 'list-products',
  description:
    'List products in the Malawi Store catalog. Prices are integer tambala (12500 means K125.00). Use this to browse or search the storefront catalog.',
  inputSchema: z.object({
    categoryId: z.string().optional().describe('Filter products by category ID'),
    activeOnly: z
      .boolean()
      .optional()
      .describe(
        'Defaults to true on the API. Set false to include inactive products (admin catalog view).',
      ),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe('Page size. The API defaults to 20 and caps at 100.'),
    offset: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Number of rows to skip for pagination.'),
  }),
  outputSchema: z.array(productSchema),
  requestContextSchema,
  execute: async (
    { categoryId, activeOnly, limit, offset },
    { requestContext, observe },
  ) => {
    logToolStart('list-products', observe, requestContext);
    const store = createMalawiStore(requestContext);
    return store.products.list(
      compactPayload({
        category_id: categoryId,
        active_only: activeOnly,
        limit,
        offset,
      }),
    );
  },
});

export const getProductTool = createTool({
  id: 'get-product',
  description:
    'Get one product with its sellable variants by product ID or slug. Use this for product details such as description, price, and SKU options.',
  inputSchema: z.union([
    z.object({
      id: z.string().describe('Product ID'),
    }),
    z.object({
      slug: z.string().describe('Product slug, for example sunseed-cooking-oil-2l'),
    }),
  ]),
  outputSchema: productDetailSchema,
  requestContextSchema,
  execute: async (input, { requestContext, observe }) => {
    logToolStart('get-product', observe, requestContext);
    const store = createMalawiStore(requestContext);
    if ('id' in input) return store.products.get(input.id);
    return store.products.getBySlug(input.slug);
  },
});

export const createProductTool = createTool({
  id: 'create-product',
  description:
    'Create a product in the Malawi Store catalog. Admin only. Prices are integer tambala. Use this only when an administrator explicitly asks to add a product.',
  requireApproval: true,
  inputSchema: z.object({
    name: z.string().min(1).describe('Product name'),
    categoryId: z.string().optional().describe('Category ID to file the product under'),
    slug: z
      .string()
      .optional()
      .describe('URL slug. Generated from the name when omitted.'),
    description: z.string().optional().describe('Product description'),
    priceCents: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Price in integer tambala, for example 12500 for K125.00'),
    currency: z.string().optional().describe('Currency code. Defaults to MWK.'),
    imageUrl: z.string().optional().describe('Product image URL'),
  }),
  outputSchema: productSchema,
  requestContextSchema,
  execute: async (input, { requestContext, observe }) => {
    logToolStart('create-product', observe, requestContext);
    requireAdmin(requestContext);
    const store = createMalawiStore(requestContext);
    return store.products.create(
      compactPayload({
        name: input.name,
        category_id: input.categoryId,
        slug: input.slug,
        description: input.description,
        price_cents: input.priceCents,
        currency: input.currency,
        image_url: input.imageUrl,
      }),
    );
  },
});

export const updateProductTool = createTool({
  id: 'update-product',
  description:
    'Update an existing product. Admin only. Slugs cannot be changed; use isActive false to deactivate a product instead of deleting it.',
  requireApproval: true,
  inputSchema: z.object({
    id: z.string().describe('Product ID'),
    categoryId: z.string().optional().describe('New category ID'),
    name: z.string().optional().describe('New product name'),
    description: z.string().optional().describe('New description'),
    priceCents: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('New price in integer tambala'),
    currency: z.string().optional().describe('New currency code'),
    isActive: z.boolean().optional().describe('Whether the product is active'),
    clearCategory: z
      .boolean()
      .optional()
      .describe('Set true to remove the product from its category'),
  }),
  outputSchema: productSchema,
  requestContextSchema,
  execute: async (input, { requestContext, observe }) => {
    logToolStart('update-product', observe, requestContext);
    requireAdmin(requestContext);
    const store = createMalawiStore(requestContext);
    return store.products.update(
      input.id,
      compactPayload({
        category_id: input.categoryId,
        name: input.name,
        description: input.description,
        price_cents: input.priceCents,
        currency: input.currency,
        is_active: input.isActive,
        clear_category: input.clearCategory,
      }),
    );
  },
});

export const deleteProductTool = createTool({
  id: 'delete-product',
  description:
    'Permanently delete a product and its variants. Admin only. Prefer deactivating a product with update-product unless permanent deletion is explicitly requested.',
  requireApproval: true,
  inputSchema: z.object({
    id: z.string().describe('Product ID'),
  }),
  outputSchema: successSchema,
  requestContextSchema,
  execute: async ({ id }, { requestContext, observe }) => {
    logToolStart('delete-product', observe, requestContext);
    requireAdmin(requestContext);
    const store = createMalawiStore(requestContext);
    await store.products.delete(id);
    return { success: true as const };
  },
});

export const productsTools = {
  listProductsTool,
  getProductTool,
  createProductTool,
  updateProductTool,
  deleteProductTool,
};
