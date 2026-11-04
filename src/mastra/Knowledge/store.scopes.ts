import {
  knowledgeMemoryScopes,
  type KnowledgeScopeDeclarations,
} from "@mastra/core/knowledge";

/**
 * Canonical scope that holds store-wide, customer-readable knowledge.
 *
 * Every authenticated run is granted this scope in `malawiAuthMiddleware`, and
 * the declaration below gives it `viewer`, which is read-only. Host writes via
 * `upsertPage` do not need a run scope.
 */
export const STORE_KNOWLEDGE_SCOPE = "store:malawi";

/**
 * Declaration key for the store scope. Knowledge declarations are patterns, so
 * the concrete address above is bound from this pattern at run start.
 */
export const STORE_KNOWLEDGE_SCOPE_PATTERN = "store:$storeId";

/** Key path of the short page pinned into every store run. */
export const STORE_FACTS_PAGE = "store-facts";

export const storeKnowledgeScopes: KnowledgeScopeDeclarations = {
  // Memory's `thread:` and `resource:` identity scopes. No tenant scope is used;
  // the store scope below is the shared area.
  ...knowledgeMemoryScopes({ org: false }),
  [STORE_KNOWLEDGE_SCOPE_PATTERN]: {
    description:
      "Store-wide policies and shopping help that every signed-in customer may read.",
    displayLabel: "Malawi Store",
    access: [{ principal: "self", role: "viewer" }],
    pages: [
      {
        key: STORE_FACTS_PAGE,
        name: "Store facts",
        description:
          "What the assistant can answer, what is verified live, and which policies are not published.",
      },
    ],
    pinnedContext: [
      `${STORE_KNOWLEDGE_SCOPE_PATTERN}#${STORE_FACTS_PAGE}`,
    ],
  },
};
