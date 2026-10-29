import { z } from 'zod';
import { createLoggedTool } from '../lib/malawi-logging';
import { malawiContextSchema, requireAdmin } from '../lib/malawi-context';
import {
  blankToUndefined,
  cleanInputObject,
  compactPayload,
} from '../lib/malawi-input';
import { createMalawiStore } from '../lib/malawi-store';
import { successSchema, variantSchema } from '../lib/malawi-schemas';

const requestContextSchema = malawiContextSchema;

export const listVariantsTool = createLoggedTool({
  id: 'list-variants',
  description:
    'List the sellable SKU variants for a product. Prices are integer tambala.',
  inputSchema: cleanInputObject({
    productId: z.string().describe('Product ID whose variants should be listed'),
  }),
  outputSchema: z.array(variantSchema),
  requestContextSchema,
  execute: async ({ productId }, { requestContext, observe }) => {
    const store = createMalawiStore(requestContext);
    return store.variants.list(productId);
  },
});

export const createVariantTool = createLoggedTool({
  id: 'create-variant',
  description:
    'Create a sellable SKU variant for a product. Admin only. Prices are integer tambala.',
  requireApproval: true,
  inputSchema: cleanInputObject({
    productId: z.string().describe('Product ID the variant belongs to'),
    name: z.string().min(1).describe('Variant name, for example 500ml'),
    sku: z.string().min(1).describe('Unique SKU code, for example OIL-500'),
    priceCents: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Absolute price in integer tambala'),
  }),
  outputSchema: variantSchema,
  requestContextSchema,
  execute: async (input, { requestContext, observe }) => {
    requireAdmin(requestContext);
    const store = createMalawiStore(requestContext);
    return store.variants.create(
      input.productId,
      compactPayload({
        name: input.name,
        sku: input.sku,
        price_cents: input.priceCents,
      }),
    );
  },
});

export const updateVariantTool = createLoggedTool({
  id: 'update-variant',
  description:
    'Update a variant. Admin only. A variant product ID and SKU cannot be changed.',
  requireApproval: true,
  inputSchema: cleanInputObject({
    id: z.string().describe('Variant ID'),
    name: z.preprocess(blankToUndefined, z.string().optional()).describe('New variant name'),
    priceCents: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('New price in integer tambala'),
    isActive: z.boolean().optional().describe('Whether the variant is active'),
  }),
  outputSchema: variantSchema,
  requestContextSchema,
  execute: async (input, { requestContext, observe }) => {
    requireAdmin(requestContext);
    const store = createMalawiStore(requestContext);
    return store.variants.update(
      input.id,
      compactPayload({
        name: input.name,
        price_cents: input.priceCents,
        is_active: input.isActive,
      }),
    );
  },
});

export const deleteVariantTool = createLoggedTool({
  id: 'delete-variant',
  description: 'Delete a variant. Admin only.',
  requireApproval: true,
  inputSchema: cleanInputObject({
    id: z.string().describe('Variant ID'),
  }),
  outputSchema: successSchema,
  requestContextSchema,
  execute: async ({ id }, { requestContext, observe }) => {
    requireAdmin(requestContext);
    const store = createMalawiStore(requestContext);
    await store.variants.delete(id);
    return { success: true as const };
  },
});

export const variantsTools = {
  listVariantsTool,
  createVariantTool,
  updateVariantTool,
  deleteVariantTool,
};
