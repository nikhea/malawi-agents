import { Mastra } from "@mastra/core/mastra";
import { MastraEditor } from "@mastra/editor";
import { weatherWorkflow } from "./workflows/weather-workflow";
import { weatherAgent } from "./agents/weather-agent";
import { storeAgent } from "./agents/store.agent";
import {
  toolCallAppropriatenessScorer,
  completenessScorer,
  translationScorer,
} from "./scorers/weather-scorer";
import { cartTools } from "./tools/cart.tool";
import { categoriesTools } from "./tools/categories.tool";
import { inventoryTools } from "./tools/inventory.tool";
import { ordersTools } from "./tools/orders.tool";
import { paymentsTools } from "./tools/payments.tool";
import { productsTools } from "./tools/products.tool";
import { reviewsTools } from "./tools/reviews.tool";
import { usersTools } from "./tools/users.tool";
import { variantsTools } from "./tools/variants.tool";
import { wishlistTools } from "./tools/wishlist.tool";
import { malawiAuthMiddleware } from "./server/malawi-auth.middleware";
import {
  createMastraLogger,
  createMastraObservability,
  createMastraStorage,
  createRedisPubSub,
  redisCache,
} from "./lib/malawi-runtime";
import { SimpleAuth } from "@mastra/core/server";
import {
  storeInputClassifier,
  storeInputAccessClassifier,
  storeOutputClassifier,
  storeOutputPaymentClassifier,
  storeOutputPrivacyClassifier,
} from "./classifier/store-validate.classifier";
// import { KNOWLEDGE_ROUTES } from "@mastra/server/server-adapter";

type User = {
  id: string;
  name: string;
  role: "admin" | "user";
};

const logger = createMastraLogger();

export const mastra = new Mastra({
  pubsub: createRedisPubSub({ logger }),
  environment: "development",
  cache: redisCache,
  workflows: { weatherWorkflow },
  agents: { weatherAgent, storeAgent },
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
  scorers: {
    toolCallAppropriatenessScorer,
    completenessScorer,
    translationScorer,
  },
  classifiers: {
    storeInputClassifier,
    storeInputAccessClassifier,
    storeOutputClassifier,
    storeOutputPaymentClassifier,
    storeOutputPrivacyClassifier,
  },
  editor: new MastraEditor(),

  knowledge: {},
  storage: await createMastraStorage(),
  logger,
  observability: createMastraObservability({ logger }),
  studio: {
    auth: new SimpleAuth<User>({
      tokens: {
        "sk-admin-token-123": {
          id: "user-1",
          name: "Admin User",
          role: "admin",
        },
        "sk-user-token-456": {
          id: "user-2",
          name: "Regular User",
          role: "user",
        },
      },
    }),
  },
  server: {
    // apiRoutes: [...KNOWLEDGE_ROUTES],
    middleware: [
      {
        path: "/api/tools/*",
        handler: malawiAuthMiddleware,
      },
      {
        path: "/api/agents/:agentId/*",
        handler: malawiAuthMiddleware,
      },
      {
        path: "/api/workflows/:workflowId/*",
        handler: malawiAuthMiddleware,
      },
    ],
  },
});
