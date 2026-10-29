import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { malawiContextSchema } from '../lib/malawi-context';
import { cleanInputObject } from '../lib/malawi-input';
import { logToolStart } from '../lib/malawi-logging';
import { createMalawiStore } from '../lib/malawi-store';
import { checkoutSessionSchema, paymentSchema } from '../lib/malawi-schemas';

const requestContextSchema = malawiContextSchema;

export const createPaymentIntentTool = createTool({
  id: 'create-payment-intent',
  description:
    'Create or reuse a Stripe payment intent for one of the authenticated customer\'s orders. The client secret is redacted from the model output; send the raw result to your storefront so Stripe.js can confirm the card.',
  requireApproval: true,
  inputSchema: cleanInputObject({
    orderId: z.string().describe('Order ID to pay for'),
  }),
  outputSchema: paymentSchema,
  requestContextSchema,
  toModelOutput: (output) => ({
    ...output,
    client_secret: '[redacted]',
  }),
  execute: async ({ orderId }, { requestContext, observe }) => {
    logToolStart('create-payment-intent', observe, requestContext);
    const store = createMalawiStore(requestContext);
    return store.payments.createIntent(orderId);
  },
});

export const createCheckoutSessionTool = createTool({
  id: 'create-checkout-session',
  description:
    'Create a Stripe-hosted checkout page for one of the authenticated customer\'s pending orders. Return the URL so the customer can open it and pay.',
  requireApproval: true,
  inputSchema: cleanInputObject({
    orderId: z.string().describe('Order ID to pay for'),
  }),
  outputSchema: checkoutSessionSchema,
  requestContextSchema,
  execute: async ({ orderId }, { requestContext, observe }) => {
    logToolStart('create-checkout-session', observe, requestContext);
    const store = createMalawiStore(requestContext);
    return store.payments.createCheckoutSession(orderId);
  },
});

export const paymentsTools = {
  createPaymentIntentTool,
  createCheckoutSessionTool,
};
