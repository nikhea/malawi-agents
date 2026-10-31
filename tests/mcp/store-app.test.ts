import { describe, expect, it } from 'vitest';
import { storeAgent } from '../../src/mastra/agents/store.agent';
import { storeAppServer, STORE_APP_PLACEHOLDER_IMAGE } from '../../src/mastra/mcp/store-app.server';
import { STORE_APP_URI, storeAppTools, storeMcpTools } from '../../src/mastra/mcp/store-app.tools';
import { storeAgentTools } from '../../src/mastra/tools/store-toolset';

type ToolWithApp = {
  mcp?: { _meta?: { ui?: { resourceUri?: string } } };
};

describe('Malawi Store MCP App', () => {
  it('links every agent tool to the store app resource', () => {
    expect(Object.keys(storeAppTools).sort()).toEqual(
      Object.keys(storeAgentTools).sort(),
    );

    for (const [id, tool] of Object.entries(storeAppTools)) {
      const resourceUri = (tool as ToolWithApp).mcp?._meta?.ui?.resourceUri;
      expect(resourceUri, `${id} should render the store app`).toBe(
        STORE_APP_URI,
      );
    }
  });

  it('keeps the tool map keyed by tool id', () => {
    for (const [key, tool] of Object.entries(storeAppTools)) {
      expect(key).toBe(tool.id);
    }
    for (const [key, tool] of Object.entries(storeMcpTools)) {
      expect(key).toBe(tool.id);
    }
  });

  it('adapts MCP tools so the transport can supply the caller context', () => {
    expect(Object.keys(storeMcpTools).sort()).toEqual(
      Object.keys(storeAppTools).sort(),
    );

    for (const [id, tool] of Object.entries(storeMcpTools)) {
      expect(tool.mcp?._meta?.ui).toEqual({ resourceUri: STORE_APP_URI });
      expect(
        (tool as { requestContextSchema?: unknown }).requestContextSchema,
        `${id} should not require the agent request context over MCP`,
      ).toBeUndefined();
    }
  });

  it('registers the app metadata on the agent tools', async () => {
    const agent = storeAgent as unknown as {
      convertTools: (args: object) => Promise<Record<string, ToolWithApp>>;
    };
    const converted = await agent.convertTools({});

    expect(Object.keys(converted).sort()).toEqual(
      Object.keys(storeAppTools).sort(),
    );
    for (const name of Object.keys(converted)) {
      expect(converted[name].mcp?._meta?.ui?.resourceUri).toBe(STORE_APP_URI);
    }
  });

  it('serves the app HTML from the MCP server', async () => {
    const { resources } = await storeAppServer.listResources();
    expect(resources.map((resource) => resource.uri)).toContain(STORE_APP_URI);

    const resource = await storeAppServer.readResource(STORE_APP_URI);
    const content = resource.contents[0];

    expect(content.uri).toBe(STORE_APP_URI);
    expect(content.mimeType).toContain('text/html');
    expect(content.text).toContain('Malawi Store');
    expect(content.text).toContain(STORE_APP_PLACEHOLDER_IMAGE);
    expect(content.text).not.toContain('__MALAWI_STORE_PLACEHOLDER_IMAGE__');
  });

  it('confirms destructive actions inside the app instead of window.confirm', async () => {
    const resource = await storeAppServer.readResource(STORE_APP_URI);
    const html = resource.contents[0].text ?? '';

    expect(html).not.toContain('window.confirm');
    expect(html).toContain('keep-order');
  });

  it('exposes the storefront tools over MCP', () => {
    for (const id of [
      'get-me',
      'list-products',
      'get-product',
      'get-cart',
      'add-cart-item',
      'checkout-order',
      'list-wishlist',
      'get-product-reviews',
    ]) {
      expect(storeAppServer.getToolInfo(id), `${id} should be listed`).toBeDefined();
    }
  });

  it('exposes exactly the agent tools and not the direct payment intent', () => {
    for (const id of Object.keys(storeAgentTools)) {
      expect(storeAppServer.getToolInfo(id), `${id} should be listed`).toBeDefined();
    }

    expect(storeAppServer.getToolInfo('create-payment-intent')).toBeUndefined();
  });
});
