
import { Mastra } from '@mastra/core/mastra';
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
import {
  createMastraLogger,
  createMastraObservability,
  createMastraStorage,
  createRedisPubSub,
} from './lib/malawi-runtime';

const logger = createMastraLogger();

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
  storage: await createMastraStorage(),
  logger,
  observability: createMastraObservability({ logger }),
  pubsub: createRedisPubSub({ logger }),
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
