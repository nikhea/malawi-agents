import { RequestContext } from "@mastra/core/request-context";
import { storeAgentTools } from "../tools/store-toolset";
import { devFallbackCredentials } from "../lib/malawi-store";
import type { MalawiContext } from "../lib/malawi-context";

/**
 * MCP Apps resource served for every store tool result.
 *
 * A single app renders product grids, product detail, cart, orders, wishlist,
 * reviews, and account data by inspecting the tool's structured content.
 */
export const STORE_APP_URI = "ui://malawi-store/app";

type AppCapableTool = {
  id: string;
  mcp?: {
    _meta?: Record<string, unknown>;
  };
};

type ExecutableTool = AppCapableTool & {
  execute?: (...args: any[]) => unknown;
  requestContextSchema?: unknown;
};

/**
 * Adds the MCP Apps resource link to a tool without changing its behaviour.
 *
 * `MCPServer` reads `mcp._meta.ui.resourceUri` when it advertises a tool, and
 * Mastra Studio uses the same metadata on the agent's tool to render the app.
 * Keeping the wrapper here means the agent and the MCP server share one source
 * of truth for which tools have a UI.
 */
function withStoreApp<T extends AppCapableTool>(tool: T): T {
  return {
    ...tool,
    mcp: {
      ...tool.mcp,
      _meta: {
        ...tool.mcp?._meta,
        ui: { resourceUri: STORE_APP_URI },
      },
    },
  };
}

/**
 * Builds the Malawi request context for an MCP tool call.
 *
 * Agent calls get this context from `malawiAuthMiddleware`. MCP clients do not
 * pass through that middleware, so the bearer token the client sent to the MCP
 * server is copied into the context instead. Development keeps the existing
 * `MALAWI_TOKEN` fallback so Studio and local clients work without a header.
 */
function mcpRequestContext(context: unknown): RequestContext<MalawiContext> {
  const source = context as
    | {
        requestContext?: RequestContext<MalawiContext>;
        mcp?: { extra?: { authInfo?: { token?: string; clientId?: string; extra?: { user?: Record<string, unknown> } } } };
      }
    | undefined;

  const existing = source?.requestContext;
  const authInfo = source?.mcp?.extra?.authInfo;
  const user = authInfo?.extra?.user;

  const token = existing?.get("accessToken") || authInfo?.token || devFallbackCredentials().token;
  if (!token) {
    throw new Error(
      "MCP calls require Authorization: Bearer <malawi-access-token>.",
    );
  }

  const requestContext = existing ?? new RequestContext<MalawiContext>();
  requestContext.set("accessToken", token);

  const stringValue = (value: unknown): string | undefined =>
    typeof value === "string" && value.trim() ? value.trim() : undefined;

  requestContext.set(
    "userId",
    stringValue(user?.id) ?? stringValue(authInfo?.clientId) ?? "mcp-caller",
  );
  requestContext.set("userEmail", stringValue(user?.email) ?? "");
  requestContext.set("userName", stringValue(user?.name) ?? "MCP caller");
  requestContext.set(
    "userRole",
    user?.role === "admin" ? "admin" : "customer",
  );

  return requestContext;
}

/**
 * Adapts an agent tool for `MCPServer`.
 *
 * MCP tools must validate without the agent's request-context schema, because
 * the MCP transport supplies its own caller identity. The wrapper keeps the
 * original execute function, so all Store API calls and logging still run the
 * same way.
 */
function withMcpContext<T extends ExecutableTool>(tool: T): T {
  const execute = tool.execute;
  if (!execute) return tool;

  return {
    ...tool,
    requestContextSchema: undefined,
    execute: async (input: unknown, context: unknown) => {
      const requestContext = mcpRequestContext(context);
      return execute(input, { ...(context as object), requestContext });
    },
  } as T;
}

/** The store agent's tools, each linked to the Malawi Store MCP App. */
export const storeAppTools = Object.fromEntries(
  Object.entries(storeAgentTools).map(([id, tool]) => [id, withStoreApp(tool)]),
) as typeof storeAgentTools;

/** The MCP server's copy of the app tools, adapted for MCP request context. */
export const storeMcpTools = Object.fromEntries(
  Object.entries(storeAppTools).map(([id, tool]) => [id, withMcpContext(tool)]),
) as typeof storeAgentTools;
