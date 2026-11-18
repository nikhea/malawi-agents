/** Catalog product card used by product grids. */
export const productCardScript = String.raw`
    function productCard(product) {
      const name = product.name || "Product";
      return '<article class="card">' +
        '<button class="card-button" data-action="product" data-id="' + esc(product.id) + '">' +
          thumb(name, product.image_url) +
          '<div class="card-body">' +
            '<div class="row between"><span class="pill">' + esc(product.category_name || "Catalog") + '</span>' +
              (product.is_active === false ? '<span class="pill muted-pill">Inactive</span>' : '') + '</div>' +
            '<h2>' + esc(name) + '</h2>' +
            '<p class="price">' + esc(money(product.price_cents, product.currency)) + '</p>' +
            '<p class="muted small clamp">' + esc(product.description || "") + '</p>' +
            '<span class="link">View details</span>' +
          '</div>' +
        '</button>' +
      '</article>';
    }
`;
