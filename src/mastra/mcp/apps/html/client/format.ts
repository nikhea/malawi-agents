/** Small presentation helpers shared by every storefront view. */
export const formatScript = String.raw`
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
`;
