/** Inventory, order-status, and review-rating badges. */
export const badgesScript = String.raw`
    function stockBadge(variant) {
      const available = Number(variant.available || 0);
      if (variant.is_active === false) return '<span class="badge out">Inactive</span>';
      if (variant.in_stock === false || available <= 0) return '<span class="badge out">Out of stock</span>';
      return '<span class="badge stock">' + esc(available) + ' in stock</span>';
    }

    function statusBadge(status) {
      const value = String(status || "pending").toLowerCase();
      return '<span class="badge ' + esc(value) + '">' + esc(value) + '</span>';
    }

    function stars(rating) {
      const rounded = Math.max(0, Math.min(5, Math.round(Number(rating || 0))));
      return "★★★★★".slice(0, rounded) + "☆☆☆☆☆".slice(0, 5 - rounded);
    }
`;
