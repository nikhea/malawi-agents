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
  click: (
    attributes: Record<string, string>,
    fields?: Record<string, string>,
  ) => void;
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
    click: (attributes: Record<string, string>, fields: Record<string, string> = {}) => {
      const form = {
        querySelector: (selector: string) => {
          const name = /^\[name="([^"]+)"\]$/.exec(selector)?.[1];
          return name && name in fields ? { value: fields[name] } : null;
        },
      };
      const target: any = {
        getAttribute: (name: string) => attributes[name] ?? null,
        closest: (selector: string) =>
          selector === '[data-review-form]' ? form : target,
      };
      clickListeners.forEach((listener) => listener({ target }));
    },
  };
}

type ToolCall = {
  id: unknown;
  params: { name: string; arguments: Record<string, unknown> };
};

function toolCalls(app: LaunchedApp): ToolCall[] {
  return app.sent.filter(
    (message) => message.method === 'tools/call',
  ) as ToolCall[];
}

function deliverToolResult(
  app: LaunchedApp,
  id: unknown,
  structuredContent: unknown,
  isError = false,
) {
  app.deliver({
    jsonrpc: '2.0',
    id,
    result: {
      isError,
      structuredContent,
      content: [{ type: 'text', text: JSON.stringify(structuredContent) }],
    },
  });
}

async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

const productDetail = {
  product: {
    id: 'product-1',
    name: 'Balaka Embroidered Tunic',
    slug: 'balaka-embroidered-tunic',
    price_cents: 3824,
    currency: 'USD',
    category_name: 'Tops',
    description: 'Cotton tunic',
    is_active: true,
    image_url: '',
  },
  variants: [
    {
      id: 'variant-1',
      product_id: 'product-1',
      name: 'Balaka Embroidered Tunic / Small',
      sku: 'balaka-tunic-s',
      price_cents: 3824,
      is_active: true,
      available: 3,
      in_stock: true,
      created_at: '2026-01-01T00:00:00Z',
    },
  ],
};

const cartWithLine = {
  id: 'cart-1',
  user_id: 'user-1',
  items: [
    {
      id: 'line-1',
      product_id: 'product-1',
      variant_id: 'variant-1',
      name: 'Balaka Embroidered Tunic / Small',
      sku: 'balaka-tunic-s',
      unit_price_cents: 3824,
      currency: 'USD',
      qty: 1,
      line_total_cents: 3824,
    },
  ],
  subtotal_cents: 3824,
  currency: 'USD',
  updated_at: '2026-01-01T00:00:00Z',
};

const pendingOrder = {
  id: 'order-1',
  user_id: 'user-1',
  status: 'pending',
  subtotal_cents: 3824,
  currency: 'USD',
  lines: [
    {
      product_id: 'product-1',
      variant_id: 'variant-1',
      name: 'Balaka Embroidered Tunic / Small',
      sku: 'balaka-tunic-s',
      unit_price_cents: 3824,
      qty: 1,
      line_total_cents: 3824,
    },
  ],
  created_at: '2026-01-01T00:00:00Z',
};

const wishlistItem = {
  product_id: 'product-1',
  product: {
    id: 'product-1',
    name: 'Balaka Embroidered Tunic',
    slug: 'balaka-embroidered-tunic',
    price_cents: 3824,
    currency: 'USD',
    image_url: '',
  },
  added_at: '2026-01-01T00:00:00Z',
};

const viewer = {
  id: 'user-1',
  email: 'amina@example.com',
  name: 'Amina Banda',
  role: 'customer' as const,
  email_verified: true,
  created_at: '2026-01-01T00:00:00Z',
};

const ownReview = {
  id: 'review-1',
  user_id: 'user-1',
  author: 'Amina Banda',
  product_id: 'product-1',
  rating: 5,
  title: 'Beautiful tunic',
  body: 'The embroidery is lovely.',
  created_at: '2026-01-02T00:00:00Z',
};

const otherReview = {
  id: 'review-2',
  user_id: 'user-2',
  author: 'Chidi Phiri',
  product_id: 'product-1',
  rating: 4,
  title: 'Great fit',
  body: 'Runs true to size.',
  created_at: '2026-01-03T00:00:00Z',
};

