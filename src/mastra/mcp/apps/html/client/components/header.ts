/** Brand header with the inline sun-over-the-lake mark. */
export const headerScript = String.raw`
    function header() {
      // Sun over the lake: the mark is inline SVG so the app stays self-contained.
      return '<header class="topbar">' +
        '<div class="brand">' +
          '<span class="brand-mark" aria-hidden="true">' +
            '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" focusable="false">' +
              '<defs>' +
                '<linearGradient id="mw-mark" x1="7" y1="3" x2="41" y2="46" gradientUnits="userSpaceOnUse">' +
                  '<stop stop-color="#3a8a68" />' +
                  '<stop offset="0.55" stop-color="#1d5c45" />' +
                  '<stop offset="1" stop-color="#133d2f" />' +
                '</linearGradient>' +
              '</defs>' +
              '<rect width="48" height="48" rx="15" fill="url(#mw-mark)" />' +
              '<circle cx="24" cy="17" r="12" fill="#e1b968" opacity="0.16" />' +
              '<circle cx="24" cy="17" r="6.5" fill="#e1b968" />' +
              '<path d="M0 31c7-5 13-5 20 0s13 5 28 0v17H0Z" fill="#fdf6e9" opacity="0.94" />' +
              '<path d="M0 37c7-4.5 13-4.5 20 0s13 4.5 28 0v11H0Z" fill="#c99a3f" opacity="0.55" />' +
              '<rect x="0.5" y="0.5" width="47" height="47" rx="14.5" fill="none" stroke="#fff" stroke-opacity="0.18" />' +
            '</svg>' +
          '</span>' +
          '<span class="brand-copy">' +
            '<strong>Malawi <span class="brand-word">Store</span></strong>' +
            '<span class="brand-tag">Curated by the lake</span>' +
          '</span>' +
        '</div>' +
      '</header>';
    }
`;
