/**
 * Classifies the structured payload returned by a store tool so the renderer
 * can pick the right page.
 */
export const kindScript = String.raw`
    function kindOf(data) {
      if (data === null || data === undefined) return "empty";
      if (Array.isArray(data)) {
        if (data.length === 0) return "empty-list";
        const first = data[0] || {};
        if ("added_at" in first && "product" in first) return "wishlist";
        if ("product_id" in first && "sku" in first) return "variants";
        if ("price_cents" in first && "slug" in first) return "products";
        if ("status" in first && "lines" in first) return "orders";
        if ("parent_id" in first || "slug" in first) return "categories";
        if ("rating" in first && "body" in first) return "reviews";
        return "collection";
      }
      if (typeof data !== "object") return "text";
      if ("product" in data && "variants" in data) return "product";
      if ("items" in data && "subtotal_cents" in data) return "cart";
      if ("lines" in data && "status" in data) return "order";
      if ("average" in data && "reviews" in data) return "review-summary";
      if ("success" in data) return "success";
      if ("email" in data && "role" in data) return "user";
      if ("product_id" in data && "product" in data && "added_at" in data) return "wishlist-item";
      if ("product_id" in data && "sku" in data) return "variant";
      if ("rating" in data && "body" in data) return "review";
      if ("url" in data && "order_id" in data) return "checkout-session";
      if ("price_cents" in data && "slug" in data) return "product-card";
      if ("parent_id" in data || ("slug" in data && "name" in data)) return "category";
      if ("status" in data) return "status";
      return "record";
    }
`;
