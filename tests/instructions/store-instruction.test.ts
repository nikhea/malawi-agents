import { describe, expect, it } from 'vitest';
import {
  entity_id_privacy,
  entity_table_format,
  registered_tools,
  storeInstructions,
  tool_registry,
} from '../../src/mastra/instructions/store.instruction';

describe('store agent truth and working-memory instructions', () => {
  it('requires verified catalog facts and rejects fabricated data', () => {
    expect(storeInstructions).toContain('Never invent or assume Malawi Store data');
    expect(storeInstructions).toContain('Do not present imaginary categories');
    expect(storeInstructions).toContain('current catalog tools do not provide sales-volume data');
  });

  it('defines the category and get-product memory triggers', () => {
    expect(storeInstructions).toContain('Keep at most 6 unique verified slugs');
    expect(storeInstructions).toContain('only after a successful get-product');
    expect(storeInstructions).toContain('Do not update it after list-products');
    expect(storeInstructions).toContain('Never store prices');
    expect(storeInstructions).toContain('never use limit 0');
    expect(storeInstructions).toContain('returned field names such as in_stock');
    expect(storeInstructions).toContain('Never print the raw image URL as visible text');
  });

  it('prevents complete store entity IDs from appearing in customer responses', () => {
    expect(entity_id_privacy).toContain('Never output a complete or raw identifier');
    expect(entity_id_privacy).toContain('orders');
    expect(entity_id_privacy).toContain('payments');
    expect(entity_id_privacy).toContain('wishlist');
    expect(entity_id_privacy).toContain('first 8 characters followed by an ellipsis');
    expect(entity_id_privacy).toContain('customer-visible response');
    expect(storeInstructions).toContain('<entity_id_privacy>');
    expect(storeInstructions).toContain('Include only a short masked order reference');
    expect(storeInstructions).toContain('even if the customer asks');
  });

  it('requires store entity data to use markdown tables', () => {
    expect(entity_table_format).toContain('Always represent customer-visible data');
    expect(entity_table_format).toContain('products, categories, carts, orders');
    expect(entity_table_format).toContain('reviews, and wishlist items');
    expect(entity_table_format).toContain('Use a table even when there is only one record');
    expect(entity_table_format).toContain('Never put complete entity IDs in a table');
    expect(storeInstructions).toContain('<entity_table_format>');
  });

  it('registers all tool names and IDs in a dedicated variable and includes them in storeInstructions', () => {
    expect(registered_tools).toBeDefined();
    expect(tool_registry).toBe(registered_tools);
    expect(storeInstructions).toContain('<registered_tools>');

    const expectedTools = [
      { name: 'listProductsTool', id: 'list-products' },
      { name: 'getProductTool', id: 'get-product' },
      { name: 'createProductTool', id: 'create-product' },
      { name: 'updateProductTool', id: 'update-product' },
      { name: 'deleteProductTool', id: 'delete-product' },
      { name: 'listCategoriesTool', id: 'list-categories' },
      { name: 'getCategoryTool', id: 'get-category' },
      { name: 'createCategoryTool', id: 'create-category' },
      { name: 'updateCategoryTool', id: 'update-category' },
      { name: 'deleteCategoryTool', id: 'delete-category' },
      { name: 'listVariantsTool', id: 'list-variants' },
      { name: 'createVariantTool', id: 'create-variant' },
      { name: 'updateVariantTool', id: 'update-variant' },
      { name: 'deleteVariantTool', id: 'delete-variant' },
      { name: 'getCartTool', id: 'get-cart' },
      { name: 'addCartItemTool', id: 'add-cart-item' },
      { name: 'setCartItemQtyTool', id: 'set-cart-item-qty' },
      { name: 'removeCartItemTool', id: 'remove-cart-item' },
      { name: 'clearCartTool', id: 'clear-cart' },
      { name: 'checkoutOrderTool', id: 'checkout-order' },
      { name: 'listOrdersTool', id: 'list-orders' },
      { name: 'getOrderTool', id: 'get-order' },
      { name: 'cancelOrderTool', id: 'cancel-order' },
      { name: 'createPaymentIntentTool', id: 'create-payment-intent' },
      { name: 'createCheckoutSessionTool', id: 'create-checkout-session' },
      { name: 'listWishlistTool', id: 'list-wishlist' },
      { name: 'addToWishlistTool', id: 'add-to-wishlist' },
      { name: 'removeFromWishlistTool', id: 'remove-from-wishlist' },
      { name: 'getProductReviewsTool', id: 'get-product-reviews' },
      { name: 'createReviewTool', id: 'create-review' },
      { name: 'updateReviewTool', id: 'update-review' },
      { name: 'deleteReviewTool', id: 'delete-review' },
      { name: 'deleteAnyReviewTool', id: 'delete-any-review' },
      { name: 'getMeTool', id: 'get-me' },
      { name: 'getUserTool', id: 'get-user' },
      { name: 'setUserRoleTool', id: 'set-user-role' },
      { name: 'getStockTool', id: 'get-stock' },
      { name: 'setStockTool', id: 'set-stock' },
      { name: 'reserveStockTool', id: 'reserve-stock' },
      { name: 'releaseStockTool', id: 'release-stock' },
      { name: 'confirmStockTool', id: 'confirm-stock' },
    ];

    for (const tool of expectedTools) {
      expect(registered_tools).toContain(`Tool Name: ${tool.name}`);
      expect(registered_tools).toContain(`Tool ID: ${tool.id}`);
      expect(storeInstructions).toContain(`Tool Name: ${tool.name}`);
      expect(storeInstructions).toContain(`Tool ID: ${tool.id}`);
    }
  });
});
