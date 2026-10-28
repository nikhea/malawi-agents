import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { malawiContextSchema } from '../lib/malawi-context';
import { createMalawiStore } from '../lib/malawi-store';
import { orderSchema } from '../lib/malawi-schemas';

const requestContextSchema = malawiContextSchema;

export const checkoutOrderTool = createTool({
  id: 'checkout-order',
  description:
    'Place an order from the authenticated customer\'s current cart. This freezes the cart, reserves stock, clears the cart, and returns a pending order. Confirm with the customer before calling this tool.',
  requireApproval: true,
  inputSchema: z.object({}),
  outputSchema: orderSchema,
  requestContextSchema,
  execute: async (_input, { requestContext }) => {
    const store = createMalawiStore(requestContext);
    return store.orders.checkout();
  },
});

export const listOrdersTool = createTool({
  id: 'list-orders',
  description:
    'List the authenticated customer\'s orders, newest first. Use get-order for full line details.',
  inputSchema: z.object({}),
  outputSchema: z.array(orderSchema),
  requestContextSchema,
  execute: async (_input, { requestContext }) => {
    const store = createMalawiStore(requestContext);
    return store.orders.list();
  },
});

export const getOrderTool = createTool({
  id: 'get-order',
  description:
    'Get one of the authenticated customer\'s orders by ID, including its frozen line items and status.',
  inputSchema: z.object({
    id: z.string().describe('Order ID'),
  }),
  outputSchema: orderSchema,
  requestContextSchema,
  execute: async ({ id }, { requestContext }) => {
    const store = createMalawiStore(requestContext);
    return store.orders.get(id);
  },
});

export const cancelOrderTool = createTool({
  id: 'cancel-order',
  description:
    'Cancel a pending order for the authenticated customer and release its stock hold. Paid or already cancelled orders cannot be cancelled.',
  requireApproval: true,
  inputSchema: z.object({
    id: z.string().describe('Order ID'),
  }),
  outputSchema: orderSchema,
  requestContextSchema,
  execute: async ({ id }, { requestContext }) => {
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
