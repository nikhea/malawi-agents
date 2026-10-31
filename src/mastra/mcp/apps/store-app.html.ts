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
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; padding: 10px 4px 18px; flex-wrap: wrap;
    }
    .brand { display: flex; align-items: center; gap: 11px; }
    .brand-mark {
      width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center;
      background: linear-gradient(145deg, var(--green), var(--green-2));
      color: #fff; font-family: var(--serif); font-size: 23px; font-weight: 700;
      box-shadow: 0 8px 20px rgba(29, 92, 69, 0.28);
    }
    .brand strong { display: block; font-family: var(--serif); font-size: 18px; letter-spacing: 0.01em; }
    .brand span { display: block; color: var(--muted); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; }
    .top-actions { display: flex; gap: 6px; flex-wrap: wrap; }
    button {
      font: inherit; color: inherit; cursor: pointer; border: 0; background: none;
    }
    button:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
    .ghost {
      border: 1px solid var(--line); background: var(--surface); border-radius: 999px;
      padding: 7px 13px; font-size: 12px; font-weight: 600; color: var(--muted);
      transition: border-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
    }
    .ghost:hover { border-color: var(--green); color: var(--green); transform: translateY(-1px); }
    .main { padding: 8px 4px 24px; }
    .eyebrow {
      color: var(--clay); font-size: 10px; font-weight: 800; letter-spacing: 0.16em;
      text-transform: uppercase; margin-bottom: 6px;
    }
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
    .empty button, .error button, .success button {
      background: var(--green); color: #fff; border-radius: 999px; padding: 9px 16px;
      font-size: 12px; font-weight: 800;
    }
    .success .check { display: inline-grid; place-items: center; width: 52px; height: 52px; border-radius: 999px; background: rgba(29, 92, 69, 0.15); color: var(--green); font-size: 28px; }
    .error { border-color: rgba(168, 50, 42, 0.35); }
    .json {
      background: #1d1914; color: #f4ecdf; border-radius: 14px; padding: 16px; overflow: auto;
      font-size: 12px; line-height: 1.55; max-height: 460px;
    }
    .busy { display: inline-flex; align-items: center; gap: 9px; color: var(--muted); font-size: 12px; margin-bottom: 14px; }
    .spinner { width: 17px; height: 17px; border: 2px solid var(--line); border-top-color: var(--green); border-radius: 999px; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .footer { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; padding-top: 22px; border-top: 1px solid var(--line); margin-top: 26px; }
    .footer button { border: 1px solid var(--line); background: var(--surface); border-radius: 999px; padding: 7px 13px; font-size: 11px; font-weight: 700; color: var(--muted); }
    .footer button:hover { border-color: var(--green); color: var(--green); }
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
    let busy = false;
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
          Array.isArray(value.result)
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
      if ("status" in data) return "status";
      return "json";
    }

    function header() {
      return '<header class="topbar">' +
        '<div class="brand"><span class="brand-mark">M</span><div><strong>Malawi Store</strong><span>Personal storefront</span></div></div>' +
      '</header>';
    }

    function shell(title, subtitle, content) {
      return header() + '<main class="main">' +
        '<div class="eyebrow">Malawi Store</div>' +
        '<h1>' + esc(title) + '</h1>' +
        (subtitle ? '<p class="lede">' + esc(subtitle) + '</p>' : '') +
        (busy ? '<div class="busy"><div class="spinner"></div><span>Updating the storefront</span></div>' : '') +
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
        '</section>');
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
      return '<article class="order">' +
        '<div class="order-head"><div><h2>' + esc(order.status === "paid" ? "Paid order" : order.status === "cancelled" ? "Cancelled order" : "Pending order") + '</h2>' +
          '<div class="order-id">' + esc(order.id) + ' · ' + esc(shortDate(order.created_at)) + '</div></div>' +
          '<div class="row">' + statusBadge(order.status) +
            (order.status === "pending" ?
              '<button class="link danger" data-action="cancel-order" data-id="' + esc(order.id) + '">' + (confirming ? "Confirm cancel" : "Cancel") + '</button>' +
              (confirming ? '<button class="link" data-action="keep-order">Keep order</button>' : '') : '') +
          '</div></div>' +
        '<ul>' + lines.map(function (line) {
          return '<li><span>' + esc(line.qty) + ' × ' + esc(line.name) + '</span><span>' + esc(money(line.line_total_cents, order.currency)) + '</span></li>';
        }).join("") + '</ul>' +
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
      const list = reviews.map(function (review) {
        return '<article class="review"><div class="row between"><strong>' + esc(review.title || "Review") + '</strong><span class="stars">' + stars(review.rating) + '</span></div>' +
          '<p class="muted small">' + esc(review.author || "Customer") + ' · ' + esc(shortDate(review.created_at)) + '</p>' +
          '<p>' + esc(review.body || "") + '</p></article>';
      }).join("");
      return shell("Reviews", summary.count + " review" + (summary.count === 1 ? "" : "s") + " for this product.",
        '<section class="panel"><div class="row between"><div><div class="big-stars stars">' + stars(summary.average) + '</div>' +
          '<p class="muted small">' + esc(Number(summary.average || 0).toFixed(1)) + ' average from ' + esc(summary.count) + ' reviews</p></div></div>' +
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

    function renderJson(data) {
      return shell("Store data", "The tool returned this payload.",
        '<pre class="json">' + esc(JSON.stringify(data, null, 2)) + '</pre>');
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
      if (view === "categories") return void (root.innerHTML = renderCategories(data));
      if (view === "variants") return void (root.innerHTML = renderVariants(data));
      if (view === "review-summary") return void (root.innerHTML = renderReviewSummary(data));
      if (view === "reviews") return void (root.innerHTML = renderReviewSummary({ average: 0, count: data.length, reviews: data }));
      if (view === "user") return void (root.innerHTML = renderUser(data));
      if (view === "success") return void (root.innerHTML = renderSuccess());
      if (view === "status") return void (root.innerHTML = renderStatus(data));
      if (view === "text") return void (root.innerHTML = renderStatus({ status: String(data) }));
      if (view === "empty-list") {
        root.innerHTML = shell("Nothing here yet", "The store returned an empty collection.",
          emptyState("No records", "This view has no records right now."));
        return;
      }
      if (view === "collection") return void (root.innerHTML = renderJson(data));
      if (view === "json") return void (root.innerHTML = renderJson(data));
      root.innerHTML = renderEmpty();
    }

    async function runTool(name, args) {
      busy = true;
      lastAction = name;
      pendingCancel = "";
      render();
      try {
        const result = await callServerTool({ name: name, arguments: args || {} });
        lastArgs = args || {};
        lastResult = result;
      } catch (error) {
        lastResult = { isError: true, content: [{ type: "text", text: String(error && error.message ? error.message : error) }] };
      } finally {
        busy = false;
        render();
      }
    }

    root.addEventListener("click", function (event) {
      const target = event.target && event.target.closest ? event.target.closest("[data-action]") : null;
      if (!target) return;
      const action = target.getAttribute("data-action");
      if (action === "category-products") {
        const categoryId = target.getAttribute("data-id") || "";
        if (!categoryId) return;
        runTool("list-products", { categoryId: categoryId, limit: 24 });
        return;
      }
      if (action === "product") { runTool("get-product", { id: target.getAttribute("data-id") }); return; }
      if (action === "add-variant") {
        runTool("add-cart-item", {
          productId: target.getAttribute("data-product"),
          variantId: target.getAttribute("data-variant"),
          qty: 1
        });
        return;
      }
      if (action === "qty") {
        runTool("set-cart-item-qty", {
          itemId: target.getAttribute("data-item"),
          qty: Number(target.getAttribute("data-qty"))
        });
        return;
      }
      if (action === "remove-line") {
        runTool("remove-cart-item", { itemId: target.getAttribute("data-item") });
        return;
      }
      if (action === "clear-cart") {
        runTool("clear-cart", {});
        return;
      }
      if (action === "remove-wishlist") {
        runTool("remove-from-wishlist", { productId: target.getAttribute("data-product") }).then(function () {
          if (!lastResult || !lastResult.isError) runTool("list-wishlist", {});
        });
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
        runTool("cancel-order", { id: id });
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
