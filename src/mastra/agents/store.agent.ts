import { Agent } from "@mastra/core/agent";
import { getProductTool, listProductsTool } from "../tools/products.tool";
import { storeMemory } from "../memory/store.memory";
import { storeInstructions } from "../instructions/store.instruction";
import { getMeTool } from "../tools/users.tool";
import { getCategoryTool, listCategoriesTool } from "../tools/categories.tool";
import { storedAgentInputProcessors } from "../processors/store-agent-input.processor";
import {
  storedAgentErrorProcessors,
  storedAgentOutProcessors,
} from "../processors/store-agent-output.processor";
import { MAX_STEPS } from "../utils/constant.utils";
import { storedAgentModels } from "../models/store-agent.model";

export const storeAgent = new Agent({
  id: "store-agent",
  name: "Store Agent",
  memory: storeMemory,
  instructions: storeInstructions,
  model: storedAgentModels,
  tools: {
    // user
    getMeTool,
    // products
    listProductsTool,
    getProductTool,
    // categories
    listCategoriesTool,
    getCategoryTool,
  },
  inputProcessors: storedAgentInputProcessors,
  outputProcessors: storedAgentOutProcessors,
  errorProcessors: storedAgentErrorProcessors,
  errorProcessorDefaults: false,
  maxProcessorRetries: 5,
  defaultOptions: {
    maxSteps: MAX_STEPS,
    autoResumeSuspendedTools: true,
  },
});
