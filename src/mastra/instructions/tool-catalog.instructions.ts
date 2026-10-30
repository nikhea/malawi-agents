import { productsTools } from "../tools/products.tool";
import { categoriesTools } from "../tools/categories.tool";
import { variantsTools } from "../tools/variants.tool";
import { cartTools } from "../tools/cart.tool";
import { ordersTools } from "../tools/orders.tool";
import { paymentsTools } from "../tools/payments.tool";
import { wishlistTools } from "../tools/wishlist.tool";
import { reviewsTools } from "../tools/reviews.tool";
import { usersTools } from "../tools/users.tool";
import { inventoryTools } from "../tools/inventory.tool";

export interface ToolCatalogEntry {
  /** Human grouping used as a heading in the prompt. */
  group: string;
  /** Registry key, e.g. `listOrdersTool`. */
  name: string;
  /** Registered Mastra tool ID the model must call, e.g. `list-orders`. */
  id: string;
  /** First sentence of the tool description. */
  description: string;
}

/**
 * Every tool the store agent can reach, grouped for the prompt.
 *
 * This is the single source of truth: the prompt block below is generated from
 * these objects, so a renamed tool ID can never drift from what the model is
 * told to call. Add or remove tools here, not in the instruction string.
 */
const toolGroups: ReadonlyArray<{
  group: string;
  tools: Record<string, { id: string; description?: string }>;
}> = [
  { group: "Catalog & Products", tools: productsTools },
  { group: "Categories", tools: categoriesTools },
  { group: "Variants", tools: variantsTools },
  { group: "Cart", tools: cartTools },
  { group: "Orders", tools: ordersTools },
  { group: "Payments", tools: paymentsTools },
  { group: "Wishlist", tools: wishlistTools },
  { group: "Reviews", tools: reviewsTools },
  { group: "Users", tools: usersTools },
  { group: "Inventory", tools: inventoryTools },
];

/**
 * Keep descriptions to one line. Tool descriptions are multi-sentence and the
 * prompt only needs the gist; the schema and tool result carry the detail.
 */
function firstSentence(text: string | undefined): string {
  const collapsed = (text ?? "").replace(/\s+/g, " ").trim();
  if (!collapsed) return "";

  const match = collapsed.match(/^.*?[.!?](?=\s+[A-Z]|\s*$)/);
  return match ? match[0] : collapsed;
}

/**
 * Structured catalog: `{ group, name, id, description }` per tool.
 *
 * Use this when you need tool metadata in code (tests, evals, docs). Use
 * `tool_catalog` for the prompt text.
 */
export const toolCatalog: ToolCatalogEntry[] = toolGroups.flatMap(
  ({ group, tools }) =>
    Object.entries(tools).map(([name, tool]) => ({
      group,
      name,
      id: tool.id,
      description: firstSentence(tool.description),
    })),
);

/** Tool names keyed by registered ID, for fast lookups. */
export const toolCatalogById = new Map(
  toolCatalog.map((entry) => [entry.id, entry]),
);

function renderCatalog(): string {
  const sections = toolGroups.map(({ group, tools }) => {
    const entries = Object.entries(tools).map(([name, tool]) => {
      const description = firstSentence(tool.description);
      const header = `  * Tool Name: ${name} | Tool ID: ${tool.id}`;
      return description ? `${header}\n    Description: ${description}` : header;
    });

    return `- ${group}:\n${entries.join("\n")}`;
  });

  return `<registered_tools>
Available tools registered in the system with their Tool Name and Tool ID.

Call a tool by its exact Tool ID, never by its Tool Name and never in CamelCase.
A tool that is not in the current tool list is loaded on demand: call
search_tools with a keyword first, then call the exact Tool ID from the results.
If a call fails because a tool was not found, run search_tools and retry with
the exact Tool ID instead of guessing another spelling.

${sections.join("\n\n")}
</registered_tools>`;
}

/** Prompt block listing every tool name and ID. Generated, do not hand-edit. */
export const tool_catalog = renderCatalog();
