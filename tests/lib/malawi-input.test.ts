import { describe, expect, it } from 'vitest';
import { compactPayload } from '../../src/mastra/lib/malawi-input';

describe('compactPayload', () => {
  it('drops empty and whitespace-only strings', () => {
    expect(
      compactPayload({ name: 'Rice', slug: '', description: '   ' }),
    ).toEqual({ name: 'Rice' });
  });

  it('drops undefined and null but keeps false, 0, and empty arrays', () => {
    expect(
      compactPayload({
        missing: undefined,
        empty: null,
        active: false,
        offset: 0,
        lines: [],
      }),
    ).toEqual({ active: false, offset: 0, lines: [] });
  });

  it('cleans nested objects and arrays', () => {
    expect(
      compactPayload({
        order_ref: 'order-1',
        lines: [
          { product_id: 'prod-1', variant_id: '', qty: 2 },
          { product_id: 'prod-2', variant_id: 'var-2', qty: 1 },
        ],
        ttl_seconds: undefined,
      }),
    ).toEqual({
      order_ref: 'order-1',
      lines: [
        { product_id: 'prod-1', qty: 2 },
        { product_id: 'prod-2', variant_id: 'var-2', qty: 1 },
      ],
    });
  });

  it('leaves non-object values unchanged', () => {
    expect(compactPayload('value')).toBe('value');
    expect(compactPayload(0)).toBe(0);
    expect(compactPayload(false)).toBe(false);
  });
});
