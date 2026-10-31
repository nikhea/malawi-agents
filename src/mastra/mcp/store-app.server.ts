import { MCPServer } from "@mastra/mcp";
import { storeAppHtml } from "./apps/store-app.html";
import { STORE_APP_URI, storeMcpTools } from "./store-app.tools";

/** Placeholder used by the app until the catalog has real product photography. */
export const STORE_APP_PLACEHOLDER_IMAGE =
  "https://placehold.co/600x600/f4ede2/6b5a45?text=Malawi+Store";

/**
 * MCP server for the storefront tools the agent exposes.
 *
 * The server publishes the same tool objects the agent uses, plus a single MCP
 * App resource. Every tool links to that resource through
 * `mcp._meta.ui.resourceUri`, so Mastra Studio renders the app next to the
 * tool result instead of only showing JSON.
 */
export const storeAppServer = new MCPServer({
  id: "malawi-store",
  name: "Malawi Store",
  title: "Malawi Store",
  description:
    "Browse the Malawi Store catalog, manage a cart and wishlist, review orders, read reviews, and inspect the signed-in account.",
  version: "1.0.0",
  legacy: "stateless",
  instructions:
    "Use these tools for Malawi Store shopping. Product prices are integer minor units. Read the cart before checkout, and require an exact variant ID whenever you add a variant product to the cart.",
  tools: storeMcpTools,
  appResources: {
    [STORE_APP_URI]: {
      name: "Malawi Store",
      description:
        "Interactive storefront for product grids, product detail, cart, orders, wishlist, reviews, and account data.",
      html: storeAppHtml.replace(
        "__MALAWI_STORE_PLACEHOLDER_IMAGE__",
        STORE_APP_PLACEHOLDER_IMAGE,
      ),
      meta: {
        csp: {
          // The app is self-contained: no remote scripts or stylesheets, only
          // the placeholder product image.
          resourceDomains: ["https://placehold.co"],
        },
      },
    },
  },
});
