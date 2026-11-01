import { describe, expect, it } from 'vitest';
import { storeAgent } from '../../src/mastra/agents/store.agent';
import { storeAppServer, STORE_APP_PLACEHOLDER_IMAGE } from '../../src/mastra/mcp/store-app.server';
import { STORE_APP_URI, storeAppTools, storeMcpTools } from '../../src/mastra/mcp/store-app.tools';
import { storeAgentTools } from '../../src/mastra/tools/store-toolset';

type ToolWithApp = {
  mcp?: { _meta?: { ui?: { resourceUri?: string } } };
};

type LaunchedApp = {
  root: { innerHTML: string };
  sent: Array<Record<string, any>>;
  deliver: (data: unknown) => void;
  click: (attributes: Record<string, string>) => void;
};

/**
 * Runs the app's module script against a minimal fake host.
 *
 * The app is self-contained, so a DOM stub plus postMessage is enough to
 * exercise the bridge, the initial render, and click-driven tool calls.
 */
function launchStoreApp(html: string): LaunchedApp {
  const script = /<script type="module">([\s\S]*?)<\/script>/.exec(html)?.[1];
  if (!script) throw new Error('App HTML is missing its module script');

  const listeners: Array<(event: unknown) => void> = [];
  const clickListeners: Array<(event: unknown) => void> = [];
  const sent: Array<Record<string, any>> = [];
  const root = {
    innerHTML: '',
    addEventListener: (type: string, fn: (event: unknown) => void) => {
      if (type === 'click') clickListeners.push(fn);
    },
  };
  const documentStub = {
    getElementById: () => root,
    documentElement: {
      setAttribute: () => {},
      getAttribute: () => null,
      classList: { contains: () => false },
      style: { setProperty: () => {}, colorScheme: '' },
      getBoundingClientRect: () => ({ height: 600 }),
    },
    addEventListener: () => {},
  };
  const parent = {
    postMessage: (message: Record<string, any>) => sent.push(message),
  };
  const windowStub = {
    parent,
    innerWidth: 800,
    addEventListener: (type: string, fn: (event: unknown) => void) => {
      if (type === 'message') listeners.push(fn);
    },
  };

  new Function(
    'window',
    'document',
    'console',
    'requestAnimationFrame',
    'ResizeObserver',
    script,
  )(
    windowStub,
    documentStub,
    { warn: () => {}, log: () => {}, error: () => {} },
    (fn: () => void) => fn(),
    class {
      observe() {}
      disconnect() {}
    },
  );

  return {
    root,
    sent,
    deliver: (data: unknown) =>
      listeners.forEach((listener) => listener({ source: parent, data })),
    click: (attributes: Record<string, string>) => {
      const target = {
        getAttribute: (name: string) => attributes[name] ?? null,
        closest: () => target,
      };
      clickListeners.forEach((listener) => listener({ target }));
    },
  };
}

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

  it('ships a self-contained host bridge with no remote script import', async () => {
    const resource = await storeAppServer.readResource(STORE_APP_URI);
    const html = resource.contents[0].text ?? '';

    expect(html).not.toContain('cdn.jsdelivr.net');
    expect(html).not.toContain('import { App }');
    expect(html).toContain('ui/initialize');
    expect(html).toContain('ui/notifications/tool-result');
  });

  it('renders the storefront without waiting for the host handshake', async () => {
    const resource = await storeAppServer.readResource(STORE_APP_URI);
    const app = launchStoreApp(resource.contents[0].text ?? '');

    // The empty state replaces the boot screen even if no host replies.
    expect(app.root.innerHTML).toContain('Ready when you are');

    const initialize = app.sent.find(
      (message) => message.method === 'ui/initialize',
    );
    expect(initialize).toBeTruthy();
    expect((initialize?.params as { protocolVersion?: string }).protocolVersion).toBe(
      '2026-01-26',
    );

    app.deliver({
      jsonrpc: '2.0',
      id: initialize?.id,
      result: {
        protocolVersion: '2026-01-26',
        hostInfo: { name: 'test', version: '1.0.0' },
        hostCapabilities: {},
        hostContext: { theme: 'light' },
      },
    });
    await Promise.resolve();
    expect(
      app.sent.some(
        (message) => message.method === 'ui/notifications/initialized',
      ),
    ).toBe(true);

    app.deliver({
      jsonrpc: '2.0',
      method: 'ui/notifications/tool-result',
      params: {
        structuredContent: {
          result: [
            {
              id: 'product-1',
              name: 'Balaka Embroidered Tunic',
              slug: 'balaka-embroidered-tunic',
              price_cents: 3824,
              currency: 'USD',
              category_name: 'Tops',
              description: 'Cotton tunic',
              is_active: true,
            },
          ],
        },
      },
    });

    expect(app.root.innerHTML).toContain('Balaka Embroidered Tunic');
    expect(app.root.innerHTML).not.toContain('Connecting to the storefront app');
  });

  it('does not render navigation to other entity pages', async () => {
    const resource = await storeAppServer.readResource(STORE_APP_URI);
    const html = resource.contents[0].text ?? '';

    for (const action of [
      'browse',
      'open-cart',
      'open-orders',
      'open-wishlist',
      'open-account',
      'refresh',
    ]) {
      expect(html, `${action} should not be a global action`).not.toContain(
        `data-action="${action}"`,
      );
    }

    expect(html).not.toContain('<footer');
  });

  it('renders category images and drills from a category into its products', async () => {
    const resource = await storeAppServer.readResource(STORE_APP_URI);
    const app = launchStoreApp(resource.contents[0].text ?? '');

    app.deliver({
      jsonrpc: '2.0',
      method: 'ui/notifications/tool-result',
      params: {
        structuredContent: {
          result: [
            {
              id: 'cat-1',
              name: 'Tops & Blouses',
              slug: 'tops-blouses',
              description: 'Shirts and blouses',
              image_url: 'https://cdn.example.com/categories/tops.jpg',
              created_at: '2026-01-01T00:00:00Z',
            },
          ],
        },
      },
    });

    expect(app.root.innerHTML).toContain(
      'https://cdn.example.com/categories/tops.jpg',
    );
    expect(app.root.innerHTML).toContain('data-action="category-products"');
    expect(app.root.innerHTML).toContain('data-id="cat-1"');

    app.click({ 'data-action': 'category-products', 'data-id': 'cat-1' });

    const call = app.sent.find(
      (message) => message.method === 'tools/call',
    ) as { id?: unknown; params?: { name?: string; arguments?: unknown } } | undefined;
    expect(call?.params?.name).toBe('list-products');
    expect(call?.params?.arguments).toEqual({
      categoryId: 'cat-1',
      limit: 24,
    });

    app.deliver({
      jsonrpc: '2.0',
      id: call?.id,
      result: {
        structuredContent: {
          result: [
            {
              id: 'product-1',
              name: 'Kitenge Blouse',
              slug: 'kitenge-blouse',
              price_cents: 2500,
              currency: 'USD',
              category_name: 'Tops & Blouses',
              description: 'Printed blouse',
              is_active: true,
            },
          ],
        },
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(app.root.innerHTML).toContain('Products in Tops &amp; Blouses');
    expect(app.root.innerHTML).toContain('Kitenge Blouse');
  });

  it('allows only the placeholder image origin in the resource CSP', async () => {
    const { resources } = await storeAppServer.listResources();
    const app = resources.find((resource) => resource.uri === STORE_APP_URI) as
      | { _meta?: { ui?: { csp?: { resourceDomains?: string[] } } } }
      | undefined;

    expect(app?._meta?.ui?.csp?.resourceDomains).toEqual([
      'https://placehold.co',
    ]);
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
