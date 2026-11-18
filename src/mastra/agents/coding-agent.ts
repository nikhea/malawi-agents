import { basename } from "node:path";
import { buildBasePrompt, createCodingAgent } from "@mastra/core/coding-agent";

export const projectPath = process.cwd();
const model = "openai/gpt-6.1-sol";

const instructions = buildBasePrompt({
  projectPath,
  projectName: basename(projectPath),
  platform: process.platform,
  date: new Date().toISOString().slice(0, 10),
  mode: "build",
  modelId: model,
  productName: "alex code assistant",
  coAuthorName: "My Coding Agent",
  coAuthorEmail: "coding-agent@example.com",
  toolGuidance: `# Workspace tools
- Use mastra_workspace_read_file for view.
- Use mastra_workspace_list_files for find_files.
- Use mastra_workspace_grep for search_content.
- Use mastra_workspace_execute_command for execute_command.
- Use mastra_workspace_write_file, mastra_workspace_edit_file, and mastra_workspace_file_stat for writing, editing, and inspecting file metadata.
- Use only the workspace tools provided to you. Do not attempt unavailable capabilities.`,
});

export const codingAgent = createCodingAgent({
  id: "coding-agent",
  name: "Coding Agent",
  model,
  instructions,
  basePath: projectPath,
  durable: true,
});
