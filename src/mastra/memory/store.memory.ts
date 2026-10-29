// src/mastra/memory/store-memory.ts
import { Memory } from "@mastra/memory";
import { z } from "zod";

/**
 * Shopper profile. Resource-scoped, so it follows the shopper across threads.
 * Only durable facts live here. Cart, prices and stock are never stored:
 * they come from the SDK tools every turn (store.cart.get(), products.getBySlug()).
 */
export const shopperProfileSchema = z.object({
  customer: z
    .object({
      Id: z.string().max(60).optional().describe("ID of the Customer"),
      email: z.email().max(60).optional().describe("Email name or nickname"),
      name: z.string().max(60).optional().describe("Full  Name or nickname"),
      language: z.string().max(10).optional().describe("BCP-47 tag, e.g. en"),
      deliveryCity: z
        .string()
        .max(60)
        .optional()
        .describe("City only, never a full address"),
    })
    .optional(),
  shopping: z
    .object({
      budgetCents: z
        .number()
        .int()
        .positive()
        .optional()
        .describe(
          "Per-order budget in integer USD cents, same unit as price_cents",
        ),
      favouriteCategories: z
        .array(z.string().max(60))
        .max(5)
        .optional()
        .describe("Category slugs"),
      recentProducts: z
        .array(
          z.object({
            id: z.string(),
            slug: z.string().optional(),
            name: z.string().max(80),
          }),
        )
        .max(6)
        .optional()
        .describe(
          "Most recent first. Always send the full list: arrays replace, not merge.",
        ),
      basketIntent: z
        .string()
        .max(160)
        .optional()
        .describe("What they are shopping for right now"),
    })
    .optional(),
  openQuestions: z.array(z.string().max(160)).max(5).optional(),
});

export type ShopperProfile = z.infer<typeof shopperProfileSchema>;

const TITLE_MODEL = process.env.TITLE_MODEL!; // small/cheap model id

export const storeMemory = new Memory({
  options: {
    // Message history: token budget, not a message count.
    // Counts the whole prompt (system + working memory + history + current turn).
    // When over maxTokens, drops oldest history until <= maxTokens - atMaxRemoveTokens.
    // Chunked removal keeps the prompt prefix stable, so provider caches stay warm.
    // Setting messageHistory without lastMessages disables the default 10-message cap,
    // which is intended here. Do not also set lastMessages, or the sliding window returns.
    messageHistory: { maxTokens: 12_000, atMaxRemoveTokens: 4_000 },

    generateTitle: {
      model: TITLE_MODEL,
      instructions:
        "Title this shopping chat in 2-5 words. Name the product or goal. No quotes.",
      emitEvent: true, // only if the UI must show the title on the same stream
    },

    workingMemory: {
      enabled: true,
      scope: "resource",
      useStateSignals: true,
      schema: shopperProfileSchema, // schema OR template, never both
    },
  },
});

// import { Memory } from '@mastra/memory';

// /**
//  * Working memory template for the store agent.
//  *
//  * Resource-scoped: the profile follows the shopper across every thread, so a
//  * returning customer never has to repeat their details.
//  */
// const shopperProfileTemplate = `# Shopper Profile

// ## Customer
// - Name:
// - Language:
// - Delivery City:

// ## Shopping
// - Budget: [e.g. K50,000 per order]
// - Favourite Categories:
// - Products Viewed: [name, product ID or slug]
// - Current Basket Intent:

// ## Open Questions
// - [Question 1]
// `;

// export const storeMemory = new Memory({
//   options: {
//     // Message history: the last 20 stored messages stay in the context window.
//     lastMessages: 20,
//     generateTitle: true,
//     workingMemory: {
//       enabled: true,
//       scope: 'resource',
//       template: shopperProfileTemplate,
//     },
//   },
// });
