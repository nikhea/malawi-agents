import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { malawiContextSchema, requireAdmin } from '../lib/malawi-context';
import { compactPayload } from '../lib/malawi-input';
import { logToolStart } from '../lib/malawi-logging';
import { createMalawiStore } from '../lib/malawi-store';
import { statusResponseSchema, stockSchema } from '../lib/malawi-schemas';

const requestContextSchema = malawiContextSchema;

const stockLineSchema = z.object({
  productId: z.string().describe('Product ID'),
  variantId: z.string().optional().describe('Variant ID for a specific SKU'),
  qty: z.number().int().min(1).describe('Quantity to hold'),
});

export const getStockTool = createTool({
  id: 'get-stock',
  description:
    'Read on-hand, reserved, and available stock for a product or variant. Admin only.',
  inputSchema: z.object({
    productId: z.string().describe('Product ID'),
    variantId: z.string().optional().describe('Variant ID for a specific SKU'),
  }),
  outputSchema: stockSchema,
  requestContextSchema,
  execute: async ({ productId, variantId }, { requestContext, observe }) => {
    logToolStart('get-stock', observe, requestContext);
    requireAdmin(requestContext);
    const store = createMalawiStore(requestContext);
    return store.inventory.getStock(
      compactPayload({
        product_id: productId,
        variant_id: variantId,
      }),
    );
  },
});

export const setStockTool = createTool({
  id: 'set-stock',
  description:
    'Set the on-hand stock quantity for a product or variant (restocking). Admin only.',
  requireApproval: true,
  inputSchema: z.object({
    productId: z.string().describe('Product ID'),
    variantId: z.string().optional().describe('Variant ID for a specific SKU'),
    qty: z.number().int().min(0).describe('New on-hand quantity'),
  }),
  outputSchema: stockSchema,
  requestContextSchema,
  execute: async ({ productId, variantId, qty }, { requestContext, observe }) => {
    logToolStart('set-stock', observe, requestContext);
    requireAdmin(requestContext);
    const store = createMalawiStore(requestContext);
    return store.inventory.setStock(
      compactPayload({
        product_id: productId,
        variant_id: variantId,
        qty,
      }),
    );
  },
});

export const reserveStockTool = createTool({
  id: 'reserve-stock',
  description:
    'Atomically hold stock for an order reference. Admin only. One short line fails the whole reservation.',
  requireApproval: true,
  inputSchema: z.object({
    orderRef: z.string().describe('Order reference to reserve stock for'),
    lines: z.array(stockLineSchema).min(1).describe('Stock lines to hold'),
    ttlSeconds: z
      .number()
      .int()
      .positive()
      .optional()
      .describe('Hold lifetime in seconds. The API default is 900.'),
  }),
  outputSchema: statusResponseSchema,
  requestContextSchema,
  execute: async ({ orderRef, lines, ttlSeconds }, { requestContext, observe }) => {
    logToolStart('reserve-stock', observe, requestContext);
    requireAdmin(requestContext);
    const store = createMalawiStore(requestContext);
    return store.inventory.reserve(
      compactPayload({
        order_ref: orderRef,
        lines: lines.map((line) => ({
          product_id: line.productId,
          variant_id: line.variantId,
          qty: line.qty,
        })),
        ttl_seconds: ttlSeconds,
      }),
    );
  },
});

export const releaseStockTool = createTool({
  id: 'release-stock',
  description:
    'Release a stock hold for an order reference. Admin only. This operation is idempotent.',
  requireApproval: true,
  inputSchema: z.object({
    orderRef: z.string().describe('Order reference whose hold should be released'),
  }),
  outputSchema: statusResponseSchema,
  requestContextSchema,
  execute: async ({ orderRef }, { requestContext, observe }) => {
    logToolStart('release-stock', observe, requestContext);
    requireAdmin(requestContext);
    const store = createMalawiStore(requestContext);
    return store.inventory.release(orderRef);
  },
});

export const confirmStockTool = createTool({
  id: 'confirm-stock',
  description:
    'Convert a stock hold into sales for an order reference. Admin only. This operation is idempotent.',
  requireApproval: true,
  inputSchema: z.object({
    orderRef: z.string().describe('Order reference whose hold should be confirmed'),
  }),
  outputSchema: statusResponseSchema,
  requestContextSchema,
  execute: async ({ orderRef }, { requestContext, observe }) => {
    logToolStart('confirm-stock', observe, requestContext);
    requireAdmin(requestContext);
    const store = createMalawiStore(requestContext);
    return store.inventory.confirm(orderRef);
  },
});

export const inventoryTools = {
  getStockTool,
  setStockTool,
  reserveStockTool,
  releaseStockTool,
  confirmStockTool,
};
