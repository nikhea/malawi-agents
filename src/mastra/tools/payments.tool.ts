import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { malawiContextSchema } from '../lib/malawi-context';
import { createMalawiStore } from '../lib/malawi-store';
import { paymentSchema } from '../lib/malawi-schemas';

const requestContextSchema = malawiContextSchema;

export const createPaymentIntentTool = createTool({
  id: 'create-payment-intent',
  description:
    'Create or reuse a Stripe payment intent for one of the authenticated customer\'s orders. The client secret is redacted from the model output; send the raw result to your storefront so Stripe.js can confirm the card.',
  inputSchema: z.object({
    orderId: z.string().describe('Order ID to pay for'),
  }),
  outputSchema: paymentSchema,
  requestContextSchema,
  toModelOutput: (output) => ({
    ...output,
    client_secret: '[redacted]',
  }),
  execute: async ({ orderId }, { requestContext }) => {
    const store = createMalawiStore(requestContext);
    return store.payments.createIntent(orderId);
  },
});

export const paymentsTools = {
  createPaymentIntentTool,
};
