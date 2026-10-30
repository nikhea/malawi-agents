import { Knowledge } from "@mastra/core/knowledge";
import { createMastraStorage } from "../lib/malawi-runtime";
const knowledge = new Knowledge({
  id: "praxis-knowledge",
  name: "Praxis Knowledge",
  description: "Prose context for agents", // bounded length
  structure: { scopes: [/* see §4 */], retrofit: true },
  scopes: {/* scope templates, see §5 */},
  //   storage:await createMastraStorage(),
});

// if (knowledge.name) {
//     const p = await knowledge.name()
// }
