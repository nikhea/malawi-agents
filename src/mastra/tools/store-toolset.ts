import { getProductTool, listProductsTool } from "./products.tool";
import { getCategoryTool, listCategoriesTool } from "./categories.tool";
import { listVariantsTool } from "./variants.tool";
import {
  addCartItemTool,
  clearCartTool,
  getCartTool,
  removeCartItemTool,
  setCartItemQtyTool,
} from "./cart.tool";
import {
  cancelOrderTool,
  checkoutOrderTool,
  getOrderTool,
  listOrdersTool,
} from "./orders.tool";
import {
  createCheckoutSessionTool,
  createPaymentIntentTool,
} from "./payments.tool";
import {
  addToWishlistTool,
  listWishlistTool,
  removeFromWishlistTool,
} from "./wishlist.tool";
import {
  createReviewTool,
  deleteReviewTool,
  getProductReviewsTool,
  updateReviewTool,
} from "./reviews.tool";
import { getMeTool } from "./users.tool";

type IdTool = { id: string };

/**
 * Index tools by their registered ID.
 *
 * Mastra names a tool for the model after its key in the agent's `tools` map,
 * and resolves tool calls against that same key. Keying by registry name would
 * advertise `listOrdersTool` to the model while the prompt tells it to call
 * `list-orders`, so calls miss and come back as `ToolNotFoundError`.
 */
function byToolId<const T extends readonly IdTool[]>(tools: T) {
  return Object.fromEntries(tools.map((tool) => [tool.id, tool])) as {
    [K in T[number]["id"]]: Extract<T[number], { id: K }>;
  };
}

/**
 * Tools the store agent exposes directly, on every turn, keyed by tool ID.
 *
 * Anything in here is callable immediately, so the model never has to discover
 * it first. Anything not in here (catalog writes, user administration,
 * inventory) is registered on `mastra` for direct API use but is not exposed to
 * the agent, which is why the prompt marks those as admin only.
 *
 * Add a tool to this list and the agent, the prompt catalog, and the type
 * checker all pick it up.
 */
export const storeAgentTools = byToolId([
  // account
  getMeTool,
  // catalog
  listProductsTool,
  getProductTool,
  listCategoriesTool,
  getCategoryTool,
  listVariantsTool,
  // cart
  getCartTool,
  addCartItemTool,
  setCartItemQtyTool,
  removeCartItemTool,
  clearCartTool,
  // orders
  checkoutOrderTool,
  listOrdersTool,
  getOrderTool,
  cancelOrderTool,
  // payments
  // createPaymentIntentTool,
  createCheckoutSessionTool,
  // wishlist
  listWishlistTool,
  addToWishlistTool,
  removeFromWishlistTool,
  // reviews
  getProductReviewsTool,
  createReviewTool,
  updateReviewTool,
  deleteReviewTool,
]);
