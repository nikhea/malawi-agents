/**
 * Inline HTML for the Malawi Store MCP App.
 *
 * Kept as a TypeScript string rather than an `.html` file so `mastra build`
 * bundles the UI without relying on an asset-copy step. The guest script talks
 * to the host through the official MCP Apps `App` bridge.
 */
export const storeAppHtml = String.raw`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Malawi Store</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f7f1e7;
      --surface: #fffaf2;
      --surface-2: #efe4d3;
      --ink: #211a13;
      --muted: #6e6151;
      --line: #e2d4c0;
      --green: #1d5c45;
      --green-2: #2d7a5c;
      --clay: #b4552d;
      --gold: #c99a3f;
      --danger: #a8322a;
      --shadow: 0 18px 50px rgba(67, 46, 23, 0.12);
      --radius: 20px;
      --font: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
      --serif: ui-serif, Georgia, "Times New Roman", serif;
    }
    [data-theme="dark"] {
      color-scheme: dark;
      --bg: #16130f;
      --surface: #211c16;
      --surface-2: #2c251d;
      --ink: #f5ede1;
      --muted: #b7a992;
      --line: #3d342a;
      --green: #6dc6a0;
      --green-2: #8ed9b8;
      --clay: #e08a61;
      --gold: #e1b968;
      --danger: #ef8b80;
      --shadow: 0 18px 50px rgba(0, 0, 0, 0.4);
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      background:
        radial-gradient(circle at 12% 0%, rgba(201, 154, 63, 0.14), transparent 34rem),
        radial-gradient(circle at 88% 10%, rgba(29, 92, 69, 0.12), transparent 30rem),
        var(--bg);
      color: var(--ink);
      font-family: var(--font);
      font-size: 15px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    .app { max-width: 1080px; margin: 0 auto; padding: 18px 18px 28px; }
    .topbar {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      padding: 12px 4px 16px; margin-bottom: 6px;
      border-bottom: 1px solid var(--line);
    }
    .brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
    .brand-mark {
      width: 46px; height: 46px; flex: 0 0 46px; display: block; overflow: hidden;
      border-radius: 15px; background: var(--green);
      box-shadow:
        0 10px 24px -10px rgba(29, 92, 69, 0.55),
        inset 0 0 0 1px rgba(255, 255, 255, 0.16);
    }
    .brand-mark svg { display: block; width: 100%; height: 100%; }
    .brand-copy { min-width: 0; }
    .brand strong {
      display: flex; align-items: baseline; gap: 7px; flex-wrap: wrap;
      font-family: var(--serif); font-size: 21px; line-height: 1.05; letter-spacing: -0.015em;
    }
    .brand-word {
      font-family: var(--font); font-size: 10px; font-weight: 800;
      letter-spacing: 0.2em; text-transform: uppercase; color: var(--clay);
    }
    .brand-tag {
      display: flex; align-items: center; gap: 7px;
      color: var(--muted); font-size: 10px; letter-spacing: 0.13em;
      text-transform: uppercase; margin-top: 4px;
    }
    .brand-tag::before {
      content: ""; display: inline-block; width: 18px; height: 1px; background: var(--gold);
    }
    [data-theme="dark"] .brand-mark {
      box-shadow:
        0 10px 24px -10px rgba(0, 0, 0, 0.7),
        inset 0 0 0 1px rgba(255, 255, 255, 0.12);
    }
    button {
      font: inherit; color: inherit; cursor: pointer; border: 0; background: none;
    }
    button:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
    .main { padding: 14px 4px 24px; }
    h1 { font-family: var(--serif); font-size: clamp(26px, 4vw, 38px); line-height: 1.08; margin: 0 0 8px; letter-spacing: -0.02em; }
    h2 { font-family: var(--serif); font-size: 20px; line-height: 1.2; margin: 0 0 5px; }
    h3 { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin: 22px 0 9px; }
    .lede { color: var(--muted); margin: 0 0 20px; max-width: 62ch; }
    .muted { color: var(--muted); }
    .small { font-size: 12px; }
    .clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .row.between { justify-content: space-between; }
    .row.end { justify-content: flex-end; }
    .pill {
      display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--line);
      background: var(--surface-2); color: var(--muted); border-radius: 999px;
      padding: 3px 9px; font-size: 10px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
    }
    .muted-pill { opacity: 0.75; }
    .price { font-weight: 800; font-size: 17px; color: var(--green); margin: 0; }
    .link { color: var(--clay); font-size: 12px; font-weight: 700; text-decoration: none; background: none; padding: 0; }
    .link:hover { text-decoration: underline; }
    .link.danger { color: var(--danger); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
    .card {
      background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
      overflow: hidden; box-shadow: var(--shadow); position: relative;
    }
    .card-button { display: block; width: 100%; text-align: left; padding: 0; }
    .card-body { padding: 13px 15px 16px; }
    .card-body h2 { margin-bottom: 3px; }
    .thumb {
      position: relative; aspect-ratio: 4 / 3; overflow: hidden;
      background:
        linear-gradient(135deg, rgba(29, 92, 69, 0.16), rgba(201, 154, 63, 0.22)),
        repeating-linear-gradient(45deg, transparent 0 14px, rgba(255, 255, 255, 0.18) 14px 16px),
        var(--surface-2);
      display: grid; place-items: center;
    }
    .thumb-initials {
      font-family: var(--serif); font-size: clamp(34px, 8vw, 56px); font-weight: 700;
      color: var(--green); opacity: 0.55; letter-spacing: 0.04em;
    }
    .thumb img {
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.35s ease;
    }
    .card-button:hover .thumb img { transform: scale(1.04); }
    .detail { display: grid; grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr); gap: 22px; align-items: start; }
    .detail .thumb { border-radius: var(--radius); box-shadow: var(--shadow); border: 1px solid var(--line); }
    .detail-body p { color: var(--muted); }
    .panel {
      background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
      padding: 6px 16px 16px; box-shadow: var(--shadow);
    }
    .line { display: flex; gap: 13px; padding: 14px 0; border-bottom: 1px solid var(--line); align-items: flex-start; }
    .line:last-of-type { border-bottom: 0; }
    .line .thumb { width: 62px; aspect-ratio: 1; border-radius: 13px; flex: 0 0 62px; }
    .line .thumb-initials { font-size: 24px; }
    .line-main { flex: 1; min-width: 0; }
    .qty { margin-top: 7px; gap: 6px; }
    .icon {
      width: 27px; height: 27px; border-radius: 999px; border: 1px solid var(--line);
      background: var(--surface-2); display: inline-grid; place-items: center; font-weight: 700;
      line-height: 1;
    }
    .qty span { min-width: 22px; text-align: center; font-weight: 700; font-variant-numeric: tabular-nums; }
    .subtotal {
      display: flex; justify-content: space-between; align-items: baseline; gap: 12px;
      padding: 16px 0 10px; border-top: 1px solid var(--line); margin-top: 4px;
      font-size: 15px;
    }
    .subtotal strong { font-family: var(--serif); font-size: 24px; color: var(--green); }
    .table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--line); vertical-align: middle; }
    th { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); background: var(--surface-2); }
    tr:last-child td { border-bottom: 0; }
    td.right, th.right { text-align: right; }
    button.small {
      background: var(--green); color: #fff; border-radius: 999px; padding: 6px 12px;
      font-size: 11px; font-weight: 800; letter-spacing: 0.03em;
    }
    button.small:hover { background: var(--green-2); }
    button.danger { color: var(--danger); }
    .badge { display: inline-block; border-radius: 999px; padding: 3px 9px; font-size: 10px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
    .badge.pending { background: rgba(201, 154, 63, 0.2); color: #8a5a00; }
    .badge.paid { background: rgba(29, 92, 69, 0.18); color: var(--green); }
    .badge.cancelled { background: rgba(168, 50, 42, 0.15); color: var(--danger); }
    .badge.stock { background: rgba(29, 92, 69, 0.15); color: var(--green); }
    .badge.out { background: rgba(168, 50, 42, 0.12); color: var(--danger); }
    [data-theme="dark"] .badge.pending { color: var(--gold); }
    .order { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow); margin-bottom: 14px; }
    .order-head { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; flex-wrap: wrap; }
    .order-id { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: var(--muted); }
    .order ul { list-style: none; margin: 13px 0; padding: 0; border-top: 1px solid var(--line); }
    .order li { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--line); font-size: 13px; }
    .order li:last-child { border-bottom: 0; }
    .order-line {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      width: 100%; padding: 0; text-align: left; color: inherit;
    }
    .order-line:hover { color: var(--clay); }
    .order-line:hover .pill { border-color: var(--clay); color: var(--clay); }
    .order-line-side { display: inline-flex; align-items: center; gap: 8px; }
    .reviews { margin-top: 18px; padding-top: 16px; }
    .reviews-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; flex-wrap: wrap; margin-bottom: 6px; }
    .reviews-head h2 { margin-bottom: 2px; }
    .review-form {
      display: grid; gap: 10px; margin: 12px 0;
      background: var(--surface-2); border: 1px solid var(--line); border-radius: 16px; padding: 14px;
    }
    .review-form h3 { margin: 0; }
    .review-form label {
      display: grid; gap: 5px; font-size: 10px; font-weight: 800;
      letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted);
    }
    .review-form select, .review-form input, .review-form textarea {
      font: inherit; font-size: 14px; color: var(--ink); background: var(--surface);
      border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px; width: 100%;
    }
    .review-form textarea { resize: vertical; min-height: 86px; }
    .review-form select:focus, .review-form input:focus, .review-form textarea:focus {
      outline: 2px solid var(--gold); outline-offset: 1px;
    }
    .review { border-top: 1px solid var(--line); padding: 14px 0; }
    .review:first-child { border-top: 0; }
    .stars { color: var(--gold); letter-spacing: 0.08em; font-size: 14px; }
    .big-stars { font-size: 26px; letter-spacing: 0.06em; }
    .profile { display: flex; gap: 16px; align-items: center; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); }
    .avatar { width: 70px; height: 70px; border-radius: 22px; display: grid; place-items: center; background: linear-gradient(145deg, var(--green), var(--green-2)); color: #fff; font-family: var(--serif); font-size: 27px; font-weight: 700; }
    .kv { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-top: 16px; }
    .kv > div { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 12px 14px; }
    .kv span { display: block; color: var(--muted); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 3px; }
    .empty, .error, .success {
      background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
      padding: 28px 22px; text-align: center; box-shadow: var(--shadow);
    }
    .empty p, .error p, .success p { color: var(--muted); max-width: 48ch; margin: 6px auto 16px; }
    .success .check { display: inline-grid; place-items: center; width: 52px; height: 52px; border-radius: 999px; background: rgba(29, 92, 69, 0.15); color: var(--green); font-size: 28px; }
    .error { border-color: rgba(168, 50, 42, 0.35); }
    .json {
      background: #1d1914; color: #f4ecdf; border-radius: 14px; padding: 16px; overflow: auto;
      font-size: 12px; line-height: 1.55; max-height: 460px;
    }
    .busy { display: inline-flex; align-items: center; gap: 9px; color: var(--muted); font-size: 12px; margin-bottom: 14px; }
    .notice {
      display: inline-flex; align-items: center; gap: 8px; margin-bottom: 14px;
      background: rgba(29, 92, 69, 0.12); border: 1px solid rgba(29, 92, 69, 0.24);
      color: var(--green); border-radius: 999px; padding: 7px 14px;
      font-size: 12px; font-weight: 700;
    }
    [data-theme="dark"] .notice { background: rgba(109, 198, 160, 0.12); border-color: rgba(109, 198, 160, 0.28); }
    .spinner { width: 17px; height: 17px; border: 2px solid var(--line); border-top-color: var(--green); border-radius: 999px; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .boot { min-height: 60vh; display: grid; place-items: center; text-align: center; color: var(--muted); }
    .boot h1 { color: var(--ink); }
    @media (max-width: 720px) {
      .detail { grid-template-columns: 1fr; }
      .topbar { align-items: flex-start; }
      .app { padding: 12px 12px 24px; }
    }
    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; animation: none !important; }
    }
  </style>
</head>
<body>
  <div id="app" class="app" aria-live="polite">
    <div class="boot">
      <div>
        <div class="spinner" style="margin: 0 auto 14px"></div>
        <h1>Malawi Store</h1>
        <p>Connecting to the storefront app.</p>
      </div>
    </div>
  </div>
  <script type="module">
    const PLACEHOLDER_IMAGE = "__MALAWI_STORE_PLACEHOLDER_IMAGE__";
    const root = document.getElementById("app");
    const PROTOCOL_VERSION = "2026-01-26";
    const host = window.parent;
    let nextRequestId = 1;
    const pendingRequests = new Map();

    function post(message) {
      host.postMessage(message, "*");
    }

    function request(method, params, timeoutMs) {
      const id = nextRequestId++;
      return new Promise(function (resolve, reject) {
        const timer = setTimeout(function () {
          pendingRequests.delete(id);
          reject(new Error("The host did not answer " + method + " in time."));
        }, timeoutMs || 30000);
        pendingRequests.set(id, {
          resolve: function (value) { clearTimeout(timer); resolve(value); },
          reject: function (error) { clearTimeout(timer); reject(error); }
        });
        post({ jsonrpc: "2.0", id: id, method: method, params: params });
      });
    }

    function notify(method, params) {
      const message = { jsonrpc: "2.0", method: method };
      if (params !== undefined) message.params = params;
      post(message);
    }

    function applyHostContext(context) {
      if (context && context.theme) document.documentElement.setAttribute("data-theme", context.theme);
    }

    function handleHostMessage(event) {
      if (host && event.source && event.source !== host) return;
      const message = event.data;
      if (!message || message.jsonrpc !== "2.0") return;

      if (message.id !== undefined && message.method === undefined) {
        const pending = pendingRequests.get(message.id);
        if (!pending) return;
        pendingRequests.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message || "The host rejected the request."));
        else pending.resolve(message.result);
        return;
      }

      if (message.method === "ping") {
        post({ jsonrpc: "2.0", id: message.id, result: {} });
        return;
      }

      if (message.method === "ui/notifications/tool-input") {
        lastArgs = message.params && message.params.arguments ? message.params.arguments : {};
        return;
      }
      if (message.method === "ui/notifications/tool-result") {
        lastResult = message.params || null;
        busy = false;
        render();
        return;
      }
      if (message.method === "ui/notifications/tool-cancelled") {
        busy = false;
        render();
        return;
      }
      if (message.method === "ui/notifications/host-context-changed") {
        applyHostContext(message.params);
      }
    }

    window.addEventListener("message", handleHostMessage);

    function callServerTool(params) {
      return request("tools/call", params, 30000);
    }

    function connect() {
      return request("ui/initialize", {
        appInfo: { name: "Malawi Store", version: "1.0.0" },
        appCapabilities: {},
        protocolVersion: PROTOCOL_VERSION
      }, 5000).then(function (result) {
        applyHostContext(result && result.hostContext);
        notify("ui/notifications/initialized");
        return result;
      });
    }

    function startSizing() {
      let lastWidth = 0;
      let lastHeight = 0;
      let scheduled = false;

      function sendSize() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(function () {
          scheduled = false;
          const width = Math.ceil(window.innerWidth);
          const height = Math.ceil(document.documentElement.getBoundingClientRect().height);
          if (width === lastWidth && height === lastHeight) return;
          lastWidth = width;
          lastHeight = height;
          notify("ui/notifications/size-changed", { width: width, height: height });
        });
      }

      sendSize();
      window.addEventListener("resize", sendSize);
      if (typeof ResizeObserver === "function") new ResizeObserver(sendSize).observe(document.body);
    }

    let lastArgs = {};
    let lastResult = null;
    let lastAction = "";
    let pendingCancel = "";
    let pendingReviewDelete = "";
    let reviewDraft = null;
    let busy = false;
    let busyLabel = "";
    let notice = "";
    let view = "empty";
    let viewData = null;

    function esc(value) {
      return String(value === null || value === undefined ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function money(cents, currency) {
      const amount = Number(cents || 0) / 100;
      const code = String(currency || "USD").toUpperCase();
      try {
        return new Intl.NumberFormat(undefined, { style: "currency", currency: code }).format(amount);
      } catch (error) {
        return code + " " + amount.toFixed(2);
      }
    }

    function shortDate(value) {
      if (!value) return "";
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return String(value);
      return parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    }

    function initials(name) {
      const parts = String(name || "Malawi Store").trim().split(/\s+/).filter(Boolean);
      if (!parts.length) return "MS";
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    function thumb(name, imageUrl) {
      const src = imageUrl || PLACEHOLDER_IMAGE;
      return '<div class="thumb"><span class="thumb-initials">' + esc(initials(name)) + '</span>' +
        '<img src="' + esc(src) + '" alt="" loading="lazy" /></div>';
    }

    function textFromContent(result) {
      if (!result || !Array.isArray(result.content)) return "";
      return result.content.filter(function (part) {
        return part && part.type === "text";
      }).map(function (part) {
        return part.text || "";
      }).join("\n");
    }

    function payload(result) {
      if (!result) return null;
      if (result.structuredContent !== undefined) {
        const value = result.structuredContent;
        // MCPServer wraps array output schemas in a single result object so
        // the MCP structured content stays object-shaped. Unwrap it for the UI.
        if (
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          Object.keys(value).length === 1 &&
          "result" in value
        ) {
          return value.result;
        }
        return value;
      }
      const text = textFromContent(result);
      if (!text) return null;
      try {
        return JSON.parse(text);
      } catch (error) {
        return text;
      }
    }

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

    function renderProducts(products) {
      const cards = products.map(productCard).join("");
      const scoped = lastArgs && lastArgs.categoryId && products.length && products[0].category_name;
      return shell(scoped ? "Products in " + products[0].category_name : "Products",
        products.length + " product" + (products.length === 1 ? "" : "s") + " from the catalog.",
        cards ? '<section class="grid">' + cards + '</section>' :
          emptyState("No products found", "This catalog has no products to show right now."));
    }

    function renderReviewForm(draft, productId) {
      const review = draft.review || {};
      const rating = Math.max(1, Math.min(5, Number(draft.rating || review.rating || 5)));
      const options = [5, 4, 3, 2, 1].map(function (value) {
        return '<option value="' + value + '"' + (value === rating ? ' selected' : '') + '>' +
          esc(stars(value)) + '</option>';
      }).join("");
      return '<form class="review-form" data-review-form>' +
        '<h3>' + (draft.mode === "edit" ? "Edit your review" : "Write a review") + '</h3>' +
        '<label>Rating<select name="rating">' + options + '</select></label>' +
        '<label>Title<input name="title" type="text" maxlength="120" value="' + esc(review.title || "") + '" /></label>' +
        '<label>Review<textarea name="body" rows="4">' + esc(review.body || "") + '</textarea></label>' +
        '<div class="row end">' +
          '<button type="button" class="link" data-action="cancel-review">Cancel</button>' +
          '<button type="button" class="small" data-action="submit-review">' +
            (draft.mode === "edit" ? "Save changes" : "Post review") +
          '</button>' +
        '</div>' +
      '</form>';
    }

    function renderReviews(detail) {
      const product = detail.product || {};
      const productId = product.id || "";
      const summary = detail.reviews;
      const viewer = detail.viewer;
      const reviews = summary && Array.isArray(summary.reviews) ? summary.reviews : [];
      const signedIn = !!(viewer && viewer.id);
      const ownReview = signedIn
        ? reviews.filter(function (review) { return review.user_id === viewer.id; })[0]
        : null;
      const draft = reviewDraft && reviewDraft.productId === productId ? reviewDraft : null;
      const count = summary ? Number(summary.count || reviews.length) : 0;
      const average = summary ? Number(summary.average || 0) : 0;

      const summaryLine = summary
        ? '<div class="row"><span class="stars">' + stars(average) + '</span>' +
          '<span class="muted small">' + esc(average.toFixed(1)) + ' · ' + count +
          ' review' + (count === 1 ? "" : "s") + '</span></div>'
        : '<p class="muted small">Reviews are not loaded for this product.</p>';

      const head = '<div class="reviews-head"><div><h2>Reviews</h2>' + summaryLine + '</div>' +
        '<div class="row">' +
          (summary && signedIn && !ownReview && !draft
            ? '<button class="small" data-action="write-review" data-product="' + esc(productId) + '">Write a review</button>'
            : '') +
          (!summary
            ? '<button class="link" data-action="refresh-reviews" data-product="' + esc(productId) + '">Load reviews</button>'
            : '') +
        '</div></div>';

      const list = reviews.map(function (review) {
        const mine = signedIn && review.user_id === viewer.id;
        const confirming = pendingReviewDelete === review.id;
        return '<article class="review">' +
          '<div class="row between"><strong>' + esc(review.title || "Review") + '</strong>' +
            '<span class="stars">' + stars(review.rating) + '</span></div>' +
          '<p class="muted small">' + esc(review.author || "Customer") + ' · ' +
            esc(shortDate(review.created_at)) +
            (mine ? ' · <span class="pill">Your review</span>' : '') + '</p>' +
          '<p>' + esc(review.body || "") + '</p>' +
          (mine
            ? '<div class="row end">' +
                (confirming
                  ? '<span class="muted small">Delete this review?</span>' +
                    '<button class="link danger" data-action="delete-review" data-review="' + esc(review.id) + '">Confirm delete</button>' +
                    '<button class="link" data-action="keep-review">Keep</button>'
                  : '<button class="link" data-action="edit-review" data-review="' + esc(review.id) + '">Edit</button>' +
                    '<button class="link danger" data-action="delete-review" data-review="' + esc(review.id) + '">Delete</button>') +
              '</div>'
            : '') +
        '</article>';
      }).join("");

      return '<section class="panel reviews" id="reviews">' +
        head +
        (draft ? renderReviewForm(draft, productId) : "") +
        (list || (summary ? '<p class="muted">No written reviews yet.</p>' : "")) +
      '</section>';
    }

    function renderProduct(detail) {
      const product = detail.product || {};
      const variants = Array.isArray(detail.variants) ? detail.variants : [];
      const rows = variants.map(function (variant) {
        const canBuy = variant.is_active !== false && variant.in_stock !== false && Number(variant.available || 0) > 0;
        return '<tr>' +
          '<td><strong>' + esc(variant.name || "Variant") + '</strong><div class="muted small">' + esc(variant.sku || "") + '</div></td>' +
          '<td>' + esc(money(variant.price_cents, product.currency)) + '</td>' +
          '<td>' + stockBadge(variant) + '</td>' +
          '<td class="right">' + (canBuy ? '<button class="small" data-action="add-variant" data-product="' + esc(product.id) + '" data-variant="' + esc(variant.id) + '">Add to cart</button>' : '') + '</td>' +
        '</tr>';
      }).join("");
      return shell(product.name || "Product", product.category_name || "Product details",
        '<section class="detail">' +
          '<div>' + thumb(product.name || "Product", product.image_url) + '</div>' +
          '<div class="detail-body">' +
            '<div class="row between"><span class="pill">' + esc(product.category_name || "Catalog") + '</span>' +
              '<span class="price">' + esc(money(product.price_cents, product.currency)) + '</span></div>' +
            '<h2>' + esc(product.name || "Product") + '</h2>' +
            '<p>' + esc(product.description || "") + '</p>' +
            (variants.length ?
              '<h3>Choose a variant</h3><div class="table-wrap"><table><thead><tr><th>Variant</th><th>Price</th><th>Stock</th><th class="right"></th></tr></thead><tbody>' + rows + '</tbody></table></div>' :
              '<p class="muted">This product has no variants.</p>') +
          '</div>' +
        '</section>' +
        renderReviews(detail));
    }

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

    function renderCart(cart) {
      const items = Array.isArray(cart.items) ? cart.items : [];
      if (!items.length) {
        return shell("Your cart", "Your cart is empty.",
          emptyState("Nothing in the cart yet", "Add a variant to this cart and it will appear here."));
      }
      return shell("Your cart", items.length + " line" + (items.length === 1 ? "" : "s") + " ready to checkout.",
        '<section class="panel">' + items.map(cartLine).join("") +
          '<div class="subtotal"><span>Subtotal</span><strong>' + esc(money(cart.subtotal_cents, cart.currency)) + '</strong></div>' +
          '<div class="row end"><button class="link danger" data-action="clear-cart">Clear cart</button></div>' +
        '</section>');
    }

    function orderCard(order) {
      const lines = Array.isArray(order.lines) ? order.lines : [];
      const confirming = pendingCancel === order.id;
      const paid = order.status === "paid";
      return '<article class="order">' +
        '<div class="order-head"><div><h2>' + esc(order.status === "paid" ? "Paid order" : order.status === "cancelled" ? "Cancelled order" : "Pending order") + '</h2>' +
          '<div class="order-id">' + esc(order.id) + ' · ' + esc(shortDate(order.created_at)) + '</div></div>' +
          '<div class="row">' + statusBadge(order.status) +
            (order.status === "pending" ?
              '<button class="small" data-action="pay-order" data-id="' + esc(order.id) + '">Pay now</button>' +
              '<button class="link danger" data-action="cancel-order" data-id="' + esc(order.id) + '">' + (confirming ? "Confirm cancel" : "Cancel") + '</button>' +
              (confirming ? '<button class="link" data-action="keep-order">Keep order</button>' : '') : '') +
          '</div></div>' +
        '<ul>' + lines.map(function (line) {
          const label = '<span>' + esc(line.qty) + ' × ' + esc(line.name) + '</span>';
          const price = '<span>' + esc(money(line.line_total_cents, order.currency)) + '</span>';
          if (!paid || !line.product_id) return '<li>' + label + price + '</li>';
          return '<li><button class="order-line" data-action="product-reviews" data-id="' + esc(line.product_id) + '" title="Open product and reviews">' +
            label + '<span class="order-line-side">' + price + '<span class="pill">Review</span></span>' +
          '</button></li>';
        }).join("") + '</ul>' +
        (paid ? '<p class="muted small">Open a paid item to read or write its review.</p>' : '') +
        '<div class="row between"><span class="muted small">Subtotal</span><strong>' + esc(money(order.subtotal_cents, order.currency)) + '</strong></div>' +
      '</article>';
    }

    function renderOrders(orders) {
      return shell("Orders", orders.length + " order" + (orders.length === 1 ? "" : "s") + " on your account.",
        orders.length ? orders.map(orderCard).join("") :
          emptyState("No orders yet", "Your completed and pending orders will appear here."));
    }

    function renderOrder(order) {
      return shell("Order", "Order " + order.id + " is " + order.status + ".", orderCard(order));
    }

    function wishlistCard(item) {
      const product = item.product || {};
      return '<article class="card">' +
        thumb(product.name || "Wishlist item", product.image_url) +
        '<div class="card-body">' +
          '<h2>' + esc(product.name || "Wishlist item") + '</h2>' +
          '<p class="price">' + esc(money(product.price_cents, product.currency)) + '</p>' +
          '<p class="muted small">Saved ' + esc(shortDate(item.added_at)) + '</p>' +
          '<div class="row between"><button class="link" data-action="product" data-id="' + esc(product.id) + '">View product</button>' +
          '<button class="link danger" data-action="remove-wishlist" data-product="' + esc(product.id) + '">Remove</button></div>' +
        '</div>' +
      '</article>';
    }

    function renderWishlist(items) {
      return shell("Wishlist", items.length + " saved item" + (items.length === 1 ? "" : "s") + ".",
        items.length ? '<section class="grid">' + items.map(wishlistCard).join("") + '</section>' :
          emptyState("Your wishlist is empty", "Saved products will appear here."));
    }

    function categoryCard(category) {
      const name = category.name || "Category";
      return '<article class="card">' +
        '<button class="card-button" data-action="category-products" data-id="' + esc(category.id) + '">' +
          thumb(name, category.image_url) +
          '<div class="card-body">' +
            '<h2>' + esc(name) + '</h2>' +
            '<p class="muted small clamp">' + esc(category.description || "Shop this category") + '</p>' +
            '<span class="link">View products</span>' +
          '</div>' +
        '</button>' +
      '</article>';
    }

    function renderCategories(categories) {
      const cards = categories.map(categoryCard).join("");
      return shell("Categories", categories.length + " categories in the catalog.",
        cards ? '<section class="grid">' + cards + '</section>' :
          emptyState("No categories", "The catalog has no categories right now."));
    }

    function renderVariants(variants) {
      const rows = variants.map(function (variant) {
        return '<tr><td><strong>' + esc(variant.name) + '</strong><div class="muted small">' + esc(variant.sku) + '</div></td>' +
          '<td>' + esc(money(variant.price_cents, "USD")) + '</td><td>' + stockBadge(variant) + '</td>' +
          '<td class="right">' + (variant.is_active !== false && variant.in_stock !== false ? '<button class="small" data-action="product" data-id="' + esc(variant.product_id) + '">View product</button>' : '') + '</td></tr>';
      }).join("");
      return shell("Variants", variants.length + " variants across the catalog.",
        '<div class="table-wrap"><table><thead><tr><th>Variant</th><th>Price</th><th>Stock</th><th class="right"></th></tr></thead><tbody>' + rows + '</tbody></table></div>');
    }

    function renderReviewSummary(summary) {
      const reviews = Array.isArray(summary.reviews) ? summary.reviews : [];
      const productId = lastArgs && lastArgs.productId ? lastArgs.productId : "";
      const list = reviews.map(function (review) {
        return '<article class="review"><div class="row between"><strong>' + esc(review.title || "Review") + '</strong><span class="stars">' + stars(review.rating) + '</span></div>' +
          '<p class="muted small">' + esc(review.author || "Customer") + ' · ' + esc(shortDate(review.created_at)) + '</p>' +
          '<p>' + esc(review.body || "") + '</p></article>';
      }).join("");
      return shell("Reviews", summary.count + " review" + (summary.count === 1 ? "" : "s") + " for this product.",
        '<section class="panel"><div class="row between"><div><div class="big-stars stars">' + stars(summary.average) + '</div>' +
          '<p class="muted small">' + esc(Number(summary.average || 0).toFixed(1)) + ' average from ' + esc(summary.count) + ' reviews</p></div>' +
          (productId ? '<button class="small" data-action="product-reviews" data-id="' + esc(productId) + '">View product &amp; reviews</button>' : '') +
        '</div>' +
          (list || '<p class="muted">No written reviews yet.</p>') + '</section>');
    }

    function renderUser(user) {
      return shell("Your account", "The profile attached to this storefront session.",
        '<section class="profile"><div class="avatar">' + esc(initials(user.name)) + '</div>' +
          '<div><h2>' + esc(user.name) + '</h2><p class="muted">' + esc(user.email) + '</p>' +
          '<div class="row"><span class="pill">' + esc(user.role) + '</span>' +
          '<span class="pill">' + (user.email_verified ? "Verified email" : "Email not verified") + '</span></div></div>' +
        '</section>' +
        '<div class="kv"><div><span>User ID</span>' + esc(user.id) + '</div><div><span>Member since</span>' + esc(shortDate(user.created_at)) + '</div></div>');
    }

    function successMessage() {
      if (lastAction === "clear-cart") return "Your cart has been cleared.";
      if (lastAction === "remove-wishlist") return "The item was removed from your wishlist.";
      if (lastAction === "cancel-order") return "The order has been cancelled.";
      return "The storefront has been updated.";
    }

    function renderSuccess() {
      return shell("Done", "Your storefront was updated.",
        '<div class="success"><span class="check">✓</span><h2>' + esc(successMessage()) + '</h2>' +
        '<p>Ask the assistant to show this view again to see the latest state.</p></div>');
    }

    function renderStatus(data) {
      const message = typeof data === "string" ? data : String(data.status || "Updated");
      return shell("Update", "The store reported the result of that request.",
        '<div class="success"><span class="check">✓</span><h2>' + esc(message) + '</h2>' +
        '<p>The app has the latest response from the store.</p></div>');
    }

    function labelize(key) {
      return String(key).replace(/_/g, " ").replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
    }

    function prettyValue(value) {
      if (value === null || value === undefined || value === "") return "—";
      if (typeof value === "boolean") return value ? "Yes" : "No";
      if (Array.isArray(value)) return value.length + " item" + (value.length === 1 ? "" : "s");
      if (typeof value === "object") {
        const count = Object.keys(value).length;
        return count + " field" + (count === 1 ? "" : "s");
      }
      return String(value);
    }

    function renderRecord(data) {
      const entries = Object.entries(data).filter(function (entry) { return entry[0] !== "_meta"; });
      return shell("Store update", "The store returned this record.",
        '<section class="panel"><div class="kv">' + entries.map(function (entry) {
          return '<div><span>' + esc(labelize(entry[0])) + '</span>' + esc(prettyValue(entry[1])) + '</div>';
        }).join("") + '</div></section>');
    }

    function renderCollection(items) {
      const rows = items.map(function (item) {
        if (!item || typeof item !== "object") {
          return '<div class="line"><div class="line-main">' + esc(String(item)) + '</div></div>';
        }
        const title = item.name || item.title || item.status || item.id || "Record";
        const detail = Object.keys(item)
          .filter(function (key) { return key !== "id" && key !== "name" && key !== "title" && key !== "_meta"; })
          .slice(0, 3)
          .map(function (key) { return labelize(key) + ": " + prettyValue(item[key]); })
          .join(" · ");
        return '<div class="line"><div class="line-main"><strong>' + esc(title) + '</strong>' +
          (detail ? '<div class="muted small">' + esc(detail) + '</div>' : '') + '</div></div>';
      }).join("");
      return shell("Records", items.length + " record" + (items.length === 1 ? "" : "s") + " from the store.",
        '<section class="panel">' + rows + '</section>');
    }

    function renderCheckoutSession(session) {
      const url = String(session.url || "");
      const safeUrl = /^https?:\/\//i.test(url);
      const rawExpiry = Number(session.expires_at || 0);
      const expiry = rawExpiry > 0
        ? new Date(rawExpiry > 1e12 ? rawExpiry : rawExpiry * 1000)
        : null;
      return shell("Checkout ready", "A payment page was created for this order.",
        '<section class="panel"><h2>Order ' + esc(session.order_id || session.id || "") + '</h2>' +
        '<p class="muted small">' + (expiry && !Number.isNaN(expiry.getTime())
          ? "Expires " + esc(shortDate(expiry.toISOString()))
          : "Payment page ready") + '</p>' +
        (safeUrl ? '<button class="small" data-action="open-checkout" data-url="' + esc(url) + '">Open payment page</button>' : '') +
        '</section>');
    }

    function renderEmpty() {
      return shell("Your storefront", "Ask the assistant to browse products, check a cart, or review an order. Results appear here as an interactive view.",
        emptyState("Ready when you are", "The storefront shows one view at a time."));
    }

    function renderError() {
      const message = textFromContent(lastResult) || "The store could not complete that request.";
      return shell("Something went wrong", "The store returned an error.",
        '<div class="error"><h2>That did not work</h2><p>' + esc(message) + '</p></div>');
    }

    function render() {
      const data = payload(lastResult);
      if (lastResult && lastResult.isError) {
        root.innerHTML = renderError();
        return;
      }
      view = kindOf(data);
      viewData = data;
      if (view === "products") return void (root.innerHTML = renderProducts(data));
      if (view === "product") return void (root.innerHTML = renderProduct(data));
      if (view === "cart") return void (root.innerHTML = renderCart(data));
      if (view === "orders") return void (root.innerHTML = renderOrders(data));
      if (view === "order") return void (root.innerHTML = renderOrder(data));
      if (view === "wishlist") return void (root.innerHTML = renderWishlist(data));
      if (view === "wishlist-item") return void (root.innerHTML = renderWishlist([data]));
      if (view === "categories") return void (root.innerHTML = renderCategories(data));
      if (view === "category") return void (root.innerHTML = renderCategories([data]));
      if (view === "variants") return void (root.innerHTML = renderVariants(data));
      if (view === "variant") return void (root.innerHTML = renderVariants([data]));
      if (view === "review-summary") return void (root.innerHTML = renderReviewSummary(data));
      if (view === "reviews") return void (root.innerHTML = renderReviewSummary({ average: 0, count: data.length, reviews: data }));
      if (view === "review") return void (root.innerHTML = renderReviewSummary({ average: data.rating, count: 1, reviews: [data] }));
      if (view === "product-card") return void (root.innerHTML = renderProducts([data]));
      if (view === "checkout-session") return void (root.innerHTML = renderCheckoutSession(data));
      if (view === "user") return void (root.innerHTML = renderUser(data));
      if (view === "success") return void (root.innerHTML = renderSuccess());
      if (view === "status") return void (root.innerHTML = renderStatus(data));
      if (view === "text") return void (root.innerHTML = renderStatus({ status: String(data) }));
      if (view === "empty-list") {
        root.innerHTML = shell("Nothing here yet", "The store returned an empty collection.",
          emptyState("No records", "This view has no records right now."));
        return;
      }
      if (view === "collection") return void (root.innerHTML = renderCollection(data));
      if (view === "record") return void (root.innerHTML = renderRecord(data));
      root.innerHTML = renderEmpty();
    }

    function busyLabelFor(name) {
      const labels = {
        "list-products": "Loading products",
        "get-product": "Loading product",
        "get-category": "Loading category",
        "list-categories": "Loading categories",
        "get-cart": "Loading cart",
        "list-orders": "Loading orders",
        "get-order": "Loading order",
        "list-wishlist": "Loading wishlist",
        "get-me": "Loading account",
        "get-product-reviews": "Loading reviews",
        "add-cart-item": "Adding to cart",
        "set-cart-item-qty": "Updating quantity",
        "remove-cart-item": "Removing item",
        "clear-cart": "Clearing cart",
        "remove-from-wishlist": "Updating wishlist",
        "cancel-order": "Cancelling order",
        "create-checkout-session": "Creating payment page",
        "create-review": "Posting review",
        "update-review": "Saving review",
        "delete-review": "Deleting review"
      };
      return labels[name] || "Updating the storefront";
    }

    function mutationNotice(name) {
      const notices = {
        "add-cart-item": "Added to cart.",
        "set-cart-item-qty": "Cart quantity updated.",
        "remove-cart-item": "Item removed from the cart.",
        "clear-cart": "Cart cleared.",
        "remove-from-wishlist": "Removed from your wishlist.",
        "cancel-order": "Order cancelled.",
        "create-checkout-session": "Payment page ready.",
        "create-review": "Review posted.",
        "update-review": "Review updated.",
        "delete-review": "Review deleted."
      };
      return notices[name] || "Store updated.";
    }

    function errorResult(error) {
      return {
        isError: true,
        content: [{ type: "text", text: String(error && error.message ? error.message : error) }]
      };
    }

    function isErrorResult(result) {
      return !!(result && result.isError);
    }

    function openLink(url) {
      const target = String(url || "");
      if (!/^https?:\/\//i.test(target)) return;
      function fallback() {
        try {
          if (typeof window.open === "function") window.open(target, "_blank", "noopener,noreferrer");
        } catch (error) {
          console.warn("Malawi Store could not open the payment page:", error);
        }
      }
      request("ui/open-link", { url: target }, 3000).then(function (result) {
        if (result && result.isError) fallback();
      }).catch(fallback);
    }

    async function safeCall(name, args) {
      try {
        return await callServerTool({ name: name, arguments: args || {} });
      } catch (error) {
        return errorResult(error);
      }
    }

    // The product page is a bundle: the product, its public reviews, and the
    // signed-in customer so the app knows which review it may edit or delete.
    async function loadProductBundle(productId) {
      const productResult = await safeCall("get-product", { id: productId });
      if (isErrorResult(productResult)) return productResult;
      const reviewsResult = await safeCall("get-product-reviews", { productId: productId });
      const viewerResult = await safeCall("get-me", {});
      const detail = payload(productResult) || {};
      detail.reviews = isErrorResult(reviewsResult) ? null : payload(reviewsResult);
      detail.viewer = isErrorResult(viewerResult) ? null : payload(viewerResult);
      return {
        isError: false,
        content: productResult.content || [],
        structuredContent: detail
      };
    }

    function revealReviews() {
      try {
        const section = document.getElementById("reviews");
        if (section && typeof section.scrollIntoView === "function") {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } catch (error) {
        // Scrolling is a nicety; the reviews are already rendered.
      }
    }

    async function openProduct(productId, section) {
      if (!productId || busy) return;
      busy = true;
      busyLabel = busyLabelFor("get-product");
      notice = "";
      lastAction = "get-product";
      pendingCancel = "";
      pendingReviewDelete = "";
      reviewDraft = null;
      render();
      try {
        lastResult = await loadProductBundle(productId);
        lastArgs = { id: productId };
      } catch (error) {
        lastResult = errorResult(error);
      }
      busy = false;
      render();
      if (section === "reviews") revealReviews();
    }

    function readReviewField(target, name) {
      const form = target && target.closest ? target.closest("[data-review-form]") : null;
      const field = form && form.querySelector ? form.querySelector('[name="' + name + '"]') : null;
      return field ? String(field.value === undefined ? "" : field.value) : "";
    }

    function submitReview(target) {
      const draft = reviewDraft;
      if (!draft || busy) return;
      const rating = Number(readReviewField(target, "rating")) || Number(draft.review && draft.review.rating) || 5;
      const title = readReviewField(target, "title");
      const body = readReviewField(target, "body");
      const args = draft.mode === "edit"
        ? { reviewId: draft.reviewId, rating: rating, title: title, body: body }
        : { productId: draft.productId, rating: rating, title: title, body: body };
      runReviewMutation(draft.mode === "edit" ? "update-review" : "create-review", args, draft.productId);
    }

    async function runReviewMutation(name, args, productId) {
      if (busy) return;
      busy = true;
      busyLabel = busyLabelFor(name);
      notice = "";
      lastAction = name;
      pendingCancel = "";
      pendingReviewDelete = "";
      reviewDraft = null;
      render();
      try {
        const result = await callServerTool({ name: name, arguments: args || {} });
        if (isErrorResult(result)) {
          lastResult = result;
          busy = false;
          render();
          return;
        }
        notice = mutationNotice(name);
        busyLabel = busyLabelFor("get-product-reviews");
        render();
        lastResult = await loadProductBundle(productId);
        lastArgs = { id: productId };
      } catch (error) {
        lastResult = errorResult(error);
      }
      busy = false;
      render();
    }

    // Reads replace the current view, but keep it on screen behind the busy banner
    // so the user never loses their place while the store responds.
    async function runTool(name, args) {
      if (busy) return;
      busy = true;
      busyLabel = busyLabelFor(name);
      notice = "";
      lastAction = name;
      pendingCancel = "";
      pendingReviewDelete = "";
      reviewDraft = null;
      render();
      try {
        const result = await callServerTool({ name: name, arguments: args || {} });
        lastArgs = args || {};
        lastResult = result;
      } catch (error) {
        lastResult = errorResult(error);
      }
      busy = false;
      render();
    }

    // Mutations run the write, then re-fetch the entity the user is looking at.
    // The mutation payload is never rendered on its own, so the same view stays
    // in place with a short confirmation instead of swapping to raw data.
    async function runMutation(name, args, followUp) {
      if (busy) return;
      busy = true;
      busyLabel = busyLabelFor(name);
      notice = "";
      lastAction = name;
      pendingCancel = "";
      pendingReviewDelete = "";
      render();
      try {
        const result = await callServerTool({ name: name, arguments: args || {} });
        if (isErrorResult(result)) {
          lastResult = result;
          busy = false;
          render();
          return;
        }
        notice = mutationNotice(name);
        if (!followUp || !followUp.name) {
          // Keep the current entity on screen; only the notice changes.
          busy = false;
          render();
          return;
        }
        busyLabel = busyLabelFor(followUp.name);
        render();
        const previous = payload(lastResult);
        let refreshed = await callServerTool({
          name: followUp.name,
          arguments: followUp.args || {}
        });
        // Keep the review bundle attached when a product is re-fetched after a
        // cart action, so the reviews section does not disappear.
        if (followUp.name === "get-product" && previous && previous.product) {
          const detail = payload(refreshed);
          if (detail && detail.product) {
            if (previous.reviews !== undefined) detail.reviews = previous.reviews;
            if (previous.viewer !== undefined) detail.viewer = previous.viewer;
            refreshed = {
              isError: false,
              content: refreshed.content || [],
              structuredContent: detail
            };
          }
        }
        lastArgs = followUp.args || {};
        lastResult = refreshed;
      } catch (error) {
        lastResult = errorResult(error);
      }
      busy = false;
      render();
    }

    // Checkout is the one action that legitimately opens a new view: the store
    // returns a payment page, so show it with the real URL rather than refresh
    // the order the user just left.
    async function runCheckout(orderId) {
      if (busy) return;
      busy = true;
      busyLabel = busyLabelFor("create-checkout-session");
      notice = "";
      lastAction = "create-checkout-session";
      pendingCancel = "";
      pendingReviewDelete = "";
      reviewDraft = null;
      render();
      try {
        const result = await callServerTool({
          name: "create-checkout-session",
          arguments: { orderId: orderId }
        });
        if (!isErrorResult(result)) notice = mutationNotice("create-checkout-session");
        lastResult = result;
      } catch (error) {
        lastResult = errorResult(error);
      }
      busy = false;
      render();
    }

    root.addEventListener("click", function (event) {
      if (busy) return;
      const target = event.target && event.target.closest ? event.target.closest("[data-action]") : null;
      if (!target) return;
      const action = target.getAttribute("data-action");
      if (action === "category-products") {
        const categoryId = target.getAttribute("data-id") || "";
        if (!categoryId) return;
        runTool("list-products", { categoryId: categoryId, limit: 24 });
        return;
      }
      if (action === "product") { openProduct(target.getAttribute("data-id"), ""); return; }
      if (action === "product-reviews") {
        openProduct(target.getAttribute("data-id"), "reviews");
        return;
      }
      if (action === "refresh-reviews") {
        openProduct(target.getAttribute("data-product"), "reviews");
        return;
      }
      if (action === "write-review") {
        const productId = target.getAttribute("data-product") || (viewData && viewData.product ? viewData.product.id : "");
        if (!productId || busy) return;
        pendingReviewDelete = "";
        reviewDraft = { mode: "create", productId: productId };
        render();
        return;
      }
      if (action === "edit-review") {
        const reviewId = target.getAttribute("data-review") || "";
        const reviews = viewData && viewData.reviews && Array.isArray(viewData.reviews.reviews)
          ? viewData.reviews.reviews
          : [];
        const review = reviews.filter(function (item) { return item.id === reviewId; })[0];
        if (!review || !viewData || !viewData.product || busy) return;
        pendingReviewDelete = "";
        reviewDraft = { mode: "edit", productId: viewData.product.id, reviewId: reviewId, review: review };
        render();
        return;
      }
      if (action === "cancel-review") {
        reviewDraft = null;
        render();
        return;
      }
      if (action === "submit-review") {
        submitReview(target);
        return;
      }
      if (action === "delete-review") {
        const reviewId = target.getAttribute("data-review") || "";
        if (!reviewId || busy) return;
        if (pendingReviewDelete !== reviewId) {
          pendingReviewDelete = reviewId;
          reviewDraft = null;
          render();
          return;
        }
        const productId = viewData && viewData.product ? viewData.product.id : "";
        if (!productId) return;
        runReviewMutation("delete-review", { reviewId: reviewId }, productId);
        return;
      }
      if (action === "keep-review") {
        pendingReviewDelete = "";
        render();
        return;
      }
      if (action === "add-variant") {
        const productId = target.getAttribute("data-product") || (lastArgs && lastArgs.id) || "";
        const variantId = target.getAttribute("data-variant") || "";
        if (!productId || !variantId) return;
        runMutation(
          "add-cart-item",
          { productId: productId, variantId: variantId, qty: 1 },
          { name: "get-product", args: { id: productId } }
        );
        return;
      }
      if (action === "qty") {
        const itemId = target.getAttribute("data-item") || "";
        if (!itemId) return;
        runMutation(
          "set-cart-item-qty",
          { itemId: itemId, qty: Number(target.getAttribute("data-qty")) },
          { name: "get-cart", args: {} }
        );
        return;
      }
      if (action === "remove-line") {
        const itemId = target.getAttribute("data-item") || "";
        if (!itemId) return;
        runMutation("remove-cart-item", { itemId: itemId }, { name: "get-cart", args: {} });
        return;
      }
      if (action === "clear-cart") {
        runMutation("clear-cart", {}, { name: "get-cart", args: {} });
        return;
      }
      if (action === "remove-wishlist") {
        const productId = target.getAttribute("data-product") || "";
        if (!productId) return;
        runMutation(
          "remove-from-wishlist",
          { productId: productId },
          { name: "list-wishlist", args: {} }
        );
        return;
      }
      if (action === "cancel-order") {
        const id = target.getAttribute("data-id") || "";
        if (!id) return;
        if (pendingCancel !== id) {
          pendingCancel = id;
          render();
          return;
        }
        runMutation(
          "cancel-order",
          { id: id },
          view === "order" ? { name: "get-order", args: { id: id } } : { name: "list-orders", args: {} }
        );
        return;
      }
      if (action === "pay-order") {
        const orderId = target.getAttribute("data-id") || "";
        if (!orderId) return;
        runCheckout(orderId);
        return;
      }
      if (action === "open-checkout") {
        openLink(target.getAttribute("data-url"));
        return;
      }
      if (action === "keep-order") {
        pendingCancel = "";
        render();
        return;
      }
    });

    document.addEventListener("error", function (event) {
      const image = event.target;
      if (image && image.tagName === "IMG") image.style.display = "none";
    }, true);

    render();

    // Show the storefront shell even if the host never completes the handshake.
    // The previous version stayed on "Connecting…" forever when the remote
    // bridge module was blocked by the host's content security policy.
    connect().then(function (result) {
      applyHostContext(result && result.hostContext);
      startSizing();
      if (lastResult) render();
    }).catch(function (error) {
      console.warn("Malawi Store app could not complete the host handshake:", error);
    });
  </script>
</body>
</html>`;
