import { describe, expect, it } from 'vitest';
import { cartTools } from '../../src/mastra/tools/cart.tool';
import { categoriesTools } from '../../src/mastra/tools/categories.tool';
import { inventoryTools } from '../../src/mastra/tools/inventory.tool';
import { ordersTools } from '../../src/mastra/tools/orders.tool';
import { paymentsTools } from '../../src/mastra/tools/payments.tool';
import { productsTools } from '../../src/mastra/tools/products.tool';
import { reviewsTools } from '../../src/mastra/tools/reviews.tool';
import { usersTools } from '../../src/mastra/tools/users.tool';
import { variantsTools } from '../../src/mastra/tools/variants.tool';
import { wishlistTools } from '../../src/mastra/tools/wishlist.tool';

const allTools = {
  ...productsTools,
  ...categoriesTools,
  ...variantsTools,
  ...cartTools,
  ...ordersTools,
  ...paymentsTools,
  ...wishlistTools,
  ...reviewsTools,
  ...usersTools,
  ...inventoryTools,
};

const mutationToolIds = new Set([
  'add-cart-item',
  'add-to-wishlist',
  'cancel-order',
  'checkout-order',
  'clear-cart',
  'confirm-stock',
  'create-category',
  'create-payment-intent',
  'create-product',
  'create-review',
  'create-variant',
  'delete-any-review',
  'delete-category',
  'delete-product',
  'delete-review',
  'delete-variant',
  'release-stock',
  'remove-cart-item',
  'remove-from-wishlist',
  'reserve-stock',
  'set-cart-item-qty',
  'set-stock',
  'set-user-role',
  'update-category',
  'update-product',
  'update-review',
  'update-variant',
]);

describe('tool approval policy', () => {
  it('requires approval for every mutating tool and only those tools', () => {
    const tools = Object.values(allTools);

    expect(tools).toHaveLength(40);

    for (const tool of tools) {
      const shouldRequireApproval = mutationToolIds.has(tool.id);
      expect(tool.requireApproval ?? false).toBe(shouldRequireApproval);
    }
  });
});
