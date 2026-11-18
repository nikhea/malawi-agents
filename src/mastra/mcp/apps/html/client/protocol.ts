/**
 * Browser-side MCP Apps bridge.
 *
 * Runs inside the generated HTML document. It owns the JSON-RPC handshake with
 * the host, request/response correlation, host-context updates, and sizing.
 */
export const protocolScript = String.raw`
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
`;
