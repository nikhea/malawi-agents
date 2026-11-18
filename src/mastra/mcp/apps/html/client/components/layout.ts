/** Shared page chrome: shell, empty state, and status messaging. */
export const layoutScript = String.raw`
    function shell(title, subtitle, content) {
      return header() + '<main class="main">' +
        '<h1>' + esc(title) + '</h1>' +
        (subtitle ? '<p class="lede">' + esc(subtitle) + '</p>' : '') +
        (busy ? '<div class="busy"><div class="spinner"></div><span>' + esc(busyLabel || "Updating the storefront") + '</span></div>' : '') +
        (notice && !busy ? '<div class="notice">' + esc(notice) + '</div>' : '') +
        content +
      '</main>';
    }

    function emptyState(title, message) {
      return '<div class="empty"><h2>' + esc(title) + '</h2><p>' + esc(message) + '</p></div>';
    }
`;
