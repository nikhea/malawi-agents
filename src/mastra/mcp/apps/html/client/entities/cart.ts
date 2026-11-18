/** Cart line item with quantity controls. */
export const cartEntityScript = String.raw`
    function cartLine(item) {
      const qty = Number(item.qty || 0);
      return '<div class="line">' + thumb(item.name || "Cart item") +
        '<div class="line-main">' +
          '<div class="row between"><strong>' + esc(item.name || "Item") + '</strong><strong>' + esc(money(item.line_total_cents, item.currency)) + '</strong></div>' +
          '<div class="muted small">' + esc(item.sku || "") + ' · ' + esc(money(item.unit_price_cents, item.currency)) + ' each</div>' +
          '<div class="row qty">' +
            '<button class="icon" data-action="qty" data-item="' + esc(item.id) + '" data-qty="' + (qty - 1) + '" aria-label="Decrease quantity">−</button>' +
            '<span>' + qty + '</span>' +
            '<button class="icon" data-action="qty" data-item="' + esc(item.id) + '" data-qty="' + (qty + 1) + '" aria-label="Increase quantity">+</button>' +
            '<button class="link danger" data-action="remove-line" data-item="' + esc(item.id) + '">Remove</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }
`;
