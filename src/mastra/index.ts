
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { DuckDBStore } from "@mastra/duckdb";
import { MastraCompositeStore } from '@mastra/core/storage';
import { Observability, MastraStorageExporter, MastraPlatformExporter, SensitiveDataFilter } from '@mastra/observability';
import { weatherWorkflow } from './workflows/weather-workflow';
import { weatherAgent } from './agents/weather-agent';
import { toolCallAppropriatenessScorer, completenessScorer, translationScorer } from './scorers/weather-scorer';
import { cartTools } from './tools/cart.tool';
import { categoriesTools } from './tools/categories.tool';
import { inventoryTools } from './tools/inventory.tool';
import { ordersTools } from './tools/orders.tool';
import { paymentsTools } from './tools/payments.tool';
import { productsTools } from './tools/products.tool';
import { reviewsTools } from './tools/reviews.tool';
import { usersTools } from './tools/users.tool';
import { variantsTools } from './tools/variants.tool';
import { wishlistTools } from './tools/wishlist.tool';
import { malawiAuthMiddleware } from './server/malawi-auth.middleware';

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { weatherAgent },
  tools: {
    ...productsTools,
    ...categoriesTools,
    ...variantsTools,
    ...cartTools,
    ...ordersTools,
    ...paymentsTools,
    ...wishlistTools,
    ...reviewsTools,
    ...usersTools,
    ...inventoryTools,
  },
  scorers: { toolCallAppropriatenessScorer, completenessScorer, translationScorer },
  storage: new MastraCompositeStore({
    id: 'composite-storage',
    default: new LibSQLStore({
      id: "mastra-storage",
      url: "file:./mastra.db",
    }),
    domains: {
      observability: await new DuckDBStore().getStore('observability'),
    }
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'mastra',
        exporters: [
          new MastraStorageExporter(), // Persists observability events to Mastra Storage
          new MastraPlatformExporter(), // Sends observability events to Mastra Platform (if MASTRA_PLATFORM_ACCESS_TOKEN is set)
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(), // Redacts sensitive data like passwords, tokens, keys
        ],
      },
    },
  }),
  server: {
    middleware: [
      {
        path: '/api/agents/:agentId/*',
        handler: malawiAuthMiddleware,
      },
      {
        path: '/api/workflows/:workflowId/*',
        handler: malawiAuthMiddleware,
      },
    ],
  },
});
