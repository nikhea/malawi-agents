import { Agent } from "@mastra/core/agent";
import { storeMemory } from "../memory/store.memory";
import { storeInstructions } from "../instructions/store.instruction";
import { storeAgentTools } from "../tools/store-toolset";
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
  instructions: [
    {
      role: "system",
      content: storeInstructions,
    },
    // {
    //   role: "system",
    //   content: catalogCodeMode.instructions,
    // },
  ],
  model: storedAgentModels,
  tools: storeAgentTools,
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
