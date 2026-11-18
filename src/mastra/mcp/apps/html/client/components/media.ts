/** Product image with a generated initials fallback. */
export const mediaScript = String.raw`
    function thumb(name, imageUrl) {
      const src = imageUrl || PLACEHOLDER_IMAGE;
      return '<div class="thumb"><span class="thumb-initials">' + esc(initials(name)) + '</span>' +
        '<img src="' + esc(src) + '" alt="" loading="lazy" /></div>';
    }
`;
