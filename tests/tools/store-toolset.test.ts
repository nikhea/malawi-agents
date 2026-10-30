import { describe, expect, it } from 'vitest';
import { storeAgent } from '../../src/mastra/agents/store.agent';
import { storeAgentTools } from '../../src/mastra/tools/store-toolset';
import { toolCatalog } from '../../src/mastra/instructions/tool-catalog.instructions';

describe('store agent tool exposure', () => {
  it('keys every tool by its registered ID', () => {
    for (const [key, tool] of Object.entries(storeAgentTools)) {
      expect(key).toBe(tool.id);
    }
  });

  it('registers exactly the tools the prompt marks as available', () => {
    const registered = new Set(Object.keys(storeAgentTools));
    const available = toolCatalog
      .filter((entry) => entry.available)
      .map((entry) => entry.id);

    expect(available.sort()).toEqual([...registered].sort());
    expect(registered.has('list-orders')).toBe(true);
  });

  it('names tools for the model exactly as the prompt tells it to call them', async () => {
    // `convertTools` is internal but it is the only public path to the tool map
    // Mastra hands the model, which is what the prompt has to agree with.
    const agent = storeAgent as unknown as {
      convertTools: (args: object) => Promise<Record<string, unknown>>;
    };
    const converted = await agent.convertTools({});

    expect(Object.keys(converted).sort()).toEqual(
      Object.keys(storeAgentTools).sort(),
    );
    for (const name of Object.keys(converted)) {
      expect(name).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
