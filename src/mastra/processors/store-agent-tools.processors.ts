import { ToolSearchProcessor } from "@mastra/core/processors";
import { Tool } from "@mastra/core/tools";

import {
  checkoutOrderTool,
  listOrdersTool,
  getOrderTool,
  cancelOrderTool,
} from "../tools/orders.tool";

import {
  createCheckoutSessionTool,
  createPaymentIntentTool,
} from "../tools/payments.tool";

import { listVariantsTool } from "../tools/variants.tool";

import {
  getProductReviewsTool,
  createReviewTool,
  updateReviewTool,
  deleteReviewTool,
} from "../tools/reviews.tool";

import {
  listWishlistTool,
  addToWishlistTool,
  removeFromWishlistTool,
} from "../tools/wishlist.tool";

import {
  addCartItemTool,
  clearCartTool,
  getCartTool,
  removeCartItemTool,
  setCartItemQtyTool,
} from "../tools/cart.tool";

export const storedAgentToolSearch = new ToolSearchProcessor({
  tools: {
    // carts
    getCartTool: getCartTool as Tool<any, any>,
    addCartItemTool: addCartItemTool as Tool<any, any>,
    setCartItemQtyTool: setCartItemQtyTool as Tool<any, any>,
    removeCartItemTool: removeCartItemTool as Tool<any, any>,
    clearCartTool: clearCartTool as Tool<any, any>,
    // variants
    listVariantsTool: listVariantsTool as Tool<any, any>,
    // orders
    getOrderTool: getOrderTool as Tool<any, any>,
    checkoutOrderTool: checkoutOrderTool as Tool<any, any>,
    listOrdersTool: listOrdersTool as Tool<any, any>,
    cancelOrderTool: cancelOrderTool as Tool<any, any>,
    // payment
    createCheckoutSessionTool: createCheckoutSessionTool as Tool<any, any>,
    createPaymentIntentTool: createPaymentIntentTool as Tool<any, any>,
    // reviews
    getProductReviewsTool: getProductReviewsTool as Tool<any, any>,
    createReviewTool: createReviewTool as Tool<any, any>,
    updateReviewTool: updateReviewTool as Tool<any, any>,
    deleteReviewTool: deleteReviewTool as Tool<any, any>,
    // wishlist
    listWishlistTool: listWishlistTool as Tool<any, any>,
    addToWishlistTool: addToWishlistTool as Tool<any, any>,
    removeFromWishlistTool: removeFromWishlistTool as Tool<any, any>,
  },
  search: {
    topK: 5,
    minScore: 0.1,
    autoLoad: true,
  },
  storage: "context",
});
