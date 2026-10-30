import { describe, expect, it } from 'vitest';
import { shopperProfileSchema } from '../../src/mastra/memory/store.memory';

const product = (index: number) => ({
  id: `product-${index}`,
  slug: `product-${index}`,
  name: `Product ${index}`,
});

describe('shopperProfileSchema', () => {
  it('allows six favourite categories and six recent products', () => {
    const result = shopperProfileSchema.safeParse({
      shopping: {
        favouriteCategories: [
          'category-1',
          'category-2',
          'category-3',
          'category-4',
          'category-5',
          'category-6',
        ],
        recentProducts: [
          product(1),
          product(2),
          product(3),
          product(4),
          product(5),
          product(6),
        ],
      },
    });

    expect(result.success).toBe(true);
  });

  it('rejects more than six categories or recent products', () => {
    expect(
      shopperProfileSchema.safeParse({
        shopping: {
          favouriteCategories: Array.from(
            { length: 7 },
            (_, index) => `category-${index}`,
          ),
          recentProducts: Array.from({ length: 7 }, (_, index) =>
            product(index),
          ),
        },
      }).success,
    ).toBe(false);
  });
});