const emptyReviewSummary = {
  average: 0,
  count: 0,
  reviews: [],
};

const ownReviewSummary = {
  average: 5,
  count: 1,
  reviews: [ownReview],
};

async function answerProductLoad(
  app: LaunchedApp,
  detail: unknown,
  summary: unknown,
  currentViewer: unknown,
  fromIndex = 0,
) {
  const steps: Array<[string, unknown]> = [
    ['get-product', detail],
    ['get-product-reviews', summary],
    ['get-me', currentViewer],
  ];
  for (const [name, value] of steps) {
    const call = toolCalls(app)
      .slice(fromIndex)
      .find((candidate) => candidate.params.name === name);
    if (!call) throw new Error(`The app did not call ${name}`);
    deliverToolResult(app, call.id, value);
    await settle();
  }
}

function showProduct(app: LaunchedApp, detail: unknown) {
  app.deliver({
    jsonrpc: '2.0',
    method: 'ui/notifications/tool-result',
    params: { structuredContent: detail },
  });
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
    const storeTools = Object.keys(converted).filter(
      (name) => !name.startsWith('knowledge_'),
    );

    expect(storeTools.sort()).toEqual(Object.keys(storeAppTools).sort());
    for (const name of storeTools) {
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

  it('renders an inline SVG logo lockup in the header', async () => {
    const resource = await storeAppServer.readResource(STORE_APP_URI);
    const html = resource.contents[0].text ?? '';

    expect(html).toContain('class="brand-mark"');
    expect(html).toContain('<svg viewBox="0 0 48 48"');
    expect(html).toContain('class="brand-word"');
    expect(html).toContain('Curated by the lake');
    expect(html).not.toContain('Personal storefront');
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

  it('keeps the product view while adding a variant and refreshes it in place', async () => {
    const resource = await storeAppServer.readResource(STORE_APP_URI);
    const app = launchStoreApp(resource.contents[0].text ?? '');

    app.deliver({
      jsonrpc: '2.0',
      method: 'ui/notifications/tool-result',
      params: { structuredContent: productDetail },
    });
    expect(app.root.innerHTML).toContain('Balaka Embroidered Tunic');
    expect(app.root.innerHTML).toContain('data-action="add-variant"');

    app.click({
      'data-action': 'add-variant',
      'data-product': 'product-1',
      'data-variant': 'variant-1',
    });

    // The product stays on screen behind the loading state.
    expect(app.root.innerHTML).toContain('Adding to cart');
    expect(app.root.innerHTML).toContain('Balaka Embroidered Tunic');
    expect(app.root.innerHTML).not.toContain('Your cart');

    const calls = toolCalls(app);
    expect(calls).toHaveLength(1);
    expect(calls[0].params).toEqual({
      name: 'add-cart-item',
      arguments: {
        productId: 'product-1',
        variantId: 'variant-1',
        qty: 1,
      },
    });

    // The mutation answers with a cart. The app must ignore that payload and
    // re-fetch the product instead of swapping the view to the cart.
    deliverToolResult(app, calls[0].id, cartWithLine);
    await settle();

    const followUp = toolCalls(app)[1];
    expect(followUp.params).toEqual({
      name: 'get-product',
      arguments: { id: 'product-1' },
    });
    expect(app.root.innerHTML).toContain('Loading product');
    expect(app.root.innerHTML).toContain('Balaka Embroidered Tunic');
    expect(app.root.innerHTML).not.toContain('Your cart');

    deliverToolResult(app, followUp.id, productDetail);
    await settle();

    expect(app.root.innerHTML).toContain('Balaka Embroidered Tunic');
    expect(app.root.innerHTML).toContain('Added to cart.');
    expect(app.root.innerHTML).not.toContain('Your cart');
    expect(app.root.innerHTML).not.toContain('<pre');
    expect(app.root.innerHTML).not.toContain('Store data');
  });

  it('keeps the cart view while changing a quantity', async () => {
    const resource = await storeAppServer.readResource(STORE_APP_URI);
    const app = launchStoreApp(resource.contents[0].text ?? '');

    app.deliver({
      jsonrpc: '2.0',
      method: 'ui/notifications/tool-result',
      params: { structuredContent: cartWithLine },
    });

    app.click({ 'data-action': 'qty', 'data-item': 'line-1', 'data-qty': '2' });
    expect(app.root.innerHTML).toContain('Updating quantity');
    expect(app.root.innerHTML).toContain('Your cart');

    const mutation = toolCalls(app)[0];
    expect(mutation.params).toEqual({
      name: 'set-cart-item-qty',
      arguments: { itemId: 'line-1', qty: 2 },
    });

    const updatedCart = {
      ...cartWithLine,
      subtotal_cents: 7648,
      items: [{ ...cartWithLine.items[0], qty: 2, line_total_cents: 7648 }],
    };
    deliverToolResult(app, mutation.id, updatedCart);
    await settle();

    const followUp = toolCalls(app)[1];
    expect(followUp.params).toEqual({
      name: 'get-cart',
      arguments: {},
    });
    expect(app.root.innerHTML).toContain('Loading cart');

    deliverToolResult(app, followUp.id, updatedCart);
    await settle();

    expect(app.root.innerHTML).toContain('Your cart');
    expect(app.root.innerHTML).toContain('Cart quantity updated.');
    expect(app.root.innerHTML).toContain('<span>2</span>');
    expect(app.root.innerHTML).not.toContain('<pre');
  });

  it('refreshes the wishlist in place after removing an item', async () => {
    const resource = await storeAppServer.readResource(STORE_APP_URI);
    const app = launchStoreApp(resource.contents[0].text ?? '');

    app.deliver({
      jsonrpc: '2.0',
      method: 'ui/notifications/tool-result',
      params: { structuredContent: [wishlistItem] },
    });
    expect(app.root.innerHTML).toContain('<h1>Wishlist</h1>');

    app.click({ 'data-action': 'remove-wishlist', 'data-product': 'product-1' });
    expect(app.root.innerHTML).toContain('Updating wishlist');
    expect(app.root.innerHTML).toContain('<h1>Wishlist</h1>');

    const mutation = toolCalls(app)[0];
    expect(mutation.params).toEqual({
      name: 'remove-from-wishlist',
      arguments: { productId: 'product-1' },
    });

    deliverToolResult(app, mutation.id, { status: 'removed' });
    await settle();

    const followUp = toolCalls(app)[1];
    expect(followUp.params).toEqual({
      name: 'list-wishlist',
      arguments: {},
    });

    deliverToolResult(app, followUp.id, []);
    await settle();

    expect(app.root.innerHTML).toContain('Removed from your wishlist.');
    expect(app.root.innerHTML).not.toContain('Balaka Embroidered Tunic');
    expect(app.root.innerHTML).not.toContain('<pre');
    expect(app.root.innerHTML).not.toContain('Store data');
  });

  it('keeps the order view while cancelling and refreshes that order', async () => {
    const resource = await storeAppServer.readResource(STORE_APP_URI);
    const app = launchStoreApp(resource.contents[0].text ?? '');

    app.deliver({
      jsonrpc: '2.0',
      method: 'ui/notifications/tool-result',
      params: { structuredContent: pendingOrder },
    });
    expect(app.root.innerHTML).toContain('Pending order');

    app.click({ 'data-action': 'cancel-order', 'data-id': 'order-1' });
    expect(app.root.innerHTML).toContain('Confirm cancel');
    expect(toolCalls(app)).toHaveLength(0);

    app.click({ 'data-action': 'cancel-order', 'data-id': 'order-1' });
    expect(app.root.innerHTML).toContain('Cancelling order');
    expect(app.root.innerHTML).toContain('Pending order');

    const mutation = toolCalls(app)[0];
    expect(mutation.params).toEqual({
      name: 'cancel-order',
      arguments: { id: 'order-1' },
    });

    const cancelledOrder = { ...pendingOrder, status: 'cancelled' };
    deliverToolResult(app, mutation.id, cancelledOrder);
    await settle();

    const followUp = toolCalls(app)[1];
    expect(followUp.params).toEqual({
      name: 'get-order',
      arguments: { id: 'order-1' },
    });

    deliverToolResult(app, followUp.id, cancelledOrder);
    await settle();

    expect(app.root.innerHTML).toContain('Cancelled order');
    expect(app.root.innerHTML).toContain('Order cancelled.');
    expect(app.root.innerHTML).not.toContain('<pre');
  });

  it('renders an unknown object as a record instead of JSON', async () => {
    const resource = await storeAppServer.readResource(STORE_APP_URI);
    const app = launchStoreApp(resource.contents[0].text ?? '');

    app.deliver({
      jsonrpc: '2.0',
      method: 'ui/notifications/tool-result',
      params: {
        structuredContent: {
          reference: 'ref-42',
          amount_cents: 1250,
          currency: 'USD',
        },
      },
    });

    expect(app.root.innerHTML).toContain('Store update');
    expect(app.root.innerHTML).toContain('Reference');
    expect(app.root.innerHTML).toContain('ref-42');
    expect(app.root.innerHTML).toContain('Amount Cents');
    expect(app.root.innerHTML).not.toContain('<pre');
    expect(app.root.innerHTML).not.toContain('Store data');
  });

  it('shows the real checkout URL and opens it through the host', async () => {
    const resource = await storeAppServer.readResource(STORE_APP_URI);
    const app = launchStoreApp(resource.contents[0].text ?? '');

    app.deliver({
      jsonrpc: '2.0',
      method: 'ui/notifications/tool-result',
      params: { structuredContent: pendingOrder },
    });

    app.click({ 'data-action': 'pay-order', 'data-id': 'order-1' });
    expect(app.root.innerHTML).toContain('Creating payment page');
    expect(app.root.innerHTML).toContain('Pending order');

    const call = toolCalls(app)[0];
    expect(call.params).toEqual({
      name: 'create-checkout-session',
      arguments: { orderId: 'order-1' },
    });

    const url = 'https://checkout.stripe.com/c/pay/cs_test_123';
    deliverToolResult(app, call.id, {
      id: 'cs_test_123',
      order_id: 'order-1',
      url,
      expires_at: 1893456000,
    });
    await settle();

    expect(app.root.innerHTML).toContain('Checkout ready');
    expect(app.root.innerHTML).toContain(url);
    expect(app.root.innerHTML).toContain('data-action="open-checkout"');
    expect(app.root.innerHTML).not.toContain('<pre');

    app.click({ 'data-action': 'open-checkout', 'data-url': url });
    const open = app.sent.find(
      (message) => message.method === 'ui/open-link',
    ) as { id?: unknown; params?: { url?: string } } | undefined;
    expect(open?.params?.url).toBe(url);

    app.deliver({ jsonrpc: '2.0', id: open?.id, result: {} });
    await settle();
  });

  it('opens a product with its reviews and own-review controls', async () => {
    const resource = await storeAppServer.readResource(STORE_APP_URI);
    const app = launchStoreApp(resource.contents[0].text ?? '');

    app.deliver({
      jsonrpc: '2.0',
      method: 'ui/notifications/tool-result',
      params: { structuredContent: [productDetail.product] },
    });
    app.click({ 'data-action': 'product', 'data-id': 'product-1' });

    expect(app.root.innerHTML).toContain('Loading product');
    expect(app.root.innerHTML).toContain('Balaka Embroidered Tunic');

    const calls = toolCalls(app);
    expect(calls[0].params).toEqual({
      name: 'get-product',
      arguments: { id: 'product-1' },
    });

    deliverToolResult(app, calls[0].id, productDetail);
    await settle();

    const reviewCall = toolCalls(app).find(
      (call) => call.params.name === 'get-product-reviews',
    );
    expect(reviewCall?.params).toEqual({
      name: 'get-product-reviews',
      arguments: { productId: 'product-1' },
    });

    deliverToolResult(app, reviewCall?.id, ownReviewSummary);
    await settle();

    const meCall = toolCalls(app).find(
      (call) => call.params.name === 'get-me',
    );
    expect(meCall?.params).toEqual({ name: 'get-me', arguments: {} });
    deliverToolResult(app, meCall?.id, viewer);
    await settle();

    expect(app.root.innerHTML).toContain('Balaka Embroidered Tunic');
    expect(app.root.innerHTML).toContain('Reviews');
    expect(app.root.innerHTML).toContain('Beautiful tunic');
    expect(app.root.innerHTML).toContain('Your review');
    expect(app.root.innerHTML).toContain('data-action="edit-review"');
    expect(app.root.innerHTML).toContain('data-action="delete-review"');
    expect(app.root.innerHTML).not.toContain('data-action="write-review"');
  });

  it('creates a review from the product page and refreshes it in place', async () => {
    const resource = await storeAppServer.readResource(STORE_APP_URI);
    const app = launchStoreApp(resource.contents[0].text ?? '');

    showProduct(app, {
      ...productDetail,
      reviews: emptyReviewSummary,
      viewer,
    });
    expect(app.root.innerHTML).toContain('data-action="write-review"');

    app.click({ 'data-action': 'write-review', 'data-product': 'product-1' });
    expect(app.root.innerHTML).toContain('data-review-form');
    expect(app.root.innerHTML).toContain('Post review');

    const before = toolCalls(app).length;
    app.click(
      { 'data-action': 'submit-review' },
      { rating: '4', title: 'Lovely fabric', body: 'Fits well and feels soft.' },
    );
    expect(app.root.innerHTML).toContain('Posting review');
    expect(app.root.innerHTML).toContain('Balaka Embroidered Tunic');

    const createCall = toolCalls(app)[before];
    expect(createCall.params).toEqual({
      name: 'create-review',
      arguments: {
        productId: 'product-1',
        rating: 4,
        title: 'Lovely fabric',
        body: 'Fits well and feels soft.',
      },
    });

    deliverToolResult(app, createCall.id, {
      ...ownReview,
      rating: 4,
      title: 'Lovely fabric',
      body: 'Fits well and feels soft.',
    });
    await settle();

    const createdSummary = {
      average: 4,
      count: 1,
      reviews: [
        {
          ...ownReview,
          rating: 4,
          title: 'Lovely fabric',
          body: 'Fits well and feels soft.',
        },
      ],
    };
    await answerProductLoad(
      app,
      productDetail,
      createdSummary,
      viewer,
      before,
    );

    expect(app.root.innerHTML).toContain('Review posted.');
    expect(app.root.innerHTML).toContain('Lovely fabric');
    expect(app.root.innerHTML).toContain('data-action="edit-review"');
    expect(app.root.innerHTML).not.toContain('data-review-form');
    expect(app.root.innerHTML).not.toContain('data-action="write-review"');
  });

  it('edits and deletes the customer own review in place', async () => {
    const resource = await storeAppServer.readResource(STORE_APP_URI);
    const app = launchStoreApp(resource.contents[0].text ?? '');

    showProduct(app, {
      ...productDetail,
      reviews: ownReviewSummary,
      viewer,
    });

    app.click({ 'data-action': 'edit-review', 'data-review': 'review-1' });
    expect(app.root.innerHTML).toContain('Edit your review');
    expect(app.root.innerHTML).toContain('value="Beautiful tunic"');
    expect(app.root.innerHTML).toContain('The embroidery is lovely.');

    const editFrom = toolCalls(app).length;
    app.click(
      { 'data-action': 'submit-review' },
      { rating: '4', title: 'Even better in person', body: 'Soft cotton.' },
    );

    const updateCall = toolCalls(app)[editFrom];
    expect(updateCall.params).toEqual({
      name: 'update-review',
      arguments: {
        reviewId: 'review-1',
        rating: 4,
        title: 'Even better in person',
        body: 'Soft cotton.',
      },
    });

    const updatedReview = {
      ...ownReview,
      rating: 4,
      title: 'Even better in person',
      body: 'Soft cotton.',
    };
    deliverToolResult(app, updateCall.id, updatedReview);
    await settle();
    await answerProductLoad(
      app,
      productDetail,
      { average: 4, count: 1, reviews: [updatedReview] },
      viewer,
      editFrom,
    );

    expect(app.root.innerHTML).toContain('Review updated.');
    expect(app.root.innerHTML).toContain('Even better in person');

    const deleteFrom = toolCalls(app).length;
    app.click({ 'data-action': 'delete-review', 'data-review': 'review-1' });
    expect(app.root.innerHTML).toContain('Confirm delete');
    expect(toolCalls(app)).toHaveLength(deleteFrom);

    app.click({ 'data-action': 'delete-review', 'data-review': 'review-1' });
    const deleteCall = toolCalls(app)[deleteFrom];
    expect(deleteCall.params).toEqual({
      name: 'delete-review',
      arguments: { reviewId: 'review-1' },
    });

    deliverToolResult(app, deleteCall.id, { success: true });
    await settle();
    await answerProductLoad(
      app,
      productDetail,
      emptyReviewSummary,
      viewer,
      deleteFrom,
    );

    expect(app.root.innerHTML).toContain('Review deleted.');
    expect(app.root.innerHTML).toContain('No written reviews yet.');
    expect(app.root.innerHTML).toContain('data-action="write-review"');
    expect(app.root.innerHTML).not.toContain('Even better in person');
  });

  it('links paid order items to product reviews but not unpaid items', async () => {
    const resource = await storeAppServer.readResource(STORE_APP_URI);
    const app = launchStoreApp(resource.contents[0].text ?? '');

    app.deliver({
      jsonrpc: '2.0',
      method: 'ui/notifications/tool-result',
      params: { structuredContent: { ...pendingOrder, status: 'paid' } },
    });

    expect(app.root.innerHTML).toContain('Paid order');
    expect(app.root.innerHTML).toContain('data-action="product-reviews"');
    expect(app.root.innerHTML).toContain('data-id="product-1"');
    expect(app.root.innerHTML).toContain('>Review</span>');

    app.click({ 'data-action': 'product-reviews', 'data-id': 'product-1' });
    expect(app.root.innerHTML).toContain('Loading product');
    await answerProductLoad(
      app,
      productDetail,
      ownReviewSummary,
      viewer,
    );
    expect(app.root.innerHTML).toContain('Reviews');
    expect(app.root.innerHTML).toContain('Beautiful tunic');

    app.deliver({
      jsonrpc: '2.0',
      method: 'ui/notifications/tool-result',
      params: { structuredContent: pendingOrder },
    });
    expect(app.root.innerHTML).toContain('Pending order');
    expect(app.root.innerHTML).not.toContain('data-action="product-reviews"');

    app.deliver({
      jsonrpc: '2.0',
      method: 'ui/notifications/tool-result',
      params: {
        structuredContent: { ...pendingOrder, status: 'cancelled' },
      },
    });
    expect(app.root.innerHTML).toContain('Cancelled order');
    expect(app.root.innerHTML).not.toContain('data-action="product-reviews"');
  });

  it('offers a product link from a standalone review summary', async () => {
    const resource = await storeAppServer.readResource(STORE_APP_URI);
    const app = launchStoreApp(resource.contents[0].text ?? '');

    app.deliver({
      jsonrpc: '2.0',
      method: 'ui/notifications/tool-input',
      params: { arguments: { productId: 'product-1' } },
    });
    app.deliver({
      jsonrpc: '2.0',
      method: 'ui/notifications/tool-result',
      params: { structuredContent: ownReviewSummary },
    });

    expect(app.root.innerHTML).toContain('data-action="product-reviews"');

    app.click({ 'data-action': 'product-reviews', 'data-id': 'product-1' });
    expect(app.root.innerHTML).toContain('Loading product');
    await answerProductLoad(app, productDetail, ownReviewSummary, viewer);
    expect(app.root.innerHTML).toContain('Balaka Embroidered Tunic');
    expect(app.root.innerHTML).toContain('Beautiful tunic');
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
