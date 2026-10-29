import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { malawiContextSchema } from '../lib/malawi-context';
import {
  blankToUndefined,
  cleanInputObject,
  compactPayload,
} from '../lib/malawi-input';
import { logToolStart } from '../lib/malawi-logging';
import { createMalawiStore } from '../lib/malawi-store';
import { orderSchema } from '../lib/malawi-schemas';

const requestContextSchema = malawiContextSchema;

export const checkoutOrderTool = createTool({
  id: 'checkout-order',
  description:
    'Place an order from the authenticated customer\'s current cart. This freezes the cart, reserves stock, clears the cart, and returns a pending order. Confirm with the customer before calling this tool.',
  requireApproval: true,
  inputSchema: cleanInputObject({}),
  outputSchema: orderSchema,
  requestContextSchema,
  execute: async (_input, { requestContext, observe }) => {
    logToolStart('checkout-order', observe, requestContext);
    const store = createMalawiStore(requestContext);
    return store.orders.checkout();
  },
});

export const listOrdersTool = createTool({
  id: 'list-orders',
  description:
    "List or filter the authenticated customer's orders. Filter by status, currency, date range, total bounds, sort order, and pagination. Use get-order for full line details.",
  inputSchema: cleanInputObject({
    status: z
      .enum(['pending', 'paid', 'cancelled'])
      .optional()
      .describe('Filter orders by status: pending, paid, or cancelled'),
    currency: z
      .preprocess(blankToUndefined, z.string().optional())
      .describe('Filter orders by currency code, for example MWK or USD'),
    createdAfter: z
      .preprocess(blankToUndefined, z.string().optional())
      .describe('Filter orders created at or after, as RFC3339 or YYYY-MM-DD'),
    createdBefore: z
      .preprocess(blankToUndefined, z.string().optional())
      .describe('Filter orders created at or before, as RFC3339 or YYYY-MM-DD'),
    minTotalCents: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Minimum order total in integer cents/tambala'),
    maxTotalCents: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Maximum order total in integer cents/tambala'),
    sort: z
      .enum(['newest', 'oldest', 'total_asc', 'total_desc'])
      .optional()
      .describe('Sort order for the orders'),
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
  outputSchema: z.array(orderSchema),
  requestContextSchema,
  execute: async (
    {
      status,
      currency,
      createdAfter,
      createdBefore,
      minTotalCents,
      maxTotalCents,
      sort,
      page,
      limit,
      offset,
    },
    { requestContext, observe },
  ) => {
    logToolStart('list-orders', observe, requestContext);
    const store = createMalawiStore(requestContext);
    return store.orders.list(
      compactPayload({
        status,
        currency,
        created_after: createdAfter,
        created_before: createdBefore,
        min_total_cents: minTotalCents,
        max_total_cents: maxTotalCents,
        sort,
        page,
        limit,
        offset,
      }),
    );
  },
});

export const getOrderTool = createTool({
  id: 'get-order',
  description:
    'Get one of the authenticated customer\'s orders by ID, including its frozen line items and status.',
  inputSchema: cleanInputObject({
    id: z.string().describe('Order ID'),
  }),
  outputSchema: orderSchema,
  requestContextSchema,
  execute: async ({ id }, { requestContext, observe }) => {
    logToolStart('get-order', observe, requestContext);
    const store = createMalawiStore(requestContext);
    return store.orders.get(id);
  },
});

export const cancelOrderTool = createTool({
  id: 'cancel-order',
  description:
    'Cancel a pending order for the authenticated customer and release its stock hold. Paid or already cancelled orders cannot be cancelled.',
  requireApproval: true,
  inputSchema: cleanInputObject({
    id: z.string().describe('Order ID'),
  }),
  outputSchema: orderSchema,
  requestContextSchema,
  execute: async ({ id }, { requestContext, observe }) => {
    logToolStart('cancel-order', observe, requestContext);
    const store = createMalawiStore(requestContext);
    return store.orders.cancel(id);
  },
});

export const ordersTools = {
  checkoutOrderTool,
  listOrdersTool,
  getOrderTool,
  cancelOrderTool,
};
