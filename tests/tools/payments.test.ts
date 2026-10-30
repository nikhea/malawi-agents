import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createCheckoutSessionTool,
  createPaymentIntentTool,
} from '../../src/mastra/tools/payments.tool';
import { payment } from '../fixtures';
import {
  TEST_BASE_URL,
  apiUrl,
  authorizationOf,
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

describe('createPaymentIntentTool', () => {
  it('creates a payment intent for an order', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: payment }));

    const result = await executeTool(
      createPaymentIntentTool,
      { orderId: 'order-1' },
      context(),
    );

    expect(result).toEqual(payment);
    expectValidOutput(createPaymentIntentTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/payments/intents'));
    expect(calls[0].init.method).toBe('POST');
    expect(bodyOf(calls[0].init)).toEqual({ order_id: 'order-1' });
    expect(authorizationOf(calls[0].init)).toBe('Bearer access-token');
  });

  it('redacts the Stripe client secret from model output', () => {
    const output = createPaymentIntentTool.toModelOutput?.(payment);

    expect(output).toMatchObject({
      id: 'pay-1',
      client_secret: '[redacted]',
    });
  });
});

describe('createCheckoutSessionTool', () => {
  it('creates a hosted checkout URL for an order', async () => {
    const checkout = {
      id: 'cs-1',
      order_id: 'order-1',
      url: 'https://checkout.stripe.com/c/pay/cs-1',
      expires_at: 1790000000,
    };
    const { calls } = stubFetch(() => jsonResponse({ data: checkout }));

    const result = await executeTool(
      createCheckoutSessionTool,
      { orderId: 'order-1' },
      context(),
    );

    expect(result).toEqual(checkout);
    expectValidOutput(createCheckoutSessionTool.outputSchema, result);
    expect(calls[0].url).toBe(apiUrl('/payments/checkout-sessions'));
    expect(calls[0].init.method).toBe('POST');
    expect(bodyOf(calls[0].init)).toEqual({ order_id: 'order-1' });
  });
});

describe('request context', () => {
  it('requires an authenticated context', async () => {
    const { calls } = stubFetch();

    await expectRequestContextRequired(createPaymentIntentTool, {
      orderId: 'order-1',
    });

    expect(calls).toHaveLength(0);
  });
});
